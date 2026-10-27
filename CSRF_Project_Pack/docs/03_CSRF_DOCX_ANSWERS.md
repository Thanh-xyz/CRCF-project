# 03. LỜI GIẢI CHI TIẾT TOÀN BỘ CÂU HỎI TRONG FILE CSRF.DOCX

Tài liệu này cung cấp đáp án chi tiết, chuẩn xác về mặt học thuật và thực tiễn an toàn thông tin cho toàn bộ **15 câu hỏi** trong file đề bài `9. CSRF.docx`. Được biên soạn dựa trên giáo trình *Computer & Internet Security: A Hands-on Approach* của GS. Wenliang Du và các tiêu chuẩn bảo mật web hiện đại (W3C, IETF RFC, OWASP).

---

## ❓ Câu 1
**Đề bài:** *Explain why the same-site cookie can help prevent CSRF attacks.*  
*(Giải thích tại sao thuộc tính SameSite của cookie có thể giúp phòng chống tấn công CSRF.)*

### 💡 Lời giải:
1. **Bản chất của lỗ hổng CSRF:**  
   CSRF xảy ra do cơ chế mặc định trước đây của các trình duyệt web: khi một trang web tại Origin A (ví dụ: `attacker.com`) kích hoạt một HTTP request hướng tới Origin B (ví dụ: `bank.com`), trình duyệt sẽ **tự động đính kèm** toàn bộ Cookie thuộc về Origin B (bao gồm Session Cookie xác thực của nạn nhân).

2. **Cách SameSite Cookie giải quyết vấn đề:**  
   Thuộc tính `SameSite` là một cờ bảo vệ được thiết lập bởi máy chủ trong header `Set-Cookie` (ví dụ: `Set-Cookie: session=xyz; SameSite=Strict; Secure`). Cờ này trực tiếp hướng dẫn trình duyệt **kiểm soát việc có gửi Cookie kèm theo các Cross-Site Request hay không**:
   - **`SameSite=Strict`:** Trình duyệt **tuyệt đối không gửi** Cookie trong bất kỳ yêu cầu cross-site nào (kể cả khi người dùng nhấp vào một liên kết thông thường `<a href="...">` từ trang web bên ngoài). Do đó, kẻ tấn công từ trang web giả mạo không thể mượn phiên đăng nhập của người dùng $\rightarrow$ **Triệt tiêu hoàn toàn nguy cơ CSRF**.
   - **`SameSite=Lax`:** Trình duyệt chỉ gửi Cookie đối với các điều hướng an toàn cấp cao nhất (Top-level navigation) sử dụng phương thức an toàn (Safe HTTP methods như `GET`, ví dụ khi người dùng click link từ Google). Trình duyệt **từ chối gửi Cookie** đối với các request ngầm (như `<img>`, `<iframe>`, `fetch()`, `XMLHttpRequest`) và toàn bộ các request thay đổi trạng thái như `POST`, `PUT`, `DELETE`.
   - **`SameSite=None`:** Trình duyệt gửi Cookie trong mọi trường hợp (bắt buộc phải kèm cờ `Secure`).

3. **Kết luận:**  
   Vì các cuộc tấn công CSRF gây hại thường sử dụng các request thay đổi trạng thái (`POST` hoặc các `GET` ngầm), việc áp dụng `SameSite=Strict` hoặc `SameSite=Lax` khiến trình duyệt không gửi Cookie xác thực trong request mạo danh. Máy chủ mục tiêu sẽ coi đó là request chưa đăng nhập và từ chối xử lý, từ đó ngăn chặn thành công tấn công CSRF.

---

## ❓ Câu 2
**Đề bài:** *Explain how a website can use secret token to prevent CSRF attacks, and why does it work?*  
*(Giải thích cách một trang web sử dụng secret token để ngăn ngừa tấn công CSRF, và tại sao phương pháp này lại hiệu quả?)*

