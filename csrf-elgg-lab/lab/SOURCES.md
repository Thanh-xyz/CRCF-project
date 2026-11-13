# Nguồn upstream

SEED Labs, Wenliang Du: https://seedsecuritylabs.org/Labs_20.04/Web/Web_CSRF_Elgg/

ZIP ARM: https://seedsecuritylabs.org/Labs_20.04/Files/Web_CSRF_Elgg/Labsetup-arm.zip

SHA-256 quan sát ngày 08/11/2026: `13dd0f34a3e5347877a97f6f40c011b424bde6c7ef1dfd41c004975caaa97447`.

`labctl fetch-seed` chỉ trích SQL từ ZIP, không sao chép payload mẫu XHR/form upstream vào attacker. Site secret công khai upstream được loại bỏ và tạo lại riêng khi boot. Không đưa ZIP hoặc dữ liệu runtime vào Git.

Chưa tải image thành công nên phiên bản Elgg chính xác và digest: NOT RUN. Cần chạy `labctl version` trước khi báo cáo kết quả. Image SEED là bản phục vụ giáo dục, không phải Elgg hiện hành; chọn vì tương thích bộ dữ liệu và tài liệu môn học. Ngày 08/11/2026, trang Download chính thức công bố Elgg 7.1.3 và LTS 6.3.10: https://elgg.org/download.php

Tài liệu SEED gốc: Copyright © 2006–2020 Wenliang Du, CC BY-NC-SA 4.0. Giữ thông báo này khi trích/chuyển thể tài liệu lab. Elgg: GPLv2, xem giấy phép trong image/source. SQL chứa các tài khoản giả lập công khai, không phải dữ liệu người dùng thật.
