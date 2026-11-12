# -*- coding: utf-8 -*-
"""Gerador de documentos .docx para as aulas/modulos do Mini-Curso GraphQL.

Usa formatacao direta (sem depender de estilos nomeados herdados) para
reproduzir de forma previsivel o sistema visual dos cursos anteriores
(claude_code_studies, git_studies): capa a azul-marinho/laranja, caixas de
callout coloridas (DICA/ATENCAO/NOTA/PRATICAR), blocos de codigo em Consolas
sobre fundo cinzento, e tabelas com cabecalho a azul-marinho.
"""
import docx
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

import style as S


def _rgb(hexcolor):
    return RGBColor.from_string(hexcolor)


def _set_cell_shading(cell, hexcolor):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hexcolor)
    tcPr.append(shd)


def _set_cell_border(cell, color=S.GRAY_BORDER, sz=4):
    tcPr = cell._tc.get_or_add_tcPr()
    borders = OxmlElement('w:tcBorders')
    for edge in ('top', 'left', 'bottom', 'right'):
        el = OxmlElement(f'w:{edge}')
        el.set(qn('w:val'), 'single')
        el.set(qn('w:sz'), str(sz))
        el.set(qn('w:space'), '0')
        el.set(qn('w:color'), color)
        borders.append(el)
    tcPr.append(borders)


def _set_cell_margins(cell, twips=120):
    tcPr = cell._tc.get_or_add_tcPr()
    mar = OxmlElement('w:tcMar')
    for edge in ('top', 'left', 'bottom', 'right'):
        el = OxmlElement(f'w:{edge}')
        el.set(qn('w:w'), str(twips))
        el.set(qn('w:type'), 'dxa')
        mar.append(el)
    tcPr.append(mar)


def _add_page_field(paragraph):
    run = paragraph.add_run()
    run.font.color.rgb = _rgb(S.GRAY_LABEL)
    run.font.size = Pt(9)
    fld_begin = OxmlElement('w:fldChar')
    fld_begin.set(qn('w:fldCharType'), 'begin')
    instr = OxmlElement('w:instrText')
    instr.set(qn('xml:space'), 'preserve')
    instr.text = 'PAGE'
    fld_end = OxmlElement('w:fldChar')
    fld_end.set(qn('w:fldCharType'), 'end')
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_end)