### 💡 Lời giải:
1. **Cách triển khai cơ chế Secret Token (Anti-CSRF Token / Synchronizer Token Pattern):**
   - Khi người dùng hợp lệ truy cập vào một form (ví dụ: form chỉnh sửa thông tin hoặc chuyển tiền), máy chủ web sẽ sinh ra một giá trị ngẫu nhiên, bí mật, duy nhất theo phiên đăng nhập (gọi là CSRF Token hoặc Anti-CSRF Token).
   - Máy chủ nhúng token này vào trong nội dung trang HTML (ví dụ: trường ẩn `<input type="hidden" name="__csrf_token" value="abc123random">` hoặc chèn vào thẻ `<meta>`). Đồng thời, máy chủ lưu trữ token này trong session của người dùng (hoặc kiểm tra tính hợp lệ bằng HMAC).
   - Khi người dùng gửi form, trình duyệt sẽ gửi cả Cookie phiên và giá trị CSRF Token trong phần thân (body) của HTTP POST request.
   - Máy chủ tiếp nhận request, so sánh giá trị token trong body với token trong session. Nếu trùng khớp, request được chấp nhận; nếu thiếu hoặc sai lệch, request bị từ chối ngay lập tức.

2. **Tại sao phương pháp này hiệu quả (Why does it work?):**
   - **Nhờ Chính sách Cùng nguồn gốc (Same-Origin Policy - SOP):** Trình duyệt ngăn chặn mã JavaScript từ trang web độc hại của Attacker (`attacker.com`) đọc nội dung DOM hoặc đọc phản hồi HTTP từ trang web mục tiêu (`bank.com` hay `elgg`).
   - Mặc dù kẻ tấn công có thể ép trình duyệt của nạn nhân gửi request tới máy chủ mục tiêu (khiến Cookie tự động đính kèm), nhưng kẻ tấn công **hoàn toàn không có cách nào đọc trộm được giá trị Secret Token** nằm trên trang web hợp lệ của người dùng.
   - Do không biết token, request giả mạo do kẻ tấn công tạo ra sẽ thiếu hoặc chứa token sai $\rightarrow$ Máy chủ dễ dàng phát hiện và chặn đứng cuộc tấn công.

---

## ❓ Câu 3
**Đề bài:** *These days, most of the websites use HTTPS, instead of HTTP. Do we still need to worry about CSRF attacks?*  
*(Ngày nay hầu hết website đều sử dụng HTTPS thay vì HTTP. Chúng ta có còn phải lo lắng về tấn công CSRF nữa không?)*

### 💡 Lời giải:
**CÓ, chúng ta VẪN PHẢI LO LẮNG về tấn công CSRF.**

### Giải thích nguyên nhân:
1. **Khác biệt về phạm vi bảo vệ:**
   - **HTTPS (SSL/TLS):** Giải quyết bài toán **bảo mật trên đường truyền** (Transport Layer Security) giữa Client và Server. Nó bảo đảm 3 yếu tố: Tính bảo mật (Confidentiality - chống nghe lén), Tính toàn vẹn (Integrity - chống chỉnh sửa gói tin), và Tính xác thực của Server (Authentication). HTTPS ngăn chặn kẻ tấn công trung gian (Man-in-the-Middle - MITM) can thiệp vào đường truyền mạng.
   - **CSRF:** Là lỗ hổng ở **tầng logic ứng dụng web** (Application Layer) bắt nguồn từ cách thức trình duyệt quản lý và tự động đính kèm thông tin xác thực (Credentials/Cookies) khi tạo ra các Cross-Site Request.

2. **Kịch bản thực tế:**
   - Kẻ tấn công dụ nạn nhân mở trang `https://attacker.com`.
   - Trang này kích hoạt một request gửi đến `https://bank.com/transfer`.
   - Kết nối giữa trình duyệt của nạn nhân và `bank.com` được mã hóa hoàn toàn bằng HTTPS hợp lệ, chứng chỉ số hợp lệ. Trình duyệt vẫn tự động đính kèm cookie hợp lệ của `bank.com` vào trong đường hầm HTTPS đó!
   - Máy chủ `bank.com` giải mã gói tin HTTPS bình thường, thấy cookie phiên chính chủ của nạn nhân và thực hiện lệnh chuyển tiền.

$\rightarrow$ **Kết luận:** HTTPS mã hóa đường ống truyền tải, nhưng không ngăn được việc trình duyệt bị lừa gửi yêu cầu độc hại qua đường ống đó. Vì vậy, HTTPS **không có khả năng chống lại CSRF**.

