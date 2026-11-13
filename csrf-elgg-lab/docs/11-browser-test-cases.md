# Bộ Test Case cho Claude Browser (CSRF trên Elgg)

Tài liệu này mô tả các ca kiểm thử chạy bằng **trình duyệt thật** (Claude-in-Chrome) để
hoàn tất các TC trước đây ở trạng thái NOT RUN. Trình duyệt là bắt buộc vì nó tái hiện
hành vi mà `curl` không mô phỏng được: **chính sách cùng-nguồn (Same-Origin Policy)**,
**fetch chéo-nguồn (cross-origin)** từ trang attacker, và **cookie `SameSite`**.

> Đã kiểm chứng trước ở tầng server bằng `curl` (xem bảng trong mục "Bằng chứng server"):
> ở `protected` POST thiếu token bị từ chối (profile không đổi); ở `vulnerable` POST thiếu
> token được chấp nhận và About me đổi thành `CSRF attack by 23001939`.

## Điều kiện tiên quyết (Preconditions)

- Lab đã `up`, cả 3 container `healthy`:
  `python3 lab/scripts/labctl.py status`
- Phiên bản Elgg xác định: **3.3.3** (`python3 lab/scripts/labctl.py version`).
- Mode khởi đầu: `protected`.
- Tài khoản SEED giả lập: Alice `alice` / `seedalice`.

### Địa chỉ dùng trong test

| Vai trò | URL | Ghi chú |
|---|---|---|
| Elgg (nạn nhân) | http://elgg.csrf.localhost:8080 | Chrome tự phân giải `*.localhost` → loopback |
| Attacker **cùng-site** | http://attacker.csrf.localhost:8000 | khác origin, cùng site `csrf.localhost` |
| Attacker **khác-site** | http://127.0.0.1:8000 | khác site hoàn toàn so với Elgg |

Nếu trình duyệt/OS không phân giải `*.localhost`, thêm vào `/etc/hosts`:
`127.0.0.1 elgg.csrf.localhost attacker.csrf.localhost`.

### Phần tử UI của trang attacker

| Phần tử | id / nhãn |
|---|---|
| Ô endpoint | `#endpoint` |
| Ô fields (JSON) | `#fields` |
| Chọn Fetch mode | `#mode` (`cors` / `no-cors`) |
| Checkbox xác nhận | `#observed` |
| Nút gửi tấn công | nút chữ **"Gửi tới Elgg"** (`#send`) |
| Nút echo | **"Thử echo (TC-02)"** (`#echo`) |
| Vùng kết quả | `#status` / `#previewText` |

---

## Các ca kiểm thử

### TC-B01 — Đăng nhập + sửa profile hợp lệ (baseline) & bắt request
- **Mode:** protected
- **Bước:**
  1. Mở `http://elgg.csrf.localhost:8080/login`, đăng nhập `alice` / `seedalice`.
  2. Vào `profile/alice` → **Edit profile** → đặt About me = baseline (vd. "Alice — hồ sơ ban đầu của Nhóm 6").
  3. Mở DevTools ▸ Network, bấm **Save**, bắt request `POST /action/profile/edit`.
- **Kỳ vọng:**
  - Profile cập nhật hợp lệ.
  - Request là `application/x-www-form-urlencoded`, **có** trường `__elgg_token` và `__elgg_ts`.
  - Ghi lại endpoint + các trường **công khai** (loại `__elgg_token`, `__elgg_ts`) để dùng cho attacker.
  - ⚠️ **Không** copy giá trị token/cookie vào trang attacker.

### TC-B02 — Echo endpoint (payload đúng định dạng, không rò cookie)
- **Mode:** không liên quan (cùng origin attacker)
- **Bước:** Mở trang attacker, bấm **"Thử echo (TC-02)"**.
- **Kỳ vọng:** `/echo` phản chiếu đúng body (URL-encoded), **không** trả về cookie. Chứng minh payload hợp lệ trước khi bắn thật.

