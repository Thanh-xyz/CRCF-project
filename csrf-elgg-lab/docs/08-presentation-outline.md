# PowerPoint 12 slide — 10 phút

Deck dùng nền trắng, chữ đen, nhấn xanh; bố cục Codex Grid được chọn theo nội dung. Sơ đồ kiến trúc và sequence là hình native đơn giản, chỉnh sửa được. Ảnh TC-02 là ảnh thực. Vùng bằng chứng Elgg ghi NOT RUN khi chưa có ảnh; không tự dựng ảnh DevTools/profile.

| Slide | Nội dung chính | Giây |
|---|---|---:|
| 1 | Cross-Site Request Forgery on Elgg; tên 3 thành viên | 30 |
| 2 | Mục tiêu About me; Fetch + URLSearchParams; tiêu chí xác minh | 40 |
| 3 | CSRF dựa vào phiên và thiếu kiểm tra ý định | 50 |
| 4 | Sequence: login → attacker → POST → xác minh | 55 |
| 5 | Kiến trúc: Elgg/attacker/browser/DB và origin/site | 55 |
| 6 | HTTP request: nội dung cần capture, trạng thái NOT RUN | 55 |
| 7 | Mã Fetch; credential/mode/encoding; echo đã chạy | 55 |
| 8 | TC-01 đến TC-06 và cách đổi một điều kiện | 50 |
| 9 | Kết quả thực tế, ảnh echo, Elgg NOT RUN | 60 |
| 10 | Token/SameSite/CORS và đối chứng | 55 |
| 11 | Phân công đề xuất và mức AI 3 theo thực tế | 55 |
| 12 | Kết luận theo bằng chứng và Q&A | 40 |
| | **Tổng** | **600** |

Speaker notes có trong deck, bao gồm lời dẫn và [Sources]. Khi có kết quả Elgg, thay slide 6 và 9 bằng ảnh capture thật và cập nhật notes, bảng kết quả, AI Log đồng thời; không chỉ đổi chữ NOT RUN thành PASS.
