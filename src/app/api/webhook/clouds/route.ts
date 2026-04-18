import { NextResponse } from 'next/server';
import { getSessionMemory, saveSessionMemory } from '@/lib/bot/tools/memorySearch';
import { processCloudsMessage } from '@/lib/clouds/agent';
import { CoreMessage, UserContent } from 'ai';

const CLOUDS_TOKEN = process.env.CLOUDS_BOT_TOKEN;
const CLOUDS_BOT_USERNAME = process.env.CLOUDS_BOT_USERNAME || 'CloudsAgent_Bot';
const BOSS_TELEGRAM_ID = '1964391026';

// Serverless function timeout — Vercel Hobby: 10s, Pro: 30s
export const maxDuration = 30;

// ── Lấy URL file ảnh từ Telegram ──────────────────────────────
async function getTelegramFileUrl(fileId: string): Promise<string | null> {
  if (!CLOUDS_TOKEN) return null;
  const res = await fetch(
    `https://api.telegram.org/bot${CLOUDS_TOKEN}/getFile?file_id=${fileId}`
  );
  const data = await res.json();
  if (data.ok && data.result.file_path) {
    return `https://api.telegram.org/file/bot${CLOUDS_TOKEN}/${data.result.file_path}`;
  }
  return null;
}

// ── Gửi tin nhắn về Telegram ──────────────────────────────────
async function sendMessage(
  chatId: string,
  text: string,
  threadId?: number,
  replyToMessageId?: number
) {
  if (!CLOUDS_TOKEN) return;

  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    // Ngắt link preview cho clean hơn
    disable_web_page_preview: true,
  };

  if (threadId) payload.message_thread_id = threadId;
  if (replyToMessageId) payload.reply_to_message_id = replyToMessageId;

  await fetch(`https://api.telegram.org/bot${CLOUDS_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ── Bắn "đang nhập..." để user biết bot đang xử lý ────────────
async function sendTyping(chatId: string) {
  if (!CLOUDS_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${CLOUDS_TOKEN}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  });
}

// ── Memory key riêng cho Clouds Agent (tránh đụng Ngộ Không) ──
function cloudsMemoryKey(telegramId: string): string {
  return `clouds_session:${telegramId}`;
}

async function getCloudsMemory(telegramId: string): Promise<CoreMessage[]> {
  return getSessionMemory(cloudsMemoryKey(telegramId));
}

async function saveCloudsMemory(telegramId: string, messages: CoreMessage[]): Promise<void> {
  return saveSessionMemory(cloudsMemoryKey(telegramId), messages);
}

// ═══════════════════════════════════════════════════════════════
// MAIN WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Bỏ qua nếu không phải message thường (edited_message, channel_post...)
    if (!body.message) return NextResponse.json({ ok: true });

    const message = body.message;
    const chatId = message.chat.id.toString();
    const telegramId = message.from?.id?.toString() || '';
    const threadId = message.message_thread_id;
    const messageId = message.message_id;
    const textMsg = message.text || message.caption || '';
    const chatType = message.chat.type; // private | group | supergroup
    const authorName = message.from?.first_name || 'Bạn';
    const authorUsername = message.from?.username ? `@${message.from.username}` : '';

    // ── BỘ LỌC CỨNG — Tiết kiệm API token ────────────────────
    if (chatType === 'group' || chatType === 'supergroup') {
      const isMentioned = textMsg.includes(`@${CLOUDS_BOT_USERNAME}`);
      const isReplyToBot = message.reply_to_message?.from?.username === CLOUDS_BOT_USERNAME;

      if (!isMentioned && !isReplyToBot) {
        return NextResponse.json({ ok: true, reason: 'not_mentioned' });
      }
    }

    // ── Lệnh /clear — Reset memory ────────────────────────────
    if (textMsg.includes('/clear_clouds')) {
      const { kv } = await import('@vercel/kv');
      await kv.del(cloudsMemoryKey(telegramId));
      await sendMessage(
        chatId,
        '☁️ Xong rồi! Mình đã quên sạch cuộc trò chuyện cũ rồi nha. Hỏi lại từ đầu đi bạn! 😊',
        threadId
      );
      return NextResponse.json({ ok: true });
    }

    // ── BƯỚC 1: Tiếp nhận & Định danh ─────────────────────────
    let imageUrl: string | null = null;
    let userContent: UserContent;

    // Định danh người gửi → bơm vào context cho LLM
    const isBoss = telegramId === BOSS_TELEGRAM_ID;
    const senderContext = isBoss
      ? `[CẢNH BÁO HỆ THỐNG: NGƯỜI NHẮN LÀ SẾP NGHĨA - xưng "dạ em", nghiêm túc, biết ơn]\n`
      : `[Người gửi: ${authorName} ${authorUsername} | telegramId: ${telegramId}]\n`;

    // Xử lý ảnh (multimodal)
    if (message.photo && message.photo.length > 0) {
      const fileId = message.photo[message.photo.length - 1].file_id;
      imageUrl = await getTelegramFileUrl(fileId);

      userContent = [{ type: 'text', text: senderContext + 'Nội dung: ' + textMsg }];
      if (imageUrl) {
        userContent.push({ type: 'image', image: new URL(imageUrl) });
      }
    } else {
      userContent = senderContext + 'Nội dung: ' + textMsg;
    }

    if (textMsg.trim() === '' && !imageUrl) {
      return NextResponse.json({ ok: true });
    }

    // Gửi typing indicator
    await sendTyping(chatId);

    // ── BƯỚC 2: Memory Search ──────────────────────────────────
    const history = await getCloudsMemory(telegramId);
    const newUserMessage: CoreMessage = { role: 'user', content: userContent };
    const messagesToProcess = [...history, newUserMessage];

    // ── BƯỚC 3, 4: Reasoning + Execution ──────────────────────
    const { fullResponse, finalAnswer } = await processCloudsMessage(messagesToProcess);

    // ── BƯỚC 5: Đóng gói & Gửi ────────────────────────────────
    await sendMessage(chatId, finalAnswer, threadId, messageId);

    // Lưu memory (bao gồm cả thẻ <thinking> để bot nhớ bài)
    const newAssistantMessage: CoreMessage = {
      role: 'assistant',
      content: fullResponse,
    };
    await saveCloudsMemory(telegramId, [...messagesToProcess, newAssistantMessage]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[CloudsWebhook] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
