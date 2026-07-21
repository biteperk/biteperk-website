#!/usr/bin/env python3
"""BitePerk visit-pack builder — business cards, follow-up sheet, demo card, stickers.

Matches the visual language of the existing print pack (dark #12161f,
gold #f5c418, Times-Bold headlines, Helvetica body, base-14 fonts).

Outputs (into this folder):
  BitePerk_BusinessCard_90x54_PRINT.pdf        — 90x54mm + 3mm bleed, front/back, for a print shop
  BitePerk_BusinessCards_HomePrint_A4_10up.pdf — A4 duplex (flip LONG edge), 10 cards/sheet
  BitePerk_Followup_NextSteps_A4.pdf           — the "you said yes" leave-behind, A4 single-sided
  BitePerk_Demo_Card_A4.pdf                    — the hand-them-your-phone prop, A4 single-sided
  BitePerk_Sticker_Door_Round90mm_PRINT.pdf    — 90mm circle + 3mm bleed (magenta dashed = cut path)
  BitePerk_Sticker_Counter_70x25mm_PRINT.pdf   — 70x25mm + 3mm bleed
  BitePerk_Stickers_HomePrint_A4.pdf           — 2 door + 4 counter per A4 sticker sheet

Numbers (deliberate — do not "fix"):
  (02) 7501 1140 — Bella's live DEMO line. Print-only; never on the website.
  (02) 5504 1140 — BitePerk office line (Sam). Canonical NAP number.
"""
import os
import qrcode
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas as pdfcanvas

OUT = os.path.dirname(os.path.abspath(__file__))

CHAR = HexColor("#12161f")   # pack background
ELEV = HexColor("#1a1f2b")   # elevated card
GOLD = HexColor("#f5c418")   # brand gold (print-vivid)
WHITE = HexColor("#f7f8fa")
MIST = HexColor("#9aa1ad")
MIST2 = HexColor("#c8ced9")
LINE = HexColor("#2a2f38")
GUIDE = HexColor("#b0b0b0")

DEMO = "(02) 7501 1140"      # Bella demo line — print-only
OFFICE = "(02) 5504 1140"    # office / Sam
EMAIL = "sam@biteperk.com.au"
WEB = "biteperk.com.au"
ADDR = "Level 1, 477 Pitt Street, Haymarket NSW 2000"

SERIF = "Times-Bold"
SANS = "Helvetica"
SANSB = "Helvetica-Bold"
SANSO = "Helvetica-Oblique"

CW, CH = 90 * mm, 54 * mm    # business card trim
BLEED = 3 * mm

# ---- QR (dark modules on gold) --------------------------------------------
_q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2, box_size=10)
_q.add_data("https://biteperk.com.au?utm_source=business-card")
_q.make(fit=True)
_q.make_image(fill_color="#12161f", back_color="#f5c418").save("/tmp/bp_qr_card.png")

_q2 = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2, box_size=10)
_q2.add_data("https://biteperk.com.au?utm_source=followup-sheet")
_q2.make(fit=True)
_q2.make_image(fill_color="#12161f", back_color="#f5c418").save("/tmp/bp_qr_follow.png")

_q3 = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2, box_size=10)
_q3.add_data("https://biteperk.com.au?utm_source=venue-sticker")
_q3.make(fit=True)
_q3.make_image(fill_color="#f5c418", back_color="#12161f").save("/tmp/bp_qr_sticker.png")


# ---- vector logo (from public/favicon.svg + brand lockup) ------------------
GREEN = HexColor("#1a4d1a")

# favicon star polygon, 64x64 viewBox, y-down
_STAR = [(32, 4), (39, 24), (60, 24), (43, 37), (49, 58), (32, 46), (15, 58), (21, 37), (4, 24), (25, 24)]


def draw_mark(c, x, y, size, star_fill=GOLD, fork_fill=GREEN, outline=None):
    """Star-and-fork brand mark. (x, y) = lower-left, size = height/width."""
    s = size / 64.0
    c.saveState()
    c.translate(x, y)
    p = c.beginPath()
    pts = [(px * s, (64 - py) * s) for px, py in _STAR]
    p.moveTo(*pts[0])
    for pt in pts[1:]:
        p.lineTo(*pt)
    p.close()
    c.setFillColor(star_fill)
    if outline:
        c.setStrokeColor(outline)
        c.setLineWidth(max(0.4, 1.5 * s))
        c.drawPath(p, stroke=1, fill=1)
    else:
        c.drawPath(p, stroke=0, fill=1)
    c.setFillColor(fork_fill)
    for tx in (26.8, 30.6, 34.4):  # tines (y-down 17..33)
        c.roundRect(tx * s, (64 - 33) * s, 3 * s, 16 * s, 1.5 * s, stroke=0, fill=1)
    c.roundRect(30 * s, (64 - 52) * s, 4.2 * s, 22 * s, 2.1 * s, stroke=0, fill=1)  # handle
    c.restoreState()