class DocBuilder:
    def __init__(self, module_label, module_title, item_label, item_title, subtitle,
                 header_text=None):
        self.doc = docx.Document()
        self._setup_page()
        self._setup_normal_style()
        self._setup_header_footer(header_text or f"{S.COURSE_TITLE_SHORT}  |  {module_label} — {module_title}")
        self._cover(module_label, module_title, item_label, item_title, subtitle)
        self._first_heading_done = False

    # ---- page / style setup -------------------------------------------------
    def _setup_page(self):
        section = self.doc.sections[0]
        section.page_width = Inches(8.5)
        section.page_height = Inches(11)
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(0.9)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    def _setup_normal_style(self):
        normal = self.doc.styles['Normal']
        normal.font.name = S.FONT
        normal.font.size = Pt(11)
        normal.font.color.rgb = _rgb(S.GRAY_DARK)
        normal.paragraph_format.space_after = Pt(8)

    def _setup_header_footer(self, header_text):
        section = self.doc.sections[0]
        header_p = section.header.paragraphs[0]
        header_p.text = ''
        run = header_p.add_run(header_text)
        run.italic = True
        run.font.color.rgb = _rgb(S.GRAY_LABEL)
        run.font.size = Pt(8.5)

        footer_p = section.footer.paragraphs[0]
        footer_p.text = ''
        footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        prefix = footer_p.add_run('Página ')
        prefix.font.color.rgb = _rgb(S.GRAY_LABEL)
        prefix.font.size = Pt(9)
        _add_page_field(footer_p)

    # ---- cover ---------------------------------------------------------------
    def _cover(self, module_label, module_title, item_label, item_title, subtitle):
        p1 = self.doc.add_paragraph()
        r1 = p1.add_run(S.COURSE_TITLE)
        r1.bold = True
        r1.font.size = Pt(13)
        r1.font.color.rgb = _rgb(S.ORANGE)

        p2 = self.doc.add_paragraph()
        tag = f"{module_label} · {item_label}" if item_label else module_label
        r2 = p2.add_run(tag)
        r2.font.size = Pt(15)
        r2.font.color.rgb = _rgb(S.GRAY_LABEL)

        p3 = self.doc.add_paragraph()
        r3 = p3.add_run(item_title or module_title)
        r3.bold = True
        r3.font.size = Pt(32)
        r3.font.color.rgb = _rgb(S.NAVY)

        if subtitle:
            p4 = self.doc.add_paragraph()
            r4 = p4.add_run(subtitle)
            r4.font.size = Pt(14)
            r4.font.color.rgb = _rgb(S.GRAY_MED)

    def objectives(self, items, label="Nesta aula vai aprender:"):
        p = self.doc.add_paragraph()
        r = p.add_run(label)
        r.bold = True
        r.font.size = Pt(12)
        r.font.color.rgb = _rgb(S.NAVY)
        for item in items:
            bp = self.doc.add_paragraph(style='List Bullet')
            br = bp.add_run(item)
            br.font.size = Pt(11.5)
        self.doc.add_page_break()

    # ---- content --------------------------------------------------------------
    def heading1(self, text, page_break=False):
        if page_break and self._first_heading_done:
            self.doc.add_page_break()
        self._first_heading_done = True
        p = self.doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(20)
        r.font.color.rgb = _rgb(S.NAVY)
        return p

    def heading2(self, text):
        p = self.doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(text)
        r.bold = True
        r.font.size = Pt(14)
        r.font.color.rgb = _rgb(S.ORANGE)
        return p

    def paragraph(self, text):
        p = self.doc.add_paragraph()
        r = p.add_run(text)
        r.font.size = Pt(11)
        return p

    def bullet_list(self, items):
        for item in items:
            p = self.doc.add_paragraph(style='List Bullet')
            r = p.add_run(item)
            r.font.size = Pt(11)

    def callout(self, kind, text):
        kind = kind.upper()
        table = self.doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.rows[0].cells[0]
        _set_cell_shading(cell, S.CALLOUT_FILL[kind])
        _set_cell_border(cell)
        _set_cell_margins(cell, 160)
        cell.paragraphs[0].text = ''
        p = cell.paragraphs[0]
        label_run = p.add_run(f"{S.CALLOUT_LABEL[kind]}: ")
        label_run.bold = True
        label_run.font.size = Pt(10.5)
        body_run = p.add_run(text)
        body_run.font.size = Pt(10.5)
        self.doc.add_paragraph()

    def code_block(self, code, caption=None):
        if caption:
            cp = self.doc.add_paragraph()
            cr = cp.add_run(caption)
            cr.italic = True
            cr.font.size = Pt(9.5)
            cr.font.color.rgb = _rgb(S.GRAY_LABEL)
        table = self.doc.add_table(rows=1, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = table.rows[0].cells[0]
        _set_cell_shading(cell, S.CODE_BG_DOCX)
        _set_cell_border(cell)
        _set_cell_margins(cell, 160)
        cell.paragraphs[0].text = ''
        lines = code.split('\n')
        first = True
        for line in lines:
            p = cell.paragraphs[0] if first else cell.add_paragraph()
            first = False
            p.paragraph_format.space_after = Pt(0)
            run = p.add_run(line if line.strip() else ' ')
            run.font.name = S.CODEFONT
            run.font.size = Pt(10)
            run.font.color.rgb = _rgb(S.CODE_FG_DOCX)
        self.doc.add_paragraph()

    def data_table(self, headers, rows):
        table = self.doc.add_table(rows=1 + len(rows), cols=len(headers))
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        header_pr = table.rows[0]._tr.get_or_add_trPr()
        header_repeat = OxmlElement('w:tblHeader')
        header_repeat.set(qn('w:val'), 'true')
        header_pr.append(header_repeat)
        for ci, htext in enumerate(headers):
            cell = table.rows[0].cells[ci]
            _set_cell_shading(cell, S.NAVY)
            _set_cell_border(cell)
            _set_cell_margins(cell)
            cell.paragraphs[0].text = ''
            r = cell.paragraphs[0].add_run(htext)
            r.bold = True
            r.font.size = Pt(10.5)
            r.font.color.rgb = _rgb(S.WHITE)
        ncols = len(headers)
        for ri, row in enumerate(rows):
            row = (list(row) + [''] * ncols)[:ncols]
            row_pr = table.rows[ri + 1]._tr.get_or_add_trPr()
            row_keep = OxmlElement('w:cantSplit')
            row_pr.append(row_keep)
            for ci, val in enumerate(row):
                cell = table.rows[ri + 1].cells[ci]
                _set_cell_border(cell)
                _set_cell_margins(cell)
                cell.paragraphs[0].text = ''
                r = cell.paragraphs[0].add_run(str(val))
                r.font.size = Pt(10)
        self.doc.add_paragraph()

    def exercise_block(self, index, title, difficulty, statement, hint=None):
        p = self.doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        r = p.add_run(f"Exercício {index} — {title}")
        r.bold = True
        r.font.size = Pt(13)
        r.font.color.rgb = _rgb(S.NAVY)
        p2 = self.doc.add_paragraph()
        r2 = p2.add_run(f"Dificuldade: {difficulty}")
        r2.italic = True
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = _rgb(S.GRAY_LABEL)
        self.paragraph(statement)
        if hint:
            self.callout('DICA', hint)

    def summary(self, items, label="Resumo da Aula"):
        self.heading1(label)
        self.bullet_list(items)

    def save(self, path):
        self.doc.save(path)
