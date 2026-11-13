# Báo cáo kiểm thử CSRF trên Elgg — Nhóm 6

**Ngày chạy:** 2026-11-13 · **Người chạy:** lab cục bộ (Claude-in-Chrome + curl)
**Phiên bản Elgg:** **3.3.3** (`handsonsecurity/seed-elgg`, digest
`sha256:5d8a25b14ef5be67aa62aa1979b895583d6cf3c5b2a71f6fdcd49416b708f7f5`)
**Trạng thái tổng quát:** ✅ Tất cả ca kiểm thử **PASS**. Các TC Elgg trước đây NOT RUN nay đã chạy thật.

---

## 1. Tóm tắt dễ hiểu (cho người đọc nhanh)

Chúng tôi dựng một "sân tập" gồm 3 máy ảo nhỏ (Docker): **Elgg** (mạng xã hội — nạn nhân),
**MySQL** (kho dữ liệu) và **Attacker** (trang web độc hại). Mục tiêu: chứng minh rằng kẻ tấn
công có thể **âm thầm sửa dòng "About me" của Alice** mà cô không bấm gì, **chỉ khi** website
thiếu lớp phòng chống. Kết quả thực nghiệm:

- **Có phòng chống (token bật — `protected`):** đòn tấn công **bị chặn**. Elgg báo thẳng
  *"Form is missing __token or __ts fields"*. About me **không đổi**. ✅
- **Tắt phòng chống (`vulnerable`) + trang tấn công cùng-site:** đòn tấn công **thành công**,
  About me của Alice biến thành **`CSRF attack by 23001939`**. ✅
- **Tắt phòng chống nhưng trang tấn công khác-site (`127.0.0.1`):** vẫn **bị chặn** — lần này
  nhờ **cookie `SameSite`**, trình duyệt không gửi kèm phiên đăng nhập của Alice. ✅

→ Kết luận: CSRF chỉ thành công khi **cả** token **lẫn** SameSite đều không cản. Mỗi lớp phòng
thủ, một mình nó, đã đủ để chặn đòn này.

---

## 2. Môi trường & điều kiện

| Hạng mục | Giá trị |
|---|---|
| Elgg | 3.3.3 (SEED image) — xác minh bằng `labctl version` |
| MySQL | 8.0.37 |
| Attacker server | Python 3.12 (`exploit.py`, standard library) |
| Elgg (nạn nhân) | http://elgg.csrf.localhost:8080 |
| Attacker cùng-site | http://attacker.csrf.localhost:8000 |
| Attacker khác-site | http://127.0.0.1:8000 |
| Tài khoản | Alice `alice` / `seedalice` (SEED công khai, chỉ dùng trong lab) |
| Payload đích | `description = CSRF attack by 23001939` |

Cả 3 container đều `healthy` khi chạy test.

---

## 3. Bảng kết quả tổng hợp

### 3.1. Kiểm thử tự động (offline + live)

| Bộ test | Nội dung | Kết quả |
|---|---|---|
| `tests/test_request_format.mjs` (Node) | 6 test dựng payload Fetch/URLSearchParams, chặn nhập token/cookie | ✅ 6/6 PASS |
| `tests/test_environment.py` | 4 test attacker server: echo, allowlist tĩnh, không rò cookie/.env | ✅ 4/4 PASS |
| `tests/test_security_controls.py` (live) | service healthy; Elgg không mở CORS | ✅ 2/2 PASS (trước đây NOT RUN) |
| `docker compose config` | cú pháp compose | ✅ PASS |

### 3.2. Kiểm thử trình duyệt thật (Claude-in-Chrome)

| Mã TC | Điều kiện | Kỳ vọng | Kết quả | Bằng chứng |
|---|---|---|---|---|
| **TC-B01** | Đăng nhập + Save hợp lệ | About me cập nhật; request có `__elgg_token` | ✅ PASS | `TC-B01-baseline-profile.jpg` |
| **TC-B02** | Echo endpoint cùng origin | Phản chiếu body, không trả cookie | ✅ PASS | `TC-02-echo.png` |
| **TC-B04** | protected · attacker cùng-site · no-cors | Bị chặn, About me giữ baseline | ✅ PASS | `TC-B04-*.jpg` |
| **TC-B03-crosssite** | vulnerable · attacker **khác-site** (127.0.0.1) | Bị chặn bởi SameSite | ✅ PASS | `TC-B03-crosssite-127-sent.jpg` |
| **TC-B05 / TC-B06** | vulnerable · attacker **cùng-site** | **Thành công**, About me = chuỗi tấn công | ✅ PASS | `TC-B06-attack-success-about-me.jpg` |

### 3.3. Kiểm chứng ở tầng HTTP (curl — ngoài trình duyệt)

curl luôn tự đính cookie bất kể origin, nên nó cô lập đúng tác dụng của **token** (không xét SameSite):

| Mode | POST thiếu token | HTTP redirect | Profile đổi? |
|---|---|---|---|
| protected | bị chặn | → `/` (home) | Không |
| vulnerable | lọt | → `/profile/alice` | **Có** |
| restored | — | — | Không |

---

## 4. Chi tiết từng ca & giải thích cơ chế

### TC-B01 — Đăng nhập và sửa profile hợp lệ (baseline)
Đăng nhập Alice, vào **Edit profile**, đặt About me = "Alice — hồ sơ ban đầu của Nhóm 6",
bấm **Save**. Request thật `POST /action/profile/edit` có đầy đủ `__elgg_token` + `__elgg_ts`.
Ta chỉ ghi lại **các trường công khai** (`guid`, `name`, `description`, `accesslevel[description]`),
**không** lấy token/cookie sang attacker.
→ Đây là "mẫu hợp lệ" để nhái, và cũng là cách khôi phục profile đúng đắn.