def draw_wordmark(c, x, baseline, size, bite_color, perk_color):
    """Lowercase 'biteperk' lockup: 'bite' upright + 'perk' oblique."""
    c.setFont(SANSB, size)
    c.setFillColor(bite_color)
    c.drawString(x, baseline, "bite")
    c.setFillColor(perk_color)
    c.setFont("Helvetica-BoldOblique", size)
    c.drawString(x + c.stringWidth("bite", SANSB, size), baseline, "perk")
    return x + c.stringWidth("bite", SANSB, size) + c.stringWidth("perk", "Helvetica-BoldOblique", size)


def wrap(c, text, font, size, max_w):
    words, lines, cur = text.split(), [], ""
    for w_ in words:
        t = (cur + " " + w_).strip()
        if c.stringWidth(t, font, size) <= max_w:
            cur = t
        else:
            lines.append(cur)
            cur = w_
    if cur:
        lines.append(cur)
    return lines


# ---- business card faces ---------------------------------------------------
def card_front(c, b):
    """Origin at trim lower-left; b = bleed drawn beyond trim."""
    c.setFillColor(CHAR)
    c.rect(-b, -b, CW + 2 * b, CH + 2 * b, stroke=0, fill=1)

    draw_mark(c, 8 * mm, CH - 15 * mm, 10.5 * mm)
    draw_wordmark(c, 21 * mm, CH - 11.8 * mm, 13, WHITE, GOLD)
    c.setFillColor(MIST)
    c.setFont(SANS, 6.2)
    c.drawRightString(CW - 8 * mm, CH - 11.8 * mm, "AI tools for hospitality")

    c.setStrokeColor(LINE)
    c.setLineWidth(0.5)
    c.line(8 * mm, CH - 17.5 * mm, CW - 8 * mm, CH - 17.5 * mm)

    c.setFillColor(WHITE)
    c.setFont(SERIF, 14.5)
    c.drawString(8 * mm, CH - 25.5 * mm, "Sam Kalaliya")
    c.setFillColor(GOLD)
    c.setFont(SANS, 7.2)
    c.drawString(8 * mm, CH - 30 * mm, "Founder")

    c.setFillColor(MIST2)
    c.setFont(SANS, 7.4)
    c.drawString(8 * mm, 15.5 * mm, f"{OFFICE}   ·   {EMAIL}")
    c.drawString(8 * mm, 11 * mm, WEB)
    c.setFillColor(MIST)
    c.setFont(SANS, 5.4)
    c.drawString(8 * mm, 6.5 * mm, ADDR)

    c.setFillColor(GOLD)
    c.rect(8 * mm, 20.5 * mm, 14 * mm, 0.8 * mm, stroke=0, fill=1)


def card_back(c, b):
    c.setFillColor(GOLD)
    c.rect(-b, -b, CW + 2 * b, CH + 2 * b, stroke=0, fill=1)

    # knockout mark — solid dark star, gold fork, so it reads on the gold side
    draw_mark(c, CW - 8 * mm - 11 * mm, CH - 19 * mm, 11 * mm,
              star_fill=CHAR, fork_fill=GOLD)

    c.setFillColor(CHAR)
    c.setFont(SERIF, 13.5)
    c.drawString(8 * mm, CH - 14 * mm, "Never miss")
    c.drawString(8 * mm, CH - 20.5 * mm, "another booking.")

    c.setFont(SANS, 7.0)
    c.drawString(8 * mm, CH - 27.5 * mm, "Hear Bella, our AI host — call the demo line:")
    c.setFont(SERIF, 15)
    c.drawString(8 * mm, CH - 35.5 * mm, DEMO)
    c.setFont(SANS, 6.0)
    c.drawString(8 * mm, CH - 40.5 * mm, "She answers in under a second, 24/7. Try to trip her up.")

    qs = 16 * mm
    c.drawImage("/tmp/bp_qr_card.png", CW - 8 * mm - qs, 6.5 * mm, qs, qs)

    c.setFont(SANSB, 7.0)
    c.drawString(8 * mm, 10.5 * mm, "PerkTable")
    c.setFont(SANS, 6.0)
    c.drawString(8 * mm, 6.5 * mm, f"by BitePerk · {WEB}")


