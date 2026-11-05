#!/usr/bin/env bash
# =====================================================================
#  Biên dịch toàn bộ tài liệu LaTeX sang PDF (báo cáo + slide, VI + EN).
#  Yêu cầu: XeLaTeX (TeX Live) + font TeX Gyre, Noto Sans Mono, beamer metropolis.
#  Cách dùng:  ./build.sh            (dịch cả 4)
#              ./build.sh report_vi  (dịch 1 file)
# =====================================================================
set -e
cd "$(dirname "$0")"

DOCS=(report_vi report_en slides_vi slides_en)
[ "$#" -gt 0 ] && DOCS=("$@")

for d in "${DOCS[@]}"; do
  echo ">> Biên dịch $d ..."
  xelatex -interaction=nonstopmode -halt-on-error "$d.tex" >/dev/null
  xelatex -interaction=nonstopmode -halt-on-error "$d.tex" >/dev/null   # lần 2: mục lục/tham chiếu
  echo "   -> $d.pdf"
done

# Dọn file phụ trợ, chỉ giữ lại .pdf và mã nguồn.
rm -f ./*.aux ./*.log ./*.toc ./*.nav ./*.snm ./*.out ./*.vrb
echo "Hoàn tất. Các PDF nằm trong thư mục latex/."
