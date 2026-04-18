import { tool } from 'ai';
import { z } from 'zod';

const BABBLE_BASE_URL = process.env.BABBLE_API_URL || 'https://babble-app-5tcf.vercel.app';
const BOT_EMAIL = process.env.BABBLE_BOT_EMAIL || 'bot@babbleclouds.com';
const BOT_PASSWORD = process.env.BABBLE_BOT_PASSWORD || 'Nghiatranht99@';

// Cache session token in memory (reset mỗi lần cold start — OK cho serverless)
let cachedSession: { token: string; expiresAt: number } | null = null;

async function getBabbleSession(): Promise<string> {
  if (cachedSession && Date.now() < cachedSession.expiresAt) {
    return cachedSession.token;
  }

  if (!BOT_EMAIL || !BOT_PASSWORD) {
    throw new Error('Thiếu email/password cấu hình!');
  }

  try {
    const res = await fetch(`${BABBLE_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'CloudsAgent/1.0',
      },
      body: JSON.stringify({ email: BOT_EMAIL, password: BOT_PASSWORD }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Login fail: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const setCookie = res.headers.get('set-cookie');
    if (!setCookie) {
      throw new Error('Login thành công nhưng không có set-cookie trong header (có thể do Vercel giấu header).');
    }

    const sessionMatch = setCookie.match(/babble_token=[^;]+/);
    if (!sessionMatch) {
      throw new Error(`Có set-cookie nhưng không tìm thấy babble_token. Set-Cookie: ${setCookie}`);
    }

    const token = sessionMatch[0];
    cachedSession = {
      token,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    };
    return token;
  } catch (err: any) {
    throw new Error(`Lỗi getBabbleSession: ${err.message}`);
  }
}


async function babbleFetch(endpoint: string) {
  const session = await getBabbleSession();
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
    'User-Agent': 'CloudsAgent/1.0'
  };
  if (session) headers['Cookie'] = session;

  const res = await fetch(`${BABBLE_BASE_URL}${endpoint}`, { headers });
  if (!res.ok) throw new Error(`Babble API ${res.status}: ${endpoint}`);
  return res.json();
}

export const babbleApiTool = tool({
  description:
    'Gọi trực tiếp API Babble Clouds System để lấy dữ liệu sống (real-time). ' +
    'Dùng khi nhân viên hỏi các câu như: "Task nào đang quá hạn?", "Nhóm mình có mấy task?", ' +
    '"Khách hàng nào là Hạng A?". Cung cấp thông tin thực tế từ database, không phải dự đoán. ' +
    'LƯU Ý QUAN TRỌNG: Nếu tool này trả lời có lỗi (Ví dụ: ❌ Không kết nối được), bạn BẮT BUỘC phải in NGUYÊN VĂN mã lỗi kỹ thuật đó cho người dùng xem.',
  parameters: z.object({
    action: z.enum([
      'get_tasks_summary',
      'get_overdue_tasks',
      'get_high_priority_tasks',
      'get_clients',
      'get_my_tasks',
    ]).describe(
      'Hành động cần thực hiện: ' +
      'get_tasks_summary (tổng quan tasks), ' +
      'get_overdue_tasks (task quá hạn), ' +
      'get_high_priority_tasks (task VIP/ưu tiên cao), ' +
      'get_clients (danh sách khách hàng), ' +
      'get_my_tasks (task của user cụ thể)'
    ),
    context: z.string().optional().describe(
      'Thông tin thêm nếu cần (ví dụ: tên nhân viên, phòng ban...)'
    ),
  }),
  execute: async ({ action, context }) => {
    try {
      const session = await getBabbleSession();
      if (!session) {
        return (
          '⚠️ Clouds Agent chưa được cấu hình kết nối Babble System. ' +
          'Sếp Nghĩa cần thêm BABBLE_BOT_EMAIL và BABBLE_BOT_PASSWORD vào .env để tui lấy data sống được nhé!'
        );
      }

      let data: unknown;
      let summary = '';

      switch (action) {
        case 'get_tasks_summary': {
          data = await babbleFetch('/api/tasks');
          const tasks = data as Array<{ status: string; title: string }>;
          const total = tasks.length;
          const done = tasks.filter(t => t.status === 'Done').length;
          const inProgress = tasks.filter(t => t.status === 'InProgress').length;
          const todo = tasks.filter(t => t.status === 'Todo').length;
          const paused = tasks.filter(t => t.status === 'Paused').length;
          summary = `📊 Tổng quan Tasks (${new Date().toLocaleDateString('vi-VN')}):\n` +
            `• Tổng: ${total} task\n• ✅ Hoàn thành: ${done}\n• 🔵 Đang làm: ${inProgress}\n• 📋 Cần làm: ${todo}\n• ⏸ Tạm dừng: ${paused}`;
          break;
        }

        case 'get_overdue_tasks': {
          data = await babbleFetch('/api/tasks');
          const tasks = data as Array<{ status: string; title: string; deadline?: string; assignees?: Array<{ user: { name: string } }> }>;
          const now = new Date();
          const overdue = tasks.filter(t =>
            t.deadline && new Date(t.deadline) < now && t.status !== 'Done'
          );
          if (overdue.length === 0) {
            summary = '🎉 Không có task nào quá hạn! Cả nhóm đang on track đó bạn!';
          } else {
            summary = `⚠️ Có ${overdue.length} task đang quá hạn:\n` +
              overdue.slice(0, 8).map(t => {
                const deadline = t.deadline ? new Date(t.deadline).toLocaleDateString('vi-VN') : 'N/A';
                const assignee = t.assignees?.[0]?.user?.name || '?';
                return `• "${t.title}" — deadline: ${deadline} — phụ trách: ${assignee}`;
              }).join('\n');
            if (overdue.length > 8) summary += `\n... và ${overdue.length - 8} task khác nữa`;
          }
          break;
        }

        case 'get_high_priority_tasks': {
          data = await babbleFetch('/api/tasks');
          const tasks = data as Array<{ isHighPriority?: boolean; title: string; status: string; assignees?: Array<{ user: { name: string } }> }>;
          const vip = tasks.filter(t => t.isHighPriority && t.status !== 'Done');
          if (vip.length === 0) {
            summary = '✅ Không có task VIP nào đang pending. Relax đi!';
          } else {
            summary = `⭐ Có ${vip.length} task VIP (Khách hàng Hạng A) đang chạy:\n` +
              vip.slice(0, 8).map(t =>
                `• "${t.title}" [${t.status}]`
              ).join('\n');
          }
          break;
        }

        case 'get_clients': {
          data = await babbleFetch('/api/clients');
          const clients = data as Array<{ name: string; rank: string }>;
          const rankA = clients.filter(c => c.rank === 'A');
          summary = `🏢 Danh sách Khách hàng (${clients.length} tổng):\n` +
            `⭐ Hạng A (${rankA.length}): ${rankA.map(c => c.name).join(', ') || 'Chưa có'}\n` +
            `📋 Tổng các hạng: A(${rankA.length}) | B(${clients.filter(c => c.rank === 'B').length}) | C(${clients.filter(c => c.rank === 'C').length}) | D(${clients.filter(c => c.rank === 'D').length})`;
          break;
        }

        case 'get_my_tasks': {
          data = await babbleFetch('/api/tasks');
          const tasks = data as Array<{ title: string; status: string; assignees?: Array<{ user: { name: string } }> }>;
          const contextName = context?.toLowerCase() || '';
          const myTasks = contextName
            ? tasks.filter(t =>
                t.assignees?.some(a => a.user.name.toLowerCase().includes(contextName))
              )
            : tasks;

          summary = `📋 Tasks${contextName ? ` của ${context}` : ''}:\n` +
            myTasks.slice(0, 10).map(t => `• [${t.status}] ${t.title}`).join('\n');
          if (myTasks.length > 10) summary += `\n... và ${myTasks.length - 10} task khác`;
          break;
        }
      }

      return summary;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[babbleApi] Error:', msg);
      return `❌ Không kết nối được Babble API: ${msg}. Thử lại hoặc vào thẳng hệ thống tại https://babble-app-5tcf.vercel.app`;
    }
  },
});