def build_card_print():
    path = os.path.join(OUT, "BitePerk_BusinessCard_90x54_PRINT.pdf")
    page = (CW + 2 * BLEED, CH + 2 * BLEED)
    c = pdfcanvas.Canvas(path, pagesize=page)
    c.setTitle("BitePerk business card 90x54 (3mm bleed)")
    for face in (card_front, card_back):
        c.saveState()
        c.translate(BLEED, BLEED)
        face(c, BLEED)
        c.restoreState()
        c.showPage()
    c.save()
    print("done:", path)


def build_card_10up():
    """A4 portrait, 2 x 5 cards, shared cut lines. Page 2 backs are mirrored
    horizontally so home duplex (flip on LONG edge) lines up."""
    path = os.path.join(OUT, "BitePerk_BusinessCards_HomePrint_A4_10up.pdf")
    W, H = A4
    cols, rows = 2, 5
    gx = (W - cols * CW) / 2
    gy = (H - rows * CH) / 2
    c = pdfcanvas.Canvas(path, pagesize=A4)
    c.setTitle("BitePerk business cards — A4 10-up, duplex flip on long edge")

    def cut_guides():
        c.setStrokeColor(GUIDE)
        c.setLineWidth(0.3)
        c.setDash(2, 2)
        for i in range(cols + 1):
            x = gx + i * CW
            c.line(x, gy - 4 * mm, x, gy)
            c.line(x, gy + rows * CH, x, gy + rows * CH + 4 * mm)
        for j in range(rows + 1):
            y = gy + j * CH
            c.line(gx - 4 * mm, y, gx, y)
            c.line(gx + cols * CW, y, gx + cols * CW + 4 * mm, y)
        c.setDash()

    def header(txt):
        c.setFillColor(HexColor("#555555"))
        c.setFont(SANS, 6.5)
        c.drawString(gx, H - 8 * mm, txt)

    # page 1 — fronts
    header("BitePerk business cards — FRONTS. Print duplex with page 2, flip on LONG edge, 100% scale, then cut on the dashed guides.")
    for j in range(rows):
        for i in range(cols):
            c.saveState()
            c.translate(gx + i * CW, gy + (rows - 1 - j) * CH)
            p = c.beginPath()
            p.rect(0, 0, CW, CH)
            c.clipPath(p, stroke=0)
            card_front(c, 0)
            c.restoreState()
    cut_guides()
    c.showPage()

    # page 2 — backs, mirrored columns for long-edge duplex
    header("BitePerk business cards — BACKS (mirrored for duplex).")
    for j in range(rows):
        for i in range(cols):
            mi = cols - 1 - i
            c.saveState()
            c.translate(gx + mi * CW, gy + (rows - 1 - j) * CH)
            p = c.beginPath()
            p.rect(0, 0, CW, CH)
            c.clipPath(p, stroke=0)
            card_back(c, 0)
            c.restoreState()
    cut_guides()
    c.showPage()
    c.save()
    print("done:", path)


# ---- stickers --------------------------------------------------------------
MAGENTA = HexColor("#e0219a")   # print-shop cut path
GREY = HexColor("#8a8a8a")      # home-cut guide

DOOR_R = 45 * mm                # 90mm circle trim


