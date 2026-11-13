# Kịch bản video có thuyết minh tiếng Việt

**Trạng thái: chưa quay và chưa upload.** Mục tiêu khoảng 9–10 phút. Chỉ quay các bước Elgg sau khi Docker khỏe và nhóm đã kiểm tra một lượt. Nếu chưa có lab, có thể quay TC-02 và nói rõ các phần còn NOT RUN; không nộp như demo đầy đủ.

| Thời gian | Cảnh quay | Lời dẫn gợi ý |
|---|---|---|
| 00:00–00:35 | Tên đề tài, 3 thành viên, MSV | “Nhóm 6 trình bày CSRF trên Elgg. Toàn bộ tài khoản và môi trường đều là giả lập cục bộ.” |
| 00:35–01:15 | Sơ đồ Elgg, attacker, browser, DB | “Payload dùng Fetch và URLSearchParams. Python chỉ khởi động web server, không gửi request thay trình duyệt.” |
| 01:15–01:55 | Service health, version/digest, hai URL | “Hai trang khác origin; cặp subdomain cùng site dùng để đối chứng token, còn 127.0.0.1 dùng cho cross-site.” |
| 01:55–02:40 | Đăng nhập Alice, profile baseline | “Đây là About me ban đầu. Chúng em sẽ lưu một thay đổi hợp lệ trước để biết request chính xác.” |
| 02:40–03:45 | DevTools Network, Save, Payload | “Quan sát method, endpoint và field tương ứng About me. Giá trị cookie/token đã được ẩn khỏi cảnh quay. Những field còn lại cần giữ nguyên theo capture.” |
| 03:45–04:40 | Mã request.mjs và giao diện | “URLSearchParams tạo body urlencoded. credentials include không vô hiệu hóa SameSite. Không có XHR, form submit hay proxy sang Elgg.” |
| 04:40–05:15 | Nút echo và decoded body | “TC-02 xác nhận đóng gói đúng; đây chưa phải thành công trên Elgg.” |
| 05:15–06:10 | Mode protected + attacker + profile | “Với token bật, request thiếu token phải bị từ chối. Chúng em kiểm tra thông báo và dữ liệu, không chỉ status HTTP.” |
| 06:10–07:10 | Mode vulnerable + cùng payload | “Chỉ trong lab, chúng em bỏ kiểm tra token cho action này. Quan sát POST thực tế và tải mới profile để kết luận theo dữ liệu.” |
| 07:10–07:55 | Cross-site đối chứng + Cookies | “Nếu cookie Lax bị loại, Fetch không mang phiên Alice. Chúng em ghi lý do browser báo thay vì suy ra từ lỗi CORS.” |
| 07:55–08:40 | Before/after + kết quả đúng hoặc thất bại | “Chỉ khi About me đúng chuỗi theo MSV mới gọi là thành công. Nếu không, nhóm trình bày nguyên nhân quan sát được và bước cần sửa.” |
| 08:40–09:20 | Phòng chống + restore | “Bật lại token, reset hồ sơ. SameSite và kiểm nguồn bổ sung cho token; CORS không đủ để ngăn mọi CSRF.” |
| 09:20–10:00 | AI Usage và kết thúc | “AI tạo khung triển khai, tài liệu và slide theo prompt. Nhóm chịu trách nhiệm chạy, phản biện, chỉnh sửa và xác minh; phần việc thực tế được ghi trong AI Usage Log.” |

Checklist trước quay: tắt thông báo cá nhân; chỉ mở tài khoản lab; có baseline khác payload; xóa log cũ; chuẩn bị version/digest; kiểm microphone; zoom DevTools để đọc được tên field; crop/khử cookie và token ngay từ bản quay. Không dùng công cụ che bí mật có thể gỡ trong file trình chiếu.

Checklist ảnh: (1) health/version; (2) profile trước; (3) Save hợp lệ/Network; (4) echo; (5) POST attacker; (6) protected/profile không đổi; (7) vulnerable/profile sau; (8) cookie exclusion; (9) reset/protected. Giữ tên test, mode, hostname và thời gian trong chú thích. Bổ sung ảnh thật vào slide liên quan.

Sau quay: nhóm xem lại toàn bộ, đối chiếu kết quả, loại bí mật, xuất video và tự upload YouTube ở chế độ **unlisted** theo đề bài. Chỉ ghi URL sau khi upload thành công; hiện URL là **CHƯA CÓ**. Việc quay màn hình/thuyết minh và upload chưa được thực hiện bởi AI.
