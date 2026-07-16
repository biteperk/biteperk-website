#!/usr/bin/env python3
"""VocoTable A5 double-sided flyer — 'Golden Hour Service'.

Outputs:
  vocotable-flyer-a5.pdf            — trim size (screen / home printing)
  vocotable-flyer-a5-print.pdf      — 3mm bleed + crop marks (commercial print)
"""
import qrcode
from reportlab.lib.pagesizes import A5
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas as pdfcanvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image, ImageDraw

FONTS = "/sessions/dreamy-kind-fermi/mnt/.claude/skills/canvas-design/canvas-fonts"
OUTDIR = "/sessions/dreamy-kind-fermi/mnt/outputs"

pdfmetrics.registerFont(TTFont("Gloock", f"{FONTS}/Gloock-Regular.ttf"))
pdfmetrics.registerFont(TTFont("Sans", f"{FONTS}/InstrumentSans-Regular.ttf"))
pdfmetrics.registerFont(TTFont("SansB", f"{FONTS}/InstrumentSans-Bold.ttf"))
pdfmetrics.registerFont(TTFont("SansI", f"{FONTS}/InstrumentSans-Italic.ttf"))
pdfmetrics.registerFont(TTFont("Mono", f"{FONTS}/GeistMono-Regular.ttf"))
pdfmetrics.registerFont(TTFont("MonoB", f"{FONTS}/GeistMono-Bold.ttf"))

CHAR = HexColor("#111317")
ELEV = HexColor("#191d24")
GOLD = HexColor("#f5c418")
GREEN = HexColor("#6ee7a8")
WHITE = HexColor("#f7f8fa")
MIST = HexColor("#9aa1ad")
MIST2 = HexColor("#c8ced9")
LINE = HexColor("#2a2f38")

W, H = A5
M = 13 * mm

# ---- assets ---------------------------------------------------------------
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=2, box_size=10)
qr.add_data("https://vocotable.biteperk.com.au/?utm_source=flyer&utm_medium=print")
qr.make(fit=True)
qr.make_image(fill_color="#111317", back_color="#f5c418").save("/tmp/qr_gold.png")

_p = Image.open("/sessions/dreamy-kind-fermi/mnt/biteperk-website/marketing/bella.png").convert("RGB")
_sq = _p.crop((70, 150, 1010, 1090))
_mask = Image.new("L", (_sq.width * 3, _sq.height * 3), 0)
ImageDraw.Draw(_mask).ellipse((0, 0, _mask.width - 1, _mask.height - 1), fill=255)
_mask = _mask.resize(_sq.size, Image.LANCZOS)
_rgba = _sq.convert("RGBA")
_rgba.putalpha(_mask)
_rgba.save("/tmp/bella_circle.png")

c = None  # current canvas (set in render)


def fit(text, font, size, max_w):
    while c.stringWidth(text, font, size) > max_w and size > 5:
        size -= 0.25
    return size


def wrap(text, font, size, max_w):
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


def dotline(x0, x1, y, color=LINE, r=0.55, gap=3.2 * mm):
    c.setFillColor(color)
    x = x0
    while x <= x1:
        c.circle(x, y, r, stroke=0, fill=1)
        x += gap


