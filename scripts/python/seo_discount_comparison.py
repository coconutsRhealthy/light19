#!/usr/bin/env python3
"""
Generates seo-discount-comparison.xlsx in the project root.
Compares companies in discounts.json (diski.nl) with SEO content .ts files.

Run from anywhere:
    python3 scripts/seo_discount_comparison.py
"""

import json, os, re
from openpyxl import Workbook
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter

SCRIPT_DIR   = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DISCOUNTS_PATH = os.path.join(PROJECT_ROOT, "src", "app", "data", "discounts.json")
SEO_DIR        = os.path.join(PROJECT_ROOT, "src", "app", "company-codes", "company-seo-content")
OUT_PATH       = os.path.join(PROJECT_ROOT, "seo-discount-comparison.xlsx")


def normalize(name):
    """Strip TLDs, special chars and whitespace so near-identical names compare equal."""
    n = name.lower()
    n = re.sub(r'\.(nl|com|eu|de|be|co|uk|fr|se|dk|no)$', '', n)  # remove TLD suffixes
    n = re.sub(r'[^a-z0-9]', '', n)  # remove all non-alphanumeric characters
    return n


def find_near_matches(seo_companies, discount_companies):
    """Auto-detect pairs that differ only in formatting/TLD but are not exact matches."""
    exact = seo_companies & discount_companies
    seo_only_raw  = seo_companies - exact
    disc_only_raw = discount_companies - exact

    norm_to_disc = {}
    for d in disc_only_raw:
        norm_to_disc.setdefault(normalize(d), []).append(d)

    near_matches = []
    for s in sorted(seo_only_raw):
        matches = norm_to_disc.get(normalize(s), [])
        for d in matches:
            near_matches.append((s, d))

    return near_matches

# ── Styles ─────────────────────────────────────────────────────────────────────
RED_HDR    = PatternFill("solid", fgColor="E74C3C")
RED_ROW    = PatternFill("solid", fgColor="FADBD8")
GREEN_HDR  = PatternFill("solid", fgColor="27AE60")
GREEN_ROW  = PatternFill("solid", fgColor="D5F5E3")
ORANGE_HDR = PatternFill("solid", fgColor="E67E22")
ORANGE_ROW = PatternFill("solid", fgColor="FDEBD0")
BLUE_HDR   = PatternFill("solid", fgColor="2980B9")
BLUE_ROW   = PatternFill("solid", fgColor="D6EAF8")
GRAY_HDR   = PatternFill("solid", fgColor="2C3E50")

WHITE_FONT = Font(name="Arial", bold=True, color="FFFFFF", size=10)
BODY_FONT  = Font(name="Arial", size=10)

thin   = Side(style="thin", color="CCCCCC")
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)

def style_cell(cell, fill=None, font=None, bold=False, align="left"):
    if fill:   cell.fill = fill
    if font:   cell.font = font
    elif bold: cell.font = Font(name="Arial", bold=True, size=10)
    else:      cell.font = BODY_FONT
    cell.border = BORDER
    cell.alignment = Alignment(horizontal=align, vertical="center", wrap_text=False)


def load_data():
    with open(DISCOUNTS_PATH) as f:
        entries = json.load(f)

    discount_companies = set()
    for entry in entries:
        raw  = entry.split(',')[0].strip()
        name = re.sub(r'\s*\(.*?\)', '', raw).strip()
        discount_companies.add(name)

    seo_companies = set()
    for fname in os.listdir(SEO_DIR):
        if fname.endswith('.ts') and fname != 'index.ts':
            seo_companies.add(fname[:-3])

    return discount_companies, seo_companies


