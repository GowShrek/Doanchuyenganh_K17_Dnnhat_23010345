# 4. Kết luận

Chương này trình bày kết quả kiểm thử hệ thống, đối chiếu với các yêu cầu đã đặc tả ở Chương 2, sau đó nêu những hạn chế và hướng phát triển.

## 4.1 Kết quả kiểm thử

### 4.1.1 Môi trường và phương pháp kiểm thử

Toàn bộ kiểm thử được thực hiện trên chính hệ thống chạy bằng Docker ở máy cục bộ của em, với cấu hình trong Bảng 4.1.

**Bảng 4.1: Môi trường kiểm thử**

| Thành phần | Thông tin |
|---|---|
| Nền tảng container | Docker 29.8.0, Docker Compose |
| Máy chủ API | Node.js 20 (image `node:20-alpine`), cổng 3000 |
| Cơ sở dữ liệu | MySQL 8.0 (`mysql:8.0`) |
| Giao diện | React build tĩnh, phục vụ qua Nginx, cổng 5173 |
| Dữ liệu kiểm thử | 28 đầu sách từ tệp seed; các tài khoản và giao dịch do kịch bản kiểm thử tự tạo |
| Công cụ kiểm thử | Kịch bản Python gọi REST API (thư viện `requests`), chạy đồng thời bằng `ThreadPoolExecutor` |

Em áp dụng ba phương pháp kiểm thử:

- **Kiểm thử chức năng theo hộp đen:** gọi API như một ứng dụng khách thật, so sánh kết quả trả về và trạng thái dữ liệu với kết quả mong đợi suy ra từ FR và quy tắc nghiệp vụ. Mỗi ca kiểm thử bao gồm cả trường hợp hợp lệ và trường hợp ngoại lệ.
- **Rà soát bảo mật bằng phân tích mã nguồn tĩnh:** đối chiếu mã nguồn với các yêu cầu bảo mật (NFR-04 đến NFR-07) và danh sách OWASP Top 10:2025 [14]. Em **không thực hiện tấn công khai thác**; mỗi phát hiện được chứng minh bằng dòng mã nguồn liên quan. Riêng một phát hiện được quan sát thêm trên tài khoản thử nghiệm do chính em tạo.
- **Kiểm thử hiệu năng:** đo thời gian phản hồi của API dưới tải nhiều kết nối đồng thời.

Các kịch bản kiểm thử tự động được xây dựng với sự hỗ trợ của công cụ lập trình AI Claude Code [17] và nằm trong thư mục `BaoCao/tools`; kết quả thô của từng ca được lưu dạng JSON trong `BaoCao/test_results`.

### 4.1.2 Kiểm thử chức năng

Em xây dựng 55 ca kiểm thử chức năng (test case, đánh mã TC-01 đến TC-55), phủ 22 trong số 33 yêu cầu chức năng, tập trung vào các nghiệp vụ cốt lõi và các quy tắc nghiệp vụ BR-01 đến BR-10. Bộ kiểm thử được chạy hai lần: lần đầu đạt 48/55 ca; sau khi khắc phục các khiếm khuyết SEC-01 đến SEC-05 (mục 4.1.3), em chạy lại toàn bộ và đạt 50/55 ca. Bảng 4.2 tổng hợp kết quả lần chạy lại.

**Bảng 4.2: Tổng hợp kết quả kiểm thử chức năng**

| Nhóm chức năng | Số ca | Đạt | Không đạt |
|---|---|---|---|
| Tài khoản và phân quyền | 13 | 12 | 1 |
| Quản lý sách | 5 | 4 | 1 |
| Mượn và gia hạn | 12 | 11 | 1 |
| Đặt trước | 8 | 7 | 1 |
| Trả sách và tính phạt | 7 | 6 | 1 |
| Đánh giá | 3 | 3 | 0 |
| Thông báo và nhắc hạn | 4 | 4 | 0 |
| Thống kê và trợ lý AI | 3 | 3 | 0 |
| **Tổng cộng** | **55** | **50** | **5** |