def draw_door(c, cx, cy, guide):
    """Door decal, centred at (cx, cy). Everything sits >=3mm inside the cut."""
    c.saveState()
    c.translate(cx, cy)

    # gold ring (inner edge keeps a clear content zone)
    c.setStrokeColor(GOLD)
    c.setLineWidth(2.2 * mm)
    c.circle(0, 0, 41.5 * mm, stroke=1, fill=0)

    # star mark, fully inside the ring
    draw_mark(c, -8.5 * mm, 19.5 * mm, 17 * mm)

    c.setFillColor(GOLD)
    c.setFont(SANSB, 9)
    c.drawCentredString(0, 13 * mm, "O U R   P H O N E   I S")
    c.setFillColor(WHITE)
    c.setFont(SERIF, 20)
    c.drawCentredString(0, 4 * mm, "answered 24/7")
    c.setFillColor(MIST2)
    c.setFont(SANS, 8)
    c.drawCentredString(0, -2 * mm, "by Bella — your AI host")

    qs = 16 * mm
    c.drawImage("/tmp/bp_qr_sticker.png", -qs / 2, -21.5 * mm, qs, qs)

    c.setFillColor(WHITE)
    c.setFont(SANSB, 10)
    c.drawCentredString(0, -27.5 * mm, "PerkTable")
    w = c.stringWidth("by ", SANS, 7) + c.stringWidth("bite", SANSB, 7) + c.stringWidth("perk", "Helvetica-BoldOblique", 7)
    x0 = -w / 2
    c.setFillColor(MIST)
    c.setFont(SANS, 7)
    c.drawString(x0, -32.5 * mm, "by ")
    draw_wordmark(c, x0 + c.stringWidth("by ", SANS, 7), -32.5 * mm, 7, WHITE, GOLD)

    # cut path
    c.setStrokeColor(guide)
    c.setLineWidth(0.35)
    c.setDash(2.2, 2.2)
    c.circle(0, 0, DOOR_R, stroke=1, fill=0)
    c.setDash()
    c.restoreState()


CNT_W, CNT_H = 70 * mm, 25 * mm


def draw_counter(c, x, y, guide):
    """Counter strip, trim lower-left at (x, y)."""
    c.saveState()
    c.translate(x, y)

    draw_mark(c, 4.5 * mm, 5.5 * mm, 14 * mm)

    tx = 20 * mm
    c.setFillColor(WHITE)
    c.setFont(SANSB, 8)
    c.drawString(tx, 16.2 * mm, "Calls answered 24/7")
    c.setFillColor(GOLD)
    c.setFont(SANSB, 8)
    c.drawString(tx, 11.2 * mm, "Powered by PerkTable")
    c.setFillColor(MIST)
    c.setFont(SANS, 5.2)
    c.drawString(tx, 6.4 * mm, "by ")
    xw = draw_wordmark(c, tx + c.stringWidth("by ", SANS, 5.2), 6.4 * mm, 5.2, WHITE, GOLD)
    c.setFillColor(MIST)
    c.setFont(SANS, 5.2)
    c.drawString(xw + 1.6 * mm, 6.4 * mm, "· biteperk.com.au")

    qs = 15 * mm
    c.drawImage("/tmp/bp_qr_sticker.png", CNT_W - qs - 3.5 * mm, (CNT_H - qs) / 2, qs, qs)

    c.setStrokeColor(guide)
    c.setLineWidth(0.35)
    c.setDash(2.2, 2.2)
    c.roundRect(0, 0, CNT_W, CNT_H, 3 * mm, stroke=0, fill=0)
    c.roundRect(0, 0, CNT_W, CNT_H, 3 * mm, stroke=1, fill=0)
    c.setDash()
    c.restoreState()


def build_sticker_door():
    path = os.path.join(OUT, "BitePerk_Sticker_Door_Round90mm_PRINT.pdf")
    side = DOOR_R * 2 + 2 * BLEED
    c = pdfcanvas.Canvas(path, pagesize=(side, side))
    c.setTitle("BitePerk door decal 90mm (3mm bleed, magenta = cut)")
    c.setFillColor(CHAR)
    c.rect(0, 0, side, side, stroke=0, fill=1)
    draw_door(c, side / 2, side / 2, MAGENTA)
    c.showPage()
    c.save()
    print("done:", path)


def build_sticker_counter():
    path = os.path.join(OUT, "BitePerk_Sticker_Counter_70x25mm_PRINT.pdf")
    pw, ph = CNT_W + 2 * BLEED, CNT_H + 2 * BLEED
    c = pdfcanvas.Canvas(path, pagesize=(pw, ph))
    c.setTitle("BitePerk counter sticker 70x25 (3mm bleed, magenta = cut)")
    c.setFillColor(CHAR)
    c.rect(0, 0, pw, ph, stroke=0, fill=1)
    draw_counter(c, BLEED, BLEED, MAGENTA)
    c.showPage()
    c.save()
    print("done:", path)


