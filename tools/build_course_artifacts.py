from __future__ import annotations

import html
import argparse
import re
import sys
from pathlib import Path

from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT

import style as S
from docbuilder import DocBuilder
from pptxbuilder import PPTXBuilder


ROOT = Path(__file__).resolve().parents[1]
COURSE_TITLE = "Mini-Curso de Python de A a Z"
S.COURSE_TITLE = COURSE_TITLE.upper()
S.COURSE_TITLE_SHORT = COURSE_TITLE

CALLOUT_MAP = {
    "DICA": "DICA",
    "ATENÇÃO": "ATENCAO",
    "ATENCAO": "ATENCAO",
    "NOTA": "NOTA",
    "PRATICAR": "PRATICAR",
}
INLINE_TOKEN = re.compile(
    r"(<code>.*?</code>|`[^`]+`|\*\*.*?\*\*|\*[^*]+\*|\[[^\]]+\]\(https?://[^)]+\))"
)
LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
CALLOUT_RE = re.compile(r"^\*\*(DICA|ATENÇÃO|ATENCAO|NOTA|PRATICAR):\*\*\s*(.*)$", re.I)


def clean_inline(text: str) -> str:
    text = re.sub(r"<code>(.*?)</code>", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\[([^\]]+)\]\(https?://[^)]+\)", r"\1", text)
    text = text.replace("**", "").replace("*", "")
    return html.unescape(text).strip()


def add_rich(paragraph, text: str, base_size: float = 11) -> None:
    cursor = 0
    for match in INLINE_TOKEN.finditer(text):
        if match.start() > cursor:
            paragraph.add_run(html.unescape(text[cursor:match.start()]))
        token = match.group(0)
        link = LINK_RE.fullmatch(token)
        if link:
            rel_id = paragraph.part.relate_to(link.group(2), RT.HYPERLINK, is_external=True)
            hyperlink = OxmlElement("w:hyperlink")
            hyperlink.set(qn("r:id"), rel_id)
            run = OxmlElement("w:r")
            props = OxmlElement("w:rPr")
            color = OxmlElement("w:color")
            color.set(qn("w:val"), "0563C1")
            props.append(color)
            underline = OxmlElement("w:u")
            underline.set(qn("w:val"), "single")
            props.append(underline)
            run.append(props)
            value = OxmlElement("w:t")
            value.text = link.group(1)
            run.append(value)
            hyperlink.append(run)
            paragraph._p.append(hyperlink)
        elif token.startswith("<code>") or token.startswith("`"):
            value = token[6:-7] if token.startswith("<code>") else token[1:-1]
            run = paragraph.add_run(html.unescape(value))
            run.font.name = S.CODEFONT
            run.font.size = __import__("docx").shared.Pt(base_size - 1)
        elif token.startswith("**"):
            run = paragraph.add_run(html.unescape(token[2:-2]))
            run.bold = True
        else:
            run = paragraph.add_run(html.unescape(token[1:-1]))
            run.italic = True
        cursor = match.end()
    if cursor < len(text):
        paragraph.add_run(html.unescape(text[cursor:]))


def split_table_row(line: str) -> list[str]:
    return [part.strip() for part in line.strip().strip("|").split("|")]


def is_table_separator(line: str) -> bool:
    cells = split_table_row(line)
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells)


