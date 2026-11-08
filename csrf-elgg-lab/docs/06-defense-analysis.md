# Cơ chế bảo vệ và cách tạo đối chứng

Trong SEED, kiểm tra token có thể bị tắt phục vụ bài tập. Dự án dùng image original và patch có điều kiện: mặc định thực thi kiểm tra nguyên bản; vulnerable chỉ bỏ qua validate với action sửa profile. Build dừng nếu không tìm đúng signature hoặc source đã có dấu hiệu tắt kiểm tra. Đây là mô hình giáo dục, chưa chứng minh tương thích runtime của image trong phiên này. [SEED](https://seedsecuritylabs.org/Labs_20.04/Web/Web_CSRF_Elgg/)

| Lớp | Vai trò | Đối chứng / giới hạn |
|---|---|---|
| Session + quyền đối tượng | Xác thực Alice và quyền sửa đúng profile | Thiếu phiên/GUID sai không chứng minh token đã chặn |
| CSRF token | Kiểm tra nguồn hành động gắn với phiên | Giữ phiên và payload, chỉ đổi token mode |
| SameSite | Giới hạn cookie trong cross-site context | So cùng site với khác site; ghi exclusion reason |
| SOP/CORS | Giới hạn đọc response; preflight với request tương ứng | Simple POST có thể đã xử lý dù JS không đọc được |
| Origin/Referer | Server kiểm tra origin được cho phép | Phân tích đề xuất, chưa triển khai/test ở bản này |
| Fetch Metadata | Server từ chối ngữ cảnh không hợp lệ | same-site subdomain vẫn cần token; chưa triển khai ở đây |
| Secure + HttpOnly | Bảo vệ truyền tải/khả năng đọc cookie | Không thay thế token; HTTP loopback không mô phỏng HTTPS production |

Thử nghiệm token: đăng nhập Alice, mode protected, Save baseline hợp lệ; gửi attacker thiếu token và ghi profile không đổi/thông báo từ chối. Đổi riêng mode sang vulnerable, cùng origin attacker, cùng body/cookie context; gửi lại rồi kiểm tra About me. Nếu protected và vulnerable đều thất bại, chưa thể kết luận token là nguyên nhân vì có thể thiếu session hoặc sai field. Nếu cả hai thành công, cần xem patch có được nạp đúng hay token thật bị vô tình đưa vào request không.

Thử SameSite: giữ vulnerable, reset baseline; chạy attacker khác hostname nhưng cùng site rồi qua `127.0.0.1` khác site. Nếu cookie Lax không đi ở lần sau, ghi lý do do browser cung cấp. Không suy đoán từ opaque response; không tắt security flag. Không đặt SameSite=None trên HTTP và tuyên bố đó là mô phỏng production hợp lệ.

Cấu hình sản phẩm thật nên dùng middleware token mặc định, kiểm quyền cho đối tượng, cookie phù hợp, HTTPS, kiểm Origin/Fetch Metadata khi thiết kế cho phép và xác thực lại với thao tác nhạy cảm. Không tắt bảo vệ trên hệ thống thật. [Elgg Actions](https://learn.elgg.org/en/stable/guides/actions.html), [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
