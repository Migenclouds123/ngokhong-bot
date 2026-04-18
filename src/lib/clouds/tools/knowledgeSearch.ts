import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Đọc toàn bộ knowledge base trong src/data/clouds-knowledge/
export const cloudsKnowledgeSearchTool = tool({
  description:
    'Tra cứu toàn bộ tài liệu nội bộ hệ thống Babble Clouds: hướng dẫn sử dụng, tính năng, phân quyền, quy trình. ' +
    'BẮT BUỘC gọi công cụ này TRƯỚC KHI trả lời BẤT KỲ câu hỏi nào liên quan đến phần mềm Babble Clouds. ' +
    'Không bao giờ trả lời bừa — phải dùng tool này để có nguồn chính xác.',
  parameters: z.object({
    topic: z.string().describe(
      'Chủ đề hoặc từ khóa cần tra cứu (ví dụ: "tạo task", "phân quyền", "thông báo", "CRM", "khách hàng Hạng A")'
    ),
  }),
  execute: async ({ topic }) => {
    try {
      const knowledgeDir = path.join(process.cwd(), 'src/data/clouds-knowledge');

      if (!fs.existsSync(knowledgeDir)) {
        return '⚠️ Thư mục knowledge clouds-knowledge chưa được khởi tạo. Báo Sếp Nghĩa kiểm tra server.';
      }

      const files = fs.readdirSync(knowledgeDir).filter(
        f => f.endsWith('.md') || f.endsWith('.txt') || f.endsWith('.json')
      );

      if (files.length === 0) {
        return '⚠️ Chưa có tài liệu nào trong kho tri thức Clouds. Báo Sếp Nghĩa bổ sung.';
      }

      let result = `=== KHO TRI THỨC BABBLE CLOUDS SYSTEM (topic: ${topic}) ===\n\n`;

      for (const file of files) {
        const content = fs.readFileSync(path.join(knowledgeDir, file), 'utf-8');
        result += `--- [${file}] ---\n${content}\n\n`;
      }

      return result;
    } catch (err) {
      console.error('[cloudsKnowledgeSearch] Error:', err);
      return '❌ Lỗi đọc tài liệu. Clouds Agent đang xử lý, hỏi lại sau nha!';
    }
  },
});
