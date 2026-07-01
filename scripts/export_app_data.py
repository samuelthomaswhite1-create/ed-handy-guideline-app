"""Build the single JSON file the web app consumes.

Combines:
  - The 19-category taxonomy with display labels and accent colours
  - All 288 real guidelines with categories + synonyms
  - Provenance metadata so the app can show "data fetched on YYYY-MM-DD"

Output:
  app/data/app_data.json
"""

from __future__ import annotations

import datetime as dt
import json
import re
from collections import defaultdict
from pathlib import Path

# Import CATEGORIES so this stays the single source of truth
import sys
sys.path.insert(0, str(Path(__file__).parent))
from categorise_guidelines import CATEGORIES  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC_RAW = ROOT / "data" / "rch_guidelines_raw.json"
SRC_CAT = ROOT / "data" / "categories_proposed.json"
OUT = ROOT / "app" / "data" / "app_data.json"

# Distinctive accent colours - clinical/muted, not Bootstrap-default.
# Each is paired with a simple lucide-style stroke icon name (inline SVG kept
# in the front-end). Icon name is a hint; the app maps it to an inline SVG.
CATEGORY_META = {
    "resus-collapse":       {"colour": "#c0392b", "icon": "activity"},      # red
    "airway-breathing":     {"colour": "#2e86ab", "icon": "lungs"},          # steel blue
    "cardiology":           {"colour": "#a93226", "icon": "heart-pulse"},    # crimson
    "fever-infection":      {"colour": "#d35400", "icon": "thermometer"},    # burnt orange
    "trauma-injury":        {"colour": "#7d3c98", "icon": "bandage"},        # plum
    "neuro":                {"colour": "#5d6d7e", "icon": "brain"},          # slate
    "gi":                   {"colour": "#b9770e", "icon": "stomach"},        # ochre
    "renal-urology-gu":     {"colour": "#1f6f5c", "icon": "droplet"},        # teal
    "endocrine-metabolic":  {"colour": "#b03a2e", "icon": "flask"},          # rust
    "haem-onc":             {"colour": "#6c3483", "icon": "vial"},           # purple
    "skin-allergy":         {"colour": "#cb6a3b", "icon": "skin"},           # terracotta
    "poisoning-tox":        {"colour": "#7e5109", "icon": "biohazard"},      # bronze
    "ent-ophthalmology":    {"colour": "#1a5276", "icon": "ear-eye"},        # navy
    "ortho-nontrauma":      {"colour": "#797d7f", "icon": "bone"},           # warm grey
    "gynae-sexual":         {"colour": "#9b1b5b", "icon": "venus"},          # magenta
    "neonatal":             {"colour": "#7d6608", "icon": "baby"},           # mustard
    "mental-behavioural":   {"colour": "#117a65", "icon": "head-mind"},      # deep teal
    "procedures-resources": {"colour": "#34495e", "icon": "tools"},          # dark slate
    "resources-equity":     {"colour": "#5b2c6f", "icon": "people"},         # deep purple
}


def main() -> None:
    raw_entries = json.loads(SRC_RAW.read_text(encoding="utf-8"))
    cat_entries = json.loads(SRC_CAT.read_text(encoding="utf-8"))

    # Build redirect/synonym lookup keyed by canonical title (case-insensitive)
    synonyms: dict[str, list[str]] = defaultdict(list)
    for e in raw_entries:
        if e["is_redirect"] and e["redirects_to"]:
            syn = re.sub(r"\s*\(see\s*>>\s*.+?\)\s*$", "", e["raw_title"],
                          flags=re.IGNORECASE).strip()
            key = e["redirects_to"].strip().lower()
            if syn and syn.lower() != key:
                synonyms[key].append(syn)

    # Build category list with display metadata + counts
    counts_by_cat: dict[str, int] = defaultdict(int)
    for g in cat_entries:
        for c in g["categories"]:
            counts_by_cat[c] += 1

    categories_out = []
    for cid, label in CATEGORIES:
        meta = CATEGORY_META[cid]
        categories_out.append({
            "id": cid,
            "label": label,
            "colour": meta["colour"],
            "icon": meta["icon"],
            "count": counts_by_cat[cid],
        })

    # Final guideline list - one record per real guideline, ready for the app
    guidelines_out = []
    for g in cat_entries:
        title_lower = g["title"].lower()
        syns = sorted(set(synonyms.get(title_lower, [])))
        guidelines_out.append({
            "title": g["title"],
            "url": g["url"],
            "categories": g["categories"],
            "synonyms": syns,
            "is_pic": g["is_pic"],
        })

    payload = {
        "schema_version": 1,
        "generated_at": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": {
            "rch_index_url": "https://www.rch.org.au/clinicalguide/about_rch_cpgs/welcome_to_the_clinical_practice_guidelines/",
            "note": "Titles and URLs only. Guideline body text is never cached - the app links out to live RCH pages.",
        },
        "categories": categories_out,
        "guidelines": guidelines_out,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {OUT}")
    print(f"  categories : {len(categories_out)}")
    print(f"  guidelines : {len(guidelines_out)}")
    syn_count = sum(len(g["synonyms"]) for g in guidelines_out)
    print(f"  synonyms   : {syn_count} attached to {sum(1 for g in guidelines_out if g['synonyms'])} guidelines")


if __name__ == "__main__":
    main()