---

## ❓ Câu 4
**Đề bài:** *Using LiveHTTPHeader, we find out that the following GET request is used to send an HTTP request to www.example.com to delete a page owned by a user: `GET /delete.php?pageid=5 Host: www.example.com`. Please construct a simple malicious web page, so when a victim visits this web page, a forged request will be launched against www.example.com to delete a page belonging to the user.*

### 💡 Lời giải:
Do yêu cầu sử dụng phương thức `GET`, kẻ tấn công có thể lợi dụng bất kỳ thẻ HTML nào có khả năng tự động gửi GET request tải tài nguyên từ xa ngay khi trang hiển thị (như `<img>`, `<iframe>`, `<script>`, `<link>`) hoặc sử dụng Fetch API.

### Mã nguồn trang web độc hại (`malicious_get.html`):

```html
<!DOCTYPE html>
<html>
<head>
    <title>Bạn đã nhận được một thiệp chúc mừng!</title>
</head>
<body>
    <h1>Đang tải nội dung bất ngờ dành cho bạn...</h1>

    <!-- Cách 1: Sử dụng thẻ <img> ẩn (Tự động kích hoạt khi trang web nạp) -->
    <img src="http://www.example.com/delete.php?pageid=5" 
         style="display: none;" 
         alt="Hidden Exploit" />

    <!-- Cách 2: Sử dụng Fetch API chạy ngầm -->
    <script>
        fetch("http://www.example.com/delete.php?pageid=5", {
            method: "GET",
            credentials: "include", // Đính kèm Cookie phiên của example.com
            mode: "no-cors"
        });
    </script>
</body>
</html>
```

### Cơ chế hoạt động:
Khi nạn nhân (đang đăng nhập trên `www.example.com`) truy cập vào trang web trên, trình duyệt cố gắng tải bức ảnh từ địa chỉ `src`. Quá trình này kích hoạt một HTTP GET request gửi đến `www.example.com/delete.php?pageid=5` kèm theo cookie phiên của nạn nhân. Máy chủ tiếp nhận và xóa trang số 5 của người dùng.

---

## ❓ Câu 5
**Đề bài:** *Using LiveHTTPHeader, we find out that the following POST request is used to send an HTTP request to www.example.com to delete a page owned by a user: `POST /delete.php Host: www.example.com Content-Length: 8 pageid=5`. Please construct a simple malicious web page, so when a victim visits this web page, a forged request will be launched against www.example.com to delete a page belonging to the user.*

### 💡 Lời giải:
Đối với phương thức `POST`, kẻ tấn công có thể sử dụng JavaScript Fetch API (kỹ thuật hiện đại, tàng hình) hoặc form HTML tự động submit.

### Mã nguồn trang web độc hại (`malicious_post.html`) sử dụng Fetch API:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Trúng thưởng khuyến mãi</title>
</head>
<body>
    <h1>Chào mừng bạn đến với chương trình tri ân khách hàng!</h1>

    <script type="text/javascript">
        window.onload = function() {
            // Đóng gói tham số POST body pageid=5
            const params = new URLSearchParams();
            params.append('pageid', '5');

            // Gửi ngầm request POST mạo danh
            fetch('http://www.example.com/delete.php', {
                method: 'POST',
                mode: 'no-cors',
                credentials: 'include', // Bắt buộc để gửi kèm cookie của nạn nhân
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });
        };
    </script>
</body>
</html>
```

### Ưu điểm vượt trội của mã nguồn trên:
Request được gửi ngầm bất đồng bộ trong background. Nạn nhân không hề bị chuyển hướng màn hình sang `www.example.com` và không hay biết trang số 5 của mình đã bị xóa.

---

## ❓ Câu 6
**Đề bài:** *The forged HTTP request against Elgg in this chapter needs Boby’s user id (guid) to work properly. If Alice targets Boby specifically, before the attack, she needs to find ways to get Boby’s user id. Alice does not know Boby’s Elgg password, so she cannot log into Boby’s account to get the information. Please describe how Alice can find out Boby’s user id.*

### 💡 Lời giải:
Mặc dù Alice không có mật khẩu của Boby, Alice vẫn có thể tìm ra `guid` của Boby một cách dễ dàng thông qua các thông tin công khai trên ứng dụng Elgg:

1. **Kiểm tra URL liên kết trên giao diện:**
   - Khi Alice đăng nhập vào Elgg và tìm kiếm trang cá nhân của Boby, hoặc xem danh sách thành viên (Members list), nhấp vào trang cá nhân của Boby: URL hiển thị có thể là `http://www.seed-server.com/profile/boby` hoặc `http://www.seed-server.com/profile/view?guid=XX`.
