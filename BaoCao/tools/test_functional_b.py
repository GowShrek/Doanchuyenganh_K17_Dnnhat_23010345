"""Kiểm thử chức năng – phần B: đặt trước, trả sách, phạt, đánh giá, nhắc hạn, trợ lý AI."""
import datetime as dt
import time

import requests

from tlib import API, ACC, ADMIN, RUN, Recorder, d, login, meta, msg, new_reader, notifications

R = Recorder("functional_b")
admin, _ = login(*ADMIN)
lib, _ = login(ACC["librarian"]["email"], ACC["librarian"]["password"])
book = meta(lib.post(f"{API}/books", json={"title": f"TC Sách B {RUN}", "price": 100000, "totalQuantity": 1}))
bid = book["id"]
s1, u1 = new_reader("b1")
s2, u2 = new_reader("b2")
s3, u3 = new_reader("b3")


def book_qty():
    return meta(requests.get(f"{API}/books/{bid}"))


def borrow_ok(sess, bd, dd, book_id=None):
    x = meta(sess.post(f"{API}/borrows", json={"bookId": book_id or bid, "borrowDate": bd, "dueDate": dd}))
    lib.patch(f"{API}/borrows/{x['id']}/approve")
    return x["id"]


def fines_of(borrow_id):
    rows = meta(lib.get(f"{API}/fines", params={"limit": 300}))["fines"]
    return [(f["type"], float(f["amount"])) for f in rows if f["borrowId"] == borrow_id], [f for f in rows if f["borrowId"] == borrow_id]


# ── Đặt trước ──
r = s3.post(f"{API}/reservations/book/{bid}", json={})
R.add("TC-31", "Đặt trước", "BR-07", "Đặt trước khi sách vẫn còn", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}", r.status_code == 400)
b_on = borrow_ok(s1, d(0), d(7))
r = s3.post(f"{API}/reservations/book/{bid}", json={"note": "TC"})
res = meta(r) or {}
R.add("TC-32", "Đặt trước", "FR-12", "Đặt trước khi sách đã hết", "status pending; vị trí 1",
      f"HTTP {r.status_code}; status={res.get('status')}; vị trí={res.get('queuePosition')}",
      res.get("status") == "pending" and res.get("queuePosition") == 1)
r = s3.post(f"{API}/reservations/book/{bid}", json={})
R.add("TC-33", "Đặt trước", "BR-07", "Đặt trước lần 2 cùng đầu sách", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}", r.status_code == 400)
r2 = meta(s2.post(f"{API}/reservations/book/{bid}", json={})) or {}
R.add("TC-34", "Đặt trước", "FR-12", "Độc giả thứ hai đặt trước", "vị trí 2", f"vị trí={r2.get('queuePosition')}",
      r2.get("queuePosition") == 2)

# ── Trả sách đúng hạn → thông báo hàng chờ ──
r = lib.patch(f"{API}/borrows/{b_on}/return", json={"condition": "normal"})
pairs, _ = fines_of(b_on)
R.add("TC-35", "Trả sách", "FR-20, FR-31", "Trả sách đúng hạn, tình trạng bình thường",
      "status returned; kho +1; không phát sinh phạt",
      f"status={(meta(r) or {}).get('status')}; còn {book_qty()['availableQuantity']}; phạt={pairs}",
      (meta(r) or {}).get("status") == "returned" and book_qty()["availableQuantity"] == 1 and not pairs)
mine = (meta(s3.get(f"{API}/reservations/book/{bid}/my")) or {}).get("reservation") or {}
hold = None
if mine.get("expiresAt") and mine.get("notifiedAt"):
    t = lambda x: dt.datetime.fromisoformat(x.replace("Z", "+00:00"))
    hold = round((t(mine["expiresAt"]) - t(mine["notifiedAt"])).total_seconds() / 3600, 2)
ready = any(n.get("type") == "reservation_ready" for n in notifications(s3))
R.add("TC-36", "Đặt trước", "FR-32", "Có sách trả → người đầu hàng chờ được thông báo",
      "status notified; giữ chỗ 48 giờ; có thông báo reservation_ready",
      f"status={mine.get('status')}; giữ chỗ={hold} giờ; thông báo={ready}",
      mine.get("status") == "notified" and hold == 48.0 and ready)
