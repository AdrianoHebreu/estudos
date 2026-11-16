# -*- coding: utf-8 -*-
"""Gerador de decks .pptx (resumo visual) para as aulas/modulos do curso.

Replica o sistema visual observado em claude_code_studies/git_studies:
capa e slide final a fundo azul-marinho, barra superior azul-marinho nos
slides de conteudo, icones em circulo laranja, blocos de codigo escuros em
Consolas e tabelas com cabecalho azul-marinho.
"""
from pptx import Presentation
from pptx.util import Emu, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

import style as S

SLIDE_W = Emu(12191695)
SLIDE_H = Emu(6858000)
MARGIN_X = Emu(457200)
BAR_H = Emu(502920)
CONTENT_TITLE_T = Emu(777240)
CONTENT_TOP = Emu(1691640)
ROW_STEP = Emu(841248)
FOOTER_TAG_T = Emu(6492240)


def _rgb(hexcolor):
    return RGBColor.from_string(hexcolor)


def _no_line(shape):
    shape.line.fill.background()


def _set_fill(shape, hexcolor):
    shape.fill.solid()
    shape.fill.fore_color.rgb = _rgb(hexcolor)
    _no_line(shape)


def _set_bg(slide, hexcolor):
    bg = slide.background
    bg.fill.solid()
    bg.fill.fore_color.rgb = _rgb(hexcolor)


def _textbox(slide, l, t, w, h, text, size, color, bold=False, italic=False,
             align=PP_ALIGN.LEFT, font=S.FONT, anchor=None, line_spacing=None):
    box = slide.shapes.add_textbox(l, t, w, h)
    tf = box.text_frame
    tf.word_wrap = True
    if anchor is not None:
        tf.vertical_anchor = anchor
    lines = text.split('\n') if isinstance(text, str) else text
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        if line_spacing:
            p.line_spacing = line_spacing
        r = p.add_run()
        r.text = line
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.italic = italic
        r.font.color.rgb = _rgb(color)
        r.font.name = font
    return box


def _oval_icon(slide, l, t, diameter, emoji, fill=S.ORANGE, emoji_size=18):
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, l, t, diameter, diameter)
    _set_fill(shp, fill)
    tf = shp.text_frame
    tf.word_wrap = False
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = emoji
    r.font.size = Pt(emoji_size)
    r.font.color.rgb = _rgb(S.WHITE)
    r.font.name = S.EMOJIFONT
    return shp


