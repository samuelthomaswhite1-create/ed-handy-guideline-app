"""Assign each parsed RCH guideline to zero or more presenting-complaint categories.

This is RULE-BASED, not LLM-judged: every assignment traces back to an explicit
keyword/regex rule, listed in CATEGORY_RULES. Sam can audit and edit them. A
guideline matching zero rules is flagged 'needs_review' so Sam catches gaps
rather than us silently dropping it.

Outputs:
    data/categories_proposed.json   Full map (one record per real guideline)
    data/categorisation_report.md   Human summary: per-category counts, gaps,
                                    needs-review list, coverage observations
"""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "rch_guidelines_raw.json"
OUT_JSON = ROOT / "data" / "categories_proposed.json"
OUT_REPORT = ROOT / "data" / "categorisation_report.md"


# Final 19-tile taxonomy after Sam's review.
# Order is presentation order for the home screen (most-likely-acute first).
CATEGORIES = [
    ("resus-collapse",       "Resus / Collapsed child"),
    ("airway-breathing",     "Airway / Breathing"),
    ("cardiology",           "Cardiology"),
    ("fever-infection",      "Fever / Infection"),
    ("trauma-injury",        "Trauma / Injury"),
    ("neuro",                "Neuro"),
    ("gi",                   "GI"),
    ("renal-urology-gu",     "Renal / Urology / GU"),
    ("endocrine-metabolic",  "Endocrine / Metabolic"),
    ("haem-onc",             "Haematology / Oncology"),
    ("skin-allergy",         "Skin / Allergy"),
    ("poisoning-tox",        "Poisoning / Toxicology"),
    ("ent-ophthalmology",    "ENT / Ophthalmology"),
    ("ortho-nontrauma",      "Orthopaedics (non-trauma)"),
    ("gynae-sexual",         "Gynaecology / Sexual health"),
    ("neonatal",             "Neonatal"),
    ("mental-behavioural",   "Mental health / Behavioural"),
    ("procedures-resources", "Procedures / Resources"),
    ("resources-equity",     "Resources / Equity"),
]
CATEGORY_LABELS = dict(CATEGORIES)


def kw(*patterns: str) -> list[re.Pattern[str]]:
    """Compile case-insensitive word-boundary keyword patterns."""
    return [re.compile(rf"\b{p}\b", re.IGNORECASE) for p in patterns]


