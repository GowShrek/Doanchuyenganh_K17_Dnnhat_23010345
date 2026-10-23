"""Rà soát bảo mật bằng phân tích mã nguồn tĩnh (không khai thác, không chiếm tài khoản).

Mỗi mục ghi lại bằng chứng là dòng mã nguồn liên quan. Riêng SEC-02 có một quan sát
chạy thật nhưng chỉ trên tài khoản thử nghiệm do chính kịch bản này tạo ra.
"""
import os
import re

import requests

from tlib import API, RUN, HERE, Recorder, meta

R = Recorder("security_audit")
SRV = os.path.normpath(os.path.join(HERE, "..", "..", "QuanLyThuVien", "server", "src"))


def read(rel):
    return open(os.path.join(SRV, rel), encoding="utf-8").read()


def find_line(rel, pattern):
    """Trả về (số dòng, nội dung dòng) đầu tiên khớp pattern, hoặc (None, '')."""
    for i, line in enumerate(read(rel).splitlines(), 1):
        if re.search(pattern, line):
            return i, line.strip()
    return None, ""


def grep_count(rel, pattern):
    return len(re.findall(pattern, read(rel)))


# ── SEC-01: đăng nhập Google không xác minh chữ ký ID token ──
ln, code = find_line("services/users.service.js", r"verifyIdToken\(")
ln_old, _ = find_line("services/users.service.js", r"jwtDecode\(credential\)")
has_verify = ln is not None and ln_old is None
R.add("SEC-01", "A07 – Lỗi xác thực", "NFR-06",
      "Xác minh ID token khi đăng nhập Google",
      "Máy chủ xác minh chữ ký ID token bằng khóa công khai của Google (verifyIdToken) trước khi tin vào email",
      f"users.service.js:{ln} gọi verifyIdToken với audience là Client ID" if has_verify
      else f"users.service.js:{ln_old} chỉ giải mã `jwtDecode(credential)`, không gọi verifyIdToken",
      has_verify,
      "Đã khắc phục: xác minh chữ ký, aud, iss, exp của ID token [15]" if has_verify
      else "Hậu quả: có thể đăng nhập vào tài khoản bất kỳ bằng ID token tự tạo. Khắc phục: dùng verifyIdToken [15]")

# ── SEC-02: API quên mật khẩu trả mã OTP trong phản hồi ──
ln2, code2 = find_line("controller/user.controller.js", r"metadata:\s*\{\s*token,\s*otp\s*\}")
# Quan sát benign: yêu cầu đặt lại mật khẩu cho một tài khoản thử nghiệm do chính kịch bản tạo
email = f"sec2.{RUN}@fahasa-digital.test"
requests.post(f"{API}/users/register", json={"fullName": "TC SEC2", "email": email, "password": "Tc@12345"})
r = requests.post(f"{API}/users/forgot-password", json={"email": email})
body = r.json().get("metadata", {}) if r.status_code == 200 else {}
otp_leaked = "otp" in body
R.add("SEC-02", "A07 – Lỗi xác thực", "NFR-06",
      "Mã OTP đặt lại mật khẩu không bị lộ qua phản hồi API",
      "Phản hồi của /forgot-password không chứa mã OTP (OTP chỉ gửi qua email)",
      f"quan sát trên tài khoản thử nghiệm: HTTP {r.status_code}, phản hồi chứa trường otp = {otp_leaked}"
      + (f"; user.controller.js:{ln2} đặt otp vào metadata" if ln2 else ""),
      r.status_code == 200 and not otp_leaked and ln2 is None,
      "Đã khắc phục: bỏ otp khỏi phản hồi, OTP chỉ gửi qua email" if not otp_leaked
      else "Hậu quả: chỉ cần biết email là lấy được OTP và đổi mật khẩu người khác. Khắc phục: bỏ otp khỏi phản hồi")

# ── SEC-03: callback thanh toán không kiểm tra chữ ký ──
pay = read("services/payment.service.js")
m = re.search(r"static async vnpayReturn.*?(?=\n    static |\n}\n)", pay, re.S)
block = m.group(0) if m else ""
checks_hash = bool(re.search(r"SecureHash|verifyReturnUrl|verifyIpnCall", block))
momo_blocks = re.findall(r"static async momo(?:Return|IPN).*?(?=\n    static |\n}\n)", pay, re.S)
momo_checks = len(momo_blocks) == 2 and all("verifyMomoSignature(" in b for b in momo_blocks)
R.add("SEC-03", "A08 – Lỗi toàn vẹn dữ liệu", "NFR-06",
      "Kiểm tra chữ ký (checksum) khi nhận kết quả thanh toán",
      "vnpayReturn/momoReturn kiểm tra vnp_SecureHash trước khi cập nhật phiếu phạt [20]",
      f"Hàm vnpayReturn có kiểm tra chữ ký = {checks_hash}; momoReturn/momoIPN có kiểm tra chữ ký = {momo_checks}",
      checks_hash and momo_checks,
      "Đã khắc phục: VNPay dùng verifyReturnUrl, MoMo kiểm tra chữ ký HMAC-SHA256 trước khi cập nhật phiếu phạt [16]" if checks_hash and momo_checks
      else "Hậu quả: gọi trực tiếp URL return với mã thành công làm phiếu phạt bị đánh dấu đã nộp mà không thực trả tiền. Khắc phục: kiểm tra checksum [16]")

