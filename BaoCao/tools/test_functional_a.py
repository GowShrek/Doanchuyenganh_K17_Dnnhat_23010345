"""Kiểm thử chức năng – phần A: tài khoản, phân quyền, sách, mượn, gia hạn."""
import re
import time

from tlib import API, ACC, ADMIN, RUN, Recorder, d, jwt_parts, login, meta, msg, new_reader, notifications
import requests

R = Recorder("functional_a")
admin, _ = login(*ADMIN)
lib, _ = login(ACC["librarian"]["email"], ACC["librarian"]["password"])

# ── Tài khoản ──
s1, u1 = new_reader("a1")
R.add("TC-01", "Tài khoản", "FR-01", "Đăng ký tài khoản hợp lệ", "HTTP 200/201, tạo tài khoản", f"HTTP {u1['register_status']}",
      u1["register_status"] in (200, 201))
r = requests.post(f"{API}/users/register", json={"fullName": "TC role", "email": f"tcrole.{RUN}@fahasa-digital.test",
                                                 "password": "Tc@12345", "role": "admin"})
row = (meta(admin.get(f"{API}/users/admin/users", params={"search": f"tcrole.{RUN}"})) or {}).get("users", [{}])[0]
R.add("TC-02", "Tài khoản", "BR-10", "Tự đăng ký kèm role=admin trong yêu cầu", "Vai trò vẫn là reader",
      f"role = {row.get('role')}", row.get("role") == "reader")
r = requests.post(f"{API}/users/register", json={k: u1[k] for k in ("fullName", "email", "password")})
R.add("TC-03", "Tài khoản", "FR-01", "Đăng ký trùng email", "HTTP 409", f"HTTP {r.status_code} – {msg(r)}",
      r.status_code == 409)
R.add("TC-04", "Tài khoản", "NFR-04", "Danh sách người dùng không trả mật khẩu", "Không có trường password",
      "Có trường password" if "password" in row else "Không có trường password", "password" not in row)

s_login, r = login(u1["email"], u1["password"])
sc = r.headers.get("Set-Cookie", "")
R.add("TC-05", "Tài khoản", "FR-02, NFR-05", "Đăng nhập đúng email và mật khẩu",
      "HTTP 200; cookie token có HttpOnly, SameSite=Strict",
      f"HTTP {r.status_code}; HttpOnly={'HttpOnly' in sc}; SameSite=Strict={'SameSite=Strict' in sc}",
      r.status_code == 200 and "HttpOnly" in sc and "SameSite=Strict" in sc)
tok = s_login.cookies.get("token")
h, p = jwt_parts(tok)
R.add("TC-06", "Tài khoản", "NFR-05", "Thuật toán ký và thời hạn access token", "RS256; 900 giây (15 phút)",
      f"alg={h.get('alg')}; exp − iat = {p['exp'] - p['iat']} giây", h.get("alg") == "RS256" and p["exp"] - p["iat"] == 900)
_, r = login(u1["email"], "sai-mat-khau")
R.add("TC-07", "Tài khoản", "FR-02", "Đăng nhập sai mật khẩu", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}",
      r.status_code == 400)
s_login.post(f"{API}/users/logout")
r = requests.get(f"{API}/users/auth", cookies={"token": tok})
R.add("TC-08", "Tài khoản", "NFR-05", "Dùng lại token cũ sau khi đăng xuất", "Bị từ chối (401)",
      f"HTTP {r.status_code}", r.status_code in (401, 403))
s1, _ = login(u1["email"], u1["password"])  # mỗi tài khoản chỉ 1 phiên: đăng nhập lại sau bước đăng xuất
uid = row.get("id")
admin.patch(f"{API}/users/admin/users/{uid}/toggle-active", json={"isActive": False})
_, r = login(f"tcrole.{RUN}@fahasa-digital.test", "Tc@12345")
R.add("TC-09", "Tài khoản", "FR-24", "Đăng nhập bằng tài khoản đã bị khóa", "HTTP 400, báo tài khoản bị khóa",
      f"HTTP {r.status_code} – {msg(r)}", r.status_code == 400 and "khóa" in msg(r))

# ── Phân quyền ──
r = requests.get(f"{API}/borrows")
R.add("TC-10", "Phân quyền", "NFR-06", "Gọi API quản trị khi chưa đăng nhập", "401", f"HTTP {r.status_code}",
      r.status_code in (401, 403))