Các kết quả nổi bật đã được kiểm chứng (đạt):

- **Quy tắc tính phạt (BR-01 đến BR-03) chính xác tuyệt đối.** Trả trễ 10 ngày bị phạt đúng 20.000 đồng; trả trễ 1 ngày bị phạt mức tối thiểu 5.000 đồng; sách hư hỏng bị phạt 30% giá bìa; trả vừa hỏng vừa trễ sinh đúng hai phiếu phạt riêng; sách mất bị phạt 100% giá bìa và không được cộng lại kho (TC-39 đến TC-43).
- **Giới hạn gia hạn (BR-04).** Hệ thống cho gia hạn đúng 2 lần và chặn lần thứ 3 (TC-29, TC-30).
- **Quy tắc đặt trước (BR-07) và hàng chờ.** Chỉ đặt trước được khi sách đã hết, mỗi độc giả một lần; khi có sách trả, người đầu hàng chờ được chuyển sang trạng thái `notified` (đã thông báo), giữ chỗ đúng 48 giờ và nhận thông báo (TC-31 đến TC-36).
- **Xác thực và phân quyền.** Access token ký RS256 hết hạn sau đúng 900 giây; token bị vô hiệu ngay sau khi đăng xuất; tài khoản bị khóa không đăng nhập được; mọi API quản trị đều từ chối người dùng không đủ quyền (TC-05 đến TC-12).
- **Nhắc hạn và quá hạn (BR-08).** Sau khi khắc phục, phiếu trễ hạn được chuyển sang trạng thái quá hạn, người mượn nhận thông báo quá hạn và ô "Quá hạn" trên trang Tổng quan phản ánh đúng (TC-52 đến TC-54).
- **Trợ lý AI.** Trả lời bằng tiếng Việt và gợi ý đúng sách có trong cơ sở dữ liệu, thời gian phản hồi khoảng 1,3–1,7 giây (TC-55).

Năm ca còn không đạt đều phản ánh các khiếm khuyết thật chưa được khắc phục, được phân tích ở mục 4.1.3 và tổng hợp ở mục 4.3:

- **TC-13 (FR-30):** thủ thư đọc được cấu hình hệ thống (khóa API, OAuth), do API cấu hình cho phép cả vai trò Thủ thư.
- **TC-18 (FR-18):** sách bị ẩn vẫn xuất hiện ở API tra cứu công khai nếu ứng dụng khách không truyền tham số lọc.
- **TC-26 (FR-09):** hệ thống chấp nhận thời hạn mượn 800 ngày và ngày mượn trong quá khứ.
- **TC-37 (FR-32):** độc giả đứng đầu hàng chờ đã mượn được sách, nhưng đặt trước vẫn ở trạng thái `notified` thay vì chuyển sang `fulfilled` (hoàn tất).
- **TC-44 (FR-18):** trả sách mất hoặc hỏng không cập nhật số bản mất, số bản hỏng của đầu sách.

Hai ca TC-53 (phiếu quá hạn không được đánh dấu và nhắc) và TC-54 (ô "Quá hạn" luôn bằng 0) không đạt ở lần chạy đầu, và đã đạt sau khi khắc phục SEC-04.

### 4.1.3 Kiểm thử bảo mật và các khiếm khuyết phát hiện

Lần rà soát mã nguồn đầu tiên phát hiện sáu khiếm khuyết bảo mật và thiết kế (Bảng 4.3), đối chiếu với danh mục OWASP Top 10:2025 [14]. Em đã khắc phục cả sáu khiếm khuyết, trong đó có ba khiếm khuyết nghiêm trọng, rồi chạy lại toàn bộ kịch bản rà soát và kiểm thử.

**Bảng 4.3: Các khiếm khuyết phát hiện và kết quả khắc phục**