### TC-B04 — Protected chặn tấn công (token hoạt động)
Trang attacker cùng-site gửi POST với `credentials: include`, mode `no-cors`. Trình duyệt **có**
đính cookie phiên của Alice (cùng-site), nhưng payload **thiếu `__elgg_token`** (attacker không
đọc được token do **Same-Origin Policy**).
**Kết quả:** Elgg hiện thông báo đỏ **"Form is missing __token or __ts fields"**, About me giữ
nguyên baseline. → Token bảo vệ thành công.

> Payload quan sát trên trang attacker:
> `guid=56&name=Alice&description=CSRF+attack+by+23001939&accesslevel%5Bdescription%5D=2`
> (mode no-cors, credentials include, **không** có token).

### TC-B03-crosssite — Cookie SameSite chặn khác-site
Chuyển sang `vulnerable` (token đã tắt). Lần này gửi từ **`127.0.0.1:8000`** (khác-site hoàn
toàn so với `elgg.csrf.localhost`).
**Kết quả:** About me **không đổi** dù token đã tắt. Lý do: cookie phiên của Elgg là `SameSite`,
trình duyệt **không đính** nó cho POST chéo-site → Elgg coi request là khách vãng lai, không
hành động thay Alice. → SameSite bảo vệ thành công, **độc lập** với token.

### TC-B05 / TC-B06 — Tấn công thành công (token tắt + cùng-site)
Vẫn `vulnerable`, gửi từ **`attacker.csrf.localhost:8000`** (khác origin nhưng **cùng site**
`csrf.localhost`). SameSite=Lax **cho phép** cookie cùng-site, và token đã bị tắt.
**Kết quả:** Elgg chấp nhận → About me của Alice đổi thành **`CSRF attack by 23001939`**.
Đây là **bằng chứng hợp lệ duy nhất** (đối chiếu tận mắt trên profile); lỗi CORS hay response
opaque **không** được dùng làm bằng chứng.

**Chỉ một biến đổi giữa TC-B03-crosssite và TC-B05:** cùng-site hay khác-site. Sự khác biệt kết
quả (chặn ↔ thành công) chính là minh chứng cho vai trò của **SameSite**.

---

## 5. Phát hiện kỹ thuật quan trọng (ảnh hưởng tới tool của nhóm)

**Trường "About me" trong SEED Elgg được lưu dưới dạng _annotation_ `profile:description`,
không phải metadata `description`.**

- Đòn tấn công (qua `/action/profile/edit` kèm `accesslevel[description]`) ghi vào **annotation**
  `profile:description` (bảng `elgg_annotations`) — và đó là thứ trang profile **hiển thị**.
- Script `lab/scripts/profile.php reset` lại gán `$user->description` (ghi vào **metadata**,
  bảng `elgg_metadata`). Hai nơi lưu khác nhau.
- **Hậu quả:** `labctl reset-profile` báo thành công (metadata về baseline) nhưng **trang vẫn hiện
  chuỗi tấn công** vì annotation chưa bị đụng tới. `elgg-cli flush`, restart container, xóa Stash
  cache đều **không** khắc phục — vì dữ liệu nằm ở annotation, không phải cache.
- **Cách khôi phục đúng:** sửa lại About me **qua giao diện Edit profile** (đi qua đúng action,
  ghi đè annotation). Đã dùng cách này, profile trở về baseline, DB `elgg_annotations` xác nhận.

**Khuyến nghị:** sửa `profile.php reset` để đặt lại **annotation** `profile:description`
(ví dụ xoá annotation cũ rồi tạo lại bằng API profile, hoặc dùng `elgg_get_annotations` +
cập nhật `->value`), thay vì chỉ gán metadata. Hiện tại nên ghi chú trong README rằng reset
đáng tin cậy là qua UI. *(Có thể nhờ sửa tool này nếu nhóm muốn.)*

---

## 6. Khôi phục sau kiểm thử

- Mode: `protected` ✅
- About me của Alice: "Alice — hồ sơ ban đầu của Nhóm 6" ✅ (xác nhận bằng `elgg_annotations` id 13)
- Container: giữ chạy, volume DB giữ nguyên.
- Đóng tab trình duyệt của phiên test.

---

## 7. Danh mục ảnh bằng chứng (trong `evidence/screenshots/`)

| File | Mô tả | Dùng cho slide |
|---|---|---|
| `TC-B01-baseline-profile.jpg` | About me baseline sau Save hợp lệ | "Trước tấn công" |
| `TC-B04-attacker-configured-protected.jpg` | Trang attacker đã cấu hình | "Công cụ tấn công" |
| `TC-B04-attacker-payload-sent.jpg` | Payload dự kiến (không token) | "Request gửi đi" |
| `TC-B04-protected-blocked-missing-token.jpg` | Toast "Form is missing __token…" | "Token chặn tấn công" |
| `TC-B03-crosssite-127-sent.jpg` | Tấn công từ 127.0.0.1 (khác-site) | "SameSite chặn khác-site" |
| `TC-B06-attack-success-about-me.jpg` | About me = "CSRF attack by 23001939" | **"Tấn công thành công"** |
| `TC-02-echo.png` | Echo endpoint (payload hợp lệ) | "Kiểm thử payload" |

> Ảnh JPEG 1383×868 chụp từ Chrome thật. Khuyến nghị dùng cặp **TC-B04-protected-blocked** (chặn)
> và **TC-B06-attack-success** (thành công) cạnh nhau trên một slide để tương phản rõ.
