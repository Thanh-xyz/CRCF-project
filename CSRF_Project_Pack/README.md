# BỘ HỒ SƠ DỰ ÁN THỰC HÀNH TẤN CÔNG CSRF TRÊN NỀN TẢNG ELGG
> **Học phần:** An toàn và Bảo mật Hệ thống Thông tin (CS)  
> **Đề tài:** Tấn công Cross-Site Request Forgery (CSRF) sử dụng Fetch API trên mạng xã hội Elgg  
> **Quy mô nhóm:** 03 thành viên  

---

## 📌 1. Giới thiệu tổng quan
Dự án tập trung vào việc nghiên cứu, thực nghiệm và phân tích chuyên sâu về lỗ hổng **Cross-Site Request Forgery (CSRF)** trên ứng dụng mạng xã hội Elgg (môi trường SEED Labs). Điểm cải tiến và yêu cầu bắt buộc của bài thực hành này là:
- **KHÔNG** sử dụng `XMLHttpRequest` (XHR) truyền thống hay HTML Form tự động submit (`form.submit()`).
- **BẮT BUỘC** sử dụng **Fetch API (`fetch()`)** kết hợp với đối tượng **`URLSearchParams`** hoặc **`FormData`** để đóng gói dữ liệu và thực hiện tấn công ngầm.
- Thay đổi thành công trường **About me** trong Profile của nạn nhân thành cú pháp: `CSRF attack by <MSV>`.

---

## 📂 2. Cấu trúc thư mục dự án

```text
CSRF_Project_Pack/
├── README.md                           # Giới thiệu tổng quan và hướng dẫn điều hướng
├── docs/
│   ├── 01_PROJECT_OVERVIEW_AND_PLAN.md # Kế hoạch chi tiết, phương pháp và phân công nhiệm vụ công bằng (RACI)
│   ├── 02_HANDS_ON_FETCH_API_GUIDE.md  # Hướng dẫn kỹ thuật từng bước (Step-by-step Hands-on Guide)
│   └── 03_CSRF_DOCX_ANSWERS.md         # Giải chi tiết 15 câu hỏi lý thuyết trong CSRF.docx
├── src/
│   ├── index.html                      # Trang web độc hại của Attacker sử dụng Fetch API + URLSearchParams
│   └── exploit.py                      # Script Python hỗ trợ dựng máy chủ Web Attacker & kiểm thử payload
├── slides/
│   └── SLIDE_OUTLINE_AND_SCRIPT.md     # Đề cương 12 Slide thuyết trình 10 phút & Kịch bản thuyết minh
└── report/
    └── VIDEO_DEMO_SCRIPT.md            # Kịch bản quay video demo (Storyboard & Voiceover) + Khai báo AI
```

---

## 👥 3. Tóm tắt phân công công việc (Nhóm 3 thành viên)

| Thành viên | Vai trò chính | Nhiệm vụ trọng tâm | Sản phẩm phụ trách |
| :--- | :--- | :--- | :--- |
| **Thành viên 1** | **Technical Lead** | Cấu hình Docker, bắt gói tin HTTP POST qua DevTools, phát triển mã khai thác Fetch API, kiểm thử payload. | `src/index.html`, `src/exploit.py`, ảnh chụp bằng chứng kỹ thuật. |
| **Thành viên 2** | **Media & Demo Lead** | Lập kịch bản video demo, quay màn hình thao tác, thuyết minh/lồng tiếng, biên tập video, đăng tải YouTube (Unlisted). | Video Demo YouTube (Unlisted), `report/VIDEO_DEMO_SCRIPT.md`, bản khai báo AI. |
| **Thành viên 3** | **Research & Slide Lead** | Thiết kế bộ Slide thuyết trình (10 phút), vẽ sơ đồ luồng dữ liệu, giải chi tiết 15 câu hỏi trong `CSRF.docx`. | Slide thuyết trình PowerPoint, `docs/03_CSRF_DOCX_ANSWERS.md`, hoàn thiện hồ sơ nộp. |

---

## 🚀 4. Hướng dẫn sử dụng nhanh

1. **Đọc kế hoạch & phân công**: Mở file [`docs/01_PROJECT_OVERVIEW_AND_PLAN.md`](docs/01_PROJECT_OVERVIEW_AND_PLAN.md).
2. **Thực hành triển khai mã khai thác**: Làm theo hướng dẫn tại [`docs/02_HANDS_ON_FETCH_API_GUIDE.md`](docs/02_HANDS_ON_FETCH_API_GUIDE.md).
3. **Ôn tập lý thuyết & trả lời câu hỏi**: Tham khảo lời giải đầy đủ tại [`docs/03_CSRF_DOCX_ANSWERS.md`](docs/03_CSRF_DOCX_ANSWERS.md).
4. **Chuẩn bị thuyết trình**: Xem cấu trúc slide và kịch bản nói tại [`slides/SLIDE_OUTLINE_AND_SCRIPT.md`](slides/SLIDE_OUTLINE_AND_SCRIPT.md).
5. **Quay video nộp bài**: Xem kịch bản storyboard tại [`report/VIDEO_DEMO_SCRIPT.md`](report/VIDEO_DEMO_SCRIPT.md).
