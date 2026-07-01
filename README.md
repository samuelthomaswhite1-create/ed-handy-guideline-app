# ED handy-guideline app

A mobile-first quick-access index of paediatric emergency guidelines and
adjacent clinical references, for bedside use in a paediatric ED.

- **Guidelines** — indexes the live [RCH Melbourne Clinical Practice
  Guidelines](https://www.rch.org.au/clinicalguide/), organised by
  presenting complaint rather than alphabetically. Tapping a guideline opens
  the live RCH page in a new tab — nothing is cached locally.
- **Search** — matches titles and the synonym redirects RCH publishes.
- **Calculators** — currently one: Paediatric Drugs & Equipment, which
  deep-links to the live NETS Clinical Calculator with the weight + age you
  enter. No doses are computed locally.
- **Quick-links sidebar** — categorised references (ARV Infusions Table,
  REACH anticoag guidelines, Alfred ICU intubation checklist).
- **In-app reference pages** — data-driven cards for the
  anticoagulant reversal pathway (adult HI) and an interactive Alfred ICU
  intubation checklist with progress tracking and persistent state.

Not a decision-making authority. Every guideline / calculation / dose links
to a live source of truth. See [NOTICE.md](NOTICE.md) for attributions and
licensing.

---

## Live app

Deployed via GitHub Pages from the `app/` folder on every push to `main`.

**URL:** https://samuelthomaswhite1-create.github.io/ed-handy-guideline-app/

Install to iPhone / Android home screen via "Add to Home Screen" — the app
ships a web manifest so it launches standalone with its own icon.

---

## Local development

The app is pure HTML/CSS/JS with no build step. Any static server works.

### Python (Windows)

```powershell
py -m http.server 8765 --bind 127.0.0.1 --directory app
```

Then open <http://127.0.0.1:8765>.

### Rebuilding the data pipeline

The `app/data/app_data.json` file that drives the guideline index is built by
three Python scripts under `scripts/`, running against a live fetch of the
RCH CPG page:

```powershell
py scripts/parse_rch_index.py       # fetch + parse the RCH A-Z page
py scripts/categorise_guidelines.py  # apply rule-based categorisation
py scripts/export_app_data.py        # export the app-ready JSON + accents
```

Icons for the PWA manifest are generated with `scripts/make_icons.py`
(requires Pillow: `py -m pip install pillow`).

---

## Structure

```
app/                     Deployed site (this is the GitHub Pages root)
  index.html             Shell
  manifest.webmanifest   PWA manifest
  icon-*.png             App icons
  assets/                CSS + JS + inline SVG icons
  data/                  App-ready JSON — guidelines, resources, NETS table
scripts/                 Data-pipeline + icon-generation Python scripts
data/                    Parser outputs (JSON + Markdown report).
                         Raw HTML captures are gitignored — regenerate with
                         the scripts above.
.github/workflows/       GitHub Pages deploy workflow
```

---

## Licence

- **Code:** MIT (see [LICENSE](LICENSE))
- **Some embedded clinical content:** separate licences apply — see
  [NOTICE.md](NOTICE.md).
- **Linked upstream sources** (RCH, NETS, REACH, ARV, Alfred ICU) retain
  full ownership of their content.
