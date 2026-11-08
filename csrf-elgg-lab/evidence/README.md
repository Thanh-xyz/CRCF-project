# Danh mục bằng chứng

- `screenshots/TC-02-echo.png`: ảnh toàn trang attacker từ Chrome headless trong lần chạy thật.
- `screenshots/TC-02-decoded-body.png`: ảnh riêng phần decoded response, dùng trong slide 9.
- `logs/browser-echo.json`: thời gian UTC, phiên bản Chrome, origin, kết quả và giới hạn TC-02. Thời gian địa phương Việt Nam = UTC + 7.
- `logs/javascript-tests.txt`: stdout thực của 6 tests Node.
- `logs/python-tests.txt`: stdout/stderr thực của 4 HTTP tests và 2 live tests skipped NOT RUN.
- `logs/environment.txt`: biên bản các quan sát môi trường và lỗi Docker trong phiên; không phải output chạy Elgg.

Hiện không có profile screenshot, Network capture của Elgg hoặc video. Không dùng ảnh TC-02 làm ảnh khai thác thành công. Khi thu thêm bằng chứng, ghi test/mode/origin, dữ liệu trước sau và khử secret trước khi lưu vào phần có thể commit. HAR, pcap và thư mục private đã gitignore.
