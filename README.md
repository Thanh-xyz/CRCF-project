# Yêu cầu thực hiện

Sinh viên được yêu cầu thực hiện bài tấn công CSRF trên Elgg để thay đổi nội dung trường About me trong profile của nạn nhân thành “CSRF attack by \<MSV\>”, trong đó MSV là mã sinh viên của 1 thành viên nhóm.

Thay đổi với bài thực hành gốc là sinh viên không được dùng công cụ XMLHttpRequest (XHR) như trong bài giảng mà chuyển sang công cụ mới hơn Fetch API.

- Sinh viên không sử dụng XMLHttpRequest (mã nguồn mẫu trong tài liệu gốc của SEED Lab) và không sử dụng Form HTML submit truyền thống.

- Bắt buộc sử dụng Fetch API (fetch()) kết hợp với đối tượng URLSearchParams hoặc FormData để đóng gói dữ liệu request.

Nhiệm vụ của sinh viên là ghi lại video màn hình và thuyết minh toàn bộ quá trình tấn công, gồm các bước

- Phân tích HTTP request: Đăng nhập tài khoản bất kỳ trên trang Elgg. Sử dụng Developer Tools (Tab Network) hoặc HTTP Header Live Add-on để bắt (capture) HTTP Request khi thực hiện chức năng Edit Profile. Ghi lại các tham số cần thiết.

- Xây dựng trang web giả mạo: Tạo tệp index.html trên máy chủ Attacker. Viết đoạn mã JavaScript sử dụng Fetch API để gửi POST request chứa payload cập nhật profile tới endpoint của Elgg.

- Thực hiện tấn công: Dùng trình duyệt đăng nhập vào Elgg dưới danh nghĩa nạn nhân (Alice). Kiểm tra lại nội dung trang profile của nạn nhân.

Sinh viên cũng cần làm một file thuyết trình dạng powerpoint, cho 10 phút trình bày, mô tả lại

- Phân công công việc của các thành viên trong nhóm

- Trình bày lại các bước thực hiện kèm theo sơ đồ

- Cần có ảnh chụp màn hình đối với các bước thực hiện

Video cần được upload lên youtube, đặt ở chế độ **unlisted** (không công khai). Sinh viên nộp file chương trình exploit.py, file thuyết trình và đường link video theo form nộp bài sẽ thông báo trên trang Classroom.

**Lưu ý**: Sinh viên được sử dụng AI hỗ trợ quá trình thực hiện, song phải nêu rõ trong video và tài liệu thuyết trình những nội dung nào sử dụng AI và mức độ áp dụng. Các mức độ áp dụng được phân loại cần làm rõ gồm:

- Dùng AI để tranh luận và phản biện để tìm ra giải pháp, sau đó sinh viên tự triển khai.

- AI đóng vai trò đồng sáng tạo nội dung từng phần theo thiết kế của sinh viên, sinh viên biên tập lại, chỉnh sửa và chịu trách nhiệm nội dung. Cần làm rõ ý tưởng của sinh viên là gì, AI thực hiện những phần nào.

- AI tạo sinh thiết kế và triển khai theo yêu cầu prompt của sinh viên. Sinh viên đóng vai trò người viết prompt và ghép nối lại sản phẩm cuối.