# ── SEC-04: trạng thái quá hạn không bao giờ được cập nhật ──
calls_update = grep_count("", "") if False else None
# đếm số nơi GỌI updateOverdue (loại trừ dòng định nghĩa)
all_js = []
for root, _, files in os.walk(SRV):
    for f in files:
        if f.endswith(".js"):
            all_js.append(os.path.join(root, f))
call_sites = 0
def_site = None
for path in all_js:
    for i, line in enumerate(open(path, encoding="utf-8").read().splitlines(), 1):
        if "updateOverdue" in line:
            if "static async updateOverdue" in line:
                def_site = f"{os.path.relpath(path, SRV)}:{i}"
            else:
                call_sites += 1
R.add("SEC-04", "A04 – Thiết kế thiếu an toàn", "FR-33",
      "Hàm cập nhật trạng thái quá hạn được gọi định kỳ",
      "BorrowService.updateOverdue() được gọi trong tác vụ định kỳ hằng ngày",
      f"Định nghĩa tại {def_site}; số nơi gọi trong toàn mã nguồn máy chủ = {call_sites}",
      call_sites > 0,
      "Đã khắc phục: gọi updateOverdue() ở đầu tác vụ nhắc hạn (8:00 và kích hoạt thủ công)" if call_sites > 0
      else "Hậu quả: phiếu không bao giờ tự chuyển sang 'overdue', ô Quá hạn luôn bằng 0 và thiếu thông báo quá hạn (TC-53, TC-54). Khắc phục: gọi updateOverdue() trong tác vụ 8:00 hằng ngày")

# ── SEC-05: đặt trước hết hạn không bao giờ được xử lý ──
exp_calls = 0
exp_def = None
for path in all_js:
    for i, line in enumerate(open(path, encoding="utf-8").read().splitlines(), 1):
        if "expireOldReservations" in line:
            if "static async expireOldReservations" in line:
                exp_def = f"{os.path.relpath(path, SRV)}:{i}"
            else:
                exp_calls += 1
R.add("SEC-05", "A04 – Thiết kế thiếu an toàn", "FR-32",
      "Hàm thu hồi giữ chỗ đặt trước quá 48 giờ được gọi định kỳ",
      "ReservationService.expireOldReservations() được gọi định kỳ",
      f"Định nghĩa tại {exp_def}; số nơi gọi = {exp_calls}",
      exp_calls > 0,
      "Đã khắc phục: gọi expireOldReservations() trong tác vụ định kỳ" if exp_calls > 0
      else "Hậu quả: giữ chỗ 48 giờ không tự hết hạn, có thể chặn người kế tiếp trong hàng chờ. Khắc phục: gọi expireOldReservations() trong tác vụ định kỳ")

# ── SEC-06: khóa bí mật của cổng thanh toán được ghi cứng trong mã ──
hard = len(re.findall(r"(?:SECRET|ACCESS_KEY|SECRET_KEY|TMN_CODE)\s*\|\|\s*'[^']+'", pay))
R.add("SEC-06", "A05 – Cấu hình sai bảo mật", "NFR-07",
      "Không ghi cứng thông tin bí mật trong mã nguồn",
      "Khóa VNPay/MoMo chỉ lấy từ biến môi trường, không có giá trị dự phòng ghi cứng",
      f"Số khóa bí mật có giá trị dự phòng ghi cứng trong payment.service.js = {hard}",
      hard == 0,
      "Đã khắc phục: khóa chỉ nạp từ biến môi trường (.env), không còn giá trị mặc định" if hard == 0
      else "Hậu quả: khóa sandbox lộ trong mã nguồn; nếu vô ý thay bằng khóa thật sẽ rò rỉ. Khắc phục: bắt buộc nạp từ biến môi trường, không đặt giá trị mặc định")

# ── SEC-07: tham chiếu chéo – mật khẩu băm bằng bcrypt (điểm đạt) ──
uses_bcrypt = "bcrypt.hashSync" in read("services/users.service.js")
R.add("SEC-07", "A02 – Lỗi mật mã", "NFR-04",
      "Mật khẩu lưu dạng băm",
      "Mật khẩu băm bằng bcrypt, không lưu dạng rõ",
      f"users.service.js dùng bcrypt.hashSync = {uses_bcrypt}",
      uses_bcrypt)

R.save()
