# AI Usage Log — công bố minh bạch

Ngày 08/11/2026. Công cụ: OpenAI Codex trong workspace người dùng; shell/Python/Node; Chrome headless qua Playwright cho kiểm thử cục bộ; skill Presentations và thư viện artifact-tool để tạo PowerPoint; web search đọc tài liệu SEED, MDN, Elgg, OWASP.

Prompt chính do sinh viên cung cấp: xây dựng dự án thực hành CSRF trên Elgg cho Nhóm 6; bắt buộc Fetch + URLSearchParams/FormData; Alice/About me theo MSV; Docker, tests, tài liệu, bằng chứng, PowerPoint 10 phút, kịch bản video và khai báo AI; không bịa thực nghiệm.

| Phần việc | AI thực hiện | Sinh viên cần thực hiện/xác nhận |
|---|---|---|
| Khảo sát | Đọc repository/đề bài, kiểm tra công cụ, phát hiện lỗi đĩa/Docker | Giải phóng dung lượng và xử lý Docker mà không mất dữ liệu |
| Thiết kế/mã | Compose, patch token có điều kiện, attacker, launcher, lifecycle, tests | Đọc code; chạy image; xác nhận API/bootstrap/reset; sửa theo capture |
| Kiểm chứng | 6 JS tests, 4 HTTP tests; Chrome TC-02 và ảnh/log thật; Compose syntax | Chạy TC-01/03/04/05/06 trên Elgg; mở DevTools theo đề bài |
| Tài liệu/slide | Lý thuyết, sơ đồ, hướng dẫn, script, nội dung và deck | Biên tập, xác minh thuật ngữ, bổ sung ảnh Elgg và kết quả thật |
| Video/nộp bài | Viết kịch bản và checklist | Quay, thuyết minh, xem lại, upload unlisted, nộp form |

Ý tưởng/thiết kế của sinh viên xác nhận được từ prompt: đề tài, thành viên, chuỗi MSV, yêu cầu công nghệ và sản phẩm, quy trình, giới hạn lab và tính trung thực. Chưa có bằng chứng sinh viên đã tự chỉnh mã hoặc tự chạy Elgg trong phiên này. Không ghi các việc dự kiến thành việc đã làm.

**Mức áp dụng hiện tại phù hợp nhóm 3 của giảng viên:** AI tạo sinh thiết kế và triển khai theo prompt của sinh viên; sinh viên đóng vai trò viết prompt và ghép nối/biên tập sản phẩm cuối. Không khai thành “chỉ phản biện” hoặc “chỉ đồng sáng tạo một phần” khi AI đã tạo khung và code. Nếu nhóm thay đổi mức tham gia, ghi cụ thể từng phần, không xóa lịch sử tạo sinh.

Ba mức theo đề bài: (1) tranh luận/phản biện rồi sinh viên tự triển khai; (2) đồng sáng tạo từng phần theo thiết kế sinh viên, sinh viên biên tập/chịu trách nhiệm; (3) tạo sinh thiết kế và triển khai theo prompt, sinh viên ghép nối sản phẩm. Mức 3 không miễn trách nhiệm kiểm chứng.

Kết quả đã kiểm chứng: encoder và server tests đạt, TC-02 Fetch chạy Chrome thật; hình trong evidence là từ lần chạy. Chưa kiểm chứng: Docker image, phiên bản Elgg chính xác, endpoint/runtime capture, bảo vệ token, reset, CSRF thành công. Không có video hoặc YouTube URL. Chỉnh sửa của sinh viên sau bàn giao: **CHƯA GHI NHẬN**; bổ sung ngày, tên người, file, lý do và cách kiểm tra khi thực hiện.