class PPTXBuilder:
    def __init__(self, module_label, module_title, item_label=None, right_tag=None):
        self.prs = Presentation()
        self.prs.slide_width = SLIDE_W
        self.prs.slide_height = SLIDE_H
        self.blank_layout = self.prs.slide_layouts[6]
        self.module_label = module_label
        self.module_title = module_title
        self.item_label = item_label
        self.right_tag = right_tag or S.COURSE_TITLE_SHORT
        self._n = 0

    def _new_slide(self):
        self._n += 1
        return self.prs.slides.add_slide(self.blank_layout)

    def _content_header(self, slide, title):
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, SLIDE_W, BAR_H)
        _set_fill(bar, S.NAVY)
        crumb = f"{self.module_label}  ·  {self.module_title}"
        if self.item_label:
            crumb += f"  ·  {self.item_label}"
        _textbox(slide, MARGIN_X, 0, Emu(7315200), BAR_H, crumb, 12, S.WHITE,
                 bold=True, anchor=MSO_ANCHOR.MIDDLE)
        _textbox(slide, Emu(8076895), 0, Emu(3657600), BAR_H, self.right_tag, 10,
                 S.SLIDE_SUBTITLE_COLOR, align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.MIDDLE)
        _textbox(slide, Emu(548640), CONTENT_TITLE_T, Emu(10058400), Emu(640080),
                 title, 28, S.NAVY, bold=True)
        _textbox(slide, MARGIN_X, FOOTER_TAG_T, Emu(5486400), Emu(274320),
                 self.module_label, 9, S.GRAY_MED)

    # ---- slide types --------------------------------------------------------
    def cover_slide(self, tag_text, title, subtitle, footer_tag):
        slide = self._new_slide()
        _set_bg(slide, S.NAVY)
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Emu(6629400), SLIDE_W, Emu(228600))
        _set_fill(bar, S.ORANGE)
        _oval_icon(slide, Emu(868680), Emu(868680), Emu(1005840), '\U0001F4DA', emoji_size=33)
        _textbox(slide, Emu(2194560), Emu(960120), Emu(4572000), Emu(457200),
                 tag_text, 14, S.ORANGE, bold=True)
        _textbox(slide, Emu(914400), Emu(2651760), Emu(10332720), Emu(1828800),
                 title, 44, S.WHITE, bold=True)
        if subtitle:
            _textbox(slide, Emu(914400), Emu(4297680), Emu(9144000), Emu(914400),
                     subtitle, 18, S.SLIDE_SUBTITLE_COLOR)
        _textbox(slide, Emu(914400), Emu(6035040), Emu(3657600), Emu(457200),
                 footer_tag, 13, S.SLIDE_TAG_COLOR, bold=True)
        return slide

    def bullets_slide(self, title, bullets):
        """bullets: list of (emoji, text)"""
        slide = self._new_slide()
        _set_bg(slide, S.WHITE)
        self._content_header(slide, title)
        t = CONTENT_TOP
        for emoji, text in bullets[:5]:
            _oval_icon(slide, Emu(571500), Emu(t + 169164), Emu(502920), emoji, emoji_size=18)
            _textbox(slide, Emu(1280160), Emu(t), Emu(10241280), ROW_STEP, text, 15.5,
                     S.GRAY_DARK, anchor=MSO_ANCHOR.MIDDLE)
            t = Emu(int(t) + int(ROW_STEP))
        return slide

    def code_slide(self, title, code, caption="Exemplo:"):
        slide = self._new_slide()
        _set_bg(slide, S.WHITE)
        self._content_header(slide, title)
        _textbox(slide, Emu(822960), Emu(1216152), Emu(10332720), Emu(320040),
                 caption, 12.5, S.GRAY_MED)
        lines = code.split('\n')
        if len(lines) <= 1:
            panel_top, panel_height = Emu(2286000), Emu(2057400)
        elif len(lines) <= 4:
            panel_top, panel_height = Emu(2103120), Emu(2377440)
        elif len(lines) <= 9:
            panel_top, panel_height = Emu(1828800), Emu(3200400)
        else:
            panel_top, panel_height = Emu(1645920), Emu(4114800)
        rect = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Emu(822960), panel_top,
                                       Emu(10332720), panel_height)
        rect.adjustments[0] = 0.03
        _set_fill(rect, S.CODE_BG_PPTX)
        if len(lines) > 14:
            lines = lines[:14] + ['/* ... */']
        text_top = Emu(int(panel_top) + 182880)
        text_height = Emu(int(panel_height) - 365760)
        _textbox(slide, Emu(1143000), text_top, Emu(9692640), text_height,
                 '\n'.join(lines), 14, S.CODE_FG_PPTX, font=S.CODEFONT,
                 anchor=MSO_ANCHOR.MIDDLE, line_spacing=1.15)
        return slide

    def table_slide(self, title, headers, rows, note=None):
        slide = self._new_slide()
        _set_bg(slide, S.WHITE)
        self._content_header(slide, title)
        max_rows = 7
        shown = rows[:max_rows]
        n_rows = 1 + len(shown)
        row_h = Emu(548640)
        table_h = Emu(int(row_h) * n_rows)
        gframe = slide.shapes.add_table(n_rows, len(headers), Emu(822960), CONTENT_TOP,
                                         Emu(10332720), table_h)
        table = gframe.table
        for ci, htext in enumerate(headers):
            cell = table.cell(0, ci)
            cell.fill.solid()
            cell.fill.fore_color.rgb = _rgb(S.NAVY)
            tf = cell.text_frame
            tf.paragraphs[0].text = htext
            for r in tf.paragraphs[0].runs:
                r.font.bold = True
                r.font.size = Pt(13)
                r.font.color.rgb = _rgb(S.WHITE)
                r.font.name = S.FONT
        ncols = len(headers)
        for ri, row in enumerate(shown):
            row = (list(row) + [''] * ncols)[:ncols]
            for ci, val in enumerate(row):
                cell = table.cell(ri + 1, ci)
                cell.fill.solid()
                cell.fill.fore_color.rgb = _rgb(S.WHITE if ri % 2 == 0 else S.GRAY_TABLE_ALT)
                tf = cell.text_frame
                tf.paragraphs[0].text = str(val)
                for r in tf.paragraphs[0].runs:
                    r.font.size = Pt(12)
                    r.font.name = S.FONT
                    r.font.color.rgb = _rgb(S.GRAY_DARK)
        if note:
            _textbox(slide, Emu(822960), Emu(int(CONTENT_TOP) + int(table_h) + 60000),
                     Emu(10332720), Emu(320040), note, 10, S.GRAY_LABEL, italic=True)
        return slide

    def callout_slide(self, title, kind, text):
        slide = self._new_slide()
        _set_bg(slide, S.WHITE)
        self._content_header(slide, title)
        rect = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Emu(822960), Emu(2286000),
                                       Emu(10332720), Emu(2286000))
        rect.adjustments[0] = 0.06
        _set_fill(rect, S.CALLOUT_FILL[kind.upper()])
        icon = S.CALLOUT_ICON.get(kind.upper(), 'ℹ')
        _oval_icon(slide, Emu(1097280), Emu(2606040), Emu(731520), icon,
                   fill=S.ORANGE, emoji_size=26)
        _textbox(slide, Emu(2057400), Emu(2560320), Emu(8686800), Emu(1737360),
                 f"{S.CALLOUT_LABEL[kind.upper()]}\n{text}", 15, S.GRAY_DARK,
                 anchor=MSO_ANCHOR.MIDDLE)
        return slide

    def closing_slide(self, message, next_label, footer_tag, emoji='\U0001F680'):
        slide = self._new_slide()
        _set_bg(slide, S.NAVY)
        _oval_icon(slide, Emu(5501487), Emu(1508760), Emu(1188720), emoji, emoji_size=42)
        _textbox(slide, Emu(1371600), Emu(3108960), Emu(9418320), Emu(1097280),
                 message, 24, S.WHITE, bold=True, align=PP_ALIGN.CENTER)
        if next_label:
            _textbox(slide, Emu(1371600), Emu(4297680), Emu(9418320), Emu(548640),
                     next_label, 15, S.SLIDE_SUBTITLE_COLOR, align=PP_ALIGN.CENTER)
        _textbox(slide, MARGIN_X, FOOTER_TAG_T, Emu(5486400), Emu(274320),
                 footer_tag, 9, S.GRAY_MED)
        return slide

    def save(self, path):
        self.prs.save(path)
