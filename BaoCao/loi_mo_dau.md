# LỜI MỞ ĐẦU

#### 1. Lý do chọn đề tài

Bên cạnh hoạt động bán lẻ, nhiều nhà sách mở thêm không gian đọc và dịch vụ cho khách hàng thành viên mượn sách để giữ chân khách hàng và lan tỏa văn hóa đọc. Tuy nhiên, ở quy mô một nhà sách, các nghiệp vụ như tra cứu sách, ghi phiếu mượn, tính tiền phạt và nhắc hạn thường vẫn làm thủ công bằng sổ sách và Excel. Thông tin kho vì vậy dễ sai lệch, tiền phạt dễ tính nhầm và độc giả phải đến tận quầy cho mọi thao tác. Trong khi đó, các phần mềm thư viện chuyên nghiệp như Koha hay Libol được thiết kế cho thư viện có cán bộ chuyên môn, có ngưỡng vận hành quá cao so với nhu cầu của một nhà sách. Xuất phát từ thực tế đó, em chọn đề tài “Xây dựng hệ thống quản lý thư viện cho nhà sách”, với sản phẩm demo mang tên Fahasa Digital.

#### 2. Mục tiêu của đồ án

Đồ án xây dựng một hệ thống web số hóa toàn bộ vòng đời mượn – trả sách tại nhà sách: tự động cập nhật kho, tính tiền phạt, nhắc hạn và quản lý hàng chờ đặt trước; cho phép độc giả tra cứu, gửi yêu cầu mượn, gia hạn từ xa, thanh toán phạt trực tuyến và nhận gợi ý sách từ trợ lý AI; đồng thời cung cấp số liệu thống kê giúp chủ nhà sách ra quyết định.

#### 3. Đối tượng và phạm vi

Đối tượng sử dụng hệ thống gồm độc giả (khách hàng thành viên), thủ thư và quản trị viên của nhà sách. Phạm vi đồ án gồm quản lý danh mục sách; quy trình mượn, duyệt, trả, gia hạn và đặt trước; tính phạt tự động và thanh toán phạt ở môi trường thử nghiệm; trợ lý AI gợi ý sách; thống kê, báo cáo và đóng gói triển khai bằng Docker. Nghiệp vụ bán hàng, biên mục theo chuẩn thư viện chuyên nghiệp và ứng dụng di động gốc nằm ngoài phạm vi.

#### 4. Phương pháp thực hiện

Em khảo sát quy trình nghiệp vụ theo kịch bản giả định cùng các giải pháp đã có; phân tích, thiết kế hệ thống theo hướng đối tượng với UML (use case, biểu đồ lớp, biểu đồ tuần tự); cài đặt ứng dụng web theo kiến trúc ba tầng với React, Node.js/Express và MySQL; sau đó kiểm thử chức năng bằng kịch bản tự động, rà soát bảo mật đối chiếu OWASP Top 10 và đo hiệu năng trên hệ thống chạy thật.

#### 5. Bố cục báo cáo

Ngoài phần mở đầu, báo cáo gồm các chương sau:

- Chương 1 – Giới thiệu: bối cảnh, hiện trạng, các vấn đề cần giải quyết, các giải pháp đã có và giải pháp đề xuất.
- Chương 2 – Thiết kế và triển khai: yêu cầu chức năng, phi chức năng, các ràng buộc, mô hình use case, lớp, tuần tự và giao diện người dùng.
- Chương 3 – Một số thành phần khác của đồ án: kế hoạch, quy trình thực hiện, các vấn đề đạo đức, tác động xã hội và kế hoạch học tập.
- Chương 4 – Kết luận: kết quả kiểm thử, đối chiếu với yêu cầu, hạn chế và hướng phát triển.
- Chương 5 – Tài liệu tham khảo.