| Mã | Khiếm khuyết | Bằng chứng (mã nguồn ban đầu) | Mức độ | Cách khắc phục | Trạng thái |
|---|---|---|---|---|---|
| SEC-01 | Đăng nhập Google chỉ giải mã ID token mà không xác minh chữ ký | `users.service.js:111` dùng `jwtDecode(credential)` | Nghiêm trọng (A07) | Gọi `verifyIdToken` để kiểm tra chữ ký, `aud`, `iss`, `exp`; từ chối email chưa xác minh [15] | Đã khắc phục |
| SEC-02 | API quên mật khẩu trả mã OTP ngay trong phản hồi | `user.controller.js:124` đặt `otp` vào `metadata` | Nghiêm trọng (A07) | Bỏ `otp` khỏi phản hồi; OTP chỉ gửi qua email | Đã khắc phục |
| SEC-03 | Kết quả thanh toán không được kiểm tra chữ ký | `payment.service.js`: `vnpayReturn` chỉ xét `vnp_ResponseCode`; `momoReturn`, `momoIPN` chỉ xét `resultCode` | Nghiêm trọng (A08) | VNPay: kiểm tra `vnp_SecureHash` bằng `verifyReturnUrl`; MoMo: kiểm tra chữ ký HMAC-SHA256 [16] | Đã khắc phục |
| SEC-04 | Trạng thái quá hạn không bao giờ được cập nhật | `borrow.service.js:211` định nghĩa `updateOverdue()` nhưng không có nơi gọi | Trung bình (A04) | Gọi ở đầu tác vụ nhắc hạn (lúc 8:00 và khi kích hoạt thủ công) | Đã khắc phục |
| SEC-05 | Giữ chỗ đặt trước quá 48 giờ không tự hết hạn | `reservation.service.js:151` định nghĩa `expireOldReservations()` nhưng không có nơi gọi | Trung bình (A04) | Gọi trong cùng tác vụ định kỳ | Đã khắc phục |
| SEC-06 | Khóa bí mật của cổng thanh toán ghi cứng trong mã nguồn | `payment.service.js`: 4 khóa có giá trị dự phòng ghi cứng | Trung bình (A05) | Nạp từ biến môi trường (tệp `.env` không đưa lên kho mã); bỏ giá trị mặc định ghi cứng ở cả `docker-compose.yml` và phía giao diện | Đã khắc phục |

**Kiểm chứng sau khắc phục.** Kịch bản rà soát được chạy trên cả bản mã nguồn ban đầu (báo đủ sáu khiếm khuyết) và bản đã sửa (7/7 mục đạt), nên kết quả được tính từ mã nguồn thật chứ không ghi sẵn. Ngoài ra, em thử trực tiếp trong container máy chủ:

- ID token Google tự tạo (không có chữ ký) bị từ chối với thông báo "Thông tin đăng nhập Google không hợp lệ".
- Kết quả VNPay có chữ ký đúng được chấp nhận; khi sửa số tiền hoặc dùng chữ ký giả thì bị từ chối.
- Kết quả MoMo có chữ ký đúng được chấp nhận; kết quả không có chữ ký hợp lệ bị từ chối.
- Phản hồi của API quên mật khẩu không còn chứa mã OTP.
- Khi khóa cổng thanh toán được nạp từ tệp `.env`, việc tạo liên kết thanh toán VNPay vẫn hoạt động (TC-47).

Lần kiểm chứng này chưa bao gồm một giao dịch thật trên môi trường sandbox của VNPay, MoMo và chưa thử đăng nhập bằng tài khoản Google thật sau khi sửa.

Ngoài ra, kiểm thử chức năng và rà soát mã nguồn còn phát hiện ba vấn đề về phân quyền, logic và giao diện:

