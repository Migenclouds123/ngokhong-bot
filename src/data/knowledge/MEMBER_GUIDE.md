# Hướng Dẫn Sử Dụng Babble Clouds System

Chào mừng bạn đến với **Babble Clouds System**. Tài liệu này hướng dẫn chi tiết cách sử dụng các tính năng hiện có trên hệ thống, dành riêng cho **Member (Thành viên)** và **Manager (Quản lý)**. Mọi tính năng được mô tả ở đây đều bám sát 100% với chức năng phần mềm hiện tại.

> [!NOTE]
> Hệ thống áp dụng cơ chế Role-Based Access Control (RBAC). Các tính năng bạn thấy trên giao diện sẽ phụ thuộc vào vai trò (Role) và quyền (Permissions) được cấp.

---

## 1. Tính năng chung (Dành cho mọi Vai trò)

### 1.1. Đăng ký, Đăng nhập & Cá nhân hóa
- **Truy cập phần mềm:** [Truy cập hệ thống Babble Clouds tại đây](https://babble-app-5tcf.vercel.app/) *(Vui lòng liên hệ Admin nếu link thay đổi)*
- **Đăng nhập (Dành cho tài khoản đã được cấp):**
  > 🔑 Thông tin đăng nhập mặc định:
  > - Email: (Sử dụng đúng email bạn đang dùng để làm việc)
  > - Mật khẩu mặc định: Babble@123 sau khi truy cập hệ thống vui lòng đổi mật khẩu để đảm bảo bảo mật
- **Đăng ký / Chờ Duyệt:** Khi đăng ký, tài khoản mặc định là `Pending` (Chờ duyệt). Bạn phải đợi Manager hoặc Admin phân bổ vào Phòng ban (Department) mới có thể sử dụng.
- **Tuỳ chỉnh (Profile Modal):** Nhấp vào Avatar góc phải phía trên để xem Role, Phòng ban và bấm tải lên/cập nhật ảnh đại diện của mình.
- **Sidebar & Chuông:** Thanh menu bên trái giúp chuyển đổi giữa các module. Chuông thông báo góc phải theo dõi các sự kiện liên quan đến bạn.

### 1.2. Tổng quan (Dashboard)
Ngay khi đăng nhập, bạn sẽ thấy trang Tổng quan với các số liệu sau:
- **Thẻ Thống Kê:** Tổng số công việc, Hoàn thành, Đang làm, Trễ hạn.
- **Biểu đồ (Charts):**
  - Đồng hồ đo tỉ lệ hoàn thành nhiệm vụ (Gauge Chart).
  - Biểu đồ thống kê khối lượng công việc theo từng Khách hàng (Client Bar Chart).
- **Cảnh báo (Red Flags):** Danh sách các công việc Ưu Tiên Cao nhưng đang bị trễ hạn.
- _Lưu ý:_ Chỉ có Admin mới nhìn thấy bộ lọc Department trên trang Dashboard, Manager và Member xem số liệu mặc định gắn với phòng ban của mình để chuyên tâm làm việc.

### 1.3. Khách Hàng (Clients)
Nơi quản lý dữ liệu đối tác của tổ chức:
- Danh sách hiển thị theo Hạng (Rank A, B, C, D). **Hạng A (Chiến lược)** có ký hiệu ⭐.
- Member và Manager đều có quyền **Thêm mới** và **Sửa** thông tin Khách hàng (Tên, Hạng, Liên hệ).
- Mỗi khi một Task được gán cho Khách hàng Hạng A, công việc đó sẽ tự động được đánh dấu là VIP (Ưu tiên cao).
- _Lưu ý:_ Chỉ Admin mới có quyền nhấn nút **Xóa** Khách hàng.

### 1.4. Quản Lý Công Việc (Tasks)
Module cốt lõi với 4 giao diện xem (View Tabs):
1. **📋 Kanban:** 
   - 4 Cột trạng thái: `Cần làm` (Todo), `Đang làm` (InProgress), `Tạm dừng` (Paused), `Hoàn thành` (Done).
   - Thao tác nhanh qua nút trạng thái ("Bắt đầu", "Tạm dừng", "Hoàn thành") thay vì kéo thả.
   - Tại thẻ công việc: Cung cấp Labels, Checklist (tiến độ %), Gắn khách hàng, Gắn ngày hạn (Deadline), Gán nhiều nhân sự phụ trách cùng lúc.
2. **📊 Timeline (Gantt-like):** Trực quan hóa deadline công việc nằm vắt ngang qua các ngày trong tháng.
3. **📅 Lịch (Calendar):** Xem công việc theo ngày dạng Lịch, báo đỏ ở những ngày có task trễ hạn.
4. **🗃️ Lưu Trữ (Archive):** Nơi chứa những task đã được "Lưu trữ" để phần bảng Kanban gọn gàng. Có thể Khôi phục (Restore) chúng từ đây.

**Bộ lọc Task (Filters):** Lọc theo "Tất cả", "Của tôi", "Trễ hạn", "Ưu tiên cao", hoặc thả xuống lọc theo Tên Người Phụ Trách, Thời gian.

### 1.5. Library Agent & Học Viện (Academy)
- **Library Agent:** Nơi Admin cung cấp các Prompts mẫu (AI Agents) cho các phòng ban. Từ đây, bạn có thể lọc theo phòng ban, bấm "Copy Prompt" để sao chép nhanh, hoặc mở External Link đi kèm. _Chú ý: Chỉ Admin mới có thể đăng bài hay xóa Agent._
- **Academy:** Hiện tại Module này **Đang được Sếp Nghĩa xây dựng** và chưa ra mắt.

### 1.6. Truy cập CRM
- Nút CRM luôn bị ẩn với Member/Manager. Chỉ hiển thị nếu tài khoản của bạn được **Admin trực tiếp đánh dấu Bật Quyền CRM**.

---

## 2. Các Tính Năng Dành Riêng Cho Quản Lý (MANAGER)

Ngoài việc thao tác Task/Client như một Member, Manager được mở thêm Quyền Truy Cập Tab **Quản Trị (Admin Panel)** nhằm điều phối nhân sự.

Tại Menu "Quản Trị", Manager có thể làm:
1. **Duyệt tài khoản mới (Tab Chờ Duyệt):** Bấm "Phê duyệt" để chọn Phòng ban cho nhân viên mới đăng ký.
2. **Quản lý Nhân Sự Đang Làm (Staff):** Theo dõi danh sách, sử dụng thanh tìm kiếm / Lọc theo phòng ban.
3. **Thêm / Chỉnh Sửa Nhân Sự:** 
   - Chủ động nút "Thêm nhân sự" để tạo tài khoản thay Member.
   - Sửa thông tin Member (Tên, Email, Reset Password, Đổi phòng ban, Ngày vào làm, Sinh nhật).

> [!WARNING]
> **Giới hạn bảo mật dữ liệu của Manager:**
> Mặc dù được phép tạo/sửa người dùng, các Nút / Chức năng rủi ro thao tác sai dữ liệu đều bị vô hiệu hoá trên giao diện của Manager, cụ thể:
> - **Khóa nút Xóa nhân sự:** Cấm xoá User ra khỏi Database (Chỉ Admin mới có thể nhấn Xoá).
> - **Khóa cấp quyền CRM:** Manager thấy trạng thái CRM `--` của user nhưng không bấm tắt bật được.
> - **Chặn đổi chức vụ:** Manager không thể nâng cấp Member thành Manager hay Admin, dòng Select Role bị mờ hoặc cảnh báo "Chỉ Admin mới có quyền".
