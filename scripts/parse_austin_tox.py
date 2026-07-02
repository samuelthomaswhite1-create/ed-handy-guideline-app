"""Parse Austin Health's Clinical Toxicology Guidelines into a title/URL list.

Every guideline is a PDF hosted at austin.org.au/Assets/Files/*.pdf. The site
organises them into 8 alphabetical letter-group pages plus 3 cross-cutting
topic pages plus a Statewide Snakebite Guidelines page. Each toxin/topic is
rendered as:

    <div class="ContentSection">
      <h2>Toxin / Topic name</h2>
      <p><a href="/Assets/Files/xxx.pdf">Clinical Guideline</a></p>
      [optional: additional PDFs for variants / identification / etc.]
    </div>

Rules for the app-side title:
  * anchor text == "Clinical Guideline"           -> title = h2
  * anchor text like "Clinical Guideline (X)"     -> title = "h2 - X"
  * any other anchor text (e.g. "Identification") -> title = "h2 - anchor"

Deduped by absolute URL (the same PDF is often linked from multiple letter
pages, e.g. MAOI appears under both A-B and M-O).

Output: data/austin_guidelines_raw.json
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = DATA / "austin_guidelines_raw.json"

BASE = "https://www.austin.org.au"

# 8 alphabetical letter groups + 3 cross-cutting topics + Snakebite guidelines
PAGE_IDS = {
    1780: "A-B",
    1791: "C-F",
    1792: "G-I",
    1793: "J-L",
    1794: "M-O",
    1795: "P-R",
    1796: "S-U",
    1797: "V-Z",
    1810: "Decontamination",
    1816: "Antidotes / Antivenoms",
    1828: "Enhanced elimination",
    4712: "Statewide Snakebite Guidelines",
}

# Grabs <div class="ContentSection" ...> ... </div> up to the matching FloatClear
# closing div. The pages nest a <div class="FloatClear"></div> at the end of each
# section, so we snip on that boundary.
SECTION_RE = re.compile(
    r'<div class="ContentSection"[^>]*>(.*?)<div class="FloatClear">',
    re.IGNORECASE | re.DOTALL,
)
H2_RE  = re.compile(r'<h[2-4][^>]*>(.*?)</h[2-4]>', re.IGNORECASE | re.DOTALL)
PDF_RE = re.compile(
    r'<a\s+href="(/Assets/Files/[^"]+\.pdf)"[^>]*>(.*?)</a>',
    re.IGNORECASE | re.DOTALL,
)


def strip_tags(s: str) -> str:
    return re.sub(r"<[^>]+>", "", s or "").strip()


def clean(text: str) -> str:
    text = html.unescape(text or "")
    text = strip_tags(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_page(page_id: int, group_label: str) -> list[dict]:
    path = DATA / f"austin_tox_{page_id}.html"
    if not path.exists():
        print(f"  skip: {path.name} not fetched")
        return []

    raw = path.read_text(encoding="utf-8", errors="replace")
    entries: list[dict] = []

    for m in SECTION_RE.finditer(raw):
        section_html = m.group(1)
        h2_m = H2_RE.search(section_html)
        heading = clean(h2_m.group(1)) if h2_m else ""
        if not heading:
            continue

        for a in PDF_RE.finditer(section_html):
            href = a.group(1).strip()
            anchor_text = clean(a.group(2))

            # Build the display title.
            if anchor_text.lower() in ("clinical guideline", "guideline"):
                title = heading
            else:
                paren = re.match(r"^clinical\s+guidelines?\s*\((.+)\)\s*$",
                                  anchor_text, re.IGNORECASE)
                if paren:
                    title = f"{heading} — {paren.group(1).strip()}"
                else:
                    title = f"{heading} — {anchor_text}"

            entries.append({
                "title": title,
                "heading": heading,
                "anchor": anchor_text,
                "url": BASE + href,
                "group": group_label,
                "page_id": page_id,
            })

    return entries


def main() -> None:
    all_entries: list[dict] = []
    per_page_counts: dict[int, int] = {}

    for pid, label in PAGE_IDS.items():
        entries = parse_page(pid, label)
        per_page_counts[pid] = len(entries)
        all_entries.extend(entries)

    # Dedupe by URL, keep the first occurrence (which is usually the primary
    # letter group). Record any additional groups the same PDF appears under.
    seen: dict[str, dict] = {}
    for e in all_entries:
        key = e["url"]
        if key not in seen:
            e = dict(e)
            e["also_in_groups"] = []
            seen[key] = e
        else:
            existing = seen[key]
            if e["group"] not in existing["also_in_groups"] and e["group"] != existing["group"]:
                existing["also_in_groups"].append(e["group"])

    deduped = list(seen.values())
    # Alphabetise by title so the on-app list is browseable.
    deduped.sort(key=lambda x: x["title"].lower())

    OUT.write_text(json.dumps(deduped, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {OUT}")
    print(f"  pages parsed  : {sum(1 for c in per_page_counts.values() if c)}")
    print(f"  raw entries   : {len(all_entries)}")
    print(f"  unique PDFs   : {len(deduped)}")
    for pid, cnt in per_page_counts.items():
        print(f"    {pid} {PAGE_IDS[pid]:30s} : {cnt}")


if __name__ == "__main__":
    main()