r = s1.get(f"{API}/borrows")
R.add("TC-11", "Phân quyền", "NFR-06", "Độc giả gọi API quản trị mượn trả", "401/403", f"HTTP {r.status_code}",
      r.status_code in (401, 403))
r = lib.delete(f"{API}/users/admin/users/{uid}")
R.add("TC-12", "Phân quyền", "BR-10", "Thủ thư gọi API xóa tài khoản", "401/403 (chỉ Quản trị viên)",
      f"HTTP {r.status_code}", r.status_code in (401, 403))
r = lib.get(f"{API}/system-configs")
R.add("TC-13", "Phân quyền", "FR-30", "Thủ thư đọc cấu hình hệ thống (khóa API, OAuth)", "401/403 (chỉ Quản trị viên)",
      f"HTTP {r.status_code}, trả về {len(meta(r) or {})} khóa cấu hình", r.status_code in (401, 403),
      "Route /api/system-configs dùng authAdminOrLibrarian")

# ── Sách ──
isbn = "978" + str(int(time.time() * 1000))[-10:]
r = lib.post(f"{API}/books", json={"title": f"TC Sách A {RUN}", "isbn": isbn, "price": 100000, "totalQuantity": 2})
book = meta(r) or {}
R.add("TC-14", "Sách", "FR-18", "Thủ thư thêm sách", "HTTP 201; còn = tổng = 2",
      f"HTTP {r.status_code}; còn {book.get('availableQuantity')}/{book.get('totalQuantity')}",
      r.status_code in (200, 201) and book.get("availableQuantity") == 2)
r = lib.post(f"{API}/books", json={"title": "TC trùng ISBN", "isbn": isbn})
R.add("TC-15", "Sách", "FR-18", "Thêm sách trùng ISBN", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}", r.status_code == 400)
found = [b["id"] for b in meta(requests.get(f"{API}/books", params={"search": f"TC Sách A {RUN}"}))["books"]]
R.add("TC-16", "Sách", "FR-06", "Tìm kiếm sách theo tên", "Có sách vừa thêm", f"{len(found)} kết quả",
      book.get("id") in found)
r = s1.delete(f"{API}/books/{book['id']}")
R.add("TC-17", "Phân quyền", "BR-10", "Độc giả gọi API xóa sách", "401/403", f"HTTP {r.status_code}", r.status_code in (401, 403))
hb = meta(lib.post(f"{API}/books", json={"title": f"TC Sách ẩn {RUN}", "totalQuantity": 1}))
lib.patch(f"{API}/books/{hb['id']}/toggle")
q = f"TC Sách ẩn {RUN}"
with_flag = [b["id"] for b in meta(requests.get(f"{API}/books", params={"search": q, "isActive": "true"}))["books"]]
no_flag = [b["id"] for b in meta(requests.get(f"{API}/books", params={"search": q}))["books"]]
R.add("TC-18", "Sách", "FR-18", "Sách bị ẩn không xuất hiện ở API tra cứu công khai", "Không trả về sách bị ẩn",
      f"có isActive=true: {'không trả về' if hb['id'] not in with_flag else 'trả về'}; không truyền tham số: {'trả về' if hb['id'] in no_flag else 'không trả về'}",
      hb["id"] not in with_flag and hb["id"] not in no_flag, "Máy chủ chỉ lọc sách ẩn khi client truyền isActive=true")

# ── Mượn ──
bid = book["id"]
s2, u2 = new_reader("a2")
r = s1.post(f"{API}/borrows", json={"bookId": bid, "borrowDate": d(0), "dueDate": d(14)})
b1 = meta(r) or {}
R.add("TC-19", "Mượn sách", "FR-09", "Gửi yêu cầu mượn hợp lệ", "status pending; mã BM-YYYYMMDD-XXXXX",
      f"HTTP {r.status_code}; status={b1.get('status')}; mã={b1.get('borrowCode')}",
      b1.get("status") == "pending" and bool(re.match(r"^BM-\d{8}-\d{5}$", b1.get("borrowCode", ""))))
