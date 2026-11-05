# 04. KIỂM CHỨNG KẾT QUẢ & CHỨNG MINH PHÒNG THỦ

Tài liệu này hoàn thiện vòng khép kín của đề tài: sau khi **tấn công thành công**, nhóm **kiểm chứng** kết quả một cách khách quan, rồi **bật lại cơ chế phòng thủ** để chứng minh cùng một payload sẽ thất bại — qua đó làm rõ bản chất "học tấn công để phòng thủ".

---

## 🔎 1. Kiểm chứng kết nối trước khi demo

Trước khi quay video, chạy lệnh kiểm tra lab đang hoạt động (không gửi payload tấn công):

```bash
python3 src/exploit.py --check
# [OK] Máy chủ phản hồi — HTTP 200. Lab đang hoạt động.
```

Nếu báo lỗi kết nối, kiểm tra lại:
```bash
docker ps                      # 3 container seed-server, mysql, attacker32 phải "Up"
cat /etc/hosts | grep seed     # phải có dòng ánh xạ www.seed-server.com
```

---

## ✅ 2. Ba mốc bằng chứng cần chụp (Evidence Checklist)

| Mốc | Thao tác | Bằng chứng cần có |
| :--: | :--- | :--- |
| **Trước** | Mở `http://www.seed-server.com/profile/alice` | Ảnh "About me" nội dung gốc (hoặc trống) |
| **Trong** | Mở `http://www.attacker32.com` + F12 (Console/Network) | Ảnh request `POST /action/profile/edit` được gửi ngầm; trang Attacker **không** chuyển hướng |
| **Sau** | Quay lại tab Alice, nhấn F5 | Ảnh "About me" = `CSRF attack by <MSV>` |

### Kiểm chứng ở tầng cơ sở dữ liệu (tùy chọn — tăng độ thuyết phục)
Có thể xác nhận dữ liệu đã bị ghi đè trực tiếp trong MySQL, không chỉ nhìn trên giao diện:

```bash
docker exec -it mysql-10.9.0.6 mysql -uroot -pdees elgg_db \
  -e "SELECT guid, string FROM elgg_metadata m \
      JOIN elgg_metastrings s ON m.value_id = s.id \
      WHERE string LIKE '%CSRF attack by%';"
```
*(Tên container và mật khẩu có thể khác tùy phiên bản SEED; đây là minh hoạ cách đối chiếu tầng dữ liệu.)*

---

## 🛡️ 3. Chứng minh phòng thủ: bật lại cơ chế chống CSRF của Elgg

Bài lab mặc định **đã tắt** cơ chế bảo vệ để tấn công thành công. Để chứng minh phòng thủ hiệu quả, nhóm **bật lại** rồi chạy đúng payload cũ.

### 3.1. Cơ chế gốc của Elgg: Anti-CSRF Token
Elgg nhúng vào mọi form hai tham số bí mật, sinh theo phiên người dùng:
- `__elgg_ts`: timestamp.
- `__elgg_token`: giá trị băm bí mật = `md5(site_secret + __elgg_ts + session_id ...)`.

Khi nhận request, server tính lại token và so khớp. Vì **Same-Origin Policy** cấm JavaScript của `attacker32.com` đọc DOM/token trên trang `seed-server.com`, kẻ tấn công **không thể** đoán được `__elgg_token` hợp lệ.

### 3.2. Thao tác bật lại bảo vệ (theo cấu trúc lab SEED)
Trong mã nguồn Elgg của lab, cơ chế kiểm tra token nằm ở hàm `elgg_validate_token()` (file `engine/classes/Elgg/Security/Csrf.php` hoặc tương đương). Bài lab tắt bảo vệ bằng cách cho hàm này luôn trả về hợp lệ; khôi phục lại phần kiểm tra gốc rồi khởi động lại dịch vụ:

```bash
# Sau khi khôi phục đoạn kiểm tra token trong mã nguồn Elgg:
docker restart seed-server-10.9.0.5
```

### 3.3. Kết quả kỳ vọng sau khi bật bảo vệ
Chạy lại `index.html` tấn công y hệt:

| Thành phần | Trước (bảo vệ TẮT) | Sau (bảo vệ BẬT) |
| :--- | :--- | :--- |
| Payload Fetch gửi đi | Thiếu `__elgg_token` | Vẫn thiếu `__elgg_token` |
| Phản hồi server | Cập nhật DB thành công (302) | **Từ chối** — "Form is missing __token or __ts fields" (HTTP 200 kèm lỗi / 403) |
| Trường About me của Alice | Bị đổi | **Không đổi** |

→ Kết luận: payload CSRF thất bại vì không có token bí mật. **Đây là bằng chứng trực quan cho hiệu quả của Synchronizer Token Pattern.**

---

## 🧱 4. Bảng tổng hợp các lớp phòng thủ (Defense-in-Depth)

| Lớp | Biện pháp | Chặn được gì | Hạn chế |
| :--- | :--- | :--- | :--- |
| Cookie | `SameSite=Lax` (mặc định hiện đại) / `Strict` | Trình duyệt không gửi cookie cross-site → payload mất phiên | `Strict` ảnh hưởng UX điều hướng; cần cookie khác cho SSO |
| Ứng dụng | Anti-CSRF Token (Synchronizer) | Attacker không đọc được token (nhờ SOP) | Cần quản lý token theo session/form |
| Ứng dụng | Double Submit Cookie | Attacker không đọc được cookie để nhét vào body | Yếu nếu có lỗ hổng subdomain/XSS |
| HTTP Header | Kiểm tra `Origin` / `Sec-Fetch-Site: cross-site` | Từ chối request thay đổi trạng thái từ nguồn lạ | Trình duyệt cũ không gửi `Sec-Fetch-*` |
| Giao diện | `X-Frame-Options` / CSP `frame-ancestors` | Chống Clickjacking qua iframe | Chỉ liên quan tấn công dựa trên UI |

> **Khuyến nghị thực tế:** kết hợp `SameSite=Lax` (lớp mặc định) **+** Anti-CSRF Token (lớp ứng dụng) **+** kiểm tra `Origin` cho các endpoint nhạy cảm. Không dựa vào một lớp duy nhất, và tuyệt đối không dùng `GET` cho hành động thay đổi trạng thái.