2. **Kiểm tra mã nguồn HTML (View Page Source / Inspect Element):**
   - Alice mở trang cá nhân của Boby hoặc một bài viết do Boby đăng, nhấn chuột phải chọn **Inspect Element** (hoặc `Ctrl + U`).
   - Tìm kiếm tên `boby` hoặc thẻ ảnh đại diện (avatar) của Boby: Thẻ `<img>` ảnh đại diện thường có đường dẫn chứa GUID trực tiếp, ví dụ:  
     `<img src="http://www.seed-server.com/avatar/view/43/medium/..." />`  
     $\rightarrow$ Con số `43` chính là `guid` của Boby.
   - Tìm các nút tương tác như "Add friend" hoặc "Send message" tới Boby: Trong thuộc tính `href` hoặc `form action`, Elgg nhúng tham số `friend=43` hoặc `guid=43`.
3. **Xem RSS Feed hoặc dữ liệu xuất bản:**
   - Elgg hỗ trợ các luồng cấp tin RSS. Khi bấm xem RSS feed của trang cá nhân Boby, mã GUID của người dùng luôn xuất hiện trong các thẻ XML.

---

## ❓ Câu 7
**Đề bài:** *In a request, there is a user id, which is a random number generated by the server. The ID information can be found from the user’s page from the server. If an attacker does not know this user ID, can he/she still launch an CSRF attack on this service?*

### 💡 Lời giải:
**CÂU TRẢ LỜI PHỤ THUỘC VÀO CƠ CHẾ XỬ LÝ CỦA PHÍA SERVER:**

1. **Trường hợp KHÔNG THỂ tấn công (Nếu Server bắt buộc phải có User ID hợp lệ trong Request Body):**
   - Nếu server logic yêu cầu: `UPDATE profile WHERE id = request.getParam("user_id")` và kiểm tra quyền dựa trên Session cookie.
   - Nếu User ID là một số ngẫu nhiên có không gian giá trị đủ lớn (ví dụ UUID 128-bit) và kẻ tấn công không biết ID của nạn nhân, kẻ tấn công không thể đoán mò (brute-force). Yêu cầu giả mạo gửi lên server sẽ chứa ID sai hoặc để trống, server sẽ báo lỗi `User Not Found` $\rightarrow$ **Tấn công thất bại**.

2. **Trường hợp VẪN CÓ THỂ tấn công:**
   - **Tấn công mục tiêu cụ thể đã thu thập trước:** Như phân tích ở Câu 6, nếu ID có thể tìm thấy trên trang web công khai của người dùng, kẻ tấn công chỉ cần vào trang công khai lấy ID trước rồi mới nhúng vào mã khai thác.
   - **Endpoint tự suy diễn danh tính từ Session:** Nếu server được thiết kế tốt hơn về mặt kiến trúc, nó chỉ lấy danh tính người dùng từ Cookie Session: `currentUser = session.getUser(); currentUser.update(...)` mà không cần client gửi `user_id`. Lúc này kẻ tấn công không cần biết User ID vẫn tấn công thành công.
   - **Tấn công theo kiểu Spraying / Guessing:** Nếu số ngẫu nhiên nằm trong khoảng hẹp (ví dụ số nguyên từ 1 đến 100), kẻ tấn công có thể gửi vòng lặp nhiều request thử nghiệm.

---

## ❓ Câu 8
**Đề bài:** *If Alice would like to launch the attack on anybody who visits her malicious web page. In this case, she does not know who is visiting the web page before hand.*  
*(1) Can she still launch a CSRF attack to modify the victim’s Elgg profile? Please explain.*  
*(2) Can she launch a CSRF attack to add her to the victim’s friend list? Please explain.*

