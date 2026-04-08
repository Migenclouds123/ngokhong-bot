import { kv } from '@vercel/kv';
import { CoreMessage } from 'ai';

const TTL_SECONDS = 24 * 60 * 60; // 24 hours

export async function getSessionMemory(telegramId: string): Promise<CoreMessage[]> {
  try {
    const key = `telegram_session:${telegramId}`;
    const session = await kv.get<CoreMessage[]>(key);
    return session || [];
  } catch (err) {
    console.error("Lỗi lấy memory Vercel KV:", err);
    return []; // Fallback ngầm định nếu KV sụp, tránh crash logic
  }
}

export async function saveSessionMemory(telegramId: string, messages: CoreMessage[]): Promise<void> {
  try {
    const key = `telegram_session:${telegramId}`;
    // Chỉ ghi lại tối đa 10 tin nhắn gần nhất để đỡ tốn tiền lưu trữ KV
    const recentMessages = messages.slice(-10);
    await kv.set(key, recentMessages, { ex: TTL_SECONDS });
  } catch (err) {
    console.error("Lỗi lưu memory Vercel KV:", err);
  }
}