def parse_markdown(path: Path) -> dict:
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    title = path.stem
    sections: list[dict] = []
    section: dict | None = None
    paragraph: list[str] = []
    fence: list[str] | None = None
    indented_code: list[str] | None = None
    table_lines: list[str] = []

    def ensure_section(name: str = "Introdução") -> dict:
        nonlocal section
        if section is None:
            section = {"title": name, "blocks": []}
            sections.append(section)
        return section

    def flush_paragraph() -> None:
        nonlocal paragraph
        if paragraph:
            value = " ".join(part.strip() for part in paragraph).strip()
            if value:
                m = CALLOUT_RE.match(value)
                if m:
                    ensure_section()["blocks"].append(("callout", m.group(1).upper(), m.group(2).strip()))
                else:
                    ensure_section()["blocks"].append(("paragraph", value))
            paragraph = []

    def flush_table() -> None:
        nonlocal table_lines
        if table_lines:
            parsed = [split_table_row(line) for line in table_lines]
            if len(parsed) >= 2:
                headers = parsed[0]
                rows = [row for row in parsed[1:] if not all(re.fullmatch(r":?-{3,}:?", c.replace(" ", "")) for c in row)]
                ensure_section()["blocks"].append(("table", headers, rows))
            table_lines = []

    for raw in lines:
        line = raw.rstrip()
        if fence is not None:
            if line.startswith("```"):
                ensure_section()["blocks"].append(("code", "\n".join(fence).rstrip()))
                fence = None
            else:
                fence.append(line)
            continue
        indented = line.startswith("    ") or line.startswith("\t")
        if indented_code is not None:
            if not line.strip():
                indented_code.append("")
                continue
            if indented:
                indented_code.append(line[4:] if line.startswith("    ") else line[1:])
                continue
            ensure_section()["blocks"].append(("code", "\n".join(indented_code).rstrip()))
            indented_code = None
        if indented:
            flush_paragraph()
            flush_table()
            indented_code = [line[4:] if line.startswith("    ") else line[1:]]
            continue
        if line.startswith("```"):
            flush_paragraph()
            flush_table()
            fence = []
            continue
        if line.startswith("# "):
            flush_paragraph()
            flush_table()
            title = line[2:].strip()
            continue
        if line.startswith("## "):
            flush_paragraph()
            flush_table()
            section = {"title": line[3:].strip(), "blocks": []}
            sections.append(section)
            continue
        if line.startswith("### "):
            flush_paragraph()
            flush_table()
            ensure_section()["blocks"].append(("heading2", line[4:].strip()))
            continue
        if line.strip().startswith("|") and line.strip().endswith("|"):
            flush_paragraph()
            table_lines.append(line.strip())
            continue
        if table_lines:
            flush_table()
        if not line.strip():
            flush_paragraph()
            continue
        callout = CALLOUT_RE.match(line.strip())
        if callout:
            flush_paragraph()
            ensure_section()["blocks"].append(("callout", callout.group(1).upper(), callout.group(2).strip()))
            continue
        bullet = re.match(r"^\s*[-*+]\s+(.*)$", line)
        if bullet:
            flush_paragraph()
            ensure_section()["blocks"].append(("bullet", bullet.group(1).strip()))
            continue
        number = re.match(r"^\s*(\d+)\.\s+(.*)$", line)
        if number:
            flush_paragraph()
            ensure_section()["blocks"].append(("number", number.group(1), number.group(2).strip()))
            continue
        if line.lstrip().startswith("> "):
            flush_paragraph()
            quote = line.lstrip()[2:].strip()
            m = CALLOUT_RE.match(quote)
            if m:
                ensure_section()["blocks"].append(("callout", m.group(1).upper(), m.group(2).strip()))
            else:
                ensure_section()["blocks"].append(("paragraph", quote))
            continue
        paragraph.append(line)
    flush_paragraph()
    flush_table()
    if indented_code is not None:
        ensure_section()["blocks"].append(("code", "\n".join(indented_code).rstrip()))
    if fence is not None:
        ensure_section()["blocks"].append(("code", "\n".join(fence).rstrip()))
    sections = [sec for sec in sections if sec["blocks"]]
    return {"title": title, "sections": sections}


def extract_sources(text: str) -> list[tuple[str, str]]:
    found = []
    for label, url in LINK_RE.findall(text):
        if (label, url) not in found:
            found.append((label.strip(), url.strip()))
    return found


def draw_docx(path: Path, lesson: dict, module_num: str, module_title: str) -> None:
    sections = lesson["sections"]
    objectives = [s["title"] for s in sections if s["title"].lower() not in {"fontes oficiais", "fontes", "exercícios", "folha de registo"}][:4]
    builder = DocBuilder(
        module_label=f"MÓDULO {module_num}", module_title=module_title,
        item_label="Aula", item_title=lesson["title"],
        subtitle="Aula do Mini-Curso de Python de A a Z",
    )
    builder.objectives(objectives, "Nesta aula vai estudar:")
    for sec in sections:
        needs_page_break = (module_num, sec["title"]) in set()
        builder.heading1(sec["title"], page_break=needs_page_break)
        for block in sec["blocks"]:
            kind = block[0]
            if kind == "heading2":
                builder.heading2(block[1])
            elif kind == "paragraph":
                p = builder.doc.add_paragraph()
                add_rich(p, block[1])
            elif kind == "bullet":
                p = builder.doc.add_paragraph(style="List Bullet")
                add_rich(p, block[1])
            elif kind == "number":
                p = builder.doc.add_paragraph()
                prefix = p.add_run(f"{block[1]}. ")
                prefix.bold = True
                add_rich(p, block[2])
            elif kind == "code":
                builder.code_block(block[1])
            elif kind == "callout":
                mapped = CALLOUT_MAP.get(block[1], "NOTA")
                builder.callout(mapped, clean_inline(block[2]))
            elif kind == "table":
                headers = [clean_inline(cell) for cell in block[1]]
                rows = [[clean_inline(cell) for cell in row] for row in block[2]]
                builder.data_table(headers, rows)
    builder.doc.core_properties.title = lesson["title"]
    builder.doc.core_properties.subject = COURSE_TITLE
    builder.save(str(path))