### 💡 Lời giải:

#### (1) Có thể sửa profile Elgg của một khách ghé thăm bất kỳ không?
- **Trả lời: KHÔNG THỂ (với CSRF thuần túy trên Elgg).**
- **Giải thích:**  
  Trong Elgg, endpoint `/action/profile/edit` bắt buộc phải có tham số `guid` của chính nạn nhân trong payload POST. Vì Alice không biết trước ai sẽ truy cập trang web độc hại của mình, và do chính sách Same-Origin Policy (SOP), mã JavaScript trên trang của Alice không thể đọc trộm thông tin profile của khách ghé thăm để lấy `guid`. Do thiếu `guid` chính xác của nạn nhân, request mạo danh sẽ không thể chỉ định đúng đối tượng cần sửa trên server. *(Lưu ý: Trừ khi kết hợp với một lỗ hổng XSS trên Elgg để đọc GUID trước rồi mới trigger CSRF).*

#### (2) Có thể kết bạn (Add Friend) với Alice vào danh sách bạn bè của nạn nhân không?
- **Trả lời: HOÀN TOÀN CÓ THỂ.**
- **Giải thích:**  
  Khi thực hiện hành động thêm bạn bè trong Elgg, endpoint có dạng:  
  `GET /action/friends/add?friend=<Alice_GUID>`  
  Trong request này:
  - Tham số duy nhất cần truyền là GUID của **Alice (kẻ tấn công)**. Mà GUID của chính mình thì Alice đã biết rõ (ví dụ `friend=42`).
  - Danh tính của người thực hiện hành vi "kết bạn" (nạn nhân ghé thăm) được máy chủ Elgg **tự động xác định từ Cookie Session** đính kèm trong request.
  - Do đó, bất kỳ ai đang đăng nhập Elgg vô tình vào trang web của Alice, trình duyệt của họ sẽ tự động gửi request kết bạn với Alice. Tấn công thành công trên mọi nạn nhân!

---

## ❓ Câu 9
**Đề bài:** *When a web page sends a request to its server, the session ID is always attached in the cookie section of the HTTP header. A web application requires all the requests from its own page to also attach the session ID in its data part (for GET requests, the session ID is attached in the URL, while for POST requests, the session ID is included in the payload). This sounds redundant, because the session ID is already included in the request. However, by checking whether a request has the session ID in its data part, the web server can tell whether a request is a cross-site request or not. Please explain why.*

### 💡 Lời giải:
Kỹ thuật này trong an toàn ứng dụng web được gọi là **Cơ chế Double Submit Cookie** (hoặc biến thể dùng Session ID làm token).

### Cơ chế hoạt động và nguyên lý phân biệt:
1. **Tại sao việc gửi 2 lần không hề thừa (Why it is not redundant):**
   - **Cookie Header:** Do **trình duyệt tự động đính kèm** vào mọi request gửi đến máy chủ, bất kể request đó sinh ra từ chính trang web gốc (same-site) hay sinh ra từ trang web của kẻ tấn công (cross-site). Kẻ tấn công không cần biết giá trị cookie này là gì, trình duyệt vẫn tự gửi.
   - **Data part (URL hoặc Body Payload):** Phải do **mã JavaScript hoặc Form của trang web chủ động gán vào**.
2. **Vai trò của Same-Origin Policy (SOP):**
   - Nhờ SOP, JavaScript chạy trên trang độc hại của kẻ tấn công (`attacker.com`) **bị cấm hoàn toàn không được đọc cookie** của miền `example.com`.
   - Vì kẻ tấn công không thể đọc được Session ID trong Cookie, nên kẻ tấn công **không thể lấy được giá trị Session ID để nhét vào URL hay body** của request giả mạo.
3. **Phân biệt của Server:**
   - **Request hợp lệ (Same-site):** Trang web chính chủ đọc được Session ID của chính nó và nhúng vào dữ liệu gửi đi $\rightarrow$ Giá trị trong Body = Giá trị trong Cookie Header $\rightarrow$ Server chấp nhận.
   - **Request giả mạo (Cross-site):** Kẻ tấn công chỉ có thể lợi dụng trình duyệt gửi Cookie Header, nhưng không thể điền Session ID vào Body $\rightarrow$ Server so sánh thấy thiếu hoặc không khớp $\rightarrow$ Server nhận biết ngay đây là Cross-site request và từ chối xử lý!

