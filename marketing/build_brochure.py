#!/usr/bin/env python3
"""VoxTable A5 brochure — 'Never miss another booking.'

Professional brand build (Jul 2026): real biteperk logo (transparent versions
derived from biteperk-logo.jpeg at build time), Gloock / Instrument Sans /
Geist Mono from ./fonts, palette sampled from the logo (gold #f8b406,
deep green #0f4f35) on charcoal.

Outputs:
  BitePerk_VoxTable_Brochure_A5.pdf              — A5 + 3mm bleed, 2pp, print shop
  print/BitePerk_Brochure_HomePrint_A4_2up.pdf   — A4 landscape 2-up imposition (200dpi)

Assets: brochure-photo.jpg (front cover), biteperk-logo.jpeg, fonts/.

Numbers (deliberate — do not "fix"):
  (02) 7501 1140 — Bella demo line, print-only. (02) 5504 1140 — office/Sam.
"""
import os
import subprocess
import tempfile
import qrcode
from PIL import Image
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))

CHAR = HexColor("#12161f")
ELEV = HexColor("#1a1f2b")
GOLD = HexColor("#f8b406")
GREEN = HexColor("#0f4f35")
GOLDDK = HexColor("#3d3411")
WHITE = HexColor("#f7f8fa")
MIST = HexColor("#9aa1ad")
MIST2 = HexColor("#c8ced9")
LINE = HexColor("#2a2f38")

DEMO = "(02) 7501 1140"
OFFICE = "(02) 5504 1140"
EMAIL = "sam@biteperk.com.au"
WEB = "biteperk.com.au"
ADDR = "Level 1/457-459 Elizabeth Street, Surry Hills NSW 2010"

W, H = 148 * mm, 210 * mm    # A5 trim
B = 3 * mm                   # bleed
M = 13 * mm

