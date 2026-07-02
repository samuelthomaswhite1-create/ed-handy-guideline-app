"""Build the single JSON file the web app consumes.

Combines:
  - Two populations (Child / Adult) that group tiles on the home screen
  - Child categories: 19 tiles derived from the RCH taxonomy in
    `categorise_guidelines.CATEGORIES`
  - Adult categories: currently 1 tile (Toxicology, backed by Austin Health's
    Clinical Toxicology Guidelines). Room to grow.
  - Guidelines from both sources merged into a single searchable list; each
    guideline knows which categories it belongs to and where it originated.

Output:
  app/data/app_data.json
"""

from __future__ import annotations

import datetime as dt
import json
import re
from collections import defaultdict
from pathlib import Path

# Import CATEGORIES so this stays the single source of truth for the child
# (RCH) taxonomy.
import sys
sys.path.insert(0, str(Path(__file__).parent))
from categorise_guidelines import CATEGORIES as CHILD_CATEGORIES  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SRC_RAW    = ROOT / "data" / "rch_guidelines_raw.json"
SRC_CAT    = ROOT / "data" / "categories_proposed.json"
SRC_AUSTIN = ROOT / "data" / "austin_guidelines_raw.json"
OUT        = ROOT / "app" / "data" / "app_data.json"

# Populations (top-level home-screen groupings).
POPULATIONS = [
    {
        "id": "child",
        "label": "Child",
        "subtitle": "Paediatric — RCH Melbourne CPGs, by presenting complaint",
        "default_expanded": True,
    },
    {
        "id": "adult",
        "label": "Adult",
        "subtitle": "General adult references, by topic",
        "default_expanded": True,
    },
]

# Adult categories (grows over time). Order = home-screen display order.
ADULT_CATEGORIES = [
    ("adult-toxicology", "Toxicology"),
]

# Display metadata for every category. Colour + icon apply to the tile and
# subsequent list/pinned rendering. Population determines which home-screen
# section the tile appears under.
CATEGORY_META = {
    # ---- Child (RCH) ----
    "resus-collapse":       {"colour": "#c0392b", "icon": "activity",     "population": "child"},
    "airway-breathing":     {"colour": "#2e86ab", "icon": "lungs",         "population": "child"},
    "cardiology":           {"colour": "#a93226", "icon": "heart-pulse",   "population": "child"},
    "fever-infection":      {"colour": "#d35400", "icon": "thermometer",   "population": "child"},
    "trauma-injury":        {"colour": "#7d3c98", "icon": "bandage",       "population": "child"},
    "neuro":                {"colour": "#5d6d7e", "icon": "brain",         "population": "child"},
    "gi":                   {"colour": "#b9770e", "icon": "stomach",       "population": "child"},
    "renal-urology-gu":     {"colour": "#1f6f5c", "icon": "droplet",       "population": "child"},
    "endocrine-metabolic":  {"colour": "#b03a2e", "icon": "flask",         "population": "child"},
    "haem-onc":             {"colour": "#6c3483", "icon": "vial",          "population": "child"},
    "skin-allergy":         {"colour": "#cb6a3b", "icon": "skin",          "population": "child"},
    "poisoning-tox":        {"colour": "#7e5109", "icon": "biohazard",     "population": "child"},
    "ent-ophthalmology":    {"colour": "#1a5276", "icon": "ear-eye",       "population": "child"},
    "ortho-nontrauma":      {"colour": "#797d7f", "icon": "bone",          "population": "child"},
    "gynae-sexual":         {"colour": "#9b1b5b", "icon": "venus",         "population": "child"},
    "neonatal":             {"colour": "#7d6608", "icon": "baby",          "population": "child"},
    "mental-behavioural":   {"colour": "#117a65", "icon": "head-mind",     "population": "child"},
    "procedures-resources": {"colour": "#34495e", "icon": "tools",         "population": "child"},
    "resources-equity":     {"colour": "#5b2c6f", "icon": "people",        "population": "child"},

    # ---- Adult ----
    "adult-toxicology":     {"colour": "#2c6e49", "icon": "biohazard",     "population": "adult"},
}