- **Thủ thư đọc được cấu hình hệ thống (TC-13).** Route `/api/system-configs` dùng middleware `authAdminOrLibrarian`, nên thủ thư cũng đọc được các khóa API và thông tin OAuth, trong khi theo thiết kế (FR-30) đây là quyền của Quản trị viên. Hướng khắc phục: đổi sang middleware `authAdmin`.
- **Sách bị ẩn vẫn xuất hiện ở API tra cứu công khai (TC-18).** Máy chủ chỉ lọc sách ẩn khi ứng dụng khách truyền tham số `isActive=true`; nếu không truyền, sách đã ẩn vẫn được trả về. Hướng khắc phục: với người dùng chưa đăng nhập hoặc là độc giả, luôn mặc định chỉ trả về sách đang hiển thị.
- **Giao diện chưa có nút đăng nhập Google.** Hàm gọi API `requestLoginGoogle` đã được viết ở phía giao diện nhưng chưa được màn hình nào sử dụng, nên FR-03 hiện chỉ dùng được qua API. Hướng khắc phục: thêm nút đăng nhập Google (thư viện `@react-oauth/google` đã được cài) vào trang đăng nhập.

Bên cạnh các khiếm khuyết, em cũng xác nhận một số biện pháp bảo mật đã được cài đặt đúng: mật khẩu băm bằng bcrypt (SEC-07 đạt, NFR-04), token ký RS256 và bị thu hồi khi đăng xuất (NFR-05), cookie đặt `HttpOnly` và `SameSite=Strict` (TC-05), phân quyền theo vai trò hoạt động ở hầu hết các API (TC-10 đến TC-12).

### 4.1.4 Kiểm thử hiệu năng

Kết quả đo hiệu năng trên máy cục bộ được trình bày trong Bảng 4.4. Lưu ý đây là số đo trên máy phát triển, không phải trên máy chủ sản xuất.

**Bảng 4.4: Kết quả kiểm thử hiệu năng**

| Mã | Phép đo | Tiêu chí (NFR) | Kết quả | Đánh giá |
|---|---|---|---|---|
| PERF-01 | `GET /api/books`, 200 yêu cầu, 20 kết nối đồng thời | Trung vị ≤ 300 ms; p95 ≤ 1000 ms; lỗi 0% (NFR-01) | Trung vị 95 ms; p95 151 ms; tối đa 191 ms; 0 lỗi | Đạt |
| PERF-02 | `GET /api/books/:id`, 100 yêu cầu, 20 kết nối đồng thời | Trung vị ≤ 300 ms; lỗi 0% (NFR-01) | Trung vị 63 ms; p95 71 ms; 0 lỗi | Đạt |
| PERF-03 | Nén gzip và cache tài nguyên tĩnh qua Nginx | Có gzip và `Cache-Control: immutable` (NFR-02) | gzip; `max-age=31536000, public, immutable` | Đạt |
| PERF-04 | Thời gian phản hồi `POST /api/ai/chat` | ≤ 10 giây (NFR-03) | 1,7 giây | Đạt |
| PERF-05 | Ba dịch vụ Docker và cổng publish | client và server trả 200 (NFR-11) | client 5173 và server 3000 đều 200 | Đạt |

Hệ thống đáp ứng tốt các yêu cầu hiệu năng đã đặt ra: API tra cứu sách phản hồi dưới 200 ms ngay cả với 20 kết nối đồng thời, và trợ lý AI phản hồi nhanh hơn nhiều so với ngưỡng 10 giây.

## 4.2 Đối chiếu với yêu cầu chức năng và phi chức năng

Bảng 4.5 và Bảng 4.6 đối chiếu mức độ hoàn thành của các yêu cầu đã đặc tả ở Chương 2. Mức đánh giá gồm: **Đạt** (hoạt động đúng, đã kiểm chứng), **Đạt một phần** (hoạt động nhưng còn khiếm khuyết), **Chưa đạt** (không hoạt động như yêu cầu).

**Bảng 4.5: Đối chiếu yêu cầu chức năng**

