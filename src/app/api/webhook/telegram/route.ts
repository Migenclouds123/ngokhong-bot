import { NextResponse } from 'next/server';
import { getSessionMemory, saveSessionMemory } from '@/lib/bot/tools/memorySearch';
import { processTelegramMessage } from '@/lib/bot/agent';
import { CoreMessage, UserContent } from 'ai';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Serverless Config
export const maxDuration = 30; 

async function getTelegramFileUrl(fileId: string) {
  if (!TELEGRAM_TOKEN) return null;
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getFile?file_id=${fileId}`);
  const data = await res.json();
  if (data.ok && data.result.file_path) {
    return `https://api.telegram.org/file/bot${TELEGRAM_TOKEN}/${data.result.file_path}`;
  }
  return null;
}

async function sendMessage(chatId: string, text: string) {
  if (!TELEGRAM_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

// Hàm Main POST đón tín hiệu Telegram
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.message) return NextResponse.json({ ok: true });

    const message = body.message;
    const chatId = message.chat.id.toString();
    const telegramId = message.from.id.toString();
    const textMsg = message.text || message.caption || '';
    const chatType = message.chat.type;
    
    // BỘ LỌC CỨNG (TIẾT KIỆM TOKEN): Chỉ xử lý khi được tag đích danh trong group
    if (chatType === 'group' || chatType === 'supergroup') {
      if (!textMsg.includes('@NgoKhongKhaKha_Bot')) {
        return NextResponse.json({ ok: true, reason: 'ignored_unmentioned' });
      }
    }
    
    // BƯỚC 1: Tiếp nhận và Phân biệt ảnh
    let imageUrl = null;
    let content: UserContent = '';

    if (message.photo && message.photo.length > 0) {
      const fileId = message.photo[message.photo.length - 1].file_id;
      imageUrl = await getTelegramFileUrl(fileId);
      
      content = [ { type: 'text', text: textMsg } ];
      if (imageUrl) {
          content.push({ type: 'image', image: new URL(imageUrl) });
      }
    } else {
      content = textMsg;
    }

    if (!content && !imageUrl) return NextResponse.json({ ok: true });

    // BƯỚC 2: Memory Search - Cắm rễ vào Redis lấy trí nhớ nhân sự
    const history = await getSessionMemory(telegramId);
    
    const newUserMessage: CoreMessage = {
      role: 'user',
      content: content,
    };
    const messagesToProcess = [...history, newUserMessage];

    // BƯỚC 3 & 4: Suy nghĩ và Triển khai (Xuyên qua não Gemini)
    const { fullResponse, finalAnswer } = await processTelegramMessage(telegramId, messagesToProcess, imageUrl ?? undefined);

    // BƯỚC 5: Đóng gói tin nhắn và bắn ngầm qua Telegram API
    await sendMessage(chatId, finalAnswer);

    // Lưu đè lại Memory DB toàn bộ kết quả hội thoại
    const newAssistantMessage: CoreMessage = {
      role: 'assistant',
      content: fullResponse, // Lưu cả thẻ <thinking> trần trụi để Model nhớ bài
    };
    await saveSessionMemory(telegramId, [...messagesToProcess, newAssistantMessage]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
