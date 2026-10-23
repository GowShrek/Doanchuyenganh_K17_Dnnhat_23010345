"""Sinh Phụ lục A (bảng ca kiểm thử) và các số liệu tổng hợp từ test_results/*.json."""
import glob
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
RES = os.path.join(HERE, "..", "test_results")
OUT = os.path.join(HERE, "..", "phuluc_a.md")


def esc(x):
    return str(x).replace("|", "\\|").replace("\n", " ")


def load(name):
    return json.load(open(os.path.join(RES, name + ".json"), encoding="utf-8"))


files = [
    ("functional_a", "A.1 Kiểm thử chức năng – Tài khoản, phân quyền, sách, mượn, gia hạn"),
    ("functional_b", "A.2 Kiểm thử chức năng – Đặt trước, trả sách, phạt, đánh giá, nhắc hạn, trợ lý AI"),
    ("security_audit", "A.3 Rà soát bảo mật (phân tích mã nguồn tĩnh)"),
    ("performance", "A.4 Kiểm thử hiệu năng và triển khai"),
]

lines = ["# Phụ lục A. Kết quả kiểm thử chi tiết", ""]
lines.append("Toàn bộ ca kiểm thử dưới đây được chạy tự động bằng các kịch bản trong thư mục `BaoCao/tools` "
             f"trên hệ thống chạy bằng Docker ở máy cục bộ (ngày chạy theo giờ UTC của container: {load('functional_a')['utc_date']}). "
             "Kết quả thô được lưu dưới dạng JSON trong `BaoCao/test_results`.")
lines.append("")

for key, title in files:
    d = load(key)
    rows = d["rows"]
    npass = sum(r["result"] == "Đạt" for r in rows)
    lines.append(f"## {title}")
    lines.append("")
    lines.append(f"Kết quả: {npass}/{len(rows)} ca đạt.")
    lines.append("")
    lines.append(f"**Bảng A.{files.index((key, title)) + 1}: {title[4:]}**")
    lines.append("")
    lines.append("| Mã | Nhóm | FR/NFR | Nội dung kiểm thử | Kết quả mong đợi | Kết quả thực tế | Đánh giá |")
    lines.append("|---|---|---|---|---|---|---|")
    for r in rows:
        lines.append("| " + " | ".join(esc(r[k]) for k in ("id", "group", "ref", "name", "expected", "actual", "result")) + " |")
    lines.append("")

open(OUT, "w", encoding="utf-8").write("\n".join(lines))

# số liệu tổng hợp
summary = {}
for key, _ in files:
    d = load(key)
    summary[key] = (sum(r["result"] == "Đạt" for r in d["rows"]), len(d["rows"]))
print("Đã sinh", OUT)
for k, (p, n) in summary.items():
    print(f"  {k}: {p}/{n}")
