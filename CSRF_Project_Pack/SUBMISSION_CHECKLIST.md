# ✅ CHECKLIST NỘP BÀI (Submission Checklist)

Dùng bảng này để rà soát lần cuối trước khi nộp lên Google Classroom. Đánh dấu `[x]` khi hoàn tất.

---

## 1. Điền thông tin thật của nhóm (thay placeholder)
- [ ] Thay `B21DCCN001` bằng **MSV thật** của một thành viên trong:
  - [ ] `src/index.html` (biến `studentId`)
  - [ ] `src/index_formdata.html` (biến `studentId`)
  - [ ] Hoặc dùng `python3 src/exploit.py --msv <MSV_THẬT>` để sinh lại `index.html`
- [ ] Điền Họ tên + MSV của 3 thành viên vào:
  - [ ] `docs/01_PROJECT_OVERVIEW_AND_PLAN.md` (mục 3.2, các `[Tên TVx]` / `[MSV x]`)
  - [ ] `slides/SLIDE_OUTLINE_AND_SCRIPT.md` (Slide 1)
  - [ ] `report/VIDEO_DEMO_SCRIPT.md` (phần mô tả YouTube)
  - [ ] `latex/report_vi.tex` + `latex/report_en.tex` (khối thông tin nhóm ở trang bìa)
  - [ ] `latex/slides_vi.tex` + `latex/slides_en.tex` (`\author{...}`), rồi chạy lại `cd latex && ./build.sh`
- [ ] Điền tên Giảng viên hướng dẫn vào Slide 1.

## 2. Thực nghiệm & bằng chứng
- [ ] 3 container Docker chạy OK (`docker ps`) — xem `docs/04`.
- [ ] `python3 src/exploit.py --check` báo `[OK]`.
- [ ] **Mỗi thành viên** tự đổi About me thành MSV của mình (theo mô hình 2 tầng ở `docs/01`).
- [ ] Chụp đủ 3 ảnh bằng chứng: **Trước / Trong / Sau** (xem `docs/04` mục 2).
- [ ] (Khuyến khích) Chụp bằng chứng phòng thủ: bật token → tấn công thất bại (`docs/04` mục 3).

## 3. File chương trình nộp bài
- [ ] `exploit.py` chạy không lỗi (`python3 src/exploit.py --help`).
- [ ] `index.html` (và/hoặc `index_formdata.html`) mở được, tự chạy khi load.
- [ ] Mã nguồn **không** chứa thông tin thật của hệ thống ngoài lab.

## 4. Slide thuyết trình & Báo cáo
- [ ] Đủ 11–12 slide theo `slides/SLIDE_OUTLINE_AND_SCRIPT.md`, khớp 10 phút (hoặc dùng trực tiếp `latex/slides_vi.pdf` / `slides_en.pdf`).
- [ ] Báo cáo PDF hoàn chỉnh: `latex/report_vi.pdf` (và/hoặc `report_en.pdf`).
- [ ] Có sơ đồ luồng tấn công (Sequence Diagram) — đã có sẵn trong slide & báo cáo LaTeX.
- [ ] Chèn 3 ảnh chụp màn hình thật vào khung "Trước/Trong/Sau" trong báo cáo & slide.
- [ ] Có slide phân công công việc & slide khai báo AI.

## 5. Video demo
- [ ] Độ dài ~5–8 phút, 1080p, có thuyết minh.
- [ ] Cả 3 thành viên đều có giọng nói trong video.
- [ ] Có nêu rõ mức độ sử dụng AI (mục `docs/01` phần 5).
- [ ] Upload YouTube ở chế độ **Unlisted** (đã kiểm tra bằng cửa sổ ẩn danh).
- [ ] Đã copy link `https://youtu.be/...`.

## 6. Khai báo AI & đạo đức
- [ ] Bảng phân loại 3 mức độ AI khớp giữa slide, video và `docs/01`.
- [ ] Đã đọc và tuân thủ `docs/00_ETHICS_AND_SCOPE.md`.

## 7. Nộp form Classroom
- [ ] File `exploit.py`
- [ ] File thuyết trình PowerPoint
- [ ] Link video YouTube (Unlisted)
- [ ] (Nếu yêu cầu) Bản trả lời 15 câu hỏi — từ `docs/03_CSRF_DOCX_ANSWERS.md`

---

## 🧹 Sau khi nộp
- [ ] `docker-compose down` để dọn môi trường lab.
- [ ] Giữ lại bản sao hồ sơ nộp cho buổi vấn đáp.