def draw_front(bleed):
    b = bleed
    c.setFillColor(CHAR)
    c.rect(-b, -b, W + 2 * b, H + 2 * b, stroke=0, fill=1)

    y = H - 15 * mm
    c.setFont("Mono", 6.4)
    c.setFillColor(MIST)
    c.drawString(M, y, "BITEPERK  ·  FOR SYDNEY RESTAURANTS")
    c.setFillColor(GREEN)
    c.circle(W - M - 1.2 * mm, y + 1.0 * mm, 1.0 * mm, stroke=0, fill=1)
    c.setFillColor(MIST)
    c.drawRightString(W - M - 4 * mm, y, "LIVE NOW")
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(M, y - 3.5 * mm, W - M, y - 3.5 * mm)

    # wordmark
    y -= 15 * mm
    c.setFont("SansB", 19)
    c.setFillColor(WHITE)
    c.drawString(M, y, "Voco")
    c.setFillColor(GOLD)
    c.drawString(M + c.stringWidth("Voco", "SansB", 19), y, "Table")
    c.setFont("Sans", 8.2)
    c.setFillColor(MIST)
    c.drawString(M, y - 5.2 * mm, "The AI phone host for restaurants")

    # Bella portrait
    pr = 13 * mm
    pcx, pcy = W - M - pr, H - 33 * mm
    c.saveState()
    c.setStrokeAlpha(0.3)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.4)
    c.circle(pcx, pcy, pr + 2.6 * mm, stroke=1, fill=0)
    c.restoreState()
    c.drawImage("/tmp/bella_circle.png", pcx - pr, pcy - pr, 2 * pr, 2 * pr, mask="auto")
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.0)
    c.circle(pcx, pcy, pr, stroke=1, fill=0)
    c.setFont("Mono", 5.4)
    c.setFillColor(MIST)
    c.drawCentredString(pcx, pcy - pr - 4.6 * mm, "MEET BELLA")

    # headline
    y -= 26 * mm
    hs = fit("another booking.", "Gloock", 33, W - 2 * M)
    c.setFont("Gloock", hs)
    c.setFillColor(WHITE)
    c.drawString(M, y, "Never miss")
    c.setFillColor(GOLD)
    c.drawString(M, y - hs * 1.12, "another booking.")

    # sub
    y -= hs * 1.12 + 11 * mm
    c.setFillColor(MIST2)
    c.setFont("Sans", 10)
    for ln in wrap("Bella answers every call in a warm Australian voice and books the "
                   "table straight into your diary — even when every line is busy and "
                   "Friday service is flat out.", "Sans", 10, W - 2 * M - 6 * mm):
        c.drawString(M, y, ln)
        y -= 5.4 * mm

    # stat chips
    y -= 6 * mm
    chip_w, chip_h, gap = (W - 2 * M - 2 * 4 * mm) / 3, 21 * mm, 4 * mm
    stats = [("24/7", "EVERY CALL ANSWERED"), ("<1 SEC", "TO PICK UP, NO HOLD"), ("48 HRS", "FROM SIGN-UP TO LIVE")]
    for i, (v, l) in enumerate(stats):
        x = M + i * (chip_w + gap)
        c.setFillColor(ELEV)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.6)
        c.roundRect(x, y - chip_h, chip_w, chip_h, 2.4 * mm, stroke=1, fill=1)
        c.setFillColor(GOLD)
        c.setFont("MonoB", 14.5)
        c.drawCentredString(x + chip_w / 2, y - 9 * mm, v)
        c.setFillColor(MIST)
        c.setFont("Mono", 5.1)
        c.drawCentredString(x + chip_w / 2, y - 15.6 * mm, l)

    # testimonial
    y -= chip_h + 12 * mm
    dotline(M, W - M, y + 5 * mm)
    c.setFillColor(GOLD)
    c.setFont("Gloock", 20)
    c.drawString(M, y - 6 * mm, "“")
    c.setFillColor(MIST2)
    c.setFont("SansI", 9.4)
    ty = y - 6 * mm
    for ln in wrap("Bella picks up every single call — the bookings just appear on our "
                   "screen. It paid for itself in the first week.", "SansI", 9.4, W - 2 * M - 10 * mm):
        c.drawString(M + 7 * mm, ty, ln)
        ty -= 5.1 * mm
    c.setFont("Mono", 6.2)
    c.setFillColor(MIST)
    c.drawString(M + 7 * mm, ty - 1.2 * mm, "NATALIA  ·  OWNER, NATALIA’S BISTRO, SYDNEY")

    # CTA band
    band_h = 50 * mm
    c.setFillColor(GOLD)
    c.rect(-b, -b, W + 2 * b, band_h + b, stroke=0, fill=1)
    qs = 33 * mm
    qx, qy = M, (band_h - qs) / 2 + 1.5 * mm
    c.drawImage("/tmp/qr_gold.png", qx, qy, qs, qs)
    c.setFillColor(CHAR)
    c.setFont("Mono", 5.4)
    c.drawCentredString(qx + qs / 2, qy - 3.6 * mm, "SCAN TO START")
    tx = qx + qs + 8 * mm
    c.setFillColor(CHAR)
    c.setFont("Gloock", fit("Start your free week", "Gloock", 19.5, W - tx - M))
    c.drawString(tx, band_h - 14.5 * mm, "Start your free week")
    c.setFont("Sans", 8.6)
    c.drawString(tx, band_h - 20.5 * mm, "Scan the code — hear Bella, sign up in minutes,")
    c.drawString(tx, band_h - 25.3 * mm, "and be live within 48 hours.")
    c.setFont("MonoB", 8.0)
    c.drawString(tx, band_h - 32.5 * mm, "vocotable.biteperk.com.au")
    c.setFont("Mono", 7.6)
    c.drawString(tx, band_h - 38 * mm, "or call +61 2 5504 1140")
    c.setFont("Mono", 5.8)
    c.drawString(tx, band_h - 44 * mm, "MONTH-TO-MONTH  ·  NO LOCK-IN  ·  CANCEL ANYTIME")


