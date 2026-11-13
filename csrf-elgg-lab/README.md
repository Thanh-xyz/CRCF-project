# Cross-Site Request Forgery Attack on Elgg

**An toàn máy tính · Nhóm 6 — CSRF**

| Thành viên | MSV | Phân công đề xuất |
|---|---|---|
| Nguyễn Trung Thành | 23001935 | Lý thuyết, HTTP request, phòng chống |
| Nguyễn Công Trí | 23001939 | Elgg, Docker, Fetch API, kiểm thử |
| Nguyễn Minh Thao | 23001936 | Bằng chứng, PowerPoint, video |

Mục tiêu: tài khoản giả lập Alice có About me bằng `CSRF attack by 23001939`. MSV đổi được ở `.env` hoặc giao diện attacker. Chỉ chạy trên lab cục bộ do nhóm kiểm soát. Các tài liệu gốc trong thư mục cha được giữ nguyên.

## Trạng thái thực tế

Ngày 08/11/2026: attacker và Fetch/echo **đã chạy trên Chrome thật**; 6 unit test JavaScript và 4 integration test HTTP đạt. Có ảnh `evidence/screenshots/TC-02-echo.png` và log `evidence/logs/browser-echo.json`. Compose kiểm tra cú pháp hợp lệ.

**Dự án CHƯA hoàn thành thực nghiệm Elgg.** Docker pull Elgg/MySQL báo `input/output error` khi ổ đĩa còn khoảng 68 MiB. Sau đó dung lượng có tăng nhưng Docker vẫn không trả kết quả kiểm tra image. Chưa khởi động Elgg; chưa bắt request Edit Profile; chưa xác minh phiên bản chính xác; TC-01, 03, 04, 05, 06 trên Elgg là **NOT RUN**. Không có ảnh profile hoặc video giả. Cần giải phóng ít nhất 5–10 GB và kiểm tra lại Docker Desktop trước khi chạy phần còn lại; không tự xóa/prune dữ liệu của dự án khác.

## Chạy attacker ngay, không cần Docker

```sh
cd CRCF-project/csrf-elgg-lab
python3 exploit.py
```

Mở http://127.0.0.1:8000 rồi bấm **Thử echo (TC-02)**. Endpoint `/echo` cùng origin chỉ trả dữ liệu vừa nhận, không cập nhật Elgg. Server chỉ phục vụ các tài nguyên attacker trong allowlist; không phục vụ `.env`, SQL hoặc repository.

**`exploit.py` là launcher bằng Python standard library. Payload HTTP gửi tới Elgg nằm trong JavaScript Fetch API, dùng URLSearchParams; Python không gửi payload thay trình duyệt. Đây là cách diễn giải tạm thời yêu cầu nộp bài, cần xác nhận với giảng viên.**

## Dựng Elgg sau khi Docker hoạt động

```sh
python3 lab/scripts/labctl.py init
python3 lab/scripts/labctl.py fetch-seed
python3 lab/scripts/labctl.py up
python3 lab/scripts/labctl.py status
python3 lab/scripts/labctl.py version
```

Windows dùng Python 3 và Docker Desktop với Linux containers; có thể thay `python3` bằng `py -3`. macOS Apple Silicon dùng image `original-arm`; x86 dùng `original` do lệnh init chọn theo kiến trúc. MySQL cố định 8.0.37 theo gói ARM upstream. Không cần PHP trên host.

| Thành phần | URL | Điều kiện |
|---|---|---|
| Elgg | http://elgg.csrf.localhost:8080 | Host-only cookie, HTTP loopback |
| Attacker | http://attacker.csrf.localhost:8000 | Khác origin, cùng site `csrf.localhost` |
| Attacker đối chứng | http://127.0.0.1:8000 | Khác site so với Elgg |
| MySQL | Trong Docker network | Không publish cổng |

Chrome thường phân giải các tên kết thúc `.localhost` về loopback. Nếu trình duyệt/OS không hỗ trợ, thêm `127.0.0.1 elgg.csrf.localhost attacker.csrf.localhost` vào hosts bằng quyền quản trị; tài liệu [setup](docs/02-environment-setup.md) có đường dẫn. Không đổi hostname tùy ý sau khi đăng nhập. Cookie không phân biệt cổng, vì vậy dùng hai hostname và không mở rộng Domain của cookie. Xác nhận thuộc tính cookie thực tế trong DevTools.

Tài khoản **giả lập công khai của SEED**: Alice `alice` / `seedalice`; admin `admin` / `seedelgg`. Đây là dữ liệu học tập, không dùng lại mật khẩu ở nơi khác. DB password được sinh ngẫu nhiên trong `.env` (không commit). Site secret công khai upstream được loại và thay bằng giá trị riêng lúc khởi động.

