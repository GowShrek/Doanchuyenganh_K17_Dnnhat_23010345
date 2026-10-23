"""Tạo dữ liệu demo cho báo cáo qua REST API của hệ thống (chạy trên localhost).

- Tạo ảnh bìa minh họa (tự sinh bằng Pillow) và gán cho sách đã seed.
- Tạo tài khoản thủ thư / độc giả thử nghiệm (lưu vào test_accounts.json).
- Tạo phiếu mượn ở nhiều trạng thái, phiếu phạt, đặt trước, đánh giá, bài viết, liên hệ.
Chạy: python seed_demo.py
"""
import json
import os
import re
import secrets
import textwrap

import requests
from PIL import Image, ImageDraw, ImageFont

API = "http://localhost:3000/api"
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, "..", "..", "QuanLyThuVien"))
ACCOUNTS_FILE = os.path.join(HERE, "test_accounts.json")
COVER_DIR = os.path.join(HERE, "..", "demo_covers")


def admin_credentials():
    src = open(os.path.join(REPO, "server", "src", "seeds", "initAdmin.js"), encoding="utf-8").read()
    email = re.search(r"const email = '([^']+)'", src).group(1)
    pw = re.search(r"bcrypt\.hash(?:Sync)?\(\s*'([^']+)'", src)
    if not pw:
        raise SystemExit("Không đọc được mật khẩu admin từ initAdmin.js")
    return email, pw.group(1)


def session_login(email, password):
    s = requests.Session()
    r = s.post(f"{API}/users/login", json={"email": email, "password": password})
    r.raise_for_status()
    return s


def ok(r):
    if r.status_code >= 400:
        raise RuntimeError(f"{r.request.method} {r.url} -> {r.status_code} {r.text[:300]}")
    return r.json().get("metadata")


# ───────────────────────── ảnh bìa minh họa ─────────────────────────
PALETTE = ["#1f4e79", "#7b2d26", "#2e6b4f", "#5b3f8c", "#8a5a00", "#264653", "#9c2c5a", "#3d5a80",
           "#6d597a", "#2a9d8f", "#b5651d", "#355070"]


def make_cover(path, title, author, idx):
    W, H = 400, 600
    bg = PALETTE[idx % len(PALETTE)]
    im = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(im)
    d.rectangle([18, 18, W - 18, H - 18], outline="#ffffff", width=3)
    d.rectangle([18, H - 150, W - 18, H - 18], fill="#ffffff")
    f_title = ImageFont.truetype("C:/Windows/Fonts/timesbd.ttf", 38)
    f_auth = ImageFont.truetype("C:/Windows/Fonts/times.ttf", 26)
    f_small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 16)
    y = 80
    for line in textwrap.wrap(title.upper(), width=16)[:6]:
        w = d.textlength(line, font=f_title)
        d.text(((W - w) / 2, y), line, font=f_title, fill="#ffffff")
        y += 50
    for k, line in enumerate(textwrap.wrap(author, width=24)[:2]):
        w = d.textlength(line, font=f_auth)
        d.text(((W - w) / 2, H - 125 + k * 34), line, font=f_auth, fill="#222222")
    tag = "FAHASA DIGITAL"
    w = d.textlength(tag, font=f_small)
    d.text(((W - w) / 2, H - 48), tag, font=f_small, fill="#888888")
    im.save(path, "JPEG", quality=90)


