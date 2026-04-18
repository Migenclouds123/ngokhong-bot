# 🌩️ Babble Clouds System — Hướng Dẫn Toàn Diện

## Giới thiệu
**Babble Clouds System** là phần mềm quản lý công việc nội bộ do **Sếp Nghĩa** xây dựng, chạy tại:
🔗 https://babble-app-5tcf.vercel.app/

Stack: Next.js 15, PostgreSQL (Prisma), Vercel KV, SSE real-time.

---

## 1. Tài khoản & Đăng nhập

### Đăng nhập
- Email: email làm việc của bạn
- Mật khẩu mặc định: `Babble@123` (đổi ngay sau lần đầu đăng nhập!)

### Đăng ký tài khoản mới
1. Vào `/register` → điền thông tin
2. Tài khoản mặc định ở trạng thái **Pending (Chờ duyệt)**
3. Cần Admin/Manager vào Admin Panel → Tab "Chờ Duyệt" → Phê duyệt + gán Phòng ban
4. Sau khi được duyệt mới dùng được hệ thống

### Phân quyền (Role)
| Role | Quyền hạn tóm tắt |
|------|-------------------|
| **Member** | Xem/tạo/sửa Task, Client, Bảng tin, Library; Không xóa User |
| **Manager** | Member + Duyệt tài khoản mới, Thêm/sửa nhân sự phòng ban |
| **Admin** | Toàn quyền tất cả, xóa User, cấp quyền CRM, đổi Role |

---

## 2. Dashboard (Tổng quan)

Trang đầu tiên sau khi đăng nhập. Hiển thị:
- **Thẻ thống kê:** Tổng task, Hoàn thành, Đang làm, Trễ hạn
- **Gauge Chart:** Tỉ lệ % hoàn thành nhiệm vụ
- **Bar Chart:** Khối lượng công việc theo từng Khách hàng
- **Red Flags:** Danh sách task ưu tiên cao đang bị trễ hạn
- Admin thấy bộ lọc Department; Member/Manager xem số liệu phòng ban mình

---

## 3. Sidebar Navigation (Menu chính)

| Icon | Module | Mô tả |
|------|--------|-------|
| 📊 | Dashboard | Tổng quan số liệu |
| ✅ | Tasks | Quản lý công việc Kanban |
| 🏢 | Clients | Quản lý khách hàng |
| 📰 | Feed | Bảng tin nội bộ |
| 📚 | Library | Thư viện AI Agents/Prompts |
| 🎓 | Academy | Học viện (đang xây dựng) |
| 💼 | CRM | Chỉ tài khoản được cấp quyền |
| ⚙️ | Admin | Quản trị nhân sự |

---

## 4. 🔔 Thông báo (Notification Bell)

Góc phải trên cùng — **Real-time SSE**, không cần refresh trang.

### Các loại thông báo:
| Type | Khi nào | Click vào |
|------|---------|-----------|
| 📋 `task_assigned` | Được giao task mới | Mở task đó |
| 💬 `task_comment` | Có bình luận mới trong task | Mở task đó |
| 🔔 `task_comment` (mention) | Bị @tag trong bình luận | Mở task đó |
| 🔄 `task_moved` | Task đổi trạng thái | Mở task đó |
| ⏸ `task_paused` | Task bị tạm dừng | Mở task đó |
| 📢 `feed_post` | Bài đăng mới trên Bảng tin | Vào Feed |

### Deep-link: Click vào thông báo task → **tự động mở TaskModal đúng task đó**

---

## 5. Profile & Avatar

- Nhấp vào **Avatar góc phải trên** để xem Profile Modal
- Thấy: Tên, Email, Role, Phòng ban, Chức danh
- Upload/thay ảnh đại diện tại đây

---

## 6. Lấy hỗ trợ

- Tag **@CloudsAgent_Bot** trên nhóm Telegram để hỏi bất kỳ thứ gì
- Vấn đề nghiêm trọng / bug: Báo trực tiếp Sếp Nghĩa