# Keyword rules per category.  Each pattern is matched against the guideline
# title.  Multi-category matches are allowed and expected (e.g. anaphylaxis
# hits airway-breathing + resus-collapse + skin-allergy).
CATEGORY_RULES: dict[str, list[re.Pattern[str]]] = {
    "airway-breathing": kw(
        "asthma", "croup", "bronchiolitis", "wheeze", "wheezing",
        "airway", "intubation", "intubated", "extubation", "tracheostomy",
        "ventilation", "ventilated", "ventilator", "oxygen", "CPAP", "BiPAP",
        "HFNP", "high flow", "respiratory", "pneumonia", "pleural",
        "stridor", "apnoea", "BRUE", "ALTE", "cough", "pertussis",
        "bronchiectasis", "cystic fibrosis", "pulmonary", "thoracic",
        "empyema", "pneumothorax", "tracheal", "laryngeal", "laryngitis",
        "laryngomalacia", "anaphylaxis", "epiglottitis",
        "foreign bodies inhaled", "parapneumonic",
    ),
    "resus-collapse": kw(
        "resuscitation", "resus", "cardiac arrest", "collapsed", "collapse",
        "anaphylaxis", "shock", "septic shock", "sepsis", "DKA",
        "diabetic ketoacidosis", "hypoglycaemia", "hypoglycemic",
        "status epilepticus", "CPR", "defibrillation", "intraosseous",
        "fluid resuscitation", "rapid sequence", "RSI", "neonatal resuscitation",
        "newborn resuscitation", "code blue", "MET call", "deteriorating",
        "deterioration", "arrest",
        "altered conscious state", "MET criteria", "seriously unwell neonate",
        "deteriorating patient",
    ),
    "fever-infection": kw(
        "fever", "febrile", "infection", "infections", "sepsis", "septic",
        "meningitis", "meningococcal", "bacteraemia", "bacteremia", "UTI",
        "urinary tract infection", "tonsillitis", "pharyngitis", "otitis",
        "mastoiditis", "cellulitis", "abscess", "lymphadenitis", "varicella",
        "chickenpox", "measles", "mumps", "rubella", "kawasaki",
        "scarlet fever", "antibiotic", "antibiotics", "antiviral",
        "antifungal", "malaria", "tuberculosis", "TB", "HIV",
        "hepatitis", "immunisation", "immunization", "vaccine",
        "vaccination", "prophylaxis", "osteomyelitis", "septic arthritis",
        "pneumonia", "viral", "bacterial", "MRSA", "staphylococcal",
        "streptococcal", "rheumatic fever", "endocarditis",
        "encephalitis", "myocarditis", "pericarditis",
        "PIMS", "MIS-C", "COVID", "influenza", "RSV",
        "needlestick", "antimicrobial", "Ebola", "empiric treatment",
    ),
    "trauma-injury": kw(
        "trauma", "injury", "injuries", "fracture", "fractures", "dislocation",
        "sprain", "burn", "burns", "head injury", "spinal", "neck pain",
        "wound", "wounds", "laceration", "lacerations", "abrasion",
        "bite", "bites", "sting", "stings", "drowning", "submersion",
        "electric", "electrocution", "non-accidental", "non accidental",
        "abuse", "neglect", "assault", "falls", "MVA", "limp",
        "knee injury", "knee injuries", "ankle", "wrist", "elbow",
        "clavicle", "femur", "humerus", "tibia", "phalan", "shoulder",
        "compartment syndrome", "crush injury", "amputation", "degloving",
        "scalp", "skull", "facial injury", "dental injury", "tooth",
        "ocular trauma", "eye injury", "foreign body",
    ),
    "gi": kw(
        "abdominal pain", "vomiting", "diarrhoea", "diarrhea", "constipation",
        "gastroenteritis", "GORD", "reflux", "intussusception", "appendicitis",
        "hernia", "pyloric", "hepatitis", "jaundice", "hirschsprung",
        "colic", "feeding", "NG tube", "gastrostomy", "stoma", "bowel",
        "GI bleed", "haematemesis", "melaena", "rectal bleed",
        "rectal bleeding", "pancreatitis", "cholecystitis", "biliary",
        "coeliac", "celiac", "inflammatory bowel", "Crohn", "ulcerative colitis",
        "encopresis", "soiling", "abdominal", "gastrointestinal",
        "Meckel", "volvulus", "malrotation", "ingestion",
    ),
    "neuro": kw(
        "seizure", "seizures", "status epilepticus", "epilepsy", "headache",
        "migraine", "meningitis", "encephalitis", "neuro", "neurological",
        "weakness", "ataxia", "paralysis", "dizziness", "vertigo",
        "syncope", "faint", "GCS", "head injury", "stroke", "cerebral",
        "cerebellar", "palsy", "Bell's palsy", "Guillain", "myasthenia",
        "spinal cord", "shunt", "hydrocephalus", "VP shunt",
        "movement disorder", "tic", "torticollis", "acquired torticollis",
        "raised intracranial", "ICP", "concussion",
        "altered conscious state", "CSF interpretation", "infantile spasms",
    ),
    "poisoning-tox": kw(
        "poisoning", "poison", "overdose", "paracetamol", "ibuprofen",
        "opioid", "opiate", "alcohol", "drugs of abuse", "button battery",
        "envenomation", "envenoming", "snake", "snakebite", "spider", "jellyfish",
        "marine", "lead", "iron", "antidote", "naloxone", "charcoal",
        "toxicology", "toxin", "carbon monoxide", "cyanide",
        "tricyclic", "TCA", "SSRI", "benzodiazepine", "amphetamine",
        "ecstasy", "MDMA", "GHB", "cannabis", "cocaine",
        "alkalis", "acid ingestion", "caustic", "hydrocarbon",
        "salicylate", "aspirin",
        "anticholinergic", "serotonin toxicity", "nitrous oxide",
        "capsicum spray", "hydrofluoric", "low dose paediatric ingestion",
        "low dose paediatric ingestions",
    ),
    "skin-allergy": kw(
        "rash", "eczema", "dermatitis", "urticaria", "anaphylaxis",
        "allergy", "allergic", "hives", "impetigo", "cellulitis",
        "scabies", "ringworm", "tinea", "molluscum", "wart", "warts",
        "hand foot and mouth", "viral exanthem", "scalded skin",
        "Stevens", "SJS", "TEN", "toxic epidermal", "sunburn",
        "drug eruption", "drug rash", "skin", "lesion", "lesions",
        "vulval", "vulvovaginitis", "balanitis", "nappy rash",
        "intertrigo", "psoriasis", "alopecia",
        "hereditary angioedema", "C1-esterase", "serum sickness",
    ),
    "mental-behavioural": kw(
        "mental health", "mental", "behaviour", "behavioural", "behavior",
        "suicide", "suicidal", "self harm", "self-harm", "deliberate self",
        "depression", "depressed", "anxiety", "psychosis", "psychiatric",
        "eating disorder", "eating disorders", "anorexia", "bulimia",
        "autism", "ASD", "ADHD", "conduct", "restraint", "agitation",
        "agitated", "substance use", "addiction", "code grey",
        "behavioural disturbance", "school refusal", "mental state",
    ),
    "procedures-resources": kw(
        "procedural sedation", "sedation", "pain management", "analgesia",
        "cannulation", "intraosseous", "blood gas", "lumbar puncture",
        "suprapubic", "catheter", "catheterisation", "NG insertion",
        "urine sample", "plaster", "casting", "ultrasound", "POCUS",
        "local anaesthetic", "local anesthesia", "RSI",
        "Acceptable ranges", "drugs and equipment", "emergency drugs",
        "retrieval", "transfer",
        "parent resources", "calculator", "songsheet",
        "weight", "observation chart", "NEWS", "PEWS", "escalation",
        "checklist", "ED triage", "triage",
        "bier block", "fascia iliaca", "intranasal fentanyl",
        "intravenous access", "thoracocentesis", "chest drain",
        "fasting for general anaesthesia", "NPA", "intravenous fluids",
        "nasogastric fluids", "neonatal intravenous fluids",
        "dehydration", "adverse drug reaction", "blood product",
        "patient blood management", "communicating procedures",
        "minimising distress", "death of a child", "death certificate",
        "online death certificate", "sizing a one-piece hard collar",
        "CSF interpretation", "scan meeting",
    ),

    # ===== New categories added after Sam's review =====
    "cardiology": kw(
        "ECG", "electrocardiogram", "bradycardia", "tachycardia",
        "supraventricular", "SVT", "VT", "ventricular tachycardia",
        "chest pain", "cyanotic", "congenital heart", "heart disease",
        "heart failure", "hypertension", "hypotension", "murmur",
        "cardiomyopathy", "arrhythmia", "long QT", "rheumatic heart",
        "endocarditis", "pericarditis", "myocarditis", "cardiac",
        "pulseless", "Kawasaki",
    ),
    "endocrine-metabolic": kw(
        "diabetes", "DKA", "diabetic ketoacidosis", "hyperosmolar",
        "hyperglycaemic state", "hyperglycaemia", "hypoglycaemia",
        "adrenal", "thyroid", "thyrotoxicosis", "hypothyroid",
        "hyperthyroid", "diabetes insipidus", "SIADH",
        "metabolic disorders", "inborn error", "metabolic",
        "vitamin D", "vitamin", "micronutrient", "endocrine",
        "growth", "puberty", "obesity",
    ),
    "haem-onc": kw(
        "anaemia", "anemia", "haemophilia", "hemophilia",
        "thrombocytopen", "ITP", "von Willebrand",
        "sickle cell", "thalassaemia", "thalassemia",
        "blood product", "transfusion", "blood culture",
        "blood management", "immunoglobulin", "IVIG",
        "oncological emergencies", "oncology", "leukaemia", "leukemia",
        "lymphoma", "neutropenic", "febrile neutropenia",
        "hyperleukocytosis", "tumour lysis", "mediastinal mass",
        "anticoagulation", "vancomycin", "purpura", "petechiae",
        "petechia", "Henoch", "HSP", "vasculitis",
        "primary immunodeficiency", "immunodeficiencies",
        "cancer", "neoplasm",
    ),
    "renal-urology-gu": kw(
        "urinary tract", "haematuria", "hematuria", "nephrotic",
        "nephritis", "AKI", "acute kidney injury", "chronic kidney",
        "renal failure", "renal", "kidney", "urology",
        "scrotal", "testicular", "torsion", "penis", "foreskin",
        "phimosis", "paraphimosis", "balanitis", "circumcision",
        "enuresis", "bed wetting", "daytime wetting",
        "urinary incontinence", "hyperkalaemia", "hypokalaemia",
        "hypernatraemia", "hyponatraemia", "hypermagnesaemia",
        "hypomagnesaemia", "hyperphosphataemia", "hypophosphataemia",
        "hypercalcaemia", "hypocalcaemia", "electrolyte abnormalities",
        "electrolyte", "tubular acidosis", "antenatal urinary tract",
        "antenatal hydronephrosis", "vesicoureteric reflux", "VUR",
    ),
    "ent-ophthalmology": kw(
        "red eye", "eye examination", "eye exam", "conjunctivitis",
        "uveitis", "iritis", "ophthalm", "vision", "visual",
        "strabismus", "squint", "cataract", "glaucoma",
        "epistaxis", "nose bleed", "rhinitis", "rhinosinusitis",
        "sinusitis", "sore throat", "pharyngitis", "tonsillitis",
        "quinsy", "peritonsillar", "otitis", "ear", "hearing",
        "cervical lymphadenopathy", "neck lump", "HSV gingivostomatitis",
        "gingivostomatitis", "dental conditions",
        "tooth", "teeth", "oral", "stomatitis",
        "positional plagiocephaly", "plagiocephaly",
    ),
    "gynae-sexual": kw(
        "gynaecology", "gynecology", "menstrual", "menstruation",
        "menses", "dysmenorrhoea", "menorrhagia", "heavy menstrual",
        "amenorrhoea", "contraception", "contraceptive",
        "emergency contraception", "pregnancy", "ectopic",
        "miscarriage", "PV bleed", "vaginal bleeding",
        "sexual health", "STI", "sexually transmitted",
        "PCOS", "ovarian", "pelvic inflammatory",
    ),
    "neonatal": kw(
        "neonatal", "neonate", "newborn", "perinatal",
        "unsettled", "crying babies", "crying baby",
        "infantile", "young infant",
        "umbilical", "jaundice", "kernicterus",
        "feeding difficulties", "breastfeed", "formula",
        "weight gain", "weight loss", "failure to thrive",
        "FTT", "antenatal",
    ),
    "ortho-nontrauma": kw(
        "SUFE", "slipped upper femoral epiphysis", "Perthes",
        "limp", "swollen joint", "septic arthritis",
        "osteomyelitis", "scoliosis", "developmental dysplasia",
        "DDH", "hip", "cervical spine assessment",
        "spine assessment", "hard collar", "c-spine",
        "upper limb non-use", "limb non-use", "back pain",
        "growing pains",
    ),
    "resources-equity": kw(
        "Aboriginal", "Torres Strait", "Indigenous",
        "family violence", "domestic violence", "intimate partner",
        "immigrant", "refugee", "interpreter", "cultural",
        "engaging", "adolescent patient",
        "CPG Committee", "CPG information",
        "admission criteria", "general medicine SSU",
        "Paediatric Improvement Collaborative",
    ),
}