def main():
    os.makedirs(COVER_DIR, exist_ok=True)
    a_email, a_pw = admin_credentials()
    admin = session_login(a_email, a_pw)

    # ── tài khoản thử nghiệm ──
    if os.path.exists(ACCOUNTS_FILE):
        accounts = json.load(open(ACCOUNTS_FILE, encoding="utf-8"))
    else:
        accounts = {
            "librarian": {"fullName": "Nguyễn Thu Hà", "email": "thuthu.demo@fahasa-digital.test", "role": "librarian"},
            "reader1": {"fullName": "Trần Minh Anh", "email": "minhanh.demo@fahasa-digital.test", "role": "reader",
                        "phone": "0900000001", "address": "Hà Nội"},
            "reader2": {"fullName": "Lê Hoàng Nam", "email": "hoangnam.demo@fahasa-digital.test", "role": "reader",
                        "phone": "0900000002", "address": "Hà Nội"},
            "reader3": {"fullName": "Phạm Thu Trang", "email": "thutrang.demo@fahasa-digital.test", "role": "reader",
                        "phone": "0900000003", "address": "Hà Nội"},
        }
        for a in accounts.values():
            a["password"] = "Demo@" + secrets.token_hex(4)
        json.dump(accounts, open(ACCOUNTS_FILE, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    for key, a in accounts.items():
        r = admin.post(f"{API}/users/admin/users", json={k: a[k] for k in ("fullName", "email", "password", "role")})
        if r.status_code not in (200, 201, 409):
            ok(r)
    S = {k: session_login(a["email"], a["password"]) for k, a in accounts.items()}
    for k in ("reader1", "reader2", "reader3"):
        a = accounts[k]
        S[k].put(f"{API}/users/update", json={"fullName": a["fullName"], "email": a["email"],
                                               "phone": a["phone"], "address": a["address"]})

    # ── ảnh bìa ──
    books = ok(admin.get(f"{API}/books", params={"limit": 100}))["books"]
    books.sort(key=lambda b: b["id"])
    for i, b in enumerate(books):
        if b.get("coverImage"):
            continue
        author = ", ".join(a.get("penName") or a.get("fullName") for a in b.get("authors", [])) or "Nhiều tác giả"
        p = os.path.join(COVER_DIR, f"book_{b['id']}.jpg")
        make_cover(p, b["title"], author, i)
        with open(p, "rb") as fh:
            up = ok(admin.post(f"{API}/upload/image", files={"image": (os.path.basename(p), fh, "image/jpeg")}))
        ok(admin.put(f"{API}/books/{b['id']}", json={"coverImage": [up["url"]]}))
    books = ok(admin.get(f"{API}/books", params={"limit": 100}))["books"]
    books.sort(key=lambda b: b["id"])
    print("Sách:", len(books))

    lib = S["librarian"]
    avail = [b for b in books if b["availableQuantity"] > 1]
    B = lambda i: avail[i]["id"]

    def borrow(reader, book_id, bd, dd, note=None):
        return ok(S[reader].post(f"{API}/borrows", json={"bookId": book_id, "borrowDate": bd, "dueDate": dd, "note": note}))["id"]

    existing = ok(admin.get(f"{API}/borrows", params={"limit": 1}))
    if existing["total"] == 0:
        # Độc giả 1
        b1 = borrow("reader1", B(0), "2026-10-01", "2026-10-15")
        ok(lib.patch(f"{API}/borrows/{b1}/approve"))
        ok(S["reader1"].post(f"{API}/borrows/{b1}/renew", json={"renewDueDate": "2026-10-25", "renewNote": "Cần thêm thời gian đọc"}))
        b2 = borrow("reader1", B(1), "2026-09-01", "2026-09-15")
        ok(lib.patch(f"{API}/borrows/{b2}/approve"))
        ok(lib.patch(f"{API}/borrows/{b2}/return", json={"condition": "normal"}))
        b3 = borrow("reader1", B(2), "2026-09-20", "2026-10-04")
        ok(lib.patch(f"{API}/borrows/{b3}/approve"))
        ok(lib.patch(f"{API}/borrows/{b3}/return", json={"condition": "damaged", "note": "Rách bìa sau"}))
        # Độc giả 2
        borrow("reader2", B(3), "2026-10-07", "2026-10-21", "Mượn đọc cuối tuần")
        b5 = borrow("reader2", B(4), "2026-09-10", "2026-10-05")
        ok(lib.patch(f"{API}/borrows/{b5}/approve"))
        b6 = borrow("reader2", B(5), "2026-10-06", "2026-10-20")
        ok(lib.patch(f"{API}/borrows/{b6}/reject", json={"note": "Độc giả đang có sách quá hạn chưa trả"}))
        # Độc giả 3
        borrow("reader3", B(6), "2026-10-07", "2026-10-14")
        b8 = borrow("reader3", B(7), "2026-09-15", "2026-09-29")
        ok(lib.patch(f"{API}/borrows/{b8}/approve"))
        ok(lib.patch(f"{API}/borrows/{b8}/return", json={"condition": "lost"}))
        b9 = borrow("reader3", B(8), "2026-10-02", "2026-10-16")
        ok(lib.patch(f"{API}/borrows/{b9}/approve"))

    # Một đầu sách chỉ có 2 bản, cả 2 đang được mượn → độc giả 3 đặt trước
    target = books[-1]
    mine = ok(admin.get(f"{API}/borrows", params={"bookId": target["id"], "limit": 10}))["borrows"]
    for x in mine:  # trả lại các phiếu không phải của độc giả (nếu lần chạy trước tạo nhầm)
        if x["reader"]["email"] == accounts["librarian"]["email"] and x["status"] == "approved":
            ok(lib.patch(f"{API}/borrows/{x['id']}/return", json={"condition": "normal"}))
    for r in ("reader1", "reader2"):
        if not any(x["reader"]["email"] == accounts[r]["email"] for x in mine):
            bid = borrow(r, target["id"], "2026-10-03", "2026-10-17")
            ok(lib.patch(f"{API}/borrows/{bid}/approve"))
    ok(admin.put(f"{API}/books/{target['id']}", json={"totalQuantity": 2, "availableQuantity": 0}))
    r = S["reader3"].post(f"{API}/reservations/book/{target['id']}", json={"note": "Báo giúp em khi có sách"})
    if r.status_code >= 400 and "đã đặt trước" not in r.text:
        ok(r)

    # Phạt: thu tiền mặt phiếu quá hạn của độc giả 1
    fines = ok(lib.get(f"{API}/fines", params={"limit": 50}))["fines"]
    r1_email = accounts["reader1"]["email"]
    for f in fines:
        if f["type"] == "overdue" and f["reader"]["email"] == r1_email and f["status"] == "unpaid":
            ok(lib.patch(f"{API}/fines/{f['id']}/pay", json={"paymentMethod": "cash"}))
            break

    # Đánh giá
    reviews = [("reader1", B(1), 5, "Sách hay, nội dung cuốn hút từ đầu đến cuối."),
               ("reader2", B(1), 4, "Bản dịch tốt, giấy in đẹp."),
               ("reader3", B(0), 5, "Rất đáng đọc, mình đã giới thiệu cho bạn bè."),
               ("reader1", B(2), 3, "Nội dung ổn nhưng hơi dài."),
               ("reader2", B(4), 4, "Cốt truyện hấp dẫn.")]
    for r, bid, rating, cmt in reviews:
        ok(S[r].post(f"{API}/reviews/book/{bid}", json={"rating": rating, "comment": cmt}))

    # Bài viết & liên hệ
    articles = [
        ("Thông báo giờ mở cửa khu thư viện tháng 10/2026",
         "<p>Khu thư viện mở cửa từ 8h00 đến 21h00 tất cả các ngày trong tuần. Độc giả có thể gửi yêu cầu mượn sách trực tuyến và đến quầy nhận sách sau khi thủ thư duyệt.</p>"),
        ("Hướng dẫn mượn, gia hạn và đặt trước sách trực tuyến",
         "<p>Bước 1: Tìm sách và nhấn Mượn sách. Bước 2: Chờ thủ thư duyệt. Bước 3: Nhận sách tại quầy. Khi sách hết, bạn có thể đặt trước để được thông báo khi có sách.</p>"),
        ("Giới thiệu tủ sách văn học mới về",
         "<p>Thư viện vừa bổ sung nhiều đầu sách văn học trong nước và nước ngoài. Mời độc giả tra cứu trên hệ thống.</p>"),
    ]
    have = ok(admin.get(f"{API}/articles", params={"limit": 50}))["total"]
    for t, c in (articles if have == 0 else []):
        ok(admin.post(f"{API}/articles", json={"title": t, "content": c, "status": "published"}))
    contacts = ok(admin.get(f"{API}/contacts"))
    n_contacts = contacts.get("total", 0) if isinstance(contacts, dict) else len(contacts or [])
    if n_contacts == 0:
        ok(requests.post(f"{API}/contacts", json={"name": "Phạm Thu Trang", "email": accounts["reader3"]["email"],
                                                "subject": "Hỏi về thời hạn mượn sách",
                                                "message": "Cho em hỏi mỗi lần được mượn tối đa bao nhiêu cuốn ạ?"}))
    print("Xong dữ liệu demo.")


if __name__ == "__main__":
    main()
