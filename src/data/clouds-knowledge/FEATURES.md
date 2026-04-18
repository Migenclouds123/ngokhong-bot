# 🛠️ Babble Clouds — Chi Tiết Tính Năng Từng Module

## Module 1: TASKS (Quản lý công việc)

### 4 View Tabs:
1. **📋 Kanban** — Bảng kéo thả theo trạng thái
2. **📊 Timeline (Gantt)** — Trực quan deadline theo tháng
3. **📅 Calendar** — Xem task theo ngày trong lịch
4. **🗃️ Archive** — Kho lưu trữ task đã xong

### Trạng thái Task (Status):
| Status | Màu | Hành động |
|--------|-----|-----------|
| Cần làm (Todo) | Xám | Bấm "Bắt đầu →" |
| Đang làm (InProgress) | Xanh | Bấm "Tạm dừng" hoặc "Hoàn thành ✓" |
| Tạm dừng (Paused) | Cam | Bấm "▶ Tiếp tục" |
| Hoàn thành (Done) | Xanh lá | Bấm "← Mở lại" nếu cần |

### Tạo Task mới:
1. Bấm nút **"TẠO CÔNG VIỆC"** góc phải trên
2. Điền: Tiêu đề (*bắt buộc*), Mô tả, Khách hàng, Giao cho (nhiều người), Hạn chót (*bắt buộc*)
3. Task giao cho **Khách hàng Hạng A → tự động đánh dấu ⭐ VIP (Ưu tiên cao)**
4. Bấm **"Tạo task"**

### Bên trong Task Modal (chỉ khi edit):
- **Labels (Nhãn dán):** Cao/Trung bình/Thấp/Design/Content/Code/Review/Bug, hoặc tự tạo
- **Checklist:** Danh sách việc cần làm, tick xong từng mục, hiện % tiến độ
- **Comments & @mentions:** Bình luận, tag đồng nghiệp bằng `@Tên` → người được tag nhận thông báo ngay
- **Activity Log:** Nhật ký mọi thay đổi trạng thái

### Bộ lọc Task:
- **Tất cả** | **Của tôi** | **Trễ hạn** | **Ưu tiên cao**
- Lọc theo Tên người phụ trách
- Lọc theo Phòng ban (Admin/Manager)
- Lọc theo Khoảng thời gian tạo

### Lưu trữ (Archive) & Khôi phục:
- Bấm **"Lưu trữ"** trên thẻ task → task vào tab Archive
- Vào tab Archive → bấm **"Khôi phục"** để đưa lại Kanban
- Admin có thể **Xóa vĩnh viễn** từ Archive

---

## Module 2: CLIENTS (Khách hàng)

- Danh sách hiển thị theo Hạng: **A ⭐ | B | C | D**
- Hạng A = Chiến lược, task liên quan → tự động VIP
- Mọi Role được **Thêm mới** và **Sửa** thông tin
- Chỉ Admin mới **Xóa** được
- Thông tin: Tên, Hạng, Ngành nghề, Website, Tổng giá trị hợp đồng, Liên hệ

---

## Module 3: FEED (Bảng tin nội bộ)

- Đăng bài: Text + ảnh (nhiều ảnh) + link video YouTube/Vimeo
- Like/reaction bài: 👍 ❤️ 🎉 😮 👀
- Bình luận trên bài đăng
- Khi ai đó đăng bài → **tất cả nhân viên nhận thông báo**

---

## Module 4: LIBRARY AGENT (Thư viện AI)

- Nơi Admin đăng các **AI Prompt mẫu** cho từng phòng ban
- Nhân viên: lọc theo phòng ban → bấm **"Copy Prompt"** để dùng ngay
- Có thể gắn External Link kèm theo
- Chỉ Admin: Tạo mới / Xóa

---

## Module 5: CRM (Quản lý Deal)

- **Chỉ hiển thị** với tài khoản được Admin bật quyền CRM
- Quản lý Deals theo pipeline: Tiếp cận → Khảo sát → Báo giá → Đàm phán → Chốt → Thất bại
- Gắn Deal với Khách hàng và người phụ trách
- Giá trị deal, ngày dự kiến chốt, ghi chú

---

## Module 6: ADMIN PANEL (Quản trị)

### Tab "Chờ Duyệt":
- Danh sách tài khoản mới đăng ký (Pending)
- Bấm **"Phê duyệt"** → chọn Phòng ban → tài khoản Active

### Tab "Nhân sự" (Staff):
- Danh sách toàn bộ nhân viên, tìm kiếm, lọc phòng ban
- Sửa: Tên, Email, Reset Password, Đổi phòng ban, Ngày sinh, Ngày vào làm
- Admin: Xóa user, Bật/tắt quyền CRM, Nâng/hạ Role
- Manager: Thêm/sửa nhân sự (không xóa, không đổi Role)

### Thêm nhân sự trực tiếp:
1. Admin/Manager bấm **"Thêm nhân sự"**
2. Điền Email, Tên, Role, Phòng ban
3. Mật khẩu mặc định: `Babble@123`

---

## Module 7: NOTIFICATIONS (Thông báo)

- **Bell icon** góc phải — hiện badge đỏ khi có thông báo chưa đọc
- Click vào thông báo task → **nhảy thẳng vào task đó** (deep-link)
- Click ✓ trên từng thông báo → đánh dấu 1 cái đã đọc
- "Đọc tất cả" → clear toàn bộ

### @Mention trong comment:
Gõ `@` + tên đồng nghiệp trong ô bình luận → **gợi ý tên xuất hiện** → chọn → gửi → người được nhắc nhận thông báo ngay

---

## Tính năng đặc biệt: VIP Task ⭐

Khi task gắn với **Khách hàng Hạng A**:
- Thẻ task hiện badge **"★ VIP · Hạng A"**
- Luôn đứng đầu danh sách (sort ưu tiên cao lên trước)
- Hiện cảnh báo màu vàng trong TaskModal

---

## Lỗi thường gặp & Cách xử lý

| Lỗi | Nguyên nhân | Cách sửa |
|-----|-------------|----------|
| Không thấy task | Bị lọc sai department | Đổi filter Team sang "Tất cả" |
| Tạo task báo lỗi | Chưa chọn Deadline | Điền Hạn chót (bắt buộc) |
| Không nhận thông báo | SSE bị disconnect | Reload trang — kết nối tự khôi phục |
| Không vào được CRM | Chưa được cấp quyền | Nhờ Admin bật quyền CRM cho tài khoản |
| Tài khoản Pending | Chưa được duyệt | Nhờ Admin/Manager vào quản trị duyệt |