---

## ❓ Câu 10
**Đề bài:** *Do browsers know whether an HTTP request is cross-site or not?*  
*(Trình duyệt có biết một HTTP request có phải là cross-site hay không?)*

### 💡 Lời giải:
**CÓ, trình duyệt HOÀN TOÀN BIẾT RÕ một request có phải là cross-site hay không.**

### Giải thích chi tiết:
Trình duyệt là thực thể trực tiếp khởi tạo và quản lý ngữ cảnh duyệt web:
- Trình duyệt nắm rõ **Context/Origin nguồn (Request Initiator / Document Origin):** Địa chỉ của trang web đang mở và thực thi đoạn mã gửi request (ví dụ: `http://www.attacker.com`).
- Trình duyệt nắm rõ **Origin đích (Target Origin):** Địa chỉ URL mà request đang hướng tới (ví dụ: `http://www.bank.com/transfer`).
- Trình duyệt so sánh cặp Origin này:
  - Nếu cùng Scheme (giao thức), Host (tên miền), và Port (cổng) $\rightarrow$ **Same-Origin**.
  - Nếu khác Site (eTLD+1) $\rightarrow$ **Cross-Site**.
- Dựa trên hiểu biết này, các trình duyệt hiện đại tự động gửi kèm các Header bảo vệ như `Sec-Fetch-Site: cross-site` (Metadata Request Headers) và `Origin: http://www.attacker.com` để thông báo cho máy chủ đích.

---

## ❓ Câu 11
**Đề bài:** *Do servers know whether an HTTP request is cross-site or not?*  
*(Máy chủ có biết một HTTP request có phải là cross-site hay không?)*

### 💡 Lời giải:
**VỀ BẢN CHẤT GIAO THỨC HTTP THUẦN TÚY: MÁY CHỦ MẶC ĐỊNH KHÔNG BIẾT.**  
*(Tuy nhiên, máy chủ có thể biết NẾU dựa vào các Header hỗ trợ từ trình duyệt hoặc triển khai cơ chế kiểm tra chủ động).*

### Phân tích:
1. **Tại sao mặc định máy chủ không biết?**
   - Giao thức HTTP là giao thức phi trạng thái (stateless). Khi máy chủ nhận một gói tin TCP/HTTP chứa cookie hợp lệ, nội dung các byte gửi tới trông giống hệt nhau, dù nó xuất phát từ người dùng nhấp nút trên trang chủ hay do mã script độc hại từ trang web khác kích hoạt.
2. **Làm thế nào để máy chủ nhận biết?**
   - **Kiểm tra Header `Origin`:** Thường xuất hiện trong các POST/CORS request, cho biết nguồn gốc khởi tạo request.
   - **Kiểm tra Header `Referer`:** Chỉ ra trang web trước đó chứa liên kết dẫn đến request.
   - **Kiểm tra Header `Sec-Fetch-Site`:** Trình duyệt hiện đại gửi cờ `cross-site`, `same-site`, hoặc `same-origin`.
   - **Kiểm tra CSRF Token:** Nếu request không có secret token hợp lệ, máy chủ suy luận ra đó là cross-site request.

---

## ❓ Câu 12
**Đề bài:** *Why cannot a web server use the referer header to tell whether a request is cross-site or not?*  
*(Tại sao máy chủ web không thể dựa hoàn toàn vào Referer header để phân biệt request có phải cross-site hay không?)*

### 💡 Lời giải:
Máy chủ không thể dựa tin cậy 100% vào `Referer` header vì các nguyên nhân sau:

