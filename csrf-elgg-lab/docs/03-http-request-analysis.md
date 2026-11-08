# Bắt và phân tích HTTP Edit Profile

**Trạng thái: NOT RUN trên Elgg.** Bảng dưới là mẫu ghi nhận, không phải kết quả quan sát. Endpoint/field có trong tài liệu SEED không thay thế bằng chứng của môi trường nhóm.

1. Khởi động lab; xác nhận các service healthy và ghi version/digest.
2. Mở đúng hostname Elgg; đăng nhập Alice giả lập, mở profile và chụp About me ban đầu.
3. Mở DevTools (F12 hoặc Cmd+Option+I), tab Network; bật Preserve log, xóa request cũ.
4. Mở Edit Profile; ghi tên hiển thị và các giá trị ban đầu để tránh tác dụng phụ.
5. Đổi About me bằng nội dung baseline dễ nhận biết, nhấn Save hợp lệ trong giao diện Elgg.
6. Lọc POST hoặc tên profile, chọn request lưu. Nếu có redirect, xem cả request POST đầu và chuỗi redirect.
7. Headers: ghi URL đầy đủ, method, Origin/Referer, Content-Type; Request Cookies: ghi **tên và có gửi hay bị loại**, không ghi giá trị.
8. Payload: ghi tên tham số, trường nào tương ứng About me, GUID, tên, quyền truy cập. Giữ các trường khác khi tạo payload thử để tránh đổi nhầm.
9. Application/Storage > Cookies: ghi host/domain/path, SameSite, Secure, HttpOnly, hạn dùng. Không chụp giá trị cookie.
10. Response: ghi status, Location nếu có (khử token nếu xuất hiện), thông báo thành công/thất bại. Tải mới profile để xác nhận dữ liệu.

| Thuộc tính | Giá trị quan sát |
|---|---|
| Phiên bản Elgg / digest | NOT RUN |
| Browser / thời gian / origin | NOT RUN |
| Request URL / method / Content-Type | NOT RUN |
| Trường About me / danh sách trường công khai | NOT RUN |
| Tên các trường token/timestamp | NOT RUN |
| Tên cookie, thuộc tính, có gửi không | NOT RUN |
| Response status / redirect / thông báo | NOT RUN |
| Dữ liệu About me trước / sau | NOT RUN |

Sao chép `lab/config/observed-request.example.json` thành evidence/logs/observed-request.json khi có capture thật. Không copy request as cURL hoặc HAR thô vào Git, vì thường chứa cookie/token. Nếu cần file thô để phân tích, để `evidence/private/` đã gitignore; trước khi nộp chỉ dùng bản được khử bí mật. Ảnh chụp nên crop sẵn vùng không chứa bí mật, không chỉ đặt hình che có thể gỡ trong slide.

Tài liệu upstream gợi ý action profile/edit và tên description, guid, name, accesslevel[description], __elgg_token, __elgg_ts. Đây là **giả thuyết từ tài liệu cần kiểm tra**, không dùng để điền giá trị giả vào bảng runtime. Với field khác giữa các phiên bản, dừng và sửa mã theo capture thay vì ép payload cũ. Attacker bắt buộc người dùng xác nhận đã quan sát Network trước khi gửi Elgg.

Đặc biệt: status 200 có thể là trang login hoặc profile sau redirect, không phải action thành công. Status 302 có thể đi kèm lỗi session/token. JavaScript báo Failed to fetch không xác định riêng CORS/cookie/token; cần Network + thông báo Elgg + đối chiếu dữ liệu. [Elgg Actions](https://learn.elgg.org/en/stable/guides/actions.html), [Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