| Mã | Yêu cầu | Mức độ | Ghi chú |
|---|---|---|---|
| FR-01 | Đăng ký tài khoản | Đạt | TC-01 đến TC-03 |
| FR-02 | Đăng nhập, đăng xuất bằng email | Đạt | TC-05 đến TC-09 |
| FR-03 | Đăng nhập bằng Google | Đạt một phần | API xác minh đúng ID token (SEC-01 đã khắc phục); giao diện chưa có nút đăng nhập Google |
| FR-04 | Khôi phục mật khẩu bằng OTP | Đạt | OTP chỉ gửi qua email (SEC-02 đã khắc phục) |
| FR-05 | Quản lý hồ sơ cá nhân | Đạt | Kiểm thử giao diện (Hình 2.26) |
| FR-06 | Tìm kiếm và lọc sách | Đạt | TC-16 |
| FR-07 | Xem chi tiết sách | Đạt | TC-50, PERF-02 |
| FR-08 | Xem tin tức, gửi liên hệ | Đạt | Dữ liệu demo đã tạo |
| FR-09 | Gửi yêu cầu mượn sách | Đạt một phần | Đúng với dữ liệu hợp lệ; chưa giới hạn thời hạn mượn và chưa chặn ngày mượn quá khứ (TC-26) |
| FR-10 | Theo dõi lịch sử mượn | Đạt | TC-19, Hình 2.25 |
| FR-11 | Gửi và duyệt gia hạn | Đạt | TC-27 đến TC-30 |
| FR-12 | Đặt trước sách | Đạt | TC-31 đến TC-34, TC-38 |
| FR-13 | Xem và thanh toán tiền phạt | Đạt | Tạo link và phân quyền đúng (TC-47, TC-48); kết quả thanh toán được kiểm tra chữ ký (SEC-03 đã khắc phục) |
| FR-14 | Đánh giá sách | Đạt | TC-49, TC-50 |
| FR-15 | Nhận và quản lý thông báo | Đạt | TC-24, TC-52 |
| FR-16 | Trò chuyện với trợ lý AI | Đạt | TC-55 |
| FR-17 | Quản lý danh mục, thể loại, tác giả, nhà xuất bản | Đạt | Dữ liệu demo, kiểm thử giao diện |
| FR-18 | Quản lý đầu sách | Đạt một phần | Thêm sách, chặn trùng ISBN đúng (TC-14, TC-15); sách bị ẩn vẫn lộ ở API tra cứu công khai (TC-18) |
| FR-19 | Duyệt, từ chối yêu cầu mượn | Đạt | TC-22, TC-23, TC-25 |
| FR-20 | Xác nhận trả sách | Đạt một phần | Cập nhật kho và phiếu đúng; chưa cập nhật `lostQuantity`, `damagedQuantity` (TC-44) |
| FR-21 | Duyệt, từ chối gia hạn | Đạt | TC-29 |
| FR-22 | Quản lý tiền phạt | Đạt | TC-45, TC-46 |
| FR-23 | Quản lý đặt trước | Đạt một phần | Đặt trước không tự chuyển `fulfilled` khi người chờ mượn (TC-37); giữ chỗ quá 48 giờ đã tự hết hạn (SEC-05 đã khắc phục) |
| FR-24 | Quản lý độc giả | Đạt | TC-09 |
| FR-25 | Kiểm duyệt đánh giá | Đạt | TC-51 |
| FR-26 | Quản lý bài viết và liên hệ | Đạt | Dữ liệu demo |
| FR-27 | Xem bảng thống kê | Đạt | TC-54 (sau khi khắc phục SEC-04) |
| FR-28 | Xuất báo cáo | Đạt | Kiểm thử giao diện (Hình 2.33) |
| FR-29 | Quản lý tài khoản, phân quyền | Đạt | TC-02, TC-12 |
| FR-30 | Cấu hình hệ thống | Đạt một phần | Hoạt động nhưng thủ thư cũng truy cập được (TC-13) |
| FR-31 | Tự động tính tiền phạt | Đạt | TC-39 đến TC-43 |
| FR-32 | Tự động thông báo hàng chờ | Đạt | TC-36 |
| FR-33 | Nhắc hạn trả tự động | Đạt | TC-52, TC-53 (sau khi khắc phục SEC-04) |

