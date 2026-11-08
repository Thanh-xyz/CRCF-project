# PowerPoint Nhóm 6

`Nhom6_CSRF_Elgg.pptx`: 12 slide tiếng Việt; speaker notes tổng 600 giây, nguồn nằm trong [Sources] mỗi slide. `speaker-notes.md` là bản lời dẫn dễ đọc. Ảnh TC-02 lấy từ Chrome thật, các phần chưa có bằng chứng Elgg ghi NOT RUN. Slide 6 dành vị trí cho Network sau khi capture.

`build.mjs`: source JavaScript ES module dùng `@oai/artifact-tool`. Chạy từ thư mục gốc lab với dependency được cài trong `.build/presentation/node_modules` hoặc đặt `ARTIFACT_TOOL_MODULE` là đường dẫn entry module. Trong môi trường Codex, đã khởi tạo workspace theo skill Presentations. Trên máy khác, cài thư viện theo quyền truy cập của môi trường đó rồi:

```sh
node presentation/build.mjs
```

Build đọc ảnh thật `evidence/screenshots/TC-02-decoded-body.png`, xuất PPTX/notes và render 12 PNG vào `.build/presentation`. Nếu chưa có ảnh, chạy TC-02 trước; không thay ảnh bằng hình tạo sinh giả screenshot. Không cần LibreOffice để render với artifact-tool.

QA thực tế: đã render và xem từng slide 1–12; kiểm tra canvas không có phần tử vượt biên; deck có 12 notes và nguồn; không có tiêu đề bị wrap ngoài dự kiến, clipping hoặc chồng chữ. Hai sơ đồ native có connector dưới node theo thiết kế. Hình echo giữ tỉ lệ. Cần sinh viên bổ sung ảnh Elgg sau khi lab chạy rồi render/kiểm tra lại các slide đã sửa.

Nguồn nội dung: SEED Labs, MDN Fetch/Set-Cookie, Elgg Actions, OWASP CSRF Prevention và evidence cục bộ; xem notes để truy xuất từng slide.
