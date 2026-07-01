# NOTICE

The **code** in this repository (HTML/CSS/JS/Python) is licensed under MIT
(see [LICENSE](LICENSE)).

Some clinical content embedded or referenced by the app is licensed separately
or belongs to its original publisher. This file records who owns what and how
we use it.

---

## Clinical decision support — this app is a navigation aid, not authoritative

This app is a personal / departmental reference tool. It does **not** replace
clinical judgement or an authoritative guideline at the point of care. Every
in-app value has been extracted from a fetched source (recorded below) and
should be verified against that live source before administration.

---

## Embedded content

### Alfred ICU Intubation Checklist  ·  CC BY-NC-SA 4.0

The interactive checklist in `app/data/resources.json` under the
`alfred-intubation-checklist` key is a derivative work of the Alfred ICU
intubation checklist, itself modified by the Alfred ICU Airway Team from the
RTIC Severn Checklist.

- **Original authors:** Alfred ICU Airway Team
- **Upstream:** Modified from the RTIC Severn Checklist
- **Version:** 15 · 17 May 2017
- **Source:** <https://intensiveblog.com/alfred-icu-intubation-checklist/>
- **Licence:** Creative Commons Attribution-NonCommercial-ShareAlike 4.0
  (<https://creativecommons.org/licenses/by-nc-sa/4.0/>)

Per the ShareAlike clause, the checklist content embedded here is offered
under the same CC BY-NC-SA 4.0 licence. **Non-commercial use only.**

Images from the source card are not stored in this repository — they are
hot-linked from `intensiveblog.com` at view time so the source retains full
control.

---

## Linked (not embedded) sources

The app **navigates to** the following live sources without reproducing their
content. Each publisher retains full ownership.

- **Royal Children's Hospital Melbourne Clinical Practice Guidelines** —
  <https://www.rch.org.au/clinicalguide/>. We index guideline titles and URLs
  only; every tap opens the live RCH page.
- **NETS Clinical Calculator (Adult Retrieval Victoria)** —
  <https://calculator.nets.org.au/>. We collect weight + age locally and
  deep-link to the NETS calculator so doses are computed live by NETS.
  The 50th-centile weight-for-age table used to preview an estimate before
  submission is transcribed verbatim from NETS's own `menu.js` source,
  with attribution (see `app/data/nets_weight_table.json`).
- **Ambulance Victoria — ARV Infusions Table** —
  <https://www.ambulance.vic.gov.au/sites/default/files/2025-05/ARV-infusions-table.pdf>.
  Sidebar link only; no local copy of the PDF.
- **Victorian State Trauma System (REACH)** —
  <https://trauma.reach.vic.gov.au/>. The in-app anticoagulant reversal
  pathway summarises clinical facts (drug names, doses, regimens) extracted
  from REACH pages with our own visual design and prose. Every panel links
  back to the exact source page it draws from.

---

## Attribution & feedback

If you own any of the above content and would like this app to change how it
uses your material, please open an issue on the repository.
