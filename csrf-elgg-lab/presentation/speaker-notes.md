# Lời thuyết trình — 600 giây

## Slide 1 — 30 giây

Nhóm 6 giới thiệu đề tài Cross-Site Request Forgery Attack on Elgg. Mục tiêu là giải thích và kiểm chứng một yêu cầu thay đổi About me được phát sinh từ trang khác origin trong trình duyệt đang đăng nhập Alice. Mã gửi yêu cầu phải dùng Fetch API và URLSearchParams. Thí nghiệm chỉ áp dụng tài khoản giả lập trong môi trường cục bộ. Trong bản trình bày này, phần echo đã chạy thật, còn thực nghiệm Elgg chưa chạy được vì lỗi lưu trữ Docker; nhóm sẽ phân biệt rõ hai mức bằng chứng.

## Slide 2 — 40 giây

Đề bài yêu cầu thay đổi trường About me, không phải chỉ gửi được HTTP request. Chuỗi cuối cùng là CSRF attack by 23001939, lấy mã sinh viên của Nguyễn Công Trí; có thể đổi qua giao diện hoặc môi trường. Trang attacker không dùng XHR hay submit form truyền thống. Python có vai trò launcher phục vụ trang, còn payload thực thi trong trình duyệt. Cách diễn giải exploit.py này cần giảng viên xác nhận. Tiêu chuẩn đánh giá là dữ liệu Elgg sau khi tải lại, kèm profile ban đầu và request đã quan sát; một thông báo trên attacker chưa chứng minh được điều đó.

## Slide 3 — 50 giây

Ba điều kiện cần được kiểm chứng riêng. Thứ nhất Alice có phiên hợp lệ và chính sách cookie cho phép gửi. Thứ hai payload đúng endpoint và tên trường của phiên bản đang chạy. Thứ ba server chấp nhận quyền sửa và chưa kiểm tra đủ ý định người dùng. Cookie HttpOnly ngăn script đọc giá trị nhưng không ngăn browser gửi cookie đến đúng host. Vì vậy attacker không cần đánh cắp cookie để CSRF có thể xảy ra. Tuy nhiên chỉ có cookie cũng chưa đủ: token hoặc kiểm tra nguồn có thể từ chối yêu cầu. Đây là lý do phải dùng đối chứng thay vì suy ra thành công từ việc gọi fetch.

## Slide 4 — 55 giây

Đọc sơ đồ theo thứ tự thời gian từ trên xuống. Alice đăng nhập Elgg trước và browser nhận cookie. Khi mở attacker, browser nhận JavaScript thuộc origin attacker. Fetch tạo POST trực tiếp đến Elgg; server attacker không chuyển tiếp request và không cấp cookie Alice. Browser tự đánh giá cookie theo host, site và thuộc tính. Elgg tiếp tục kiểm tra session, quyền và token. Sau đó người thực nghiệm điều hướng riêng về profile để xem dữ liệu. CORS có thể khiến JavaScript attacker không đọc được response sau khi simple POST đã được xử lý. Mũi tên cuối, tải lại profile, là bước quyết định kết luận của bài.

## Slide 5 — 55 giây

Compose gồm Elgg, MySQL và Python attacker trong network nội bộ. Chỉ Elgg 8080 và attacker 8000 bind loopback; MySQL không có cổng host. Hai hostname giữ cookie host-only của Elgg không đi tới attacker. Hai origin vẫn cùng site csrf.localhost nên thí nghiệm này mô phỏng khả năng kiểm soát một subdomain cùng site; phải công bố giới hạn đó. Truy cập attacker qua 127.0.0.1 tạo đối chứng khác site để quan sát SameSite. Image chọn từ SEED vì bộ dữ liệu phục vụ môn học, không đại diện Elgg hiện hành. Phiên bản chính xác và digest chưa xác minh vì Docker pull lỗi; cần bổ sung trước khi báo cáo kết quả Elgg.

## Slide 6 — 55 giây

Thực hiện Save hợp lệ trong Elgg khi DevTools Network đang mở, bật Preserve log để thấy cả chuỗi redirect. Ghi URL và method thực tế, Content-Type, tên các trường trong body, cookie có được gửi không và những thuộc tính liên quan. Chỉ lưu tên token, không lưu giá trị. Thông tin profile/edit và description trong tài liệu SEED là tham khảo, chưa phải capture của nhóm. Bản hiện tại để NOT RUN vì Elgg chưa khởi động. Khi có môi trường khỏe, thay vùng bằng chứng bằng ảnh đã khử bí mật, điền bảng ghi nhận và kiểm tra lại dữ liệu profile. Không kết luận chỉ từ HTTP 200 vì đó có thể là trang login sau redirect.

## Slide 7 — 55 giây