Tổng hợp: trong 33 yêu cầu chức năng, **27 đạt** và **6 đạt một phần**, không có yêu cầu nào hoàn toàn chưa đạt. Sau khi khắc phục SEC-01 đến SEC-05, bốn yêu cầu FR-04, FR-13, FR-27, FR-33 chuyển từ đạt một phần sang đạt. Các yêu cầu còn đạt một phần đều do những khiếm khuyết chưa khắc phục ở mục 4.1.2 và 4.1.3, phần lớn là lỗi cài đặt nhỏ và có hướng khắc phục rõ ràng.

**Bảng 4.6: Đối chiếu yêu cầu phi chức năng**

| Mã | Yêu cầu | Mức độ | Căn cứ |
|---|---|---|---|
| NFR-01 | Hiệu năng API tra cứu | Đạt | PERF-01, PERF-02 |
| NFR-02 | Tải trang nhanh, nén, cache | Đạt | PERF-03 |
| NFR-03 | Trợ lý AI phản hồi ≤ 10 giây | Đạt | PERF-04 |
| NFR-04 | Mật khẩu, OTP không lưu dạng rõ | Đạt | SEC-07, TC-04 |
| NFR-05 | Xác thực token an toàn | Đạt | TC-05, TC-06, TC-08 |
| NFR-06 | Phân quyền và toàn vẹn dữ liệu | Đạt một phần | SEC-01, SEC-02, SEC-03 đã khắc phục; còn TC-13 (thủ thư đọc được cấu hình) và TC-18 (sách ẩn lộ qua API công khai) |
| NFR-07 | Không lộ bí mật trong mã nguồn | Đạt | SEC-06 đã khắc phục: mọi khóa nạp từ tệp `.env` |
| NFR-08 | Tự phục hồi, dữ liệu bền vững | Đạt | Cấu hình `restart`, healthcheck, volume (Bảng 2.8) |
| NFR-09 | Dễ sử dụng | Đạt | Giao diện tiếng Việt; gửi yêu cầu mượn trong 3 thao tác (Hình 2.22, 2.23) |
| NFR-10 | Tương thích trình duyệt, responsive | Đạt một phần | Mới kiểm thử trên trình duyệt nhân Chromium ở màn hình máy tính; chưa kiểm thử trên Firefox và trên điện thoại |
| NFR-11 | Triển khai bằng một lệnh | Đạt | PERF-05, `docker compose up` |
| NFR-12 | Mã nguồn dễ mở rộng | Đạt | Kiến trúc phân lớp, định dạng thống nhất |
| NFR-13 | Hạn chế dữ liệu cá nhân gửi ra ngoài | Đạt | Mã `ai.service.js` chỉ gửi tên và thể loại sách |

## 4.3 Hạn chế và hướng phát triển

### 4.3.1 Kết quả đạt được

Em đã xây dựng hoàn chỉnh một hệ thống web quản lý thư viện cho nhà sách với đầy đủ vòng đời nghiệp vụ mượn – duyệt – gia hạn – đặt trước – trả – phạt – thanh toán, cùng các tiện ích hiện đại là trợ lý AI gợi ý sách và thanh toán trực tuyến. Hệ thống được đóng gói bằng Docker, chạy được chỉ với một lệnh, và đáp ứng tốt các yêu cầu hiệu năng. Phần lớn các yêu cầu chức năng và phi chức năng đã đạt; các quy tắc nghiệp vụ cốt lõi hoạt động chính xác.