def build_sticker_sheet():
    path = os.path.join(OUT, "BitePerk_Stickers_HomePrint_A4.pdf")
    W, H = A4
    c = pdfcanvas.Canvas(path, pagesize=A4)
    c.setTitle("BitePerk sticker sheet — A4 adhesive paper")

    c.setFillColor(HexColor("#555555"))
    c.setFont(SANS, 6.5)
    c.drawString(12 * mm, H - 9 * mm,
                 "BitePerk sticker sheet — print on A4 adhesive/sticker paper, colour, 100% scale, then cut on the grey guides.")

    # two door decals (drawn on dark squares so the design survives scissors)
    sq = DOOR_R * 2 + 4 * mm
    gap = 6 * mm
    total = 2 * sq + gap
    x0 = (W - total) / 2
    ytop = H - 14 * mm - sq
    for i in range(2):
        bx = x0 + i * (sq + gap)
        c.setFillColor(CHAR)
        c.rect(bx, ytop, sq, sq, stroke=0, fill=1)
        draw_door(c, bx + sq / 2, ytop + sq / 2, GREY)

    # four counter strips
    cw, chh = CNT_W + 4 * mm, CNT_H + 4 * mm
    gtot = 2 * cw + gap
    cx0 = (W - gtot) / 2
    cy = ytop - 12 * mm - chh
    for j in range(2):
        for i in range(2):
            bx = cx0 + i * (cw + gap)
            by = cy - j * (chh + 6 * mm)
            c.setFillColor(CHAR)
            c.rect(bx, by, cw, chh, stroke=0, fill=1)
            draw_counter(c, bx + 2 * mm, by + 2 * mm, GREY)

    c.setFillColor(HexColor("#555555"))
    c.setFont(SANS, 6.5)
    c.drawString(12 * mm, cy - chh - 14 * mm,
                 "For customer venues only — it's a badge, not an ad. QR links to biteperk.com.au (tagged utm_source=venue-sticker).")
    c.showPage()
    c.save()
    print("done:", path)