def short_bullet(text: str, limit: int = 142) -> str:
    text = clean_inline(text)
    text = re.sub(r"\s+", " ", text)
    number_prefix = ""
    numbered = re.match(r"^(\d+\.\s+)(.*)$", text)
    if numbered:
        number_prefix, text = numbered.group(1), numbered.group(2)
    sentences = re.split(r"(?<!\d)(?<=[.!?])\s+", text)
    candidate = sentences[0] if sentences and sentences[0] else text
    candidate = number_prefix + candidate
    if len(candidate) > limit:
        candidate = candidate[: limit - 1].rsplit(" ", 1)[0] + "…"
    return candidate.strip()


def note_sources(slide, sources: list[tuple[str, str]]) -> None:
    if not sources:
        return
    frame = slide.notes_slide.notes_text_frame
    frame.text = "Fontes oficiais consultadas neste módulo:\n" + "\n".join(f"{label}: {url}" for label, url in sources)


def draw_pptx(path: Path, lesson: dict, module_num: str, module_title: str, next_label: str, sources: list[tuple[str, str]]) -> None:
    builder = PPTXBuilder(module_label=f"MÓDULO {module_num}", module_title=module_title, item_label="Aula")
    slide = builder.cover_slide(COURSE_TITLE.upper(), lesson["title"], "Aula do Mini-Curso de Python de A a Z", f"MÓDULO {module_num}")
    note_sources(slide, sources)
    main_sections = [s for s in lesson["sections"] if s["title"].lower() not in {"fontes oficiais", "fontes"}]
    objectives = [("🎯", short_bullet(sec["title"], 92)) for sec in main_sections[:5]]
    slide = builder.bullets_slide("Objetivos da aula", objectives)
    note_sources(slide, sources)

    for sec in main_sections:
        title = sec["title"]
        blocks = sec["blocks"]
        bullets = []
        code_blocks = []
        tables = []
        callouts = []
        for block in blocks:
            if block[0] == "paragraph":
                bullet = short_bullet(block[1])
                if bullet and bullet not in [entry[1] for entry in bullets]:
                    bullets.append(("•", bullet))
            elif block[0] in {"bullet", "number"}:
                value = block[1] if block[0] == "bullet" else f"{block[1]}. {block[2]}"
                bullets.append(("•", short_bullet(value)))
            elif block[0] == "heading2":
                bullets.append(("›", short_bullet(block[1], 110)))
            elif block[0] == "callout":
                callouts.append(block)
                if len(bullets) < 5:
                    bullets.append(("⚠" if block[1].upper().startswith("ATEN") else "💡", short_bullet(f"{block[1]}: {block[2]}")))
            elif block[0] == "code":
                code_blocks.append(block[1])
            elif block[0] == "table":
                tables.append((block[1], block[2]))
        for part, start in enumerate(range(0, len(bullets), 5), 1):
            group = bullets[start:start + 5]
            slide_title = title if len(bullets) <= 5 else f"{title} ({part})"
            slide = builder.bullets_slide(slide_title, group)
            note_sources(slide, sources)
        for code in code_blocks:
            caption = "Exemplo:"
            if len(code.splitlines()) > 14:
                caption = "Excerto do comando; o bloco completo está na aula Word."
            slide = builder.code_slide(title, code, caption=caption)
            note_sources(slide, sources)
        for headers, rows in tables:
            page_size = 6
            chunks = [rows[i:i + page_size] for i in range(0, len(rows), page_size)] or [[]]
            for i, chunk in enumerate(chunks, 1):
                suffix = f" ({i}/{len(chunks)})" if len(chunks) > 1 else ""
                note = f"Linhas {((i - 1) * page_size) + 1}–{min(i * page_size, len(rows))} de {len(rows)}. Consulta a aula Word para contexto completo." if len(chunks) > 1 else None
                clean_headers = [clean_inline(cell) for cell in headers]
                clean_rows = [[clean_inline(cell) for cell in row] for row in chunk]
                slide = builder.table_slide(title + suffix, clean_headers, clean_rows, note=note)
                note_sources(slide, sources)
        for block in callouts:
            kind = CALLOUT_MAP.get(block[1], "NOTA")
            slide = builder.callout_slide(title, kind, clean_inline(block[2]))
            note_sources(slide, sources)

    if sources:
        source_bullets = [("↗", label) for label, _url in sources]
        for start in range(0, len(source_bullets), 5):
            slide = builder.bullets_slide("Fontes oficiais", source_bullets[start:start + 5])
            note_sources(slide, sources)
    slide = builder.closing_slide("Fim da aula", next_label, f"MÓDULO {module_num}")
    note_sources(slide, sources)
    builder.save(str(path))