**Phiên bản:** chọn SEED để tương thích tài liệu và dữ liệu có sẵn, không gán nhãn Elgg hiện hành có lỗi. Phiên bản ứng dụng chính xác trong tag SEED và digest chưa xác minh vì pull thất bại; bắt buộc chạy `labctl version`, lưu kết quả và pin image digest trong `.env` trước khi báo cáo khả năng tái hiện. Tag có thể thay đổi. Ngày 08/11/2026, [Elgg Download](https://elgg.org/download.php) công bố 7.1.3 (stable), 6.3.10 (LTS). Tắt token là chỉnh sửa có chủ đích của lab, không phải kết luận về các bản này.

## Thực nghiệm theo thứ tự

1. Giữ mode `protected`, đăng nhập Alice. Sửa About me hợp lệ; bắt request theo [hướng dẫn Network](docs/03-http-request-analysis.md).
2. Điền endpoint và các trường công khai từ request thật vào attacker. Không nhập token/cookie/timestamp xác thực. `description` phải được xác nhận từ capture trước; chuỗi theo MSV được mã thay tự động.
3. Bấm xem request; chạy TC-02 trước. Payload không có XHR hay form submit.
4. Thử cross-origin ở mode protected. Kiểm tra lại profile; phải đối chiếu cả phản hồi từ chối và dữ liệu không đổi.
5. Chuyển có chủ đích sang vulnerable và thử lại cùng payload:

```sh
python3 lab/scripts/labctl.py mode vulnerable
```

6. So sánh attacker cùng site với `127.0.0.1` khác site. Chỉ thay một điều kiện mỗi lần. Với cookie Lax, cross-site Fetch dự kiến không mang phiên dù `credentials: include`; phải kiểm tra Network thực tế.
7. Tải mới profile Alice. Chỉ PASS khi About me đúng chuỗi. Khôi phục mode và profile:

```sh
python3 lab/scripts/labctl.py mode protected
python3 lab/scripts/labctl.py reset-profile
```

Lệnh reset chỉ đặt lại About me của Alice, không xóa DB hoặc thay các trường khác. Reset hiện **chưa kiểm thử trên Elgg**. `labctl down` dừng các service của project và giữ volume. Muốn reset toàn bộ, dừng lab rồi chỉ xóa volume DB của project này sau khi sao lưu; không dùng Docker system prune. Profile reset không thay thế full DB reset.

Không có proxy hoặc CORS allowance trên Elgg. CORS error có thể xuất hiện sau khi simple POST đã xử lý. `no-cors` cho response opaque, không chứng minh thành công. [Luồng và giải thích](docs/04-attack-flow.md).

## Kiểm thử

```sh
node --test tests/test_request_format.mjs
python3 -m unittest discover -s tests -v
docker compose --env-file .env.example config --quiet
```

Python suite mặc định skip 2 kiểm tra live, hiển thị NOT RUN. Để kiểm tra service thật sau khi lab khỏe:

```sh
RUN_ELGG_LIVE=1 python3 -m unittest discover -s tests -v
```

Browser tests dùng Playwright; cài vào môi trường riêng hoặc `npm install --no-save playwright`, rồi `npx playwright install chromium`. Có thể đặt `CHROME_PATH` trỏ Chrome có sẵn để không tải Chromium. `PLAYWRIGHT_MODULE` là tùy chọn trỏ module đã cài. Chạy từ thư mục gốc lab:

```sh
node tests/browser_echo.mjs
RUN_ELGG_LIVE=1 ALICE_PASSWORD=seedalice node tests/browser_elgg.mjs
```

Ví dụ cuối dùng cú pháp shell macOS/Linux; PowerShell dùng `$env:RUN_ELGG_LIVE='1'` và `$env:ALICE_PASSWORD='seedalice'` trước lệnh Node. Browser Elgg test là công cụ **chưa chạy**, selector dựa vào SEED UI có thể cần sửa sau quan sát. Nó capture endpoint qua Save hợp lệ, không lấy token vào attacker; cuối cùng cố bật lại protected. Nếu restore lỗi, tự chạy `labctl mode protected`. Automation không thay thế cảnh quay sinh viên mở tab Network theo yêu cầu giảng viên.

## Sản phẩm và nguồn

- `docs/01`–`09`: lý thuyết, setup, request, luồng, kết quả, phòng chống, demo, slide, AI Usage.
- `presentation/`: deck mới, source tạo deck và speaker notes khi build thành công.
- `evidence/`: ảnh/log thật; bảng kết quả tách PASS và NOT RUN.
- [Final review](docs/10-final-review.md): các mục cần hoàn tất trước khi nộp.
- [Nguồn upstream và giấy phép](lab/SOURCES.md).

Nguồn chính: [SEED](https://seedsecuritylabs.org/Labs_20.04/Web/Web_CSRF_Elgg/), [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), [Elgg Actions](https://learn.elgg.org/en/stable/guides/actions.html), [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). Không commit/push hoặc upload video trong tác vụ này.