FONTDIR = os.path.join(HERE, "fonts")
pdfmetrics.registerFont(TTFont("Gloock", os.path.join(FONTDIR, "Gloock-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Sans", os.path.join(FONTDIR, "InstrumentSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("SansB", os.path.join(FONTDIR, "InstrumentSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("SansI", os.path.join(FONTDIR, "InstrumentSans-Italic.ttf")))
pdfmetrics.registerFont(TTFont("Mono", os.path.join(FONTDIR, "GeistMono-Regular.ttf")))
pdfmetrics.registerFont(TTFont("MonoB", os.path.join(FONTDIR, "GeistMono-Bold.ttf")))

# ---- logo (black matte lifted from the JPEG) --------------------------------
_GOLD_RGB, _GREEN_RGB = (248, 180, 6), (15, 79, 53)


def _prep_logo():
    src = Image.open(os.path.join(HERE, "biteperk-logo.jpeg")).convert("RGB")
    px = src.load()
    out = Image.new("RGBA", src.size)
    po = out.load()
    lo, hi = 20.0, 90.0
    for yy in range(src.height):
        for xx in range(src.width):
            r, g, b = px[xx, yy]
            l = max(r, g, b)
            a = 0.0 if l <= lo else (1.0 if l >= hi else (l - lo) / (hi - lo))
            if a > 0.02:
                po[xx, yy] = (min(255, int(r / a)), min(255, int(g / a)), min(255, int(b / a)), int(a * 255))
            else:
                po[xx, yy] = (0, 0, 0, 0)
    bbox = out.getbbox()
    lockup = out.crop(bbox)
    lockup.save("/tmp/bpb_lockup.png")
    return lockup.width / lockup.height


LOCKUP_AR = _prep_logo()


def draw_lockup(c, x, y, h):
    w = h * LOCKUP_AR
    c.drawImage("/tmp/bpb_lockup.png", x, y, w, h, mask="auto")
    return w


def draw_tick(c, x, y, s, color):
    c.saveState()
    c.setStrokeColor(color)
    c.setLineWidth(0.28 * s)
    c.setLineCap(1)
    c.line(x, y + 0.32 * s, x + 0.3 * s, y + 0.04 * s)
    c.line(x + 0.3 * s, y + 0.04 * s, x + 0.82 * s, y + 0.72 * s)
    c.restoreState()


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


def fit(c, text, font, size, max_w):
    while c.stringWidth(text, font, size) > max_w and size > 5:
        size -= 0.25
    return size


# ---- QR (green modules on gold, for the gold contact band) ------------------
_q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2, box_size=10)
_q.add_data("https://biteperk.com.au?utm_source=brochure")
_q.make(fit=True)
_q.make_image(fill_color="#0f4f35", back_color="#f8b406").save("/tmp/bpb_qr.png")

PHOTO = ImageReader(os.path.join(HERE, "brochure-photo.jpg"))


# ---- front ------------------------------------------------------------------
def draw_front(c, b):
    # full-bleed photo (1240x1760 = exactly A5 ratio), charcoal wash for legibility
    c.drawImage(PHOTO, -b, -b, W + 2 * b, H + 2 * b)
    c.saveState()
    c.setFillColor(CHAR)
    c.setFillAlpha(0.66)
    c.rect(-b, -b, W + 2 * b, H + 2 * b, stroke=0, fill=1)
    c.restoreState()

    draw_lockup(c, M, H - 21 * mm, 8 * mm)

    c.setFillColor(GOLD)
    c.setFont(MonoB := "MonoB", 9)
    c.drawString(M, H - 34 * mm, "V O X T A B L E")

    c.setFillColor(WHITE)
    c.setFont("Gloock", 25)
    c.drawString(M, H - 45.5 * mm, "Never miss")
    c.setFillColor(GOLD)
    c.drawString(M, H - 56 * mm, "another booking.")

    c.setFillColor(MIST2)
    c.setFont("Sans", 9.4)
    body = ("Bella, our AI phone host, answers every call to your restaurant "
            "in a warm Australian voice — and books the table. 24/7.")
    ly = H - 66 * mm
    for ln in wrap(c, body, "Sans", 9.4, W - 2 * M):
        c.drawString(M, ly, ln)
        ly -= 5.2 * mm

    ticks = ["24/7 answering", "Picks up in <1 second", "Books straight to your diary"]
    ty = ly - 6 * mm
    for t in ticks:
        draw_tick(c, M, ty, 9.5, GOLD)
        c.setFillColor(WHITE)
        c.setFont("Sans", 9.5)
        c.drawString(M + 6.5 * mm, ty, t)
        ty -= 7.2 * mm

    # gold call-to-action band
    bh = 34 * mm
    by = 27 * mm
    c.setFillColor(GOLD)
    c.roundRect(M, by, W - 2 * M, bh, 3.5 * mm, stroke=0, fill=1)
    c.setFillColor(GREEN)
    c.setFont("SansB", 10.5)
    c.drawCentredString(W / 2, by + bh - 9.5 * mm, "Hear her yourself — call Bella now")
    s = fit(c, DEMO, "Gloock", 23, W - 2 * M - 16 * mm)
    c.setFont("Gloock", s)
    c.drawCentredString(W / 2, by + bh - 21.5 * mm, DEMO)
    c.setFillColor(GOLDDK)
    c.setFont("MonoB", 6.6)
    c.drawCentredString(W / 2, by + 5 * mm, "ANSWERS IN UNDER A SECOND  ·  AVAILABLE 24/7")

    c.setFillColor(MIST)
    c.setFont("Mono", 6.2)
    c.drawCentredString(W / 2, 16 * mm, "MADE IN SYDNEY  ·  FREE FIRST WEEK  ·  BITEPERK.COM.AU")


# ---- back -------------------------------------------------------------------
def draw_back(c, b):
    c.setFillColor(CHAR)
    c.rect(-b, -b, W + 2 * b, H + 2 * b, stroke=0, fill=1)

    c.setFillColor(GOLD)
    c.setFont("MonoB", 7.5)
    c.drawString(M, H - 16.5 * mm, "V O X T A B L E")
    c.setFillColor(WHITE)
    c.setFont("Gloock", 19)
    c.drawString(M, H - 25.5 * mm, "How it works")
    draw_lockup(c, W - M - 6.5 * mm * 3.345, H - 24 * mm, 6.5 * mm)

    steps = [
        ("Keep your number",
         "Customers call you exactly as they do today — or add a dedicated booking line."),
        ("Bella answers",
         "Books the table, answers questions, or takes a message. She never guesses."),
        ("You see everything",
         "Bookings and transcripts appear live in your dashboard. You stay in control."),
    ]
    box_h = 20 * mm
    gap = 5 * mm
    y0 = H - 33 * mm
    for i, (t, body) in enumerate(steps):
        top = y0 - i * (box_h + gap)
        c.setFillColor(ELEV)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        c.roundRect(M, top - box_h, W - 2 * M, box_h, 2.5 * mm, stroke=1, fill=1)
        c.setFillColor(GOLD)
        c.circle(M + 8.5 * mm, top - box_h / 2, 3.8 * mm, stroke=0, fill=1)
        c.setFillColor(GREEN)
        c.setFont("SansB", 10.5)
        c.drawCentredString(M + 8.5 * mm, top - box_h / 2 - 1.3 * mm, str(i + 1))
        tx = M + 16 * mm
        c.setFillColor(GOLD)
        c.setFont("SansB", 9.8)
        c.drawString(tx, top - 7.5 * mm, t)
        c.setFillColor(MIST2)
        c.setFont("Sans", 8.4)
        ly = top - 12.5 * mm
        for ln in wrap(c, body, "Sans", 8.4, W - tx - M - 5 * mm):
            c.drawString(tx, ly, ln)
            ly -= 4.4 * mm

    y = y0 - 3 * (box_h + gap) - 3 * mm

    # "your way" box
    sb_h = 16 * mm
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.9)
    c.roundRect(M, y - sb_h, W - 2 * M, sb_h, 2.5 * mm, stroke=1, fill=0)
    c.setFillColor(GOLD)
    c.setFont("SansB", 9.5)
    c.drawString(M + 6 * mm, y - 6.5 * mm, "Set it up your way")
    c.setFillColor(MIST2)
    c.setFont("Sans", 8.2)
    c.drawString(M + 6 * mm, y - 11.8 * mm,
                 "Every call or just the missed ones · your number or a new one · your greeting, your rules.")
    y -= sb_h + 9 * mm

    # compliance ticks 2x2
    items = ["Australian data residency", "Privacy Act compliant",
             "Sydney-based support, 7 days", "No lock-in — month to month"]
    colx = [M, W / 2 + 2 * mm]
    for i, t in enumerate(items):
        cx = colx[i % 2]
        cy = y - (i // 2) * 7.2 * mm
        draw_tick(c, cx, cy, 8.5, HexColor("#2f7a55"))
        c.setFillColor(MIST2)
        c.setFont("Sans", 8.3)
        c.drawString(cx + 5.8 * mm, cy, t)
    y -= 2 * 7.2 * mm + 3 * mm

    c.setFillColor(GOLD)
    c.setFont("SansI", 8.8)
    c.drawCentredString(W / 2, y, "Simple flat monthly plan — free first week, no per-call fees.")

    # gold contact band (full bleed)
    bh = 37 * mm
    c.setFillColor(GOLD)
    c.rect(-b, -b, W + 2 * b, bh + b, stroke=0, fill=1)
    c.setFillColor(GREEN)
    c.setFont("Gloock", 13.5)
    c.drawString(M, bh - 11 * mm, "Talk to Sam")
    c.setFillColor(GOLDDK)
    c.setFont("Sans", 8.6)
    c.drawString(M, bh - 17 * mm, f"{EMAIL}   ·   {OFFICE}")
    c.setFillColor(GREEN)
    c.setFont("SansB", 8.6)
    c.drawString(M, bh - 22.5 * mm, WEB)
    c.setFillColor(GOLDDK)
    c.setFont("Sans", 5.7)
    c.drawString(M, bh - 29 * mm, f"VoxTable is a BitePerk product · {ADDR}")

    qs = 21 * mm
    c.drawImage("/tmp/bpb_qr.png", W - M - qs, bh - 8 * mm - qs, qs, qs)
    c.setFillColor(GOLDDK)
    c.setFont("Mono", 4.8)
    c.drawCentredString(W - M - qs / 2, bh - 10.8 * mm - qs, "SCAN TO LEARN MORE")


def render(path, bleed):
    c = pdfcanvas.Canvas(path, pagesize=(W + 2 * bleed, H + 2 * bleed))
    c.setTitle("VoxTable — Never miss another booking (A5 brochure)")
    for face in (draw_front, draw_back):
        c.saveState()
        c.translate(bleed, bleed)
        face(c, bleed)
        c.restoreState()
        c.showPage()
    c.save()
    print("done:", path)


def build_homeprint_2up(src_trim_pdf):
    """Rasterise the trim brochure at 200dpi and impose 2-up on A4 landscape."""
    from reportlab.lib.pagesizes import A4, landscape
    out = os.path.join(HERE, "print", "BitePerk_Brochure_HomePrint_A4_2up.pdf")
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(["pdftoppm", "-png", "-r", "200", src_trim_pdf,
                        os.path.join(td, "p")], check=True)
        pages = sorted(os.listdir(td))
        PW, PH = landscape(A4)
        c = pdfcanvas.Canvas(out, pagesize=(PW, PH))
        c.setTitle("BitePerk VoxTable Brochure - Home Print A4 2-up")
        scale = 0.96
        pw, ph = (PW / 2) * scale, PH * scale
        for pg in pages:
            img = ImageReader(os.path.join(td, pg))
            for i in (0, 1):
                c.drawImage(img, i * (PW / 2) + (PW / 2 - pw) / 2, (PH - ph) / 2, pw, ph)
            c.setStrokeColor(HexColor("#999999"))
            c.setDash(4, 4)
            c.setLineWidth(0.6)
            c.line(PW / 2, 6, PW / 2, PH - 6)
            c.showPage()
        c.save()
    print("done:", out)


if __name__ == "__main__":
    render(os.path.join(HERE, "BitePerk_VoxTable_Brochure_A5.pdf"), B)
    trim = "/tmp/bpb_trim.pdf"
    render(trim, 0)
    build_homeprint_2up(trim)
