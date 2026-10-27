# KỊCH BẢN QUAY VIDEO DEMO THỰC NGHIỆM VÀ THUYẾT MINH (VOICEOVER)

> **Mục tiêu:** Ghi lại video màn hình Full HD và thuyết minh toàn bộ quá trình tấn công CSRF bằng Fetch API trên Elgg.  
> **Thời lượng video:** Khoảng 5 – 7 phút.  
> **Định dạng:** MP4 (1080p, 60fps hoặc 30fps).  
> **Hình thức nộp bài:** Đăng tải lên YouTube ở chế độ **Không công khai (Unlisted)**.  

---

## 📋 1. Chuẩn bị trước khi quay (Pre-recording Checklist)

1. **Phần mềm quay màn hình:** Khuyến nghị dùng **OBS Studio** hoặc **SimpleScreenRecorder** trên Linux/Windows.
2. **Độ phân giải màn hình:** Đặt màn hình ở tỉ lệ 16:9, độ phân giải khuyến nghị 1920x1080 (1080p) để chữ trên DevTools hiển thị sắc nét.
3. **Môi trường lab sẵn sàng:**
   - Các container Docker đã chạy: `docker ps`.
   - File `/etc/hosts` đã cấu hình tên miền `www.seed-server.com` và `www.attacker32.com`.
   - Cơ chế CSRF countermeasure của Elgg đã được tắt (theo đúng Task 3).
   - Mã sinh viên của thành viên nhóm đã được cập nhật vào biến `studentId` trong `src/index.html`.
4. **Trình duyệt web:** Mở sẵn Firefox hoặc Google Chrome, xóa cache/cookie cũ nếu cần để phiên làm việc sạch sẽ.

---

## 🎬 2. Kịch bản phân cảnh chi tiết (Storyboard & Voiceover Script)

---

### 📍 Phân cảnh 1: Giới thiệu đề tài & Môi trường Docker (0:00 – 1:00)
- **Người thuyết minh:** **Thành viên 2 (Browser & Defense Lead)**
- **Hình ảnh hiển thị (Visual):**
  - Mở slide bìa hoặc file `README.md` của dự án, hiển thị đầy đủ Họ tên & MSV của cả 3 thành viên.
  - Chuyển sang cửa sổ Terminal gõ lệnh `docker ps` để chứng minh các container `seed-server`, `attacker32`, `mysql` đang hoạt động bình thường.
- **Lời thuyết minh (Voiceover - TV2):**
  > *"Kính chào thầy và các bạn. Đây là video demo thực nghiệm đề tài: Tấn công Cross-Site Request Forgery (CSRF) trên nền tảng mạng xã hội Elgg của nhóm chúng em gồm 3 thành viên: Bạn [Tên TV1], bạn [Tên TV3] và em là [Tên TV2].  
  > Điểm cải tiến và yêu cầu cốt lõi của đề tài lần này là: Nhóm không sử dụng công cụ XMLHttpRequest cũ hay Form HTML tự submit, mà bắt buộc sử dụng chuẩn Fetch API hiện đại kết hợp với đối tượng URLSearchParams để gửi ngầm gói tin cập nhật trường About me thành 'CSRF attack by <MSV>'. Cả 3 thành viên nhóm chúng em đều đã trực tiếp thực hành thành công bài lab trên máy cá nhân và hôm nay sẽ cùng nhau phối hợp thuyết minh từng bước kỹ thuật trong video này.  
  > Trên màn hình terminal, các bạn có thể thấy hệ thống container SEED Labs đã được khởi động hoàn tất."*

---

### 📍 Phân cảnh 2: Bắt và phân tích HTTP POST Request qua DevTools (1:00 – 2:30)
- **Người thuyết minh:** **Thành viên 2 (Browser & Defense Lead)**
- **Hình ảnh hiển thị (Visual):**
  - Mở trình duyệt, truy cập `http://www.seed-server.com`.
  - Đăng nhập tài khoản `alice` với mật khẩu `seedalice`.
  - Điều hướng vào trang cá nhân của Alice $\rightarrow$ Bấm **Edit Profile**.
  - Nhấn `F12` mở Developer Tools $\rightarrow$ Chọn tab **Network**, tích chọn ô **Preserve log**.
  - Nhập vào ô Brief description một chuỗi test và bấm **Save**.
  - Phóng to (Zoom-in) vào dòng request `POST edit` trong tab Network.
  - Nhấp vào xem chi tiết:
    - URL Endpoint: `http://www.seed-server.com/action/profile/edit`
    - Request Headers: Chỉ rõ `Content-Type: application/x-www-form-urlencoded` và Cookie `Elgg=...`.
    - Payload/Body: Chỉ rõ các trường `guid=42`, `name=Alice`, `description`, `accesslevel[description]=2`.