1. **Header `Referer` có thể bị khuyết thiếu (Missing/Omitted) một cách hợp lệ:**
   - **Chính sách Referrer-Policy:** Trang web độc hại có thể cố tình đặt thẻ `<meta name="referrer" content="no-referrer">` hoặc header `Referrer-Policy: no-referrer`. Lúc này trình duyệt tuân thủ chính sách và bóc bỏ hoàn toàn header `Referer` khỏi request.
   - **Chuyển giao thức an toàn sang kém an toàn:** Khi chuyển hướng từ HTTPS sang HTTP, trình duyệt mặc định không gửi `Referer` để bảo vệ quyền riêng tư người dùng.
   - **Phần mềm bảo vệ / Proxy / Tường lửa:** Nhiều phần mềm diệt virus hoặc proxy doanh nghiệp tự động xóa bỏ header `Referer` để tránh rò rỉ dữ liệu nhạy cảm.
2. **Khó xử lý trường hợp thiếu Referer:**  
   Nếu máy chủ chặn mọi request thiếu `Referer`, nó sẽ từ chối nhầm rất nhiều người dùng hợp lệ. Nếu máy chủ cho phép bỏ qua khi thiếu `Referer`, kẻ tấn công chỉ cần dùng `no-referrer` là vượt qua được cơ chế kiểm tra.
3. **Lỗ hổng cấu hình Regex:**  
   Nhiều máy chủ kiểm tra `Referer` bằng biểu thức chính quy lỏng lẻo, ví dụ kiểm tra chuỗi có chứa `bank.com` hay không. Kẻ tấn công có thể đăng ký tên miền `bank.com.attacker.com` hoặc `attacker.com/bank.com` để đánh lừa bộ lọc.

---

## ❓ Câu 13
**Đề bài:** *Why is it important for a server to know whether a request is cross-site or not?*  
*(Tại sao việc máy chủ biết được một request là cross-site hay không lại tối quan trọng?)*

### 💡 Lời giải:
1. **Bảo vệ tính toàn vẹn của dữ liệu và quyền hạn người dùng:**  
   Các hành động nhạy cảm (như đổi mật khẩu, chuyển khoản, thay đổi email, xóa tài liệu, cập nhật hồ sơ) chỉ nên được thực hiện khi người dùng **thực sự có chủ ý (Intended action)** tương tác trực tiếp trên giao diện của dịch vụ.
2. **Ngăn chặn việc bị biến thành công cụ vô thức:**  
   Nếu không phân biệt được cross-site, máy chủ sẽ bị kẻ tấn công mượn quyền của người dùng để thực hiện các hành động phá hoại mà người dùng không hề hay biết.
3. **Phân quyền và áp dụng chính sách bảo mật phù hợp:**  
   - Cho phép các tài nguyên công khai (ảnh, font chữ, bài viết công khai) được truy cập từ cross-site.
   - Nhưng **nghiêm cấm tuyệt đối** các hành vi sửa đổi dữ liệu có đặc quyền (State-changing actions) đến từ các nguồn cross-site không được cấp phép.

---

## ❓ Câu 14
**Đề bài:** *Can we simply ask browsers not to attach any cookie for cross-site requests?*  
*(Chúng ta có thể đơn giản yêu cầu trình duyệt không bao giờ đính kèm bất kỳ cookie nào cho các request cross-site hay không?)*

### 💡 Lời giải:
**VỀ MẶT KỸ THUẬT: CÓ THỂ LÀM ĐƯỢC, NHƯNG VỀ MẶT THỰC TIỄN WEB: SẼ PHÁ VỠ HOẠT ĐỘNG BÌNH THƯỜNG CỦA INTERNET.**

### Hậu quả nếu cấm tuyệt đối 100% cookie trên cross-site:
1. **Phá vỡ trải nghiệm điều hướng cơ bản:**  
   Giả sử bạn đang tìm kiếm trên Google hoặc xem bài đăng trên Facebook. Bạn nhấp vào một đường link dẫn tới `newspaper.com`. Đây là một cross-site request (từ `google.com` sang `newspaper.com`). Nếu trình duyệt không gửi cookie, bạn sẽ bị coi là chưa đăng nhập vào `newspaper.com` mặc dù bạn đã đăng nhập tài khoản trước đó.
2. **Phá hủy hệ thống Đăng nhập một lần (Single Sign-On - SSO / OAuth):**  
   Các hệ thống như "Đăng nhập bằng Google", "Đăng nhập bằng Facebook" trên các trang web bên thứ ba dựa vào việc trao đổi và nhận diện cookie cross-site trong quá trình chuyển hướng xác thực.
