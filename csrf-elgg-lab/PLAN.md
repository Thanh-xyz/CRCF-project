# Nhóm 6 — CSRF: trạng thái triển khai

Ngày 08/11/2026. Phase 1 đã khảo sát: macOS 13.5 ARM64, Docker 28.1.1, Compose 2.36.0, Python 3.14.7, Node 24.18.0, Chrome và PowerPoint có sẵn. Có tài liệu và mã mẫu trong CRCF-project; không có Elgg chạy. Giữ nguyên các tệp gốc.

Docker pull Elgg SEED ARM và MySQL 8.0.37 đều lỗi input/output. Ổ đĩa chỉ còn khoảng 68 MiB và đã báo no space left on device. Cần giải phóng khoảng 5–10 GB trước khi tiếp tục. Không tự dọn dữ liệu ngoài dự án. Các tệp tải tạm của tác vụ đã được xóa.

Kế hoạch tiếp theo: (2) Compose Elgg/MySQL/attacker chỉ mở loopback, bảo vệ token mặc định; (3) bắt HTTP request thực tế; (4) Fetch + URLSearchParams, echo endpoint, exploit.py launcher; (5) kiểm thử TC-01 đến TC-06, ảnh/log thật đã khử bí mật; (6) tài liệu tiếng Việt, Mermaid, phân công, AI Usage; (7) PowerPoint 12 slide, notes 10 phút, kịch bản video; (8) đối chiếu yêu cầu. Không commit/push.

TC-01/03/04/05/06 trên Elgg: NOT RUN. Chưa xác định phiên bản Elgg chính xác trong image, chưa có request capture hoặc xác nhận khai thác. Endpoint và tham số phải xác minh runtime. Lỗi CORS/opaque không phải bằng chứng thành công. exploit.py làm launcher cần giảng viên xác nhận.

Tiến độ bổ sung: đã lưu Compose/Dockerfile, config, lifecycle/reset/version scripts, attacker Fetch/URLSearchParams và exploit.py; 6 JavaScript tests và 4 HTTP server tests PASS; TC-02 Chrome thật PASS, ảnh/log trong evidence. Compose config PASS. Hai live tests được skip NOT RUN. Có docs/01–10, kịch bản video và deck mới 12 slide/600 giây, đã render/xem từng slide và xác nhận 12 notes có nguồn. PHP/shell syntax PASS. Đã chuẩn bị lại SQL upstream đúng checksum, loại site secret và tạo .env riêng không commit. Chưa có video. Dung lượng có tăng lên khoảng 1.6 GiB nhưng Docker kiểm tra image vẫn treo hơn 10 phút; đã dừng riêng client kiểm tra, không restart daemon hoặc xóa dữ liệu ngoài dự án.

Nguồn SEED chính thức: https://seedsecuritylabs.org/Labs_20.04/Web/Web_CSRF_Elgg/