def draw_back(bleed):
    b = bleed
    c.setFillColor(CHAR)
    c.rect(-b, -b, W + 2 * b, H + 2 * b, stroke=0, fill=1)

    y = H - 15 * mm
    c.setFont("Mono", 6.4)
    c.setFillColor(MIST)
    c.drawString(M, y, "VOCOTABLE  ·  HOW IT WORKS")
    c.setFillColor(GOLD)
    c.drawRightString(W - M, y, "NO HARDWARE  ·  NO APPS")
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(M, y - 3.5 * mm, W - M, y - 3.5 * mm)

    y -= 14 * mm
    steps = [
        ("Forward your line", "Five minutes with your phone provider. You keep your number — nothing to install, nothing for staff to learn."),
        ("Bella answers, 24/7", "Warm Australian voice, tuned for local suburb names. Bookings land in your diary against real availability — no double-bookings."),
        ("You run the floor", "Transcripts, call recordings and no-show tracking in your dashboard. If Bella isn’t sure, she takes a message and flags your team."),
    ]
    for i, (t, bd) in enumerate(steps):
        c.setStrokeColor(GOLD)
        c.setLineWidth(0.7)
        c.circle(M + 4 * mm, y - 1 * mm, 4 * mm, stroke=1, fill=0)
        c.setFillColor(GOLD)
        c.setFont("Mono", 8.5)
        c.drawCentredString(M + 4 * mm, y - 2.1 * mm, str(i + 1))
        tx = M + 12.5 * mm
        c.setFillColor(WHITE)
        c.setFont("SansB", 11)
        c.drawString(tx, y, t)
        c.setFillColor(MIST2)
        c.setFont("Sans", 8.4)
        by = y - 5.4 * mm
        for ln in wrap(bd, "Sans", 8.4, W - tx - M):
            c.drawString(tx, by, ln)
            by -= 4.6 * mm
        y = by - 6.5 * mm

    dotline(M, W - M, y + 2 * mm)
    y -= 7 * mm
    c.setFont("Mono", 6.4)
    c.setFillColor(MIST)
    c.drawString(M, y, "WHAT YOU GET")
    y -= 8 * mm
    feats = [
        ("Unlimited inbound calls", "Every line, every time — no hold music, no menus."),
        ("Live bookings, no clashes", "Straight into your diary against real availability."),
        ("Local Australian voice", "Not an overseas call centre. Suburbs spelt right."),
        ("Privacy-first by design", "Australian data residency. Privacy Act compliant."),
    ]
    col_w = (W - 2 * M - 6 * mm) / 2
    row_h = 17 * mm
    for i, (t, bd) in enumerate(feats):
        x = M + (i % 2) * (col_w + 6 * mm)
        yy = y - (i // 2) * row_h
        c.setFillColor(GOLD)
        c.rect(x, yy - 9.5 * mm, 0.9 * mm, 11.5 * mm, stroke=0, fill=1)
        c.setFillColor(WHITE)
        c.setFont("SansB", fit(t, "SansB", 9.3, col_w - 4 * mm))
        c.drawString(x + 3.4 * mm, yy, t)
        c.setFillColor(MIST)
        c.setFont("Sans", 7.2)
        by = yy - 4.4 * mm
        for ln in wrap(bd, "Sans", 7.2, col_w - 4 * mm):
            c.drawString(x + 3.4 * mm, by, ln)
            by -= 3.9 * mm
    y -= 2 * row_h + 3 * mm

    pb_h = 30 * mm
    c.setFillColor(ELEV)
    c.setStrokeColor(GOLD)
    c.setLineWidth(0.8)
    c.roundRect(M, y - pb_h, W - 2 * M, pb_h, 3 * mm, stroke=1, fill=1)
    px = M + 8 * mm
    c.setFillColor(GOLD)
    c.setFont("MonoB", 16)
    c.drawString(px, y - 12 * mm, "FREE")
    c.drawString(px, y - 18.5 * mm, "WEEK")
    c.setFillColor(MIST)
    c.setFont("Mono", 6.0)
    c.drawString(px, y - 23.5 * mm, "ON US, TO START")
    lx = M + 52 * mm
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(lx - 5 * mm, y - pb_h + 5 * mm, lx - 5 * mm, y - 5 * mm)
    bullets = ["Try Bella on your real calls, no obligation",
               "Simple monthly plans to suit every venue",
               "Month-to-month, and live in 48 hours"]
    byy = y - 8.5 * mm
    for bl in bullets:
        c.setFillColor(GOLD)
        c.circle(lx + 1 * mm, byy + 1 * mm, 0.8 * mm, stroke=0, fill=1)
        c.setFillColor(MIST2)
        c.setFont("Sans", fit(bl, "Sans", 8.2, W - M - lx - 8 * mm))
        c.drawString(lx + 4 * mm, byy, bl)
        byy -= 7 * mm

    fy = 26 * mm
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(M, fy, W - M, fy)
    qs2 = 17 * mm
    c.drawImage("/tmp/qr_gold.png", W - M - qs2, fy - 4 * mm - qs2, qs2, qs2)
    c.setFont("Mono", 5.2)
    c.setFillColor(MIST)
    c.drawCentredString(W - M - qs2 / 2, fy - 6.5 * mm - qs2, "FREE WEEK")
    c.setFillColor(WHITE)
    c.setFont("SansB", 9.5)
    c.drawString(M, fy - 7.5 * mm, "Voco")
    c.setFillColor(GOLD)
    c.drawString(M + c.stringWidth("Voco", "SansB", 9.5), fy - 7.5 * mm, "Table")
    c.setFillColor(MIST2)
    c.setFont("Mono", 7.2)
    c.drawString(M, fy - 13 * mm, "+61 2 5504 1140   ·   hello@biteperk.com.au")
    c.drawString(M, fy - 17.8 * mm, "vocotable.biteperk.com.au")
    c.setFillColor(MIST)
    c.setFont("Mono", 5.8)
    c.drawString(M, fy - 22.5 * mm, "BITEPERK  ·  LEVEL 1, 477 PITT ST, HAYMARKET NSW 2000  ·  MADE IN SYDNEY")


def crop_marks(pad, bleed):
    """Trim marks in the pad zone, clear of the bleed."""
    c.setStrokeColor(HexColor("#000000"))
    c.setLineWidth(0.3)
    off = pad + bleed  # translate origin = trim origin
    ml, gap = 4 * mm, bleed + 1 * mm
    for tx, ty, dx, dy in [(0, 0, -1, -1), (W, 0, 1, -1), (0, H, -1, 1), (W, H, 1, 1)]:
        c.line(tx + dx * gap, ty, tx + dx * (gap + ml), ty)
        c.line(tx, ty + dy * gap, tx, ty + dy * (gap + ml))


def render(path, bleed=0, marks=False):
    global c
    pad = 6 * mm if marks else 0
    page = (W + 2 * (bleed + pad), H + 2 * (bleed + pad))
    c = pdfcanvas.Canvas(path, pagesize=page)
    c.setTitle("VocoTable — Never miss another booking")
    for draw in (draw_front, draw_back):
        c.saveState()
        c.translate(bleed + pad, bleed + pad)
        draw(bleed)
        if marks:
            crop_marks(pad, bleed)
        c.restoreState()
        c.showPage()
    c.save()
    print("done:", path)


render(f"{OUTDIR}/vocotable-flyer-a5.pdf")
render(f"{OUTDIR}/vocotable-flyer-a5-print.pdf", bleed=3 * mm, marks=True)