3. **Các dịch vụ nhúng (Embedded Services):**  
   Widget bình luận, giỏ hàng thương mại điện tử tích hợp, bản đồ nhúng hoặc trình phát video đa nền tảng sẽ mất trạng thái cá nhân hóa của người dùng.
4. **Giải pháp thực tế hiện nay:**  
   Thay vì cấm mù quáng toàn bộ, các nhà sản xuất trình duyệt và IETF đã đưa ra giải pháp chuẩn hóa thông minh: **SameSite Cookie (mặc định `Lax`)** kết hợp chính sách loại bỏ Cookie của bên thứ ba (Third-party cookie deprecation) cho mục đích theo dõi quảng cáo, trong khi vẫn cho phép duy trì phiên hợp lệ ở Top-level navigation an toàn.

---

## ❓ Câu 15 (***)
**Đề bài:** *(***) If a page from www.example.com contains an iframe, inside which a facebook page is displayed. If a request is sent from inside the iframe, is it considered as a cross-site request or not? If not, how can be this secured?*  
*(Nếu một trang từ www.example.com chứa một thẻ iframe, bên trong iframe hiển thị một trang facebook. Nếu một request được gửi từ bên trong iframe, request đó có bị coi là cross-site request không? Nếu không, làm thế nào để bảo mật trường hợp này?)*

### 💡 Lời giải:

#### 1. Request từ bên trong iframe có phải là cross-site không?
- **Trả lời: KHÔNG, đối với đích đến là Facebook.**
- **Giải thích:**  
  Một request sinh ra từ bên trong iframe chứa nội dung của `facebook.com` hướng tới máy chủ của `facebook.com` được coi là **Same-Origin / Same-Site request** đối với Facebook. Ngữ cảnh tài liệu (Document context) trực tiếp khởi tạo request chính là tài liệu của Facebook nằm trong frame đó. Do đó, Cookie của Facebook vẫn được đính kèm đầy đủ.

#### 2. Nguy cơ bảo mật tiềm ẩn:
Trường hợp này mở ra nguy cơ tấn công **Clickjacking (UI Redressing)**:
- Trang web độc hại `example.com` có thể nhúng trang Facebook của nạn nhân vào trong một iframe trong suốt (opacity = 0), sau đó đặt đè lên một nút bấm hấp dẫn (ví dụ: "Nhận thưởng iPhone").
- Khi nạn nhân nhấp chuột vào nút trúng thưởng, thực chất họ đang bấm vào nút "Like", "Xóa tài khoản", hoặc "Chuyển tiền" bên trong iframe của Facebook!

#### 3. Cách bảo mật và phòng chống:
Trang web mục tiêu (Facebook) cần ngăn chặn các trang web lạ nhúng mình vào iframe bằng các cơ chế sau:

1. **Sử dụng HTTP Header `X-Frame-Options`:**
   - `X-Frame-Options: DENY`: Cấm tuyệt đối không cho bất kỳ trang web nào nhúng trang này vào iframe.
   - `X-Frame-Options: SAMEORIGIN`: Chỉ cho phép các trang có cùng nguồn gốc (chính Facebook) được nhúng vào iframe.
   - `X-Frame-Options: ALLOW-FROM https://trusted-partner.com`: Chỉ cho phép một số trang tin cậy (đã lỗi thời trong các trình duyệt mới).

2. **Sử dụng Content Security Policy (CSP) với chỉ thị `frame-ancestors` (Khuyến nghị chuẩn hiện đại):**
   - Header: `Content-Security-Policy: frame-ancestors 'none';` (Tương đương DENY).
   - Header: `Content-Security-Policy: frame-ancestors 'self';` (Tương đương SAMEORIGIN).
   - Header: `Content-Security-Policy: frame-ancestors 'self' https://trusted.com;` (Cho phép nhiều domain chỉ định).

3. **Kỹ thuật Framebusting (Phía JavaScript Client - giải pháp phụ trợ):**
   ```javascript
   if (top !== self) {
       top.location = self.location; // Thoát khỏi iframe
   }
   ```
