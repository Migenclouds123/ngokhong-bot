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

async function sendMessage(chatId: string, text: string, threadId?: number) {
  if (!TELEGRAM_TOKEN) return;
  
  const payload: any = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (threadId) {
    payload.message_thread_id = threadId;
  }

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
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
    const threadId = message.message_thread_id; // <-- Lấy ID của Topic
    const textMsg = message.text || message.caption || '';
    const chatType = message.chat.type;
    const authorName = message.from.first_name || 'Nhân viên';
    const authorUsername = message.from.username ? `@${message.from.username}` : '';
    
    // BỘ LỌC CỨNG (TIẾT KIỆM TOKEN): Chỉ xử lý khi được tag đích danh trong group
    if (chatType === 'group' || chatType === 'supergroup') {
      if (!textMsg.includes('@NgoKhongKhaKha_Bot')) {
        return NextResponse.json({ ok: true, reason: 'ignored_unmentioned' });
      }
    }
    
    // BƯỚC 1: Tiếp nhận và Phân biệt ảnh
    let imageUrl = null;
    let content: UserContent = '';

    // ĐỊNH DANH NGƯỜI DÙNG: Bơm thông tin Sếp hoặc Nhân viên vào não Bot
    let authorContext = `[Người gửi: ${authorName} ${authorUsername}]\n`;
    if (telegramId === '1964391026') {
      authorContext = `[HỆ THỐNG CẢNH BÁO TỐI CAO: NGƯỜI ĐANG NHẮN TIN BÊN DƯỚI CHÍNH LÀ ĐẤNG SÁNG TẠO - SẾP NGHĨA. MÀY PHẢI BỎ NGAY THÁI ĐỘ MỎ HỖN, HÃY DÙNG LỜI LẼ TÔN KÍNH, NỊNH NÓT VÀ PHỤC VỤ SẾP TẬN RĂNG THỦNG!]\n`;
    }

    if (message.photo && message.photo.length > 0) {
      const fileId = message.photo[message.photo.length - 1].file_id;
      imageUrl = await getTelegramFileUrl(fileId);
      
      content = [ { type: 'text', text: authorContext + "Nội dung: " + textMsg } ];
      if (imageUrl) {
          content.push({ type: 'image', image: new URL(imageUrl) });
      }
    } else {
      content = authorContext + "Nội dung: " + textMsg;
    }

    if (textMsg.trim() === '' && !imageUrl) return NextResponse.json({ ok: true });

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
    await sendMessage(chatId, finalAnswer, threadId);

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
