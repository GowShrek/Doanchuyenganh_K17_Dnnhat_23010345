# Hệ Thống Quản Lý Thư Viện - Task Checklist

Dưới đây là danh sách các chức năng cần phát triển cho hệ thống quản lý thư viện, được trích xuất từ yêu cầu:

## 1. Các vai trò trong hệ thống

### Admin

- [x] Quản lý tài khoản _(User model + CRUD admin routes)_
- [x] Phân quyền người dùng _(ENUM role: admin/librarian/reader + middleware authAdmin, authLibrarian)_
- [x] Quản lý danh mục sách _(Category model + CRUD API /api/categories + CategoriesPage.jsx)_
- [x] Quản lý thể loại _(Genre model + CRUD API /api/genres + GenresPage.jsx + color tags)_
- [x] Quản lý nhà xuất bản _(Publisher model + CRUD API /api/publishers + PublishersPage.jsx)_
- [x] Quản lý tác giả _(Author model + CRUD API /api/authors + AuthorsPage.jsx + search by penName)_
- [x] Quản lý sách _(Book model + CRUD API /api/books + BooksPage.jsx + BookForm.jsx + upload nhiều ảnh)_
- [x] Quản lý độc giả _(ReadersPage.jsx + /api/users/admin/users)_
- [x] Quản lý mượn trả _(BorrowsPage.jsx + /api/borrows + CRUD đầy đủ lifecycle)_
- [x] Quản lý tiền phạt _(FinesPage.jsx + /api/fines + tự động sinh khi trả sách)_
- [ ] Quản lý báo cáo thống kê
- [ ] Cấu hình hệ thống

### Thủ thư

- [x] Quản lý sách
- [x] Duyệt yêu cầu mượn sách
- [x] Xác nhận trả sách
- [x] Gia hạn sách
- [x] Quản lý độc giả
- [x] Theo dõi sách quá hạn
- [x] In phiếu mượn

### Độc giả

- [x] Đăng ký tài khoản _(RegisterPage.jsx + /api/users/register)_
- [x] Đăng nhập _(LoginPage.jsx + /api/users/login, JWT cookie)_
- [x] Tìm kiếm sách
- [x] Đặt trước sách
- [x] Gửi yêu cầu mượn
- [x] Theo dõi lịch sử mượn
- [x] Gia hạn sách
- [x] Đánh giá sách
- [x] Nhận thông báo

## 2. Quản lý sách

- [x] Quản lý đầu sách
- [x] Thêm sách _(BookForm.jsx + POST /api/books)_
- [x] Sửa sách _(BookForm.jsx + PUT /api/books/:id)_
- [x] Xóa sách _(DELETE /api/books/:id)_
- [x] Ẩn/Hiện sách _(PATCH /api/books/:id/toggle)_
- [x] Xem chi tiết sách
    - [x] Hiển thị thông tin (Tên sách, ISBN, Tác giả, NXB, Năm XB, Thể loại, Ngôn ngữ, Mô tả, Ảnh bìa)
- [x] Quản lý số lượng
    - [x] Tổng số lượng
    - [x] Đang cho mượn
    - [x] Còn trong kho
    - [x] Đã mất
    - [x] Đã hỏng

## 3. Quản lý tác giả

- [x] Thêm tác giả _(AuthorsPage.jsx + POST /api/authors)_
- [x] Sửa tác giả _(AuthorsPage.jsx + PUT /api/authors/:id)_
- [x] Xóa tác giả _(DELETE /api/authors/:id)_
- [x] Tìm kiếm tác giả _(search by fullName, penName)_
- [ ] Xem danh sách sách của tác giả

## 4. Quản lý thể loại

- [x] Thêm thể loại _(GenresPage.jsx + POST /api/genres)_
- [x] Sửa thể loại _(GenresPage.jsx + PUT /api/genres/:id)_
- [x] Xóa thể loại _(DELETE /api/genres/:id)_
- [x] Hiển thị số lượng sách theo thể loại _(bookCount trong API)_

## 5. Quản lý nhà xuất bản

- [x] Thêm nhà xuất bản _(PublishersPage.jsx + POST /api/publishers)_
- [x] Sửa nhà xuất bản _(PublishersPage.jsx + PUT /api/publishers/:id)_
- [x] Xóa nhà xuất bản _(DELETE /api/publishers/:id)_
- [x] Thống kê số sách theo NXB _(bookCount trong API)_

## 6. Quản lý độc giả

- [x] Quản lý hồ sơ (Họ tên, MSSV, Email, SĐT, Khoa, Lớp, Ảnh đại diện) _(User model đủ fields)_
- [x] Thêm độc giả _(Modal tạo tài khoản + POST /api/users/admin/users)_
- [x] Khóa tài khoản _(PATCH /admin/users/:id/toggle-active)_
- [x] Mở khóa tài khoản _(PATCH /admin/users/:id/toggle-active)_
- [x] Tìm kiếm độc giả _(search by name, email, MSSV)_
- [x] Chỉnh sửa thông tin độc giả _(PUT /api/users/admin/users/:id)_
- [ ] Theo dõi lịch sử mượn của độc giả

## 7. Quản lý mượn sách

- [x] Độc giả: Chọn sách và gửi yêu cầu mượn _(POST /api/borrows)_
- [x] Thủ thư: Duyệt yêu cầu mượn _(PATCH /api/borrows/:id/approve)_
- [x] Thủ thư: Từ chối yêu cầu mượn _(PATCH /api/borrows/:id/reject)_
- [x] Thủ thư: Tạo phiếu mượn (Mã phiếu, Ngày mượn, Hạn trả, Trạng thái) _(tự sinh borrowCode)_

