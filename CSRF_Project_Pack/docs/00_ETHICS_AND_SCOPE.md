# 00. PHẠM VI SỬ DỤNG & TUYÊN BỐ ĐẠO ĐỨC (Ethics & Scope)

> Tài liệu này đặt ở đầu bộ hồ sơ để khẳng định rõ: đây là **dự án học tập** phục vụ môn *An toàn và Bảo mật Hệ thống Thông tin*, **không nhằm gây ảnh hưởng tới bất kỳ cá nhân hay tổ chức nào**.

---

## 🎯 1. Mục đích học thuật
Dự án tái hiện bài thực hành CSRF kinh điển của **SEED Labs** (GS. Wenliang Du) nhằm giúp sinh viên:
- Hiểu **cơ chế** của lỗ hổng Cross-Site Request Forgery ở tầng ứng dụng web.
- Nắm được **cách phòng thủ** (SameSite cookie, anti-CSRF token, kiểm tra `Origin`/`Sec-Fetch-Site`).
- Rèn kỹ năng phân tích HTTP request và lập trình web an toàn.

Mục tiêu cuối cùng của việc học tấn công là để **biết cách bảo vệ hệ thống** — không phải để gây hại.

---

## 🧪 2. Phạm vi thực nghiệm (Scope)
Toàn bộ mã nguồn và thao tác trong bộ hồ sơ này **CHỈ** được phép chạy trong môi trường:

| Cho phép ✅ | Không cho phép ❌ |
| :--- | :--- |
| Môi trường **SEED Labs** chạy bằng Docker trên máy cá nhân của nhóm | Mọi website/máy chủ thật trên Internet |
| Các tên miền ảo cục bộ: `www.seed-server.com`, `www.attacker32.com` (trỏ `/etc/hosts` về IP nội bộ `10.9.0.x`) | Bất kỳ hệ thống nào bạn không sở hữu hoặc không được cấp phép bằng văn bản |
| Tài khoản thử nghiệm do lab tạo sẵn (`alice`, `boby`, `samy`) | Tài khoản của người dùng thật |

- Các địa chỉ `www.example.com`, `facebook.com`... xuất hiện trong phần trả lời câu hỏi chỉ là **ví dụ lý thuyết** trích từ đề bài SEED, không phải mục tiêu tấn công.
- `exploit.py` có cờ `--check` chỉ kiểm tra **kết nối** tới máy chủ lab, không gửi payload.

---

## ⚖️ 3. Lưu ý pháp lý & đạo đức
- Thực hiện các kỹ thuật này trên hệ thống không được phép là **hành vi vi phạm pháp luật** (ở Việt Nam: Luật An ninh mạng 2018, Bộ luật Hình sự về tội truy cập trái phép) và vi phạm quy chế học thuật.
- Nhóm cam kết **không** phát tán mã nguồn với mục đích tấn công, **không** sử dụng ngoài phạm vi lab, và **xóa** môi trường lab sau khi hoàn thành bài nộp.
- Video demo đặt ở chế độ **Unlisted** đúng yêu cầu, không công khai rộng rãi.

---

## 🔐 4. Nguyên tắc "Học tấn công để phòng thủ"
Mỗi phần tấn công trong hồ sơ đều đi kèm phần phòng thủ tương ứng:

| Kỹ thuật tấn công trình bày | Biện pháp phòng thủ tương ứng (xem [`04_VERIFICATION_AND_DEFENSE.md`](04_VERIFICATION_AND_DEFENSE.md)) |
| :--- | :--- |
| Fetch API + `credentials: 'include'` cross-site | Cookie `SameSite=Lax/Strict` |
| Giả mạo POST không có token | Anti-CSRF Token (`__elgg_token`, `__elgg_ts`) |
| Lợi dụng trình duyệt tự gửi cookie | Kiểm tra `Origin` / `Sec-Fetch-Site` phía server |
| Nhúng iframe (Clickjacking) | `X-Frame-Options`, CSP `frame-ancestors` |

---

*Bằng việc sử dụng bộ hồ sơ này, người dùng xác nhận đã đọc và đồng ý tuân thủ phạm vi nêu trên.*
