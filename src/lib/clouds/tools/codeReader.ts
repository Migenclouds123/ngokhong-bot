import { tool } from 'ai';
import { z } from 'zod';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Optional — nếu không có thì 60 req/hr
const REPO_OWNER = process.env.BABBLE_GITHUB_OWNER || 'Migenclouds123';
const REPO_NAME = process.env.BABBLE_GITHUB_REPO || 'babble-app';
const BRANCH = process.env.BABBLE_GITHUB_BRANCH || 'main';

interface GitHubFile {
  type: string;
  name: string;
  path: string;
  download_url: string | null;
}

async function githubFetch(url: string) {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CloudsAgent-Bot',
  };
  if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${res.statusText}`);
  return res.json();
}

// Đọc danh sách files/folders tại path trên repo
async function listRepoContents(repoPath: string): Promise<GitHubFile[]> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${repoPath}?ref=${BRANCH}`;
  return githubFetch(url);
}

// Đọc nội dung file cụ thể
async function readRepoFile(filePath: string): Promise<string> {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${BRANCH}`;
  const data = await githubFetch(url);
  if (data.encoding === 'base64' && data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  if (data.download_url) {
    const res = await fetch(data.download_url);
    return res.text();
  }
  throw new Error('Không đọc được nội dung file.');
}

// Đọc các file code quan trọng nhất để hiểu tính năng hệ thống
const KEY_FILES = [
  'babble-app/src/app/api/tasks/route.ts',
  'babble-app/src/app/api/tasks/[id]/comments/route.ts',
  'babble-app/src/app/api/notifications/route.ts',
  'babble-app/src/components/kanban/TaskModal.tsx',
  'babble-app/src/app/tasks/page.tsx',
  'babble-app/src/lib/notify.ts',
];

const KEY_DIRS = [
  'babble-app/src/app/api',
  'babble-app/src/app',
];

export const codeReaderTool = tool({
  description:
    'Đọc source code thực tế của dự án Babble Clouds trên GitHub để hiểu chính xác các tính năng hiện có, ' +
    'API endpoints, cấu trúc dữ liệu, và các tính năng mới nhất được triển khai. ' +
    'Dùng khi cần biết chính xác một tính năng hoạt động như thế nào hoặc API endpoint nào tồn tại. ' +
    'KHÔNG cần GitHub Token — miễn phí với 60 requests/giờ.',
  parameters: z.object({
    query: z.string().describe(
      'Mô tả tính năng/module cần đọc code (ví dụ: "notifications API", "task creation", "comment @mention", "CRM module")'
    ),
    filePath: z.string().optional().describe(
      'Đường dẫn file cụ thể trong repo nếu biết rõ (ví dụ: "babble-app/src/app/api/tasks/route.ts"). Để trống để tự động tìm.'
    ),
  }),
  execute: async ({ query, filePath }) => {
    try {
      // Nếu có đường dẫn cụ thể → đọc thẳng
      if (filePath) {
        const content = await readRepoFile(filePath);
        const MAX_CHARS = 3000;
        const truncated = content.length > MAX_CHARS
          ? content.slice(0, MAX_CHARS) + '\n\n... [đã cắt bớt - còn nhiều code hơn]'
          : content;
        return `=== CODE: ${filePath} ===\n\`\`\`\n${truncated}\n\`\`\``;
      }

      // Không biết path → tìm thông minh từ các file key
      const lowerQuery = query.toLowerCase();

      // Map query → files liên quan
      const relevantFiles: string[] = [];

      if (lowerQuery.includes('task') || lowerQuery.includes('công việc') || lowerQuery.includes('kanban')) {
        relevantFiles.push('babble-app/src/app/api/tasks/route.ts');
        relevantFiles.push('babble-app/src/app/api/tasks/[id]/route.ts');
      }
      if (lowerQuery.includes('comment') || lowerQuery.includes('bình luận') || lowerQuery.includes('mention') || lowerQuery.includes('tag')) {
        relevantFiles.push('babble-app/src/app/api/tasks/[id]/comments/route.ts');
      }
      if (lowerQuery.includes('notif') || lowerQuery.includes('thông báo')) {
        relevantFiles.push('babble-app/src/app/api/notifications/route.ts');
        relevantFiles.push('babble-app/src/lib/notify.ts');
      }
      if (lowerQuery.includes('feed') || lowerQuery.includes('bảng tin')) {
        relevantFiles.push('babble-app/src/app/api/feed/route.ts');
      }
      if (lowerQuery.includes('crm') || lowerQuery.includes('deal')) {
        relevantFiles.push('babble-app/src/app/api/crm');
      }
      if (lowerQuery.includes('user') || lowerQuery.includes('người dùng') || lowerQuery.includes('auth') || lowerQuery.includes('đăng nhập')) {
        relevantFiles.push('babble-app/src/app/api/auth');
        relevantFiles.push('babble-app/src/lib/auth.ts');
      }
      if (lowerQuery.includes('client') || lowerQuery.includes('khách hàng')) {
        relevantFiles.push('babble-app/src/app/api/clients/route.ts');
      }

      // Fallback: lấy danh sách API routes
      if (relevantFiles.length === 0) {
        try {
          const apiContents = await listRepoContents('babble-app/src/app/api');
          const dirs = (apiContents as GitHubFile[])
            .filter(f => f.type === 'dir')
            .map(f => f.name)
            .slice(0, 15);
          return `📂 Không tìm thấy file cụ thể cho "${query}". Đây là danh sách các API endpoints trong hệ thống:\n\n` +
            dirs.map(d => `• /api/${d}`).join('\n') +
            '\n\nGọi lại tool với filePath cụ thể hơn nhé!';
        } catch {
          return `❌ Không tìm được thông tin về "${query}". Có thể GitHub rate limit hoặc không kết nối được repo.`;
        }
      }

      // Đọc file đầu tiên tìm được
      const targetFile = relevantFiles[0];
      try {
        const content = await readRepoFile(targetFile);
        const MAX_CHARS = 3000;
        const truncated = content.length > MAX_CHARS
          ? content.slice(0, MAX_CHARS) + `\n\n... [file còn ${content.length - MAX_CHARS} ký tự nữa]`
          : content;
        return `=== CODE liên quan đến "${query}" ===\n📄 File: \`${targetFile}\`\n\`\`\`typescript\n${truncated}\n\`\`\``;
      } catch (readErr) {
        return `⚠️ Không đọc được ${targetFile}: ${readErr}. Thử filePath khác hoặc báo Sếp Nghĩa check repo.`;
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[codeReader] Error:', msg);

      // GitHub rate limit check
      if (msg.includes('403') || msg.includes('rate limit')) {
        return '⚠️ GitHub API rate limit tạm thời. Đặt GITHUB_TOKEN vào .env để tăng lên 5000 req/giờ. Lát thử lại nha!';
      }
      return `❌ Lỗi đọc code: ${msg}`;
    }
  },
});
