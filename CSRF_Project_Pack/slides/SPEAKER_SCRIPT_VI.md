# Kịch bản thuyết trình (Speaker Script) — CSRF trên Elgg bằng Fetch API

> **Nhóm 6** · Học phần An toàn máy tính · Thời lượng mục tiêu **~10 phút**
> Khớp với bộ slide `latex/slides_vi.pdf` (13 slide). Mỗi mục ghi: **người nói · thời gian · lời thoại gợi ý · chuyển cảnh**.
>
> **Phân vai:** **Thành** (23001935 — lý thuyết/HTTP/phòng chống) · **Trí** (23001939 — Elgg/Docker/Fetch/kiểm thử) · **Thao** (23001936 — bằng chứng/slide/video).
> Lời thoại là gợi ý tự nhiên — hãy nói bằng giọng của mình, không đọc nguyên văn.

---

## Slide 1 — Trang bìa · **Thao** · 0:00–0:40 (40s)
"Em chào thầy và các bạn. Nhóm 6 chúng em xin trình bày đề tài *Tấn công Cross-Site Request Forgery — CSRF — trên mạng xã hội Elgg bằng Fetch API*. Nhóm gồm ba thành viên: Thành, Trí và Thao. Mục tiêu của bài là vừa *thực hiện* được một cuộc tấn công CSRF, vừa *chứng minh* được cách phòng chống nó."

→ *Chuyển:* "Trước hết, về phân công và nội dung trình bày."

## Slide 2 — Nội dung & phân công · **Thao** · 0:40–1:20 (40s)
"Bài trình bày gồm ba phần: tổng quan và lý thuyết, kỹ thuật tấn công bằng Fetch API, rồi kết quả và phòng thủ. Về phân công: bạn Thành phụ trách lý thuyết, phân tích HTTP và phòng chống; bạn Trí phụ trách dựng Elgg trên Docker, viết mã Fetch và kiểm thử; em — Thao — phụ trách bằng chứng, slide và video. Điểm quan trọng: *cả ba* chúng em đều tự chạy Docker, tự bắt gói tin và tự đổi About me theo mã sinh viên của mình."

→ *Chuyển:* "Mời bạn Thành vào phần lý thuyết."

## Slide 3 — CSRF là gì? · **Thành** · 1:20–2:25 (65s)
"CSRF là kiểu tấn công lừa *trình duyệt của nạn nhân đang đăng nhập* gửi đi một yêu cầu mạo danh. Điểm cốt lõi — và cũng là điều khiến nó nguy hiểm — là kẻ tấn công *không cần* mật khẩu, *không cần* trộm cookie; nó chỉ *mượn* phiên đăng nhập có sẵn. Để tấn công thành công cần ba điều kiện: một, nạn nhân còn phiên đăng nhập; hai, hành động đổi trạng thái với tham số đoán được; ba, ứng dụng thiếu phòng vệ. Trong bài này, mục tiêu cụ thể là đổi trường *About me* của Alice thành chuỗi `CSRF attack by 23001939`."

→ *Chuyển:* "Vì sao trình duyệt lại 'ngoan ngoãn' gửi cookie như vậy?"

## Slide 4 — Same-site vs cross-site & khe hở cốt lõi · **Thành** · 2:25–3:30 (65s)
"Cần phân biệt ba mức: same-origin là trùng cả giao thức, host và cổng; same-site là cùng *site*, tức cùng eTLD+1 dù khác subdomain; còn cross-site là khác site hẳn. Phân biệt này rất quan trọng cho cookie SameSite ở phần sau. Và đây là khe hở nền tảng của CSRF: chính sách Same-Origin *cấm* JavaScript **đọc** phản hồi từ trang khác origin, nhưng **không cấm gửi** yêu cầu. Kẻ tấn công không cần đọc kết quả — nó chỉ cần hành động được thực thi. Đó là lý do chế độ `no-cors`, dù phản hồi bị che mờ, vẫn đủ để tấn công."

→ *Chuyển:* "Chúng em đã dựng môi trường thế nào để kiểm chứng điều đó?"

## Slide 5 — Hai mô hình môi trường · **Thành** · 3:30–4:20 (50s)
"Chúng em dùng hai mô hình bổ trợ. Một là mô hình SEED chuẩn — dùng làm khung khái niệm. Hai, quan trọng hơn, là *lab Docker thật* do nhóm tự dựng và đã chạy: Elgg phiên bản 3.3.3, một trang attacker *cùng-site* và một trang *khác-site*, cùng hai chế độ `protected` và `vulnerable`. Lý do có hai host attacker: để chúng em chỉ thay *đúng một biến* — cùng-site hay khác-site — nhờ đó tách bạch được vai trò của cookie SameSite với anti-CSRF token."

→ *Chuyển:* "Mời Trí trình bày kỹ thuật tấn công."

## Slide 6 — Yêu cầu Fetch API & hai cờ then chốt · **Trí** · 4:20–5:20 (60s)
"Đề bài yêu cầu *không* dùng XMLHttpRequest hay form submit, mà bắt buộc dùng Fetch API. Fetch vừa tàng hình — không chuyển trang — vừa có cú pháp hiện đại và kiểm soát rõ ràng. Hai cờ quyết định thành bại: thứ nhất, `credentials: 'include'` để ép trình duyệt đính kèm cookie phiên qua cross-origin — thiếu nó, server coi mình là khách lạ. Thứ hai, `mode: 'no-cors'` kết hợp dữ liệu urlencoded hoặc FormData để request thuộc nhóm *Simple Request*, không phát sinh Preflight OPTIONS."

→ *Chuyển:* "Cụ thể gói tin và đoạn mã trông thế nào?"