x = meta(s3.post(f"{API}/borrows", json={"bookId": bid, "borrowDate": d(0), "dueDate": d(7)}))
lib.patch(f"{API}/borrows/{x['id']}/approve")
after = (meta(s3.get(f"{API}/reservations/my")) or {}).get("reservations", [])
st = [z["status"] for z in after if z.get("bookId") == bid]
R.add("TC-37", "Đặt trước", "FR-32", "Người được thông báo mượn sách", "Đặt trước chuyển fulfilled",
      f"trạng thái đặt trước = {st}", st == ["fulfilled"], "markFulfilled() không được gọi khi duyệt mượn")
lib.patch(f"{API}/borrows/{x['id']}/return", json={"condition": "normal"})
c = s2.patch(f"{API}/reservations/{r2.get('id')}/cancel")
R.add("TC-38", "Đặt trước", "FR-12", "Độc giả hủy đặt trước", "status cancelled",
      f"HTTP {c.status_code}; status={(meta(c) or {}).get('status')}", c.status_code == 200)

# ── Tính phạt ──
late = borrow_ok(s2, d(-20), d(-10))
lib.patch(f"{API}/borrows/{late}/return", json={"condition": "normal"})
p_late, f_late = fines_of(late)
R.add("TC-39", "Phạt", "BR-01", "Trả trễ 10 ngày", "1 phiếu quá hạn 20.000 đ", f"{p_late}", p_late == [("overdue", 20000.0)])
late1 = borrow_ok(s2, d(-5), d(-1))
lib.patch(f"{API}/borrows/{late1}/return", json={"condition": "normal"})
p1, _ = fines_of(late1)
R.add("TC-40", "Phạt", "BR-01", "Trả trễ 1 ngày", "Mức tối thiểu 5.000 đ", f"{p1}", p1 == [("overdue", 5000.0)])
dmg = borrow_ok(s2, d(0), d(7))
lib.patch(f"{API}/borrows/{dmg}/return", json={"condition": "damaged"})
pd, f_dmg = fines_of(dmg)
R.add("TC-41", "Phạt", "BR-02", "Trả sách hư hỏng, đúng hạn", "30% giá bìa = 30.000 đ", f"{pd}", pd == [("damaged", 30000.0)])
dmg2 = borrow_ok(s2, d(-9), d(-4))
lib.patch(f"{API}/borrows/{dmg2}/return", json={"condition": "damaged"})
pd2, _ = fines_of(dmg2)
R.add("TC-42", "Phạt", "BR-02", "Trả sách hư hỏng và trễ 4 ngày", "2 phiếu: hư hỏng 30.000 đ và quá hạn 8.000 đ",
      f"{sorted(pd2)}", sorted(pd2) == [("damaged", 30000.0), ("overdue", 8000.0)])
q0 = book_qty()["availableQuantity"]
lost = borrow_ok(s2, d(0), d(7))
r = lib.patch(f"{API}/borrows/{lost}/return", json={"condition": "lost"})
pl, f_lost = fines_of(lost)
q1 = book_qty()
R.add("TC-43", "Phạt", "BR-03", "Báo mất sách", "status lost; phạt 100.000 đ; kho giảm 1 và không cộng lại",
      f"status={(meta(r) or {}).get('status')}; {pl}; kho {q0} → {q1['availableQuantity']}",
      (meta(r) or {}).get("status") == "lost" and pl == [("lost", 100000.0)] and q1["availableQuantity"] == q0 - 1)
R.add("TC-44", "Sách", "FR-18", "Thống kê số bản đã mất của đầu sách", "lostQuantity = 1",
      f"lostQuantity = {q1.get('lostQuantity')}, damagedQuantity = {q1.get('damagedQuantity')}",
      q1.get("lostQuantity") == 1, "Trả sách mất/hỏng không cập nhật lostQuantity, damagedQuantity")

r = lib.patch(f"{API}/fines/{f_late[0]['id']}/pay")
R.add("TC-45", "Phạt", "FR-22", "Thủ thư xác nhận đã thu tiền mặt", "status paid", f"status={(meta(r) or {}).get('status')}",
      (meta(r) or {}).get("status") == "paid")
r = lib.patch(f"{API}/fines/{f_dmg[0]['id']}/waive", json={"reason": "TC miễn phạt"})
R.add("TC-46", "Phạt", "FR-22", "Thủ thư miễn phạt kèm lý do", "status waived", f"status={(meta(r) or {}).get('status')}",
      (meta(r) or {}).get("status") == "waived")
r = s2.post(f"{API}/fines/{f_lost[0]['id']}/payment", json={"method": "vnpay"})
url = (meta(r) or {}).get("paymentUrl", "")
R.add("TC-47", "Phạt", "FR-13", "Tạo liên kết thanh toán VNPay cho phiếu phạt của mình",
      "URL tới sandbox.vnpayment.vn, có vnp_SecureHash",
      f"HTTP {r.status_code}; host đúng={'sandbox.vnpayment.vn' in url}; có chữ ký={'vnp_SecureHash' in url}",
      "sandbox.vnpayment.vn" in url and "vnp_SecureHash" in url)