def build_xlsx(discount_companies, seo_companies):
    near_matches    = find_near_matches(seo_companies, discount_companies)
    near_match_seo  = {a for a, b in near_matches}
    near_match_disc = {b for a, b in near_matches}

    missing_seo  = sorted(discount_companies - seo_companies - near_match_disc)
    correct_both = sorted(seo_companies & discount_companies)
    seo_only     = sorted(seo_companies - discount_companies - near_match_seo)

    wb = Workbook()
    ws = wb.active
    ws.title = "SEO vs diski.nl"
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "A7"

    # ── Summary ───────────────────────────────────────────────────────────────
    summary = [
        ("Missing in SEO (on diski.nl)", len(missing_seo),  "Companies on diski.nl with no SEO content file"),
        ("Correct in both",              len(correct_both), "Exact name match on both diski.nl and in SEO folder"),
        ("Near matches",                 len(near_matches), "Same company, slightly different naming"),
        ("SEO only (not on diski.nl)",   len(seo_only),     "SEO content exists but no entry on diski.nl"),
    ]

    ws.merge_cells("A1:C1")
    t = ws["A1"]
    t.value     = "SEO Content vs diski.nl — Overview"
    t.fill      = GRAY_HDR
    t.font      = Font(name="Arial", bold=True, color="FFFFFF", size=13)
    t.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 28

    for col, h in enumerate(["Category", "Count", "Description"], start=1):
        c = ws.cell(row=2, column=col, value=h)
        style_cell(c, fill=GRAY_HDR, font=WHITE_FONT, align="center")

    row_fills = [RED_ROW, GREEN_ROW, ORANGE_ROW, BLUE_ROW]
    for i, (label, count, desc) in enumerate(summary):
        r = 3 + i
        c1 = ws.cell(row=r, column=1, value=label)
        c2 = ws.cell(row=r, column=2, value=count)
        c3 = ws.cell(row=r, column=3, value=desc)
        for c in (c1, c2, c3):
            style_cell(c, fill=row_fills[i], bold=True)
        c2.alignment = Alignment(horizontal="center", vertical="center")
        ws.row_dimensions[r].height = 18

    ws.row_dimensions[7].height = 8

    # ── Column headers ────────────────────────────────────────────────────────
    SECTIONS = [
        (1, "Missing in SEO (on diski.nl)", RED_HDR,    RED_ROW,    26),
        (2, "Correct in both",              GREEN_HDR,  GREEN_ROW,  26),
        (3, "Near match — SEO name",        ORANGE_HDR, ORANGE_ROW, 26),
        (4, "Near match — diski.nl name",   ORANGE_HDR, ORANGE_ROW, 26),
        (5, "SEO only (not on diski.nl)",   BLUE_HDR,   BLUE_ROW,   26),
    ]

    HDR_ROW = 7
    for col, label, hfill, _, width in SECTIONS:
        c = ws.cell(row=HDR_ROW, column=col, value=label)
        style_cell(c, fill=hfill, font=WHITE_FONT, align="center")
        ws.column_dimensions[get_column_letter(col)].width = width
    ws.row_dimensions[HDR_ROW].height = 20

    # ── Data rows ─────────────────────────────────────────────────────────────
    max_len = max(len(missing_seo), len(correct_both), len(near_matches), len(seo_only))
    fill_map = {1: RED_ROW, 2: GREEN_ROW, 3: ORANGE_ROW, 4: ORANGE_ROW, 5: BLUE_ROW}

    for i in range(max_len):
        r = HDR_ROW + 1 + i
        values = [
            missing_seo[i]       if i < len(missing_seo)   else "",
            correct_both[i]      if i < len(correct_both)  else "",
            near_matches[i][0]   if i < len(near_matches)  else "",
            near_matches[i][1]   if i < len(near_matches)  else "",
            seo_only[i]          if i < len(seo_only)       else "",
        ]
        for col, val in enumerate(values, start=1):
            c = ws.cell(row=r, column=col, value=val)
            style_cell(c, fill=fill_map[col])
        ws.row_dimensions[r].height = 16

    wb.save(OUT_PATH)
    print(f"Saved: {OUT_PATH}")
    print(f"  Missing in SEO:  {len(missing_seo)}")
    print(f"  Correct in both: {len(correct_both)}")
    print(f"  Near matches:    {len(near_matches)}")
    print(f"  SEO only:        {len(seo_only)}")


if __name__ == "__main__":
    discount_companies, seo_companies = load_data()
    build_xlsx(discount_companies, seo_companies)