Đoạn mã có bốn điểm cần giải thích. Fields lấy từ request hợp lệ đã quan sát, giữ các trường công khai cần thiết và thay description bằng chuỗi theo MSV. URLSearchParams thực hiện percent encoding và tạo Content-Type urlencoded; không cần thêm header tùy tiện. credentials include không vượt qua SameSite hay chính sách cookie. mode cors yêu cầu tuân theo quyền đọc response của server; nếu đổi no-cors thì response opaque, không phải thành công. Implementation từ chối token, cookie và mật khẩu trong field, giới hạn target về lab cục bộ, không tự gửi lúc tải trang. exploit.py chỉ là web server. TC-02 đã chạy Fetch trong Chrome, còn áp dụng trên Elgg cần request capture và lab khỏe.

## Slide 8 — 50 giây

Trình tự gồm chuẩn bị, đối chứng và xác minh. Save hợp lệ cho baseline và capture field; echo xác nhận encoder. Sau đó dùng đúng payload để so khác origin cùng site và khác site, đồng thời ghi việc cookie được gửi hay bị loại. Với token bật, profile phải không đổi và cần có thông báo từ chối tương ứng. Chỉ trong lab chuyển vulnerable, giữ các điều kiện khác và gửi lại. Cuối cùng tải mới profile, kiểm tra chuỗi chính xác và các trường khác, chụp bằng chứng, rồi bật lại protected và reset. Nếu một bước không chạy hoặc không quan sát được, ghi NOT RUN hoặc FAIL thay vì suy diễn.

## Slide 9 — 60 giây

Bằng chứng bên phải là ảnh chụp từ Chrome của chính endpoint thử nghiệm trong dự án. Browser đã thực thi Fetch, Python nhận body urlencoded và decode ra đúng description. Unit tests cũng kiểm tra Unicode, ký tự đặc biệt, field lặp, chống nhập secret và giới hạn URL; HTTP tests kiểm tra server và việc không phục vụ file ngoài allowlist. Kết quả này không khẳng định Elgg đã đổi profile. Docker pull Elgg và MySQL gặp input/output khi ổ đĩa gần đầy, nên chưa chạy các TC trên Elgg, chưa có capture Save, version ứng dụng hoặc ảnh trước sau. Slide cố tình ghi NOT RUN để người nghe đánh giá đúng mức bằng chứng. Sau khi môi trường được sửa, nhóm bổ sung kết quả thật.

## Slide 10 — 55 giây

Đối chứng token cần giữ các điều kiện khác cố định. Nếu protected và vulnerable đều thất bại, chưa thể quy nguyên nhân cho token; có thể request thiếu session hoặc sai field. Nếu cả hai thành công, phải kiểm tra mode thực tế hoặc xem token đã bị đưa nhầm vào payload chưa. SameSite là lớp browser bổ sung, có khác biệt giữa cùng site và khác site. CORS không phải cơ chế đủ để chống mọi CSRF vì simple POST có thể đi trước khi response bị chặn đọc. Với hệ thống thật, dùng middleware của framework, kiểm quyền đối tượng, cookie phù hợp, HTTPS và kiểm nguồn khi phù hợp. Các lớp bổ sung này là phân tích khuyến nghị; chưa được triển khai hay kiểm thử trên Elgg trong bản này.

## Slide 11 — 55 giây

Bảng phân công là đề xuất dựa trên thông tin nhóm cung cấp, cần nhóm xác nhận theo việc thực tế. Thành nghiên cứu và tổng hợp HTTP/phòng chống; Trí triển khai môi trường và Fetch; Thao phụ trách bằng chứng, PowerPoint và video. Về AI, sản phẩm hiện tại được tạo thiết kế và triển khai theo prompt nên phù hợp mức 3 của giảng viên, không khai thành chỉ góp ý. Sinh viên cung cấp mục tiêu, thành viên và yêu cầu công nghệ; AI tạo mã và tài liệu, chạy các kiểm tra cục bộ có thể thực hiện. Phần Elgg, video và việc chỉnh sửa của sinh viên chưa được xác nhận. Khi làm tiếp, nhóm ghi người sửa, file, lý do và cách kiểm chứng trong AI Usage Log.

## Slide 12 — 40 giây

Kết luận của bản này có giới hạn rõ: đã kiểm chứng Fetch và URLSearchParams trên echo bằng Chrome, chưa chứng minh CSRF trên Elgg. Fetch tuân thủ cookie, SameSite, SOP/CORS và bảo vệ phía server. Nhóm cần xử lý Docker, ghi phiên bản, bắt request thật, chạy token mode đối chứng và tải mới profile để hoàn tất bài. Sau đó mới quay video đầy đủ và nộp link unlisted. Câu hỏi thảo luận là tại sao lỗi CORS không đủ để kết luận server chưa thay đổi dữ liệu: với simple request, quyền gửi và quyền đọc response là hai vấn đề khác nhau.