"""Hàm dùng chung cho các bộ kiểm thử (chạy trên hệ thống Docker cục bộ)."""
import base64
import datetime as dt
import json
import os
import re
import secrets

import requests

API = "http://localhost:3000/api"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "..", "test_results")
ACC = json.load(open(os.path.join(HERE, "test_accounts.json"), encoding="utf-8"))
_SEED = open(os.path.join(HERE, "..", "..", "QuanLyThuVien", "server", "src", "seeds", "initAdmin.js"), encoding="utf-8").read()
ADMIN = (re.search(r"const email = '([^']+)'", _SEED).group(1),
         re.search(r"bcrypt\.hash(?:Sync)?\(\s*'([^']+)'", _SEED).group(1))
UTC_TODAY = dt.datetime.now(dt.timezone.utc).date()
RUN = secrets.token_hex(3)


def d(offset):
    """Ngày (UTC, theo giờ của container) cộng thêm offset ngày, dạng YYYY-MM-DD."""
    return (UTC_TODAY + dt.timedelta(days=offset)).isoformat()


class Recorder:
    def __init__(self, name):
        self.name = name
        self.rows = []

    def add(self, tid, group, ref, title, expected, actual, passed, note=""):
        self.rows.append({"id": tid, "group": group, "ref": ref, "name": title, "expected": expected,
                          "actual": actual, "result": "Đạt" if passed else "Không đạt", "note": note})
        print(f"{'PASS' if passed else 'FAIL'} {tid} {title} -> {actual}")

    def save(self, extra=None):
        os.makedirs(OUT_DIR, exist_ok=True)
        data = {"run": RUN, "utc_date": UTC_TODAY.isoformat(), "rows": self.rows}
        if extra:
            data.update(extra)
        path = os.path.join(OUT_DIR, f"{self.name}.json")
        json.dump(data, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        n_pass = sum(r["result"] == "Đạt" for r in self.rows)
        print(f"== {self.name}: {n_pass}/{len(self.rows)} đạt -> {path}")


def login(email, pw):
    s = requests.Session()
    r = s.post(f"{API}/users/login", json={"email": email, "password": pw})
    return s, r


def meta(r):
    try:
        return r.json().get("metadata")
    except Exception:
        return None


def msg(r):
    try:
        return r.json().get("message", "")
    except Exception:
        return r.text[:80]


def new_reader(tag):
    """Tạo độc giả thử nghiệm mới, trả về (session, info)."""
    pw = "Tc@" + secrets.token_hex(4)
    info = {"fullName": f"TC Độc giả {tag}", "email": f"tc{tag}.{RUN}@fahasa-digital.test", "password": pw}
    r = requests.post(f"{API}/users/register", json=info)
    s, _ = login(info["email"], pw)
    info["register_status"] = r.status_code
    return s, info


def jwt_parts(token):
    pad = lambda x: x + "=" * (-len(x) % 4)
    h, p = token.split(".")[:2]
    return json.loads(base64.urlsafe_b64decode(pad(h))), json.loads(base64.urlsafe_b64decode(pad(p)))


def notifications(sess):
    m = meta(sess.get(f"{API}/notifications")) or {}
    if isinstance(m, list):
        return m
    return m.get("notifications") or m.get("rows") or []