## 8. Quản lý trả sách

- [x] Xác nhận trả sách _(PATCH /api/borrows/:id/return)_
- [x] Cập nhật lại số lượng trong kho _(tự động khi approve/return)_
- [x] Ghi nhận sách hư hỏng _(condition: damaged)_
- [x] Ghi nhận mất sách _(condition: lost, không cộng lại kho)_
- [x] Cập nhật trạng thái trả (Đã trả, Trễ hạn, Hư hỏng, Mất sách)

## 9. Gia hạn sách

- [x] Độc giả: Gửi yêu cầu gia hạn _(RenewModal.jsx + POST /api/borrows/:id/renew + chọn ngày trả mới)_
- [x] Thủ thư: Duyệt yêu cầu gia hạn _(PATCH /api/borrows/:id/approve-renew + nút duyệt trong Borrows.jsx)_
- [x] Thủ thư: Từ chối yêu cầu gia hạn _(PATCH /api/borrows/:id/reject-renew)_
- [x] Logic quy định: Giới hạn 2 lần gia hạn, ngày trả mới phải sau hạn hiện tại

## 10. Đặt trước sách

- [x] Độc giả: Đặt trước khi sách đã hết _(BookDetail.jsx + POST /api/reservations/book/:id)_
- [x] Hệ thống: Xếp hàng chờ đặt trước _(queuePosition tự động + reorder khi hủy)_
- [x] Hệ thống: Gửi thông báo khi có sách _(notifyNextInQueue() hook vào returnBook — status: notified + expiresAt 48h)_

## 11. Quản lý tiền phạt

- [x] Phạt quá hạn _(tự động tính: 2.000đ/ngày, tối thiểu 5.000đ)_
- [x] Phạt mất sách _(Bồi thường 100% giá sách)_
- [x] Phạt hư hỏng _(30% giá sách)_

## 12. Tìm kiếm nâng cao

- [x] Tìm kiếm theo: Tên sách, ISBN, Tác giả, Thể loại, Nhà xuất bản, Năm xuất bản _(SearchPage.jsx + URL-synced filters)_
- [x] Lọc sách: Có sẵn, Đang được mượn, Sách mới _(available toggle + sortBy: newest/title/year)_

## 13. Hệ thống đánh giá sách

- [x] Độc giả: Chấm điểm (1-5 sao) và bình luận _(BookReviews.jsx — upsert, xóa, chỉnh sửa)_
- [x] Hiển thị: Điểm trung bình và số lượt đánh giá _(phân bổ sao + summary inline trên trang sách)_

## 14. Thông báo tự động

- [x] Thông báo duyệt phiếu mượn _(notifyBorrowApproved / notifyBorrowRejected)_
- [x] Thông báo duyệt / từ chối gia hạn _(notifyRenewApproved / notifyRenewRejected)_
- [x] Thông báo đặt trước có sách _(notifyReservationReady — tự động khi returnBook)_
- [x] Nhắc quá hạn tự động _(sendOverdueReminders — cron 8:00 mỗi ngày, cảnh báo D-1, D-3)_
- [x] Bell icon với badge số chưa đọc _(NotificationBell.jsx — poll 30 giây)_
- [x] Dropdown xem thông báo, đánh dấu đọc, xóa _(theo từng loại icon + màu)_

## 15. Dashboard thống kê

- [x] Thống kê tổng quan: Tổng sách, Tổng đầu sách, Tổng độc giả, Tổng lượt mượn, Số sách đang mượn, Số sách quá hạn _(Dashboard.jsx UI)_
- [x] Biểu đồ: Mượn sách theo tháng, Sách theo thể loại _(Bar + Doughnut chart)_
- [ ] Top sách được mượn nhiều, Top độc giả mượn nhiều

## 16. Xuất báo cáo

- [ ] Chức năng xuất file: Excel, PDF
- [ ] Mẫu báo cáo: Danh sách sách, Danh sách độc giả, Danh sách mượn trả, Danh sách sách quá hạn, Doanh thu tiền phạt

## 18. AI Gợi Ý Sách

- [x] Tích hợp Groq SDK (llama-3.3-70b) gợi ý sách theo yêu cầu người dùng _(POST /api/ai/chat)_
- [x] Gợi ý sách dựa trên lịch sử mượn _(user borrow history làm context)_
- [x] Chỉ gợi ý sách có trong thư viện _(catalog 80 sách phổ biến nhất làm system prompt)_
- [x] Hiển thị card sách có ảnh, tác giả, giá, trạng thái còn/hết _(AiBookCard.jsx)_
- [x] Giao diện chat giống ChatGPT _(sidebar lịch sử, canvas tin nhắn, quick prompts)_
- [x] Lưu lịch sử cuộc trò chuyện vào localStorage

## 19. QR Code

- [x] Tạo QR cho từng cuốn sách _(BookQRCode.jsx — mã hóa URL /books/:id)_
- [x] Xem QR trên trang chi tiết sách _(nút QR cạnh tiêu đề)_
- [x] Xem + In QR từ trang quản lý sách _(Admin Books — cột thao tác)_
- [x] Tải QR dạng SVG
- [x] In thẻ sách với QR (tên sách, tác giả, ISBN, URL)
