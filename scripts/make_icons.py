"""Generate app icons (PWA manifest + iOS apple-touch-icon) from a simple
   design: a rounded RCH-red square with a bold white letter R.

   Outputs:
     app/icon-192.png    -> manifest icon (Android/Chrome)
     app/icon-512.png    -> manifest icon (large)
     app/apple-touch-icon.png  -> iOS home screen (180x180)
     app/icon.svg        -> vector source (fallback for browsers that prefer SVG)
"""
from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "app"

RCH_RED = (218, 26, 49, 255)   # #DA1A31
WHITE   = (255, 255, 255, 255)

# Try a few common bold sans-serif fonts on Windows/macOS/Linux, with fallbacks.
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\arialbd.ttf",
    r"C:\Windows\Fonts\segoeuib.ttf",
    r"C:\Windows\Fonts\seguisb.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]

SVG_TEMPLATE = """<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#DA1A31"/>
  <text x="256" y="360" text-anchor="middle" font-family="-apple-system, 'Segoe UI', Arial, sans-serif"
        font-weight="900" font-size="340" fill="#ffffff">R</text>
</svg>
"""

def load_bold_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, ValueError):
            continue
    return ImageFont.load_default()

def render_png(size: int, out: Path) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    radius = int(size * 0.22)  # iOS-ish rounded corners
    draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=RCH_RED)

    # Letter R centred, taking about 60% of the icon height.
    font_size = int(size * 0.68)
    font = load_bold_font(font_size)
    text = "R"

    # Measure and centre. text_bbox returns (x0, y0, x1, y1) of ink.
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (size - text_w) / 2 - bbox[0]
    y = (size - text_h) / 2 - bbox[1]
    draw.text((x, y), text, font=font, fill=WHITE)

    img.save(out, "PNG", optimize=True)
    print(f"wrote {out.relative_to(ROOT)}  ({size}x{size})")

def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    render_png(192, OUT / "icon-192.png")
    render_png(512, OUT / "icon-512.png")
    render_png(180, OUT / "apple-touch-icon.png")
    (OUT / "icon.svg").write_text(SVG_TEMPLATE, encoding="utf-8")
    print(f"wrote {(OUT / 'icon.svg').relative_to(ROOT)}  (SVG source)")

if __name__ == "__main__":
    main()