r = s1.post(f"{API}/borrows", json={"bookId": bid, "borrowDate": d(0), "dueDate": d(5)})
R.add("TC-20", "Mượn sách", "BR-06", "Gửi trùng yêu cầu cho cùng đầu sách", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}",
      r.status_code == 400)
r = s2.post(f"{API}/borrows", json={"bookId": bid, "borrowDate": d(3), "dueDate": d(3)})
R.add("TC-21", "Mượn sách", "FR-09", "Ngày trả không sau ngày mượn", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}",
      r.status_code == 400)
r = lib.patch(f"{API}/borrows/{b1['id']}/approve")
qty = meta(requests.get(f"{API}/books/{bid}"))["availableQuantity"]
R.add("TC-22", "Mượn sách", "FR-19", "Thủ thư duyệt yêu cầu mượn", "status approved; còn 2 → 1",
      f"status={(meta(r) or {}).get('status')}; còn {qty}", qty == 1 and (meta(r) or {}).get("status") == "approved")
r = lib.patch(f"{API}/borrows/{b1['id']}/approve")
R.add("TC-23", "Mượn sách", "FR-19", "Duyệt lại phiếu đã duyệt", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}", r.status_code == 400)
has = any(n.get("type") == "borrow_approved" for n in notifications(s1))
R.add("TC-24", "Thông báo", "FR-15", "Độc giả nhận thông báo khi phiếu được duyệt", "Có thông báo borrow_approved",
      f"có = {has}", has)
b2 = meta(s2.post(f"{API}/borrows", json={"bookId": bid, "borrowDate": d(0), "dueDate": d(7)}))
r = lib.patch(f"{API}/borrows/{b2['id']}/reject", json={"note": "TC từ chối"})
R.add("TC-25", "Mượn sách", "FR-19", "Thủ thư từ chối yêu cầu mượn", "status rejected; lưu lý do",
      f"status={(meta(r) or {}).get('status')}; note={(meta(r) or {}).get('note')}", (meta(r) or {}).get("status") == "rejected")
r = s2.post(f"{API}/borrows", json={"bookId": bid, "borrowDate": d(-400), "dueDate": d(400)})
R.add("TC-26", "Mượn sách", "FR-09", "Chọn thời hạn mượn bất thường (800 ngày, ngày mượn trong quá khứ)",
      "Bị từ chối theo quy định thời hạn mượn", f"HTTP {r.status_code} – {msg(r) or (meta(r) or {}).get('status')}",
      r.status_code == 400 and "chưa xử lý xong" not in msg(r),
      "Hệ thống chưa giới hạn thời hạn mượn và chưa chặn ngày mượn trong quá khứ")

# ── Gia hạn ──
due = meta(lib.get(f"{API}/borrows/{b1['id']}"))["dueDate"]
r = s2.post(f"{API}/borrows/{b1['id']}/renew", json={"renewDueDate": d(30)})
R.add("TC-27", "Gia hạn", "FR-11", "Gia hạn phiếu của người khác", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}", r.status_code == 400)
r = s1.post(f"{API}/borrows/{b1['id']}/renew", json={"renewDueDate": due})
R.add("TC-28", "Gia hạn", "BR-04", "Ngày trả mới không sau hạn hiện tại", "HTTP 400", f"HTTP {r.status_code} – {msg(r)}", r.status_code == 400)
ok = True
for plus in (21, 28):
    ok &= s1.post(f"{API}/borrows/{b1['id']}/renew", json={"renewDueDate": d(plus)}).status_code in (200, 201)
    ok &= lib.patch(f"{API}/borrows/{b1['id']}/approve-renew").status_code == 200
v = meta(lib.get(f"{API}/borrows/{b1['id']}"))
R.add("TC-29", "Gia hạn", "FR-11, FR-21", "Gửi và duyệt gia hạn 2 lần", f"dueDate = {d(28)}; renewCount = 2",
      f"dueDate = {v['dueDate']}; renewCount = {v['renewCount']}", ok and v["renewCount"] == 2 and v["dueDate"] == d(28))
r = s1.post(f"{API}/borrows/{b1['id']}/renew", json={"renewDueDate": d(35)})
R.add("TC-30", "Gia hạn", "BR-04", "Gia hạn lần thứ 3", "HTTP 400, báo đạt giới hạn", f"HTTP {r.status_code} – {msg(r)}", r.status_code == 400)

R.save({"book_id": bid})