r = s1.post(f"{API}/fines/{f_lost[0]['id']}/payment", json={"method": "vnpay"})
R.add("TC-48", "Phạt", "FR-13", "Tạo thanh toán cho phiếu phạt của người khác", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}",
      r.status_code == 400)

# ── Đánh giá ──
r = s1.post(f"{API}/reviews/book/{bid}", json={"rating": 6})
R.add("TC-49", "Đánh giá", "BR-09", "Đánh giá 6 sao", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}", r.status_code == 400)
s1.post(f"{API}/reviews/book/{bid}", json={"rating": 5, "comment": "TC"})
s1.post(f"{API}/reviews/book/{bid}", json={"rating": 3, "comment": "TC sửa"})
s2.post(f"{API}/reviews/book/{bid}", json={"rating": 4})
rv = meta(requests.get(f"{API}/reviews/book/{bid}"))
R.add("TC-50", "Đánh giá", "FR-14", "Mỗi độc giả một đánh giá; tính điểm trung bình", "2 đánh giá; trung bình 3.5",
      f"tổng = {rv.get('totalRatings')}; trung bình = {rv.get('avgRating')}",
      rv.get("totalRatings") == 2 and str(rv.get("avgRating")) == "3.5")
one = [z for z in rv.get("reviews", []) if z.get("rating") == 3]
if one:
    lib.patch(f"{API}/reviews/{one[0]['id']}/toggle")
rv2 = meta(requests.get(f"{API}/reviews/book/{bid}"))
R.add("TC-51", "Đánh giá", "FR-25", "Thủ thư ẩn một đánh giá", "Đánh giá bị ẩn không hiển thị công khai",
      f"số đánh giá công khai {rv.get('totalRatings')} → {rv2.get('totalRatings')}", rv2.get("totalRatings") == 1)

# ── Nhắc hạn, quá hạn ──
b_soon = meta(lib.post(f"{API}/books", json={"title": f"TC Sách C {RUN}", "totalQuantity": 3}))
soon = borrow_ok(s1, d(-2), d(1), b_soon["id"])
od = borrow_ok(s2, d(-15), d(-3), b_soon["id"])
r = lib.post(f"{API}/notifications/trigger-overdue")
warn = any(n.get("type") == "overdue_warning" for n in notifications(s1))
R.add("TC-52", "Thông báo", "FR-33", "Nhắc phiếu đến hạn sau 1 ngày", "Có thông báo overdue_warning",
      f"HTTP {r.status_code}; có = {warn}", warn)
odv = meta(lib.get(f"{API}/borrows/{od}"))
notice = any(n.get("type") == "overdue_notice" for n in notifications(s2))
R.add("TC-53", "Thông báo", "FR-33", "Phiếu quá hạn 3 ngày được đánh dấu quá hạn và nhắc",
      "status overdue; có thông báo overdue_notice", f"status = {odv['status']}; thông báo = {notice}",
      odv["status"] == "overdue" and notice, "BorrowService.updateOverdue() không được gọi ở đâu")
ov = meta(admin.get(f"{API}/dashboard"))["stats"]["overdueBorrows"]
R.add("TC-54", "Thống kê", "FR-27", "Ô 'Quá hạn' trên trang Tổng quan", "≥ 1 (đang có phiếu quá hạn)",
      f"overdueBorrows = {ov}", ov >= 1)

# ── Trợ lý AI ──
t0 = time.time()
r = s1.post(f"{API}/ai/chat", json={"messages": [{"role": "user", "content": "Gợi ý 2 cuốn sách văn học nước ngoài"}]}, timeout=60)
el = time.time() - t0
m = meta(r) or {}
sb = m.get("suggestedBooks", [])
R.add("TC-55", "Trợ lý AI", "FR-16, NFR-03", "Hỏi trợ lý AI gợi ý sách", "Trả lời tiếng Việt; sách gợi ý có trong CSDL; ≤ 10 giây",
      f"HTTP {r.status_code}; {len(sb)} thẻ sách khớp CSDL; {el:.2f} giây; {m.get('usage', {}).get('total_tokens')} token",
      r.status_code == 200 and len(sb) > 0 and el <= 10)

R.save({"ai_answer_excerpt": (m.get("content") or "")[:400]})