## Slide 7 — Phân tích gói tin & mã khai thác · **Trí** · 5:20–6:25 (65s)
"Trước tiên em đăng nhập Alice, mở tab Network và bắt một request *hợp lệ* khi lưu hồ sơ. Từ đó em lấy endpoint `/action/profile/edit` và các trường *công khai*: `guid` bằng 56, `name`, `description`, và `accesslevel`. Một nguyên tắc đạo đức quan trọng: em **tuyệt đối không** sao chép token hay cookie sang trang attacker — công cụ của nhóm thậm chí tự động từ chối các trường đó. Đoạn mã trên slide chính là lõi tấn công: gói dữ liệu bằng `URLSearchParams`, rồi `fetch` với `no-cors` và `credentials: include`. Nhóm có thêm biến thể `FormData` tương đương."

→ *Chuyển:* "Toàn bộ luồng diễn ra tuần tự như sơ đồ này."

## Slide 8 — Sơ đồ luồng tấn công · **Trí** · 6:25–7:05 (40s)
"Đọc từ trên xuống: Alice đăng nhập và nhận cookie. Sau đó cô vô tình mở trang attacker; script Fetch tự chạy ngay. Nó gửi POST kèm cookie của Alice. Nếu server thiếu phòng vệ, Elgg cập nhật About me. Phản hồi bị che mờ, nhưng khi Alice tải lại hồ sơ thì trường About me đã bị đổi — tấn công hoàn tất mà không hề có cảnh báo hay chuyển hướng."

→ *Chuyển:* "Và đây là kết quả thật chúng em chạy được."

## Slide 9 — Minh chứng thực nghiệm · **Thao** · 7:05–8:05 (60s)
"Ba ảnh này là ảnh chụp *thật* từ Chrome trên Elgg 3.3.3. Bên trái: About me ban đầu của Alice. Ở giữa: khi bật phòng vệ `protected`, Elgg từ chối thẳng với thông báo đỏ *'Form is missing __token or __ts fields'* — About me không đổi. Bên phải: khi tắt phòng vệ và tấn công từ trang cùng-site, About me đã đổi thành `CSRF attack by 23001939`. Bảng dưới tóm tắt: chỉ đúng *một* tổ hợp cho kết quả thành công; hai tổ hợp còn lại đều bị chặn."

→ *Chuyển:* "Vì sao lại như vậy? Đó là nhờ hai lớp phòng thủ."

## Slide 10 — Hai lớp phòng thủ & phát hiện kỹ thuật · **Thao → Thành** · 8:05–8:50 (45s)
*(Thao)* "Hai lớp này hoạt động độc lập. Anti-CSRF token: do server kiểm, attacker không đọc được token nên request giả bị từ chối. Cookie SameSite: do trình duyệt kiểm, request khác-site không được đính cookie nên mất phiên. Mỗi lớp, một mình nó, đã đủ chặn."
*(Thành)* "Nhóm còn phát hiện một chi tiết: Elgg lưu About me ở *annotation* `profile:description`, không phải metadata — khiến công cụ khôi phục ban đầu reset nhầm bảng. Bài học: chỉ tin bằng chứng đối chiếu trực tiếp, không tin tín hiệu gián tiếp."

→ *Chuyển:* "Từ đó suy ra cách phòng thủ căn cơ."

## Slide 11 — Phòng thủ nhiều lớp · **Thành** · 8:50–9:25 (35s)
"Phòng thủ nên theo nhiều lớp: cookie đặt `SameSite=Lax` hoặc `Strict`; ứng dụng dùng anti-CSRF token và có thể thêm Double Submit Cookie; tầng header kiểm tra `Origin` hoặc `Sec-Fetch-Site`; và dùng `X-Frame-Options` chống clickjacking. Khuyến nghị thực tế là kết hợp SameSite với token và kiểm tra Origin cho endpoint nhạy cảm — và tuyệt đối không dùng GET cho hành động đổi trạng thái."

→ *Chuyển:* "Cuối cùng, phần minh bạch AI và kết luận."

## Slide 12 — Minh bạch AI & Kết luận · **Thao** · 9:25–9:50 (25s)
"Về sử dụng AI: nhóm dùng AI ở mức phản biện cơ chế, đồng sáng tạo định dạng, và hỗ trợ dựng khung công cụ kiểm thử — còn việc cấu hình, chạy thật và chịu trách nhiệm kết quả là của nhóm. Thông điệp cốt lõi: CSRF *không* bị HTTPS ngăn chặn; giải pháp căn cơ là SameSite cookie cộng anti-CSRF token cộng kiểm tra nguồn gốc. Chúng em học tấn công để biết cách phòng thủ."

→ *Chuyển:* "Nhóm em xin kết thúc phần trình bày."

## Slide 13 — Cảm ơn & Q&A · **Cả nhóm** · 9:50–10:00 (10s)
"Cảm ơn thầy và các bạn đã lắng nghe. Nhóm 6 sẵn sàng nhận câu hỏi ạ."

---

## Mẹo trình bày
- **Tổng thời gian** cộng dồn ~10:00. Nếu quá giờ, rút gọn Slide 8 (sơ đồ) và Slide 11 (phòng thủ) xuống còn ý chính.
- **Chuyển người nói** rõ ràng ("mời bạn … tiếp tục") để mạch trôi chảy.
- **Slide 9 là cao trào** — nói chậm, chỉ tay vào ảnh "protected bị chặn" và "thành công" để tạo tương phản.
- Chuẩn bị sẵn cho Q&A 15 câu (xem Phụ lục A của báo cáo): mỗi thành viên nắm chắc nhóm câu được phân công.
- Nếu demo trực tiếp: chạy sẵn `labctl up`, đăng nhập Alice từ trước, mở sẵn tab Network để tiết kiệm thời gian.