- **Lời thuyết minh (Voiceover - TV2):**
  > *"Tiếp theo, em xin phân tích cấu trúc HTTP Request hợp lệ.  
  > Em đăng nhập dưới tài khoản của nạn nhân là Alice và vào trang chỉnh sửa hồ sơ cá nhân. Mở DevTools tab Network và bấm Save để bắt gói tin.  
  > Quan sát gói tin POST gửi tới endpoint `/action/profile/edit`: Gói tin này chứa Cookie phiên của Alice để xác thực danh tính. Phần thân body chứa các tham số quan trọng: `guid` của Alice là 42, `name` là Alice, và trường `description` chính là nội dung của About me. Đồng thời, `accesslevel[description]` được đặt bằng 2 để nội dung này hiển thị công khai. Đây chính là cấu trúc payload mà chúng ta cần giả mạo. Tiếp theo, xin mời bạn [Tên TV1] phân tích mã nguồn khai thác Fetch API."*

---

### 📍 Phân cảnh 3: Xây dựng trang web giả mạo với Fetch API (2:30 – 4:00)
- **Người thuyết minh:** **Thành viên 1 (Technical & Offensive Lead)**
- **Hình ảnh hiển thị (Visual):**
  - Mở file `CSRF_Project_Pack/src/index.html` trong IDE (VS Code / Antigravity).
  - Highlight đoạn mã JavaScript:
    - Khởi tạo `new URLSearchParams()` và `payload.append(...)`.
    - Gọi hàm `fetch()` với cấu hình `method: 'POST'`, `mode: 'no-cors'`, `credentials: 'include'`.
  - Mở Terminal chạy lệnh copy file vào container `attacker32` hoặc chạy `python3 src/exploit.py --serve 80`.
- **Lời thuyết minh (Voiceover - TV1):**
  > *"Xin chào thầy, em là [Tên TV1]. Sau đây em xin giải thích mã nguồn tấn công trên máy chủ Attacker.  
  > Nhóm em tạo tệp `index.html` ngụy trang thành một trang thông báo nhận quà trúng thưởng bắt mắt để thu hút nạn nhân.  
  > Bên dưới mã nguồn JavaScript, theo đúng yêu cầu đề bài, nhóm sử dụng đối tượng `URLSearchParams` để đóng gói toàn bộ các tham số profile. Trong đó, trường `description` được gán cố định nội dung HTML: `<p>CSRF attack by B21DCCN001</p>`.  
  > Tiếp theo, nhóm kích hoạt hàm `fetch()` gửi thẳng tới endpoint của Elgg. Điểm mấu chốt kỹ thuật ở đây là:  
  > Thứ nhất: Thuộc tính `credentials: 'include'` là bắt buộc để trình duyệt tự động đính kèm Cookie phiên của Alice.  
  > Thứ hai: Thuộc tính `mode: 'no-cors'` kết hợp với dữ liệu dạng urlencoded tạo thành một Simple Request theo đặc tả W3C, giúp request được phóng thẳng đến server mà không bị chặn bởi Preflight OPTIONS. Tiếp theo xin mời bạn [Tên TV3] tiến hành kích hoạt tấn công và kiểm chứng kết quả."*

---

### 📍 Phân cảnh 4: Thực hiện cuộc tấn công và Kiểm chứng kết quả (4:00 – 5:30)
- **Người thuyết minh:** **Thành viên 3 (Server & Security Lead)**
- **Hình ảnh hiển thị (Visual):**
  - Quay lại trình duyệt nơi Alice đang mở trang cá nhân `http://www.seed-server.com/profile/alice`.
  - Chỉ rõ trường **About me** của Alice hiện tại đang trống (hoặc có chữ ban đầu).
  - Mở một Tab mới, đóng vai trò Alice vừa bấm vào một đường link độc hại: Truy cập `http://www.attacker32.com`.
  - Trang web trúng thưởng hiển thị với hiệu ứng loading xoay tròn.
  - Bấm `F12` trên tab Attacker $\rightarrow$ Tab Network và Console: Chỉ rõ request `fetch()` đã được kích hoạt và gửi ngầm thành công.
  - Quay trở lại tab trang cá nhân của Alice $\rightarrow$ Nhấn `F5` (Refresh trang).
  - Phóng to vào mục **About me**: Dòng chữ đã biến thành:  
    $$\text{“CSRF attack by <MSV>”}$$
- **Lời thuyết minh (Voiceover - TV3):**
  > *"Xin chào thầy, em là [Tên TV3]. Sau đây em xin thực hiện cuộc tấn công thực tế.  
  > Hãy quan sát trang cá nhân của Alice trước khi bị tấn công: Mục About me hiện chưa có nội dung bị chỉnh sửa.  
  > Nạn nhân Alice vẫn đang duy trì phiên làm việc trên Elgg. Giả sử Alice nhận được một đường link trúng thưởng và mở trên một tab mới: địa chỉ `www.attacker32.com`.  
  > Ngay khi trang web của kẻ tấn công tải xong, đoạn mã JavaScript ngầm đã gửi gói tin Fetch POST kèm Cookie phiên của Alice đến máy chủ Elgg mà Alice không hề hay biết, trang web cũng không hề bị chuyển hướng.  
  > Bây giờ, em quay trở lại tab Elgg của Alice và nhấn F5 để làm mới...  
  > Như thầy và các bạn có thể thấy rõ trên màn hình: Trường About me của Alice đã chính thức bị thay đổi thành 'CSRF attack by B21DCCN001'! Cuộc tấn công đã thành công mỹ mãn."*

---

### 📍 Phân cảnh 5: Minh bạch ứng dụng AI & Kết luận (5:30 – 6:30)
- **Người thuyết minh:** **Thành viên 3 (Server & Security Lead)**
- **Hình ảnh hiển thị (Visual):**
  - Chuyển sang slide hoặc tài liệu ghi rõ 3 mức độ sử dụng AI của nhóm.
  - Mở nhanh file `docs/03_CSRF_DOCX_ANSWERS.md` chỉ rõ nhóm đã giải quyết đầy đủ 15 câu hỏi trong file `CSRF.docx`.
- **Lời thuyết minh (Voiceover - TV3):**
  > *"Để tuân thủ đúng quy định trong đề bài, nhóm em xin nêu rõ mức độ sử dụng AI trong quá trình thực hiện:  
  > - Ở Mức độ 1: Cả nhóm đã cùng sử dụng AI để thảo luận, phản biện sâu về cơ chế Simple Request và CORS bypass của Fetch API, sau đó mỗi thành viên tự tay code và chạy thử trên máy của mình.  
  > - Ở Mức độ 2: AI đóng vai trò đồng sáng tạo trong việc trau chuốt cấu trúc kịch bản video và vẽ sơ đồ dữ liệu.  
  > - Ở Mức độ 3: Dùng AI sinh template khung ban đầu của file exploit.py.  
  > Cả 3 thành viên nhóm em cũng đã cùng nhau nghiên cứu và trả lời chi tiết toàn bộ 15 câu hỏi trong file CSRF.docx để chuẩn bị sẵn sàng cho buổi vấn đáp.  
  > Cảm ơn thầy và các bạn đã theo dõi video demo của nhóm chúng em!"*

---

## 📤 3. Hướng dẫn Đăng tải YouTube (Unlisted) & Nộp bài

1. **Xuất video:** Đặt tên file là `CSRF_Elgg_FetchAPI_NhomX.mp4`.
2. **Truy cập YouTube Studio:** `https://studio.youtube.com` $\rightarrow$ Nhấn **Tạo (Create)** $\rightarrow$ **Tải video lên (Upload videos)**.
3. **Cấu hình thông tin video:**
   - **Tiêu đề (Title):** `[Học phần CS] Demo Tấn công CSRF trên Elgg bằng Fetch API - Nhóm X`
   - **Mô tả (Description):**
     ```text
     Đề tài: Tấn công Cross-Site Request Forgery (CSRF) trên Elgg bằng Fetch API
     Học phần: An toàn và Bảo mật Hệ thống Thông tin
     Thành viên nhóm:
     1. Nguyễn Văn A - MSV: B21DCCN001 (Technical Lead)
     2. Trần Thị B - MSV: B21DCCN002 (Media & Demo Lead)
     3. Lê Văn C - MSV: B21DCCN003 (Research & Slide Lead)
     Mức độ sử dụng AI: Đã công khai chi tiết ở cuối video và tài liệu báo cáo.
     ```
   - **Đối tượng người xem:** Chọn *"Không, đây không phải nội dung dành cho trẻ em"*.
4. **Cấu hình quyền riêng tư (BẮT BUỘC):**
   - Chọn chế độ **Không công khai (Unlisted)**.  
     *(Chỉ những người có đường liên kết mới xem được video, không xuất hiện công khai trên kết quả tìm kiếm của YouTube).*
5. **Sao chép đường link:** Copy link dạng `https://youtu.be/...` để điền vào form nộp bài trên Google Classroom.