def child_guidelines() -> tuple[list[dict], dict[str, list[str]]]:
    raw_entries = json.loads(SRC_RAW.read_text(encoding="utf-8"))
    cat_entries = json.loads(SRC_CAT.read_text(encoding="utf-8"))

    # Redirect -> synonym lookup so a guideline can carry its "(see >> X)" text
    # aliases into search.
    synonyms: dict[str, list[str]] = defaultdict(list)
    for e in raw_entries:
        if e["is_redirect"] and e["redirects_to"]:
            syn = re.sub(r"\s*\(see\s*>>\s*.+?\)\s*$", "", e["raw_title"],
                          flags=re.IGNORECASE).strip()
            key = e["redirects_to"].strip().lower()
            if syn and syn.lower() != key:
                synonyms[key].append(syn)

    out: list[dict] = []
    for g in cat_entries:
        title_lower = g["title"].lower()
        out.append({
            "title": g["title"],
            "url":   g["url"],
            "categories": g["categories"],
            "synonyms": sorted(set(synonyms.get(title_lower, []))),
            "is_pic":  g["is_pic"],
            "source":  "rch",
        })
    return out, dict(synonyms)


def austin_guidelines() -> list[dict]:
    if not SRC_AUSTIN.exists():
        print(f"WARN: {SRC_AUSTIN.name} not found -- adult toxicology tile will be empty.")
        return []
    raw = json.loads(SRC_AUSTIN.read_text(encoding="utf-8"))
    out: list[dict] = []
    for g in raw:
        # A guideline that appears in more than one Austin letter group carries
        # the alternates as free-text synonyms so search still finds it under
        # neighbouring names.
        syns: list[str] = []
        if g.get("heading") and g["heading"] not in g["title"]:
            syns.append(g["heading"])
        if g.get("anchor") and g["anchor"].lower() not in ("clinical guideline", "guideline"):
            syns.append(g["anchor"])
        out.append({
            "title": g["title"],
            "url":   g["url"],
            "categories": ["adult-toxicology"],
            "synonyms": sorted(set(syns)),
            "is_pic":  False,
            "is_pdf":  True,
            "source":  "austin",
            "group":   g.get("group"),
        })
    return out


def main() -> None:
    child_gs, _ = child_guidelines()
    adult_gs = austin_guidelines()
    all_gs = child_gs + adult_gs

    counts_by_cat: dict[str, int] = defaultdict(int)
    for g in all_gs:
        for c in g["categories"]:
            counts_by_cat[c] += 1

    categories_out: list[dict] = []
    for cid, label in list(CHILD_CATEGORIES) + list(ADULT_CATEGORIES):
        meta = CATEGORY_META[cid]
        categories_out.append({
            "id": cid,
            "label": label,
            "colour": meta["colour"],
            "icon":   meta["icon"],
            "population": meta["population"],
            "count":  counts_by_cat[cid],
        })

    payload = {
        "schema_version": 2,
        "generated_at": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sources": {
            "rch_index_url":    "https://www.rch.org.au/clinicalguide/about_rch_cpgs/welcome_to_the_clinical_practice_guidelines/",
            "austin_tox_index": "https://www.austin.org.au/clinical-toxicology-guidelines/",
            "note": "Titles and URLs only. Body text is never cached -- the app links out to the live publisher pages/PDFs.",
        },
        "populations": POPULATIONS,
        "categories":  categories_out,
        "guidelines":  all_gs,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {OUT}")
    print(f"  populations : {len(POPULATIONS)}")
    print(f"  categories  : {len(categories_out)}"
          f"  (child {sum(1 for c in categories_out if c['population']=='child')}"
          f", adult {sum(1 for c in categories_out if c['population']=='adult')})")
    print(f"  guidelines  : {len(all_gs)}"
          f"  (RCH {len(child_gs)}, Austin {len(adult_gs)})")
    syn_count = sum(len(g["synonyms"]) for g in all_gs)
    print(f"  synonyms    : {syn_count} attached to {sum(1 for g in all_gs if g['synonyms'])} guidelines")


if __name__ == "__main__":
    main()