### 4.3.2 Hạn chế

Qua kiểm thử, em xác định các hạn chế sau:

- **Về bảo mật:** em đã khắc phục cả sáu khiếm khuyết đã phát hiện, kể cả ba khiếm khuyết nghiêm trọng; còn việc thủ thư đọc được cấu hình hệ thống (TC-13). Các bản sửa mới được kiểm chứng bằng kiểm thử tự động và thử giả mạo trong container, chưa thử lại với giao dịch sandbox và tài khoản Google thật.
- **Về logic nghiệp vụ:** đặt trước không tự chuyển `fulfilled` khi người chờ đã mượn (TC-37); số bản mất và hỏng của đầu sách không được cập nhật (TC-44); chưa giới hạn thời hạn mượn (TC-26); sách bị ẩn vẫn lộ qua API tra cứu công khai (TC-18).
- **Về giao diện:** chưa có nút đăng nhập Google dù máy chủ đã hỗ trợ (FR-03).
- **Về tính đúng đắn của dữ liệu hiển thị:** một số số liệu trên trang chủ và trang đăng nhập được gán cứng, không phản ánh dữ liệu thật (mục 3.3).
- **Về phạm vi kiểm thử:** em mới kiểm thử ở mức API và một phần giao diện; chưa có kiểm thử tự động cho tầng giao diện, chưa kiểm thử trên nhiều trình duyệt và trên thiết bị di động thật.
- **Về triển khai:** hệ thống mới chạy cục bộ, chưa được triển khai lên máy chủ công khai có HTTPS; cổng thanh toán mới ở môi trường sandbox.
- **Về trợ lý AI:** gợi ý phụ thuộc mô hình bên ngoài và có thể sai (ví dụ phân loại nhầm thể loại sách ở mục 3.3); số lượt hỏi mỗi ngày bị giới hạn bởi gói miễn phí.

### 4.3.3 Hướng phát triển

Dựa trên các hạn chế, em đề xuất hướng phát triển theo thứ tự ưu tiên:

1. **Khắc phục các khiếm khuyết còn lại:** các lỗi TC-13, TC-18, TC-26, TC-37, TC-44 theo hướng khắc phục ở mục 4.1.2, 4.1.3; bổ sung nút đăng nhập Google trên giao diện.
2. **Bổ sung kiểm thử tự động** cho cả tầng Service và tầng giao diện, tích hợp vào quy trình tích hợp liên tục (CI).
3. **Triển khai lên máy chủ thật** có tên miền và HTTPS, đặt múi giờ Việt Nam, và sao lưu định kỳ hai volume dữ liệu (`db_data`, `uploads_data`).
4. **Hoàn thiện các chức năng còn dang dở** theo README: thống kê nâng cao, xem danh sách sách theo tác giả, theo dõi lịch sử mượn của độc giả từ phía quản trị.
5. **Mở rộng tính năng:** thông báo qua email hoặc đẩy (push), mượn và đọc tài liệu điện tử, ứng dụng di động, và cải thiện chất lượng gợi ý của trợ lý AI.

### 4.3.4 Kết luận chung

Đồ án đã đạt được mục tiêu đề ra là xây dựng một hệ thống quản lý thư viện cho nhà sách, giải quyết các vấn đề VĐ-01 đến VĐ-06 của quy trình thủ công. Quan trọng hơn kết quả sản phẩm, quá trình kiểm thử nghiêm túc đã giúp em phát hiện và khắc phục những khiếm khuyết trong chính sản phẩm của mình, đặc biệt là ba lỗ hổng bảo mật nghiêm trọng, và rút ra bài học về tầm quan trọng của việc đọc kỹ tài liệu chính thức và rà soát bảo mật ngay trong quá trình phát triển, thay vì chỉ kiểm thử chức năng. Đây là nền tảng để em tiếp tục hoàn thiện hệ thống thành một sản phẩm có thể sử dụng thật.
