# 📄 Tài liệu LaTeX — Báo cáo & Slide (Song ngữ VI/EN)

Thư mục này chứa mã nguồn LaTeX và bản PDF đã biên dịch của **báo cáo** và **slide thuyết trình**, mỗi loại có hai phiên bản **Tiếng Việt** và **Tiếng Anh**.

## Sản phẩm

| File nguồn | PDF | Loại | Ngôn ngữ |
| :--- | :--- | :--- | :--- |
| `report_vi.tex` | `report_vi.pdf` | Báo cáo (8 trang) | Tiếng Việt |
| `report_en.tex` | `report_en.pdf` | Report (8 pages) | English |
| `slides_vi.tex` | `slides_vi.pdf` | Slide thuyết trình | Tiếng Việt |
| `slides_en.tex` | `slides_en.pdf` | Presentation slides | English |

## Thành phần dùng chung
- `sty_common.tex` — bảng màu, hộp callout (info/warn/ok), style listing mã nguồn, bảng.
- `diagram_flow.tex` — sơ đồ tuần tự luồng tấn công bằng TikZ (nhãn mặc định Tiếng Việt, bản EN tự ghi đè).

## Biên dịch
Yêu cầu: **XeLaTeX** (TeX Live), theme **beamer metropolis**, các font **TeX Gyre Termes/Heros** và **Noto Sans Mono** (đã có sẵn trên hầu hết bản TeX Live đầy đủ).

```bash
cd latex
./build.sh              # dịch cả 4 tài liệu, tự dọn file phụ trợ
./build.sh report_vi    # hoặc dịch riêng một tài liệu
```

Nếu không dùng script:
```bash
xelatex report_vi.tex && xelatex report_vi.tex   # chạy 2 lần để cập nhật mục lục
```

> **Ghi chú kỹ thuật:** Chú thích bên trong khối mã (code listing) được viết bằng tiếng Anh vì gói `listings` không xử lý tốt dấu tiếng Việt khi định vị từng ký tự; toàn bộ phần diễn giải tiếng Việt nằm ở văn bản và các hộp chú thích xung quanh. Cảnh báo *overfull vbox 15pt* ở trang bìa slide là đặc thù vô hại của theme metropolis, không gây tràn nội dung.
