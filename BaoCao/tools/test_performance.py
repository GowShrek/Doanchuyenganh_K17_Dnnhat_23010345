"""Đo hiệu năng và kiểm tra một số NFR khác (trên hệ thống Docker cục bộ)."""
import concurrent.futures as cf
import statistics as st
import time

import requests

from tlib import API, Recorder, meta

R = Recorder("performance")
CLIENT = "http://localhost:5173"


def measure(url, n=200, workers=20):
    """Gửi n yêu cầu GET với tối đa `workers` kết nối đồng thời; trả về (ms[], số lỗi)."""
    lat, err = [], 0

    def one(_):
        t = time.perf_counter()
        try:
            r = requests.get(url, timeout=15)
            dtm = (time.perf_counter() - t) * 1000
            return dtm if r.status_code == 200 else None
        except Exception:
            return None

    with cf.ThreadPoolExecutor(max_workers=workers) as ex:
        for v in ex.map(one, range(n)):
            if v is None:
                err += 1
            else:
                lat.append(v)
    return lat, err


def pct(xs, q):
    xs = sorted(xs)
    return xs[min(len(xs) - 1, int(q / 100 * len(xs)))]


# Làm nóng
requests.get(f"{API}/books?limit=12")

# NFR-01: 200 yêu cầu, 20 kết nối đồng thời tới API tra cứu sách
lat, err = measure(f"{API}/books?limit=12", n=200, workers=20)
med, p95, mx = st.median(lat), pct(lat, 95), max(lat)
R.add("PERF-01", "Hiệu năng", "NFR-01",
      "GET /api/books, 200 yêu cầu, 20 kết nối đồng thời",
      "Trung vị ≤ 300 ms; phân vị 95 ≤ 1000 ms; lỗi 0%",
      f"trung vị {med:.0f} ms; p95 {p95:.0f} ms; tối đa {mx:.0f} ms; lỗi {err}/200",
      med <= 300 and p95 <= 1000 and err == 0)

# Chi tiết sách (có kèm tác giả, thể loại, đánh giá)
bid = meta(requests.get(f"{API}/books?limit=1"))["books"][0]["id"]
lat2, err2 = measure(f"{API}/books/{bid}", n=100, workers=20)
R.add("PERF-02", "Hiệu năng", "NFR-01",
      "GET /api/books/:id (chi tiết sách), 100 yêu cầu, 20 kết nối đồng thời",
      "Trung vị ≤ 300 ms; lỗi 0%",
      f"trung vị {st.median(lat2):.0f} ms; p95 {pct(lat2, 95):.0f} ms; lỗi {err2}/100",
      st.median(lat2) <= 300 and err2 == 0)

# NFR-02: nén gzip và cache cho tài nguyên tĩnh qua Nginx
r = requests.get(f"{CLIENT}/", headers={"Accept-Encoding": "gzip"})
gz = r.headers.get("Content-Encoding", "")
idx_ok = r.status_code == 200
# tìm một tệp .js hoặc .css trong index.html để kiểm tra cache
import re
asset = None
mm = re.search(r'(?:src|href)="(/assets/[^"]+\.(?:js|css))"', r.text)
if mm:
    ra = requests.get(f"{CLIENT}{mm.group(1)}", headers={"Accept-Encoding": "gzip"})
    asset = (ra.headers.get("Content-Encoding", ""), ra.headers.get("Cache-Control", ""))
R.add("PERF-03", "Hiệu năng", "NFR-02",
      "Nginx nén gzip và đặt cache cho tài nguyên tĩnh",
      "Trang chủ tải 200; tệp .js/.css có gzip và Cache-Control immutable",
      f"index 200={idx_ok}; asset Content-Encoding={asset[0] if asset else 'n/a'}; Cache-Control={asset[1] if asset else 'n/a'}",
      idx_ok and bool(asset) and "gzip" in asset[0] and "immutable" in asset[1])

# NFR-03: thời gian phản hồi của trợ lý AI
t = time.perf_counter()
r = requests.post(f"{API}/ai/chat", json={"messages": [{"role": "user", "content": "Gợi ý một cuốn sách hay"}]}, timeout=30)
el = (time.perf_counter() - t)
R.add("PERF-04", "Hiệu năng", "NFR-03",
      "Thời gian phản hồi POST /api/ai/chat",
      "≤ 10 giây",
      f"{el:.2f} giây; HTTP {r.status_code}; {(meta(r) or {}).get('usage', {}).get('total_tokens')} token",
      r.status_code == 200 and el <= 10)

# NFR-11: dịch vụ chạy và cổng mở
ports = {}
for name, url in [("client 5173", f"{CLIENT}/"), ("server 3000", f"{API}/books?limit=1")]:
    try:
        ports[name] = requests.get(url, timeout=5).status_code
    except Exception as e:
        ports[name] = str(e)[:30]
R.add("PERF-05", "Triển khai", "NFR-11",
      "Ba dịch vụ Docker hoạt động và cổng được publish",
      "client (5173) và server (3000) đều trả 200",
      f"{ports}",
      ports.get("client 5173") == 200 and ports.get("server 3000") == 200)

R.save({"latency_books_ms": [round(x) for x in sorted(lat)][:5] + ["..."] + [round(x) for x in sorted(lat)][-5:]})
