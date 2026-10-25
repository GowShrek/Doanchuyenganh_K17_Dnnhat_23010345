# Fahasa Digital – Hệ thống quản lý thư viện cho nhà sách

Đồ án chuyên ngành (CSE703096) – Khoa Công nghệ Thông tin, Trường Đại học Phenikaa.
Sinh viên thực hiện: Đặng Nhất Nhất.

Hệ thống web quản lý toàn bộ vòng đời mượn sách của một nhà sách có khu thư viện: tra cứu, mượn – duyệt – gia hạn – đặt trước – trả sách, tự động tính phạt và thanh toán trực tuyến (VNPay, MoMo ở môi trường sandbox), nhắc hạn trả và trợ lý AI gợi ý sách.

## Cấu trúc kho

| Thư mục | Nội dung |
|---|---|
| `QuanLyThuVien/client` | Giao diện React 18 (Vite, Ant Design, Tailwind CSS) |
| `QuanLyThuVien/server` | API Node.js 20 / Express 5, Sequelize, MySQL 8.0 |
| `QuanLyThuVien/docker-compose.yml` | Chạy cả hệ thống (cơ sở dữ liệu, máy chủ, giao diện) bằng Docker |
| `BaoCao` | Báo cáo đồ án (Word, PDF), mã nguồn các chương, biểu đồ, kịch bản và kết quả kiểm thử |

## Chạy bằng Docker

Yêu cầu: Docker Desktop (hoặc Docker Engine kèm Docker Compose).

```bash
cd QuanLyThuVien
cp .env.example .env      # rồi điền giá trị thật vào .env
docker compose up -d --build
```

- Giao diện: http://localhost:5173
- API: http://localhost:3000/api

Tệp `.env` chứa mật khẩu cơ sở dữ liệu, các khóa ký và khóa cổng thanh toán, **không được đưa lên Git**. Các biến bắt buộc: `DB_PASS`, `SECRET_ACCESS_TOKEN`, `SECRET_REFRESH_TOKEN`, `SECRET_CRYPTO`. Khóa VNPay/MoMo có thể để trống, khi đó chức năng thanh toán trực tuyến bị tắt. Khóa API của trợ lý AI (Groq, mô hình `openai/gpt-oss-120b`) và thông tin gửi email OTP được Quản trị viên nhập ở trang **Cấu hình hệ thống**.

Tài khoản quản trị mặc định được tạo khi khởi động lần đầu (xem `QuanLyThuVien/server/src/seeds/initAdmin.js`). Hãy đổi mật khẩu này ngay sau khi đăng nhập.

## Kiểm thử

Các kịch bản kiểm thử tự động nằm trong `BaoCao/tools` (chạy khi hệ thống Docker đang hoạt động); kết quả lưu ở `BaoCao/test_results`. Kết quả gần nhất: 50/55 ca kiểm thử chức năng đạt, 7/7 mục rà soát bảo mật đạt, 5/5 phép đo hiệu năng đạt. Các khiếm khuyết còn lại được trình bày trong Chương 4 của báo cáo.
