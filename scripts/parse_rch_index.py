"""Parse the saved RCH CPG index HTML into a structured JSON list.

Output schema (one object per <li> entry):
    {
      "title":     "Acute asthma",                  # exact link text, with any "(see >> X)" suffix stripped
      "raw_title": "Adolescent gynaecology (see >> Vulval and vaginal conditions)",
      "url":       "https://www.rch.org.au/clinicalguide/guideline_index/Acute_asthma/",
      "is_redirect": False,                          # True if "(see >> X)" was present
      "redirects_to": "Vulval and vaginal conditions" or None,
      "is_pic":    True                              # the red (PIC) badge
    }
"""

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "rch_index_raw.html"
OUT = ROOT / "data" / "rch_guidelines_raw.json"

BASE = "https://www.rch.org.au"

# Only treat URLs under /clinicalguide/guideline_index/ as real guideline entries.
# This filters out footer navigation links (e.g. /pig/, /kidsinfo/, /okee/) that
# share the surrounding HTML structure but are not CPGs.
GUIDELINE_URL_RE = re.compile(r"^/clinicalguide/guideline_index/", re.IGNORECASE)
GUIDELINE_ABS_URL_RE = re.compile(r"^https?://www\.rch\.org\.au/clinicalguide/guideline_index/", re.IGNORECASE)

LI_RE = re.compile(
    r"<li>\s*<a\s+href=['\"]([^'\"]+)['\"][^>]*>(.*?)</a>(.*?)</li>",
    re.IGNORECASE | re.DOTALL,
)
SEE_RE = re.compile(r"\s*\(see\s*>>\s*(.+?)\)\s*$", re.IGNORECASE)
PIC_RE = re.compile(r"\(PIC\)", re.IGNORECASE)


def absolutise(url: str) -> str:
    url = url.strip()
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if url.startswith("/"):
        return BASE + url
    return url


def parse() -> list[dict]:
    raw = SRC.read_text(encoding="utf-8", errors="replace")

    # Restrict parsing to the A-Z tab area to avoid picking up header / footer links.
    start = raw.find("id='tabnav-letter-blocks'")
    if start == -1:
        raise SystemExit("Could not find tab block container in HTML")
    body = raw[start:]

    seen_urls: set[str] = set()
    entries: list[dict] = []

    for m in LI_RE.finditer(body):
        href = m.group(1)
        if not (GUIDELINE_URL_RE.match(href) or GUIDELINE_ABS_URL_RE.match(href)):
            continue
        link_html = m.group(2)
        tail_html = m.group(3)

        # Strip any inner tags from link text, then decode HTML entities.
        link_text = re.sub(r"<[^>]+>", "", link_html)
        link_text = html.unescape(link_text).strip()
        if not link_text:
            continue

        is_redirect = False
        redirects_to: str | None = None
        see_match = SEE_RE.search(link_text)
        if see_match:
            is_redirect = True
            redirects_to = see_match.group(1).strip()
            display_title = link_text[: see_match.start()].rstrip(" -")
        else:
            display_title = link_text

        is_pic = bool(PIC_RE.search(tail_html))
        url = absolutise(href)

        # The "All" tab repeats every guideline; key by (url, raw_title) to dedupe.
        dedupe_key = (url, link_text)
        if dedupe_key in seen_urls:
            continue
        seen_urls.add(dedupe_key)

        entries.append({
            "title": display_title,
            "raw_title": link_text,
            "url": url,
            "is_redirect": is_redirect,
            "redirects_to": redirects_to,
            "is_pic": is_pic,
        })

    return entries


def main() -> None:
    entries = parse()
    OUT.write_text(json.dumps(entries, indent=2, ensure_ascii=False), encoding="utf-8")

    real = [e for e in entries if not e["is_redirect"]]
    redirects = [e for e in entries if e["is_redirect"]]
    unique_real_urls = {e["url"] for e in real}

    print(f"Total <li> entries parsed : {len(entries)}")
    print(f"  Real guidelines          : {len(real)}")
    print(f"  Synonym redirects        : {len(redirects)}")
    print(f"  Unique real URLs         : {len(unique_real_urls)}")
    print(f"  PIC-tagged entries       : {sum(1 for e in entries if e['is_pic'])}")
    print(f"Written to: {OUT}")


if __name__ == "__main__":
    main()