def categorise(title: str) -> tuple[list[str], list[str]]:
    """Return (matched_category_ids, matched_keyword_strings)."""
    matched_cats: list[str] = []
    matched_kws: list[str] = []
    for cat_id, patterns in CATEGORY_RULES.items():
        for pat in patterns:
            if pat.search(title):
                if cat_id not in matched_cats:
                    matched_cats.append(cat_id)
                matched_kws.append(f"{cat_id}:{pat.pattern}")
                break  # one match per category is enough
    return matched_cats, matched_kws


def main() -> None:
    raw = json.loads(SRC.read_text(encoding="utf-8"))
    real = [e for e in raw if not e["is_redirect"]]

    # Build redirect map: synonym → canonical title, so we can attach search synonyms.
    synonyms: dict[str, list[str]] = defaultdict(list)
    for e in raw:
        if e["is_redirect"] and e["redirects_to"]:
            synonym = e["raw_title"]
            # Strip the "(see >> X)" tail for the synonym phrase
            synonym = re.sub(r"\s*\(see\s*>>\s*.+?\)\s*$", "", synonym, flags=re.IGNORECASE).strip()
            synonyms[e["redirects_to"].strip().lower()].append(synonym)

    out_records: list[dict] = []
    needs_review: list[dict] = []

    for g in real:
        cats, kws_matched = categorise(g["title"])
        confidence = "high" if cats else "needs_review"
        record = {
            "title": g["title"],
            "url": g["url"],
            "is_pic": g["is_pic"],
            "categories": cats,
            "confidence": confidence,
            "matched_rules": kws_matched,
            "synonyms": sorted(set(synonyms.get(g["title"].lower(), []))),
        }
        out_records.append(record)
        if not cats:
            needs_review.append(record)

    OUT_JSON.write_text(json.dumps(out_records, indent=2, ensure_ascii=False), encoding="utf-8")

    # Build summary report
    per_cat = defaultdict(list)
    multi_cat = []
    for r in out_records:
        for c in r["categories"]:
            per_cat[c].append(r["title"])
        if len(r["categories"]) > 1:
            multi_cat.append(r)

    lines: list[str] = []
    lines.append("# RCH guideline categorisation - proposed mapping for Sam's review\n")
    lines.append(f"Source: parsed {len(real)} real guidelines from rch_guidelines_raw.json\n")
    lines.append(f"Mapping rules: see `scripts/categorise_guidelines.py` (rule-based, auditable).\n")
    lines.append("\n## Per-category counts\n")
    lines.append("| Category | Count |")
    lines.append("|---|---:|")
    for cid, label in CATEGORIES:
        lines.append(f"| {label} | {len(per_cat[cid])} |")
    lines.append(f"| **needs_review (no rule matched)** | **{len(needs_review)}** |")

    lines.append("\n## NEEDS REVIEW - guidelines that didn't match any category rule\n")
    lines.append("These are the highest-priority items for Sam to look at. Either:")
    lines.append("- the rule keywords need extending to cover them, or")
    lines.append("- a new category is required, or")
    lines.append("- they genuinely belong in 'Procedures / Resources' or should be excluded from the app.\n")
    for r in needs_review:
        pic = " (PIC)" if r["is_pic"] else ""
        lines.append(f"- **{r['title']}**{pic}  \n  <{r['url']}>")

    lines.append("\n## Multi-category guidelines (sanity check these — multi-tagging is intentional)\n")
    for r in sorted(multi_cat, key=lambda x: -len(x["categories"]))[:40]:
        cats_pretty = ", ".join(CATEGORY_LABELS[c] for c in r["categories"])
        lines.append(f"- **{r['title']}** → {cats_pretty}")
    if len(multi_cat) > 40:
        lines.append(f"\n_(showing top 40 by category count; total multi-category guidelines: {len(multi_cat)})_")

    lines.append("\n## Per-category guideline lists\n")
    for cid, label in CATEGORIES:
        lines.append(f"\n### {label}  ({len(per_cat[cid])})\n")
        for t in sorted(per_cat[cid]):
            lines.append(f"- {t}")

    OUT_REPORT.write_text("\n".join(lines), encoding="utf-8")

    print(f"Wrote {OUT_JSON} ({len(out_records)} records)")
    print(f"Wrote {OUT_REPORT}")
    print()
    print("=== summary ===")
    for cid, label in CATEGORIES:
        print(f"  {label:35s}: {len(per_cat[cid])}")
    print(f"  {'NEEDS REVIEW (no rule match)':35s}: {len(needs_review)}")
    print(f"  Multi-category guidelines       : {len(multi_cat)}")


if __name__ == "__main__":
    main()