# ---- demo card -------------------------------------------------------------
def build_demo_card():
    path = os.path.join(OUT, "BitePerk_Demo_Card_A4.pdf")
    W, H = A4
    M = 18 * mm
    c = pdfcanvas.Canvas(path, pagesize=A4)
    c.setTitle("PerkTable live demo — talk to Bella")

    c.setFillColor(CHAR)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    # header — logo lockup
    y = H - 20 * mm
    draw_mark(c, M, y - 3.5 * mm, 11 * mm)
    draw_wordmark(c, M + 14 * mm, y, 15, WHITE, GOLD)
    c.setFillColor(MIST)
    c.setFont(SANS, 8)
    c.drawRightString(W - M, y, "PerkTable live demo")

    # Bella portrait
    try:
        from PIL import Image, ImageDraw
        _p = Image.open(os.path.join(OUT, "..", "bella.png")).convert("RGB")
        _sq = _p.crop((70, 150, 1010, 1090))
        _mask = Image.new("L", (_sq.width * 3, _sq.height * 3), 0)
        ImageDraw.Draw(_mask).ellipse((0, 0, _mask.width - 1, _mask.height - 1), fill=255)
        _mask = _mask.resize(_sq.size, Image.LANCZOS)
        _rgba = _sq.convert("RGBA")
        _rgba.putalpha(_mask)
        _rgba.save("/tmp/bp_bella_circle.png")
        pr = 17 * mm
        pcx, pcy = W / 2, H - 48 * mm
        c.drawImage("/tmp/bp_bella_circle.png", pcx - pr, pcy - pr, 2 * pr, 2 * pr, mask="auto")
        c.setStrokeColor(GOLD)
        c.setLineWidth(1.2)
        c.circle(pcx, pcy, pr, stroke=1, fill=0)
        y = pcy - pr - 14 * mm
    except Exception:
        y = H - 52 * mm

    c.setFillColor(WHITE)
    c.setFont(SERIF, 29)
    c.drawCentredString(W / 2, y, "Talk to Bella. Right now.")
    y -= 10 * mm
    c.setFillColor(MIST2)
    c.setFont(SANS, 11)
    c.drawCentredString(W / 2, y, "Grab your phone and call our AI host — she'll treat you like a customer.")

    # gold number band
    y -= 9 * mm
    bh = 33 * mm
    c.setFillColor(GOLD)
    c.roundRect(M + 10 * mm, y - bh, W - 2 * M - 20 * mm, bh, 4 * mm, stroke=0, fill=1)
    c.setFillColor(CHAR)
    c.setFont(SERIF, 33)
    c.drawCentredString(W / 2, y - 16 * mm, DEMO)
    c.setFont(SANSB, 9)
    c.drawCentredString(W / 2, y - 26 * mm, "Answers in under a second  ·  available 24/7")
    y -= bh + 15 * mm

    c.setFillColor(WHITE)
    c.setFont(SANSB, 12)
    c.drawString(M, y, "Things to try:")
    y -= 4.5 * mm
    tries = [
        "“Can I book a table for six tonight at 7:30?”",
        "“Do you take group bookings for twenty people?”",
        "“What time do you close on Sundays?”",
        "“Can I change my booking to tomorrow instead?”",
    ]
    row_h = 14.5 * mm
    for t in tries:
        y -= row_h + 4 * mm
        c.setFillColor(ELEV)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        c.roundRect(M, y, W - 2 * M, row_h, 3 * mm, stroke=1, fill=1)
        c.setFillColor(GOLD)
        c.setFont(SANSB, 12)
        c.drawString(M + 6.5 * mm, y + 5.2 * mm, "→")
        c.setFillColor(MIST2)
        c.setFont(SANS, 11.5)
        c.drawString(M + 15 * mm, y + 5.2 * mm, t)

    y -= 14 * mm
    c.setFillColor(MIST2)
    lead = "What just happened?  "
    body = ("Bella took that call exactly the way she'd take your customers' calls — with your "
            "menu, your hours, and your booking rules. Set up for your venue in days, free first week.")
    c.setFont(SANSB, 10)
    c.drawString(M, y, lead)
    first_x = M + c.stringWidth(lead, SANSB, 10)
    c.setFont(SANS, 10)
    words = body.split()
    line, x = "", first_x
    ly = y
    maxw = W - 2 * M
    for w_ in words:
        t = (line + " " + w_).strip()
        if x - M + c.stringWidth(t, SANS, 10) <= maxw:
            line = t
        else:
            c.drawString(x, ly, line)
            line, x, ly = w_, M, ly - 5.4 * mm
    if line:
        c.drawString(x, ly, line)

    ly -= 8 * mm
    c.setFillColor(MIST)
    c.setFont(SANS, 8)
    c.drawCentredString(W / 2, ly, "Australian data residency  ·  Privacy Act compliant  ·  Sydney-based support")

    # footer band
    bh2 = 26 * mm
    c.setFillColor(GOLD)
    c.roundRect(M, 17 * mm, W - 2 * M, bh2, 3.5 * mm, stroke=0, fill=1)
    c.setFillColor(CHAR)
    c.setFont(SANSB, 12)
    c.drawCentredString(W / 2, 17 * mm + bh2 - 10 * mm, "Want Bella answering YOUR phone?")
    c.setFont(SANS, 9.5)
    c.drawCentredString(W / 2, 17 * mm + bh2 - 17.5 * mm,
                        f"Sam  ·  {EMAIL}  ·  {OFFICE}  ·  {WEB}")
    c.showPage()
    c.save()
    print("done:", path)


