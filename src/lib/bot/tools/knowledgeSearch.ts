import { tool } from 'ai';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

export const knowledgeSearchTool = tool({
  description: 'Trích xuất và quét toàn bộ thư viện tài liệu nội bộ, nội quy, hướng dẫn của công ty. Bạn LÀ BẮT BUỘC phải dùng công cụ này liên tục để tra cứu khi nhân viên hỏi bất kỳ thứ gì liên quan đến chính sách, hướng dẫn công việc, hệ thống trước khi trả lời. Nếu không dùng bạn sẽ mất việc.',
  parameters: z.object({
    topic: z.string().describe('Chủ đề hoặc từ khóa tài liệu bạn muốn tìm (vd: "Kanban", "nội quy", "nghỉ phép"). Thực tế công cụ sẽ tự động đọc toàn bộ kho tàng nên hãy đưa từ khóa chung nhất có thể.'),
  }),
  execute: async ({ topic }) => {
    try {
      const knowledgeDir = path.join(process.cwd(), 'src/data/knowledge');
      
      // Nếu thư mục chưa có thì báo lỗi nhẹ
      if (!fs.existsSync(knowledgeDir)) {
        return "THƯ MỤC TRI THỨC src/data/knowledge CHƯA ĐƯỢC TẠO! Báo ngay với Sếp Nghĩa đẹp trai.";
      }

      // Quét tất cả các file
      const files = fs.readdirSync(knowledgeDir);
      
      // Lọc ra các file text (MD, TXT, JSON, CSV)
      const validFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.txt') || f.endsWith('.json') || f.endsWith('.csv'));

      if (validFiles.length === 0) {
        return "Hiện chưa có bất kỳ cuốn bí kíp nào trong thư viện (knowledge). Bảo Sếp Nghĩa ném file vào đi!";
      }

      let allKnowledge = "=== KHO BÁCH KHOA TOÀN THƯ BABBLE CLOUDS ===\n\n";

      for (const file of validFiles) {
        const filePath = path.join(knowledgeDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        allKnowledge += `--- BẮT ĐẦU TÀI LIỆU: [${file}] ---\n`;
        allKnowledge += content + "\n";
        allKnowledge += `--- KẾT THÚC TÀI LIỆU: [${file}] ---\n\n`;
      }

      return `Đã lấy thành công sách giáo khoa về chủ đề [${topic}]. Bạn TẬP TRUNG CAO ĐỘ đọc nội dung dưới đây để hướng dẫn cho nhân viên:\n\n${allKnowledge}`;

    } catch (error) {
      console.error('Lỗi khi đọc tri thức:', error);
      return 'Lỗi cmnr, sách giáo khoa trong thư viện bị mọt ăn hoặc không đọc được. Chửi nhân viên là ráng chịu khó dò hỏi bằng miệng đi!';
    }
  },
});