def module_title_from_folder(folder: str) -> str:
    names = {
        "00-Introducao": "Introdução",
        "01-Fundamentos": "Fundamentos",
        "02-Controlo-de-Fluxo": "Controlo de Fluxo",
        "03-Funcoes": "Funções",
        "04-Estruturas-de-Dados": "Estruturas de Dados",
        "05-Strings-e-Ficheiros": "Strings e Ficheiros",
        "06-Modulos-e-Ambientes": "Módulos e Ambientes",
        "07-Orientacao-a-Objetos": "Orientação a Objetos",
        "08-Erros-e-Testes": "Erros e Testes",
        "09-Python-Idiomatico": "Python Idiomático",
        "10-Biblioteca-Padrao-e-Ecossistema": "Biblioteca Padrão e Ecossistema",
        "11-Exercicios-Praticos": "Exercícios Práticos",
        "12-Cheat-Sheet": "Consulta Rápida",
        "13-Gabarito": "Gabarito",
        "14-Projetos-por-Area": "Projetos por Área",
    }
    return names.get(folder, folder.replace("-", " "))


def main() -> None:
    parser = argparse.ArgumentParser(description="Gera Word e PowerPoint a partir das aulas Markdown do curso.")
    parser.add_argument("--only", help="lista de módulos separados por vírgula, por exemplo 03,07")
    parser.add_argument("--format", choices=("all", "docx", "pptx"), default="all")
    args = parser.parse_args()
    selected = {value.strip() for value in args.only.split(",")} if args.only else None
    all_files = sorted(p for p in ROOT.rglob("*.md") if p.parent != ROOT and p.parent.name != "tools" and p.name != "README.md" and "node_modules" not in p.parts and p.parent.parent == ROOT)
    files = all_files
    if selected:
        files = [p for p in files if p.stem[:2] in selected]
    lessons = [(p, parse_markdown(p)) for p in files]
    source_map = {p: extract_sources(p.read_text(encoding="utf-8-sig")) for p, _ in lessons}
    for source, lesson in lessons:
        module_num = source.stem[:2]
        module_title = module_title_from_folder(source.parent.name)
        next_label = "Mini-Curso concluído"
        source_index = all_files.index(source)
        if source_index + 1 < len(all_files):
            next_source = all_files[source_index + 1]
            next_num = next_source.stem[:2]
            next_title = module_title_from_folder(next_source.parent.name)
            next_label = f"A seguir: Módulo {next_num} · {next_title}"
        docx_path = source.with_suffix(".docx")
        pptx_path = source.with_suffix(".pptx")
        if args.format in ("all", "docx"):
            draw_docx(docx_path, lesson, module_num, module_title)
        if args.format in ("all", "pptx"):
            draw_pptx(pptx_path, lesson, module_num, module_title, next_label, source_map[source])
        print(f"OK {docx_path.relative_to(ROOT)}" + (f" | {pptx_path.relative_to(ROOT)}" if args.format in ("all", "pptx") else ""))
    outputs_per_lesson = 2 if args.format == "all" else 1
    print(f"Concluído: {len(lessons)} aulas, {len(lessons) * outputs_per_lesson} ficheiros Office.")


if __name__ == "__main__":
    main()