# ---- follow-up sheet -------------------------------------------------------
def build_followup():
    path = os.path.join(OUT, "BitePerk_Followup_NextSteps_A4.pdf")
    W, H = A4
    M = 16 * mm
    c = pdfcanvas.Canvas(path, pagesize=A4)
    c.setTitle("PerkTable — what happens next")

    c.setFillColor(CHAR)
    c.rect(0, 0, W, H, stroke=0, fill=1)

    y = H - 20 * mm
    draw_mark(c, M, y - 3 * mm, 10 * mm)
    draw_wordmark(c, M + 13 * mm, y, 13.5, WHITE, GOLD)
    c.setFillColor(MIST)
    c.setFont(SANS, 7)
    c.drawRightString(W - M, y, "PerkTable · getting your venue live")

    y -= 16 * mm
    c.setFillColor(WHITE)
    c.setFont(SERIF, 25)
    c.drawString(M, y, "You're in. Here's what")
    c.setFillColor(GOLD)
    c.drawString(M, y - 11.5 * mm, "happens next.")
    y -= 20 * mm
    c.setFillColor(MIST2)
    c.setFont(SANS, 9.5)
    c.drawString(M, y, "Four steps, one short call, and Bella is answering your phone — typically within 48 hours.")

    steps = [
        ("The 15-minute setup call",
         "We go through your menu, hours, seating times and booking rules — and how you'd like Bella to greet your callers."),
        ("We build Bella for your venue",
         "Your menu, your rules, your greeting. We test her before you ever put her on a real call. Typically live within 48 hours."),
        ("A five-minute call forward",
         "You keep your number. Bella takes every call, or only the ones your team can't get to — you choose. No hardware, no apps."),
        ("Your free first week",
         "Bella answers real calls; you watch every booking and transcript live in your dashboard. Keep her only if she earns it."),
    ]
    y -= 13 * mm
    box_h = 24 * mm
    for i, (t, body) in enumerate(steps):
        by = y - i * (box_h + 6 * mm)
        c.setFillColor(ELEV)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        c.roundRect(M, by - box_h, W - 2 * M, box_h, 3 * mm, stroke=1, fill=1)
        c.setFillColor(GOLD)
        c.circle(M + 9.5 * mm, by - box_h / 2, 4.2 * mm, stroke=0, fill=1)
        c.setFillColor(CHAR)
        c.setFont(SANSB, 11)
        c.drawCentredString(M + 9.5 * mm, by - box_h / 2 - 1.4 * mm, str(i + 1))
        tx = M + 18 * mm
        c.setFillColor(GOLD)
        c.setFont(SANSB, 10.5)
        c.drawString(tx, by - 8.5 * mm, t)
        c.setFillColor(MIST2)
        c.setFont(SANS, 8.8)
        ly = by - 14 * mm
        for ln in wrap(c, body, SANS, 8.8, W - tx - M - 6 * mm):
            c.drawString(tx, ly, ln)
            ly -= 4.6 * mm
    y -= len(steps) * (box_h + 6 * mm) + 6 * mm

    # what we need from you
    c.setFillColor(WHITE)
    c.setFont(SERIF, 13.5)
    c.drawString(M, y, "What we need from you (5 minutes, tops)")
    y -= 9.5 * mm
    needs = [
        "Your current menu — a PDF, a link, or even a photo is fine",
        "Opening hours and seating times",
        "Booking rules — biggest group size, sittings, anything Bella must never promise",
        "How you take bookings today (paper diary or system — both work)",
    ]
    c.setFont(SANS, 9)
    for n in needs:
        c.setFillColor(GOLD)
        c.setFont(SANSB, 9)
        c.drawString(M + 2 * mm, y, "✓")
        c.setFillColor(MIST2)
        c.setFont(SANS, 9)
        c.drawString(M + 8 * mm, y, n)
        y -= 7 * mm

    y -= 4 * mm
    c.setFillColor(MIST)
    c.setFont(SANS, 7.5)
    c.drawString(M, y, "The fine print, plainly: flat monthly plan · no per-call fees · month-to-month, cancel anytime · your data exported within 24 hours if you leave.")
    y -= 4.5 * mm
    c.drawString(M, y, "Australian data residency · Privacy Act compliant · Sydney-based support, 7 days.")

    # gold contact band
    band_h = 34 * mm
    c.setFillColor(GOLD)
    c.rect(0, 0, W, band_h, stroke=0, fill=1)
    c.setFillColor(CHAR)
    c.setFont(SERIF, 13)
    c.drawString(M, band_h - 11 * mm, "Questions before the setup call?")
    c.setFont(SANS, 9)
    c.drawString(M, band_h - 17.5 * mm, f"Sam · {EMAIL} · {OFFICE}")
    c.drawString(M, band_h - 23 * mm, f"Show a mate: Bella's demo line is {DEMO} — she'll pick up right now.")
    c.setFont(SANS, 6.4)
    c.drawString(M, band_h - 28.5 * mm, f"BitePerk · {ADDR} · {WEB}")
    qs = 22 * mm
    c.drawImage("/tmp/bp_qr_follow.png", W - M - qs, (band_h - qs) / 2, qs, qs)
    c.setFont(SANS, 5.2)
    c.drawCentredString(W - M - qs / 2, (band_h - qs) / 2 - 3.2 * mm, "biteperk.com.au")

    c.showPage()
    c.save()
    print("done:", path)


build_card_print()
build_card_10up()
build_followup()
build_demo_card()
build_sticker_door()
build_sticker_counter()
build_sticker_sheet()
