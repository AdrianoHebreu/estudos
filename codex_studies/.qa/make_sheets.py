from pathlib import Path
import re
from PIL import Image, ImageOps, ImageDraw, ImageFont
import fitz

root = Path(__file__).resolve().parents[1]
rendered = root / ".qa" / "rendered"
word_pdf = rendered / "word-pdf"
word_png = rendered / "word-png"
word_sheets = rendered / "word-sheets"
slide_root = rendered / "slides"
slide_sheets = rendered / "slide-sheets"
for folder in (word_png, word_sheets, slide_sheets):
    folder.mkdir(parents=True, exist_ok=True)

font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 24)

for pdf_path in sorted(word_pdf.glob("*.pdf")):
    doc = fitz.open(pdf_path)
    page_imgs = []
    for idx, page in enumerate(doc, 1):
        img_path = word_png / f"{pdf_path.stem}_p{idx:02}.png"
        page.get_pixmap(matrix=fitz.Matrix(1.35, 1.35), alpha=False).save(str(img_path))
        with Image.open(img_path) as img:
            thumb = img.convert("RGB")
            thumb.thumbnail((420, 545))
            page_imgs.append(thumb.copy())
    cols = 2
    gap = 22
    title_h = 46
    cell_w, cell_h = 442, 570
    rows = (len(page_imgs) + cols - 1) // cols
    sheet = Image.new("RGB", (gap + cols * cell_w, title_h + gap + rows * cell_h), "#d9e0e7")
    draw = ImageDraw.Draw(sheet)
    draw.text((gap, 10), f"Word QA · {pdf_path.stem}", fill="#142735", font=font)
    for i, img in enumerate(page_imgs):
        x = gap + (i % cols) * cell_w + 10
        y = title_h + gap + (i // cols) * cell_h + 10
        frame = ImageOps.expand(img, border=1, fill="#8795a3")
        sheet.paste(frame, (x, y))
    sheet.save(word_sheets / f"{pdf_path.stem}.png")

for deck_dir in sorted(p for p in slide_root.iterdir() if p.is_dir()):
    slides = sorted(deck_dir.glob("*.PNG"), key=lambda p: int(re.search(r"(\d+)$", p.stem).group(1)))
    cols, rows_per_sheet = 3, 3
    thumb_w, thumb_h = 426, 240
    gap, title_h = 18, 40
    for start in range(0, len(slides), cols * rows_per_sheet):
        group = slides[start:start + cols * rows_per_sheet]
        rows = (len(group) + cols - 1) // cols
        sheet = Image.new("RGB", (gap + cols * (thumb_w + gap), title_h + gap + rows * (thumb_h + gap)), "#d9e0e7")
        draw = ImageDraw.Draw(sheet)
        draw.text((gap, 8), f"Slides QA · {deck_dir.name} · {start + 1}-{start + len(group)}", fill="#142735", font=font)
        for i, slide_path in enumerate(group):
            with Image.open(slide_path) as img:
                img = img.convert("RGB").resize((thumb_w, thumb_h))
                x = gap + (i % cols) * (thumb_w + gap)
                y = title_h + gap + (i // cols) * (thumb_h + gap)
                sheet.paste(img, (x, y))
        sheet.save(slide_sheets / f"{deck_dir.name}_{start + 1:02}.png")

print(f"Rendered {len(list(word_pdf.glob('*.pdf')))} Word PDFs and {len(list(slide_root.glob('*/*.PNG')))} slide previews.")
