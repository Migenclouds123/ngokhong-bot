import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';

let cachedGuide = '';

export const skillSearchTool = tool({
  description: 'Tra cứu thông tin kỹ thuật, hướng dẫn sử dụng phần mềm Task Management từ cuốn cẩm nang nội bộ.',
  parameters: z.object({
    topic: z.string().describe('Từ khóa hoặc chủ đề cần tìm kiếm trong sách hướng dẫn. Ví dụ: "đăng nhập", "chuyển trạng thái"'),
  }),
  execute: async ({ topic }) => {
    try {
      if (!cachedGuide) {
        // Fallback checks both src/data and .agent root just in case
        const filePath = path.join(process.cwd(), 'src/data/MEMBER_GUIDE.md');
        const fallbackPath = path.join(process.cwd(), '../.agent/MEMBER_GUIDE.md');
        try {
            cachedGuide = await fs.readFile(filePath, 'utf-8');
        } catch {
            cachedGuide = await fs.readFile(fallbackPath, 'utf-8');
        }
      }
      
      // Return full context to let LLM extract what it needs perfectly
      return `KẾT QUẢ TÌM KIẾM CHO "${topic}":\n\n[TOÀN VĂN CẨM NANG HƯỚNG DẪN DƯỚI ĐÂY]\n${cachedGuide}`;
    } catch (error) {
      console.error("Lỗi đọc MEMBER_GUIDE.md:", error);
      return "Không thể truy cập hệ thống tài liệu hướng dẫn thành viên ngay lúc này.";
    }
  },
});
