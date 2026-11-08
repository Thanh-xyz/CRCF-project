# Kết quả thực tế — 08/11/2026

## Kết quả đã có

| Kiểm tra | Trạng thái | Bằng chứng / giới hạn |
|---|---|---|
| JavaScript request builder | PASS, 6 tests | URL encoding, preserve fields, block secrets, local target, Fetch config, cấm XHR/form |
| HTTP attacker server | PASS, 4 tests | Health, static allowlist, echo encoding, reject secrets/type/oversize |
| Compose config | PASS | `docker compose --env-file .env.example config --quiet`, exit 0 |
| TC-02 Fetch trong Chrome | PASS | `evidence/logs/browser-echo.json`, ảnh `TC-02-echo.png` |
| Elgg live service tests | NOT RUN, 2 skipped | Docker chưa khởi động được lab |
| PHP image build / bootstrap / reset | NOT RUN | Docker image pull I/O failure |
| PHP / shell syntax | PASS | 5 PHP files qua php -l; entrypoint qua sh -n; không thay thế runtime |
| SQL seed preparation | PASS | ZIP đúng SHA-256, trích SQL, loại site secret upstream |
| PowerPoint QA | PASS | 12 slide render/xem từng trang, 12 notes có Sources, canvas không vượt biên |

Lần chạy HTTP test ban đầu bị sandbox chặn bind socket (`Operation not permitted`). Chạy lại với quyền tạo listener loopback đã PASS. Đây là lỗi quyền môi trường, không phải lỗi payload. Python 3.14 có ResourceWarning khi đối tượng HTTPError trong test tự đóng; assertion vẫn PASS. Không gộp lần lỗi vào báo cáo đạt mà bỏ nguyên nhân.

## Ma trận theo đề bài

| TC | Thực hiện | Kỳ vọng có điều kiện | Kết quả |
|---|---|---|---|
| 01 | Alice tự Edit Profile + Network | Profile đổi sau Save hợp lệ | NOT RUN |
| 02 | Fetch → `/echo` | Nhận đúng description theo MSV | PASS trên Chrome thật |
| 03 | Fetch khác origin; cùng site và khác site | Ghi POST/OPTIONS, cookie, CORS, dữ liệu | NOT RUN trên Elgg |
| 04 | Protected, thiếu token | Không thay đổi About me | NOT RUN |
| 05 | Vulnerable có chủ đích | Chỉ thành công nếu phiên + payload được chấp nhận | NOT RUN |
| 06 | Profile trước/sau tải mới | Chính xác `CSRF attack by 23001939` | NOT RUN |

## Bằng chứng còn cần thu

- Version/digest Elgg, PHP, DB và browser; service health.
- Profile baseline, Network của Save hợp lệ (khử secret), các field công khai.
- POST từ attacker và lý do cookie được gửi/bị loại; status và redirect.
- Token mode protected: thông báo từ chối + profile không đổi.
- Token mode vulnerable: profile thật sau reload và kiểm tra các trường khác.
- Reset profile + protected lần cuối; xác nhận trạng thái phục hồi.

Không thay ảnh Elgg bằng ảnh echo. Các giá trị GUID trong unit tests là fixture tổng hợp để kiểm tra encoder, không phải capture runtime. Script `browser_elgg.mjs` chưa chạy; có thể cần điều chỉnh selectors theo UI sau khi quan sát. Nó ghi kết quả FAIL nếu một bước không đạt; không đổi tài liệu thành PASS khi chỉ tạo được file test.