### TC-B04 — Protected chặn tấn công (token bảo vệ)
- **Mode:** protected
- **Bước:**
  1. Vẫn đang đăng nhập Alice (cookie phiên còn hiệu lực).
  2. Mở attacker **cùng-site** `http://attacker.csrf.localhost:8000`.
  3. Dán endpoint + fields công khai từ TC-B01; tick `#observed`; chọn mode `no-cors`.
  4. Bấm **"Gửi tới Elgg"**. Quan sát Network: request đi, cookie có được đính không.
  5. Mở lại `profile/alice`.
- **Kỳ vọng:** About me **vẫn là baseline**, KHÔNG chứa `CSRF attack by 23001939`.
  (Elgg từ chối vì thiếu `__elgg_token` — attacker không đọc được token do Same-Origin Policy.)

### TC-B03-crosssite — Cookie SameSite chặn khác-site
- **Mode:** vulnerable (`labctl mode vulnerable`)
- **Bước:**
  1. Mở attacker **khác-site** `http://127.0.0.1:8000`.
  2. Dán endpoint + fields; tick `#observed`; mode `no-cors`; bấm **"Gửi tới Elgg"**.
  3. Network: kiểm tra request `POST` có **bị loại cookie phiên** không.
  4. Mở lại `profile/alice`.
- **Kỳ vọng:** About me **không đổi**. Dù token đã tắt, cookie phiên **không được đính** cho POST
  chéo-site (SameSite=Lax) → Elgg coi là khách lạ.
- **Hạn chế:** cần soi lý do loại cookie trong Network để quy kết chính xác cho SameSite.

### TC-B03-samesite / TC-B05 / TC-B06 — Tấn công thành công (token tắt + cùng-site)
- **Mode:** vulnerable
- **Bước:**
  1. Mở attacker **cùng-site** `http://attacker.csrf.localhost:8000`.
  2. Dán endpoint + fields; tick `#observed`; mode `cors`; bấm **"Gửi tới Elgg"**.
     (Response có thể là lỗi CORS/opaque — KHÔNG dùng điều đó làm bằng chứng.)
  3. Mở `profile/alice` để đối chiếu tận mắt.
- **Kỳ vọng:**
  - **TC-B03-samesite:** POST cùng-site mang theo cookie phiên (SameSite=Lax cho phép cùng-site).
  - **TC-B05:** vì token đã tắt có chủ đích, Elgg chấp nhận → đổi dữ liệu thật.
  - **TC-B06:** About me của Alice = **`CSRF attack by 23001939`**. ✅ (bằng chứng duy nhất hợp lệ)

### TC-Restore — Khôi phục
- `python3 lab/scripts/labctl.py mode protected`
- `python3 lab/scripts/labctl.py reset-profile` (hoặc sửa tay About me về baseline)
- Mở `profile/alice` xác nhận đã về baseline.

---

## Ma trận điều kiện (chỉ đổi 1 biến mỗi lần)

| TC | Mode | Origin attacker | Same-site? | Token? | Kết quả kỳ vọng |
|---|---|---|---|---|---|
| TC-B04 | protected | attacker.csrf.localhost | có | bật | Chặn (không đổi) |
| TC-B03-crosssite | vulnerable | 127.0.0.1 | không | tắt | Chặn bởi SameSite |
| TC-B05/06 | vulnerable | attacker.csrf.localhost | có | tắt | **Thành công (đổi)** |

## Bằng chứng server (curl, tầng HTTP — đã chạy)

| Mode | Attack thiếu token | Redirect | Profile chứa chuỗi tấn công |
|---|---|---|---|
| protected | bị chặn | → `/` | Không (count=0) |
| vulnerable | lọt | → `/profile/alice` | **Có (count=1)** |
| restored | — | — | Không (count=0) |

> curl luôn tự đính cookie bất kể origin nên **không** kiểm được SameSite/cross-origin;
> đó là lý do cần các TC trình duyệt ở trên.
