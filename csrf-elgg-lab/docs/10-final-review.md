# Đối chiếu yêu cầu trước khi nộp

| Yêu cầu | Sản phẩm | Trạng thái |
|---|---|---|
| Khảo sát và kế hoạch | PLAN.md, docs/02 | Đã khảo sát; kế hoạch cập nhật |
| Elgg + DB + attacker, cục bộ | Compose, Dockerfile, scripts | Mã có; Elgg runtime NOT RUN |
| Alice, dữ liệu khởi tạo, reset | fetch-seed, profile.php | Mã có; NOT RUN trên Elgg |
| Phiên bản/lý do khác bản hiện hành | README, docs/02, lab/SOURCES | Lý do có; exact version/digest chưa có |
| Edit Profile HTTP thật | docs/03 + capture template | NOT RUN; cần capture |
| Attacker rõ ràng, MSV đổi được | attacker/index.html/app.js/request.mjs | Đã chạy Chrome |
| Fetch + URLSearchParams, không XHR/form | request.mjs, tests | 6 tests PASS |
| Endpoint thử nghiệm trước Elgg | /echo | TC-02 PASS, ảnh/log thật |
| SOP/CORS/SameSite/token chính xác | docs/01,04,06 | Có phân tích; đối chứng Elgg NOT RUN |
| Không hardcode cookie/token | Input guard; server allowlist; gitignore | Test input/server PASS; không ghi session thực |
| TC-01 đến TC-06 | docs/05, browser_elgg.mjs | Chỉ TC-02 PASS; còn lại NOT RUN |
| Xác minh đúng About me | TC-06 | NOT RUN |
| exploit.py | Python standard library server | Đã chạy; cần giảng viên xác nhận cách diễn giải |
| Log và screenshot thực | evidence | Có TC-02; chưa có Elgg |
| PowerPoint 10 phút | presentation + outline | Đã xuất 12 slide, 12 notes/600 giây; render và xem đủ 12 slide |
| Kịch bản video | docs/07 | Có; chưa quay/upload |
| Thành viên/phân công | README, slide 11 | Đề xuất, cần nhóm xác nhận |
| AI Usage đúng ba mức | docs/09 | Công bố mức 3; nhóm bổ sung việc tự làm |
| Hướng dẫn tái hiện | README, docs/02 | Có; toàn pipeline Elgg chưa được kiểm chứng |

**Chưa đạt tiêu chí hoàn thành toàn bộ đề tài.** Trước khi nộp: xử lý lưu trữ Docker; dựng/ghi phiên bản; bắt request bằng Network; chạy cả hai token mode và đối chứng site; xác minh profile/reset; lưu ảnh khử secret; cập nhật tài liệu/slide theo kết quả; quay và upload video unlisted. Không đánh dấu PASS chỉ vì có mã test hoặc đã mở trang attacker.
