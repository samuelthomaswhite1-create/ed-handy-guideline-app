# RCH guideline categorisation - proposed mapping for Sam's review

Source: parsed 288 real guidelines from rch_guidelines_raw.json

Mapping rules: see `scripts/categorise_guidelines.py` (rule-based, auditable).


## Per-category counts

| Category | Count |
|---|---:|
| Resus / Collapsed child | 13 |
| Airway / Breathing | 21 |
| Cardiology | 7 |
| Fever / Infection | 34 |
| Trauma / Injury | 31 |
| Neuro | 19 |
| GI | 14 |
| Renal / Urology / GU | 17 |
| Endocrine / Metabolic | 14 |
| Haematology / Oncology | 17 |
| Skin / Allergy | 14 |
| Poisoning / Toxicology | 44 |
| ENT / Ophthalmology | 10 |
| Orthopaedics (non-trauma) | 5 |
| Gynaecology / Sexual health | 7 |
| Neonatal | 9 |
| Mental health / Behavioural | 8 |
| Procedures / Resources | 40 |
| Resources / Equity | 7 |
| **needs_review (no rule matched)** | **0** |

## NEEDS REVIEW - guidelines that didn't match any category rule

These are the highest-priority items for Sam to look at. Either:
- the rule keywords need extending to cover them, or
- a new category is required, or
- they genuinely belong in 'Procedures / Resources' or should be excluded from the app.


## Multi-category guidelines (sanity check these — multi-tagging is intentional)

- **Anaphylaxis** → Airway / Breathing, Resus / Collapsed child, Skin / Allergy
- **Acute otitis media** → Fever / Infection, ENT / Ophthalmology
- **Adolescent gynaecology - lower abdominal pain** → GI, Gynaecology / Sexual health
- **Altered conscious state** → Resus / Collapsed child, Neuro
- **Antenatal urinary tract dilation** → Renal / Urology / GU, Neonatal
- **Antibiotic prescribing in children with reported penicillin or cephalosporin allergy** → Fever / Infection, Skin / Allergy
- **Antifungal prophylaxis for children with cancer or undergoing haematopoietic stem cell transplant** → Fever / Infection, Haematology / Oncology
- **Blood product prescription** → Procedures / Resources, Haematology / Oncology
- **Cellulitis and other bacterial skin infections** → Fever / Infection, Skin / Allergy
- **Cerebral palsy - chest infection** → Fever / Infection, Neuro
- **Community acquired pneumonia** → Airway / Breathing, Fever / Infection
- **CSF interpretation** → Neuro, Procedures / Resources
- **Diabetic ketoacidosis** → Resus / Collapsed child, Endocrine / Metabolic
- **Emergency airway management in COVID-19 context** → Airway / Breathing, Fever / Infection
- **Febrile seizure** → Fever / Infection, Neuro
- **Foreign body ingestion** → Trauma / Injury, GI
- **Fracture casting videos** → Trauma / Injury, Procedures / Resources
- **Head injury** → Trauma / Injury, Neuro
- **Hypoglycaemia** → Resus / Collapsed child, Endocrine / Metabolic
- **Infantile spasms** → Neuro, Neonatal
- **Intraosseous access** → Resus / Collapsed child, Procedures / Resources
- **Jaundice in early infancy** → GI, Neonatal
- **Kawasaki disease** → Fever / Infection, Cardiology
- **Local anaesthetic poisoning** → Poisoning / Toxicology, Procedures / Resources
- **Meningitis and encephalitis** → Fever / Infection, Neuro
- **Neonatal antimicrobial guidelines** → Fever / Infection, Neonatal
- **Neonatal intravenous fluids** → Procedures / Resources, Neonatal
- **Nitrous Oxide - oxygen mix** → Airway / Breathing, Poisoning / Toxicology
- **Oral Hypoglycaemic Poisoning** → Poisoning / Toxicology, ENT / Ophthalmology
- **Patient Blood Management in the Surgical Setting** → Procedures / Resources, Haematology / Oncology
- **Periorbital and orbital cellulitis** → Fever / Infection, Skin / Allergy
- **Recognition of the seriously unwell neonate and young infant** → Resus / Collapsed child, Neonatal
- **Resuscitation: Hospital Management of Cardiopulmonary Arrest COVID-19** → Resus / Collapsed child, Fever / Infection
- **Sepsis – assessment and management** → Resus / Collapsed child, Fever / Infection
- **Sexually transmitted infections (STIs)** → Fever / Infection, Gynaecology / Sexual health
- **Sizing a one-piece hard collar** → Procedures / Resources, Orthopaedics (non-trauma)
- **Slow weight gain** → Procedures / Resources, Neonatal
- **Spider Bite - Big Black Spider** → Trauma / Injury, Poisoning / Toxicology
- **Spider Bite – Redback Spider** → Trauma / Injury, Poisoning / Toxicology
- **Substance use (abuse)** → Trauma / Injury, Mental health / Behavioural

_(showing top 40 by category count; total multi-category guidelines: 42)_

## Per-category guideline lists


### Resus / Collapsed child  (13)

- Altered conscious state
- Anaphylaxis
- Diabetic ketoacidosis
- Emergency medication and resuscitation resources
- Hypoglycaemia
- Intraosseous access
- MET criteria - call 2222 for help
- Recognition of the seriously unwell neonate and young infant
- Resuscitation - Appendices
- Resuscitation: Care of the seriously unwell child
- Resuscitation: Hospital Management of Cardiopulmonary Arrest COVID-19
- Resuscitation: hospital management of cardiopulmonary arrest
- Sepsis – assessment and management

### Airway / Breathing  (21)

- Acute asthma
- Acute upper airway obstruction
- Anaphylaxis
- Assessment of severity of respiratory conditions
- Asthma in adolescents (12 years and over)
- Asthma in primary school-aged children (6-11 years)
- Brief resolved unexplained event (BRUE)
- Bronchiolitis
- Can’t intubate can’t oxygenate (CICO) airway emergency management
- Community acquired pneumonia
- Cough
- Croup  (Laryngotracheobronchitis)
- Emergency airway management
- Emergency airway management in COVID-19 context
- Foreign bodies inhaled
- Nitrous Oxide - oxygen mix
- Parapneumonic effusion
- Preschool asthma (1-5 years)
- Primary spontaneous pneumothorax
- Thoracic elevation device - Airway pad
- Whooping cough (pertussis)

### Cardiology  (7)

- Basic paediatric ECG interpretation
- Bradycardia during sleep
- Chest pain
- Cyanotic episodes in congenital heart disease
- Hypertension in children and adolescents
- Kawasaki disease
- Supraventricular Tachycardia SVT

### Fever / Infection  (34)

- Acute meningococcal disease
- Acute otitis media
- Antibiotic prescribing in children with reported penicillin or cephalosporin allergy
- Antifungal prophylaxis for children with cancer or undergoing haematopoietic stem cell transplant
- Antimicrobial guidelines
- Bone and joint infection
- COVID-19
- COVID-19 swabbing
- Cellulitis and other bacterial skin infections
- Cerebral palsy - chest infection
- Chickenpox (varicella)
- Community acquired pneumonia
- Contact prophylaxis for invasive meningococcal or Hib disease
- Distraction techniques for COVID-19 swabbing
- Emergency airway management in COVID-19 context
- Empiric treatment of infectious diseases in child with suspected Ebola
- Febrile child
- Febrile seizure
- Fever and suspected or confirmed neutropenia
- Fever in the recently returned traveller
- Influenza
- Invasive group A streptococcal infections: management of household contacts
- Kawasaki disease
- Malaria
- Meningitis and encephalitis
- Neonatal antimicrobial guidelines
- Periorbital and orbital cellulitis
- Post-streptococcal glomerulonephritis (PSGN)
- Prolonged fever
- Rabies and Australian bat lyssavirus post exposure prophylaxis
- Resuscitation: Hospital Management of Cardiopulmonary Arrest COVID-19
- Sepsis – assessment and management
- Sexually transmitted infections (STIs)
- Urinary tract infection

### Trauma / Injury  (31)

- Acute eye injury
- Acute knee injuries - emergency department
- Animal and human bites
- Burns - acute management
- Burns - post acute care and dressings
- Child abuse
- Community acquired needle stick injury
- Dental trauma
- Drowning
- Elbow Dislocations
- Elbow Dislocations - Emergency Department
- Fingertip and nail injuries – Emergency Department
- Foreign body ingestion
- Fracture casting videos
- Fractures
- Head injury
- Lacerations
- Management of tetanus-prone wounds
- Nasal fracture
- Penetrating eye injury
- Peripheral extravasation injuries: Initial management and washout procedure
- Pulled elbow
- Spider Bite - Big Black Spider
- Spider Bite – Redback Spider
- Straddle injuries
- Substance use (abuse)
- Trauma - Pelvic injury
- Trauma - primary survey
- Trauma – secondary survey
- Trauma: Tertiary Survey
- Wound dressings - acute traumatic wounds

### Neuro  (19)

- Acquired torticollis
- Altered conscious state
- Ataxia
- CSF interpretation
- Cerebral palsy
- Cerebral palsy - chest infection
- Cerebral palsy - increased seizures
- Cerebral palsy - pain and irritability
- Common causes of ataxia
- Congenital Torticollis
- Facial weakness and Bell palsy
- Febrile seizure
- Head injury
- Headache
- Infantile spasms
- Meningitis and encephalitis
- Seizures - acute management
- Stroke
- Syncope

### GI  (14)

- Abdominal pain - acute
- Abdominal pain - chronic
- Adolescent gynaecology - lower abdominal pain
- Constipation
- Foreign body ingestion
- Gastroenteritis
- Gastrooesophageal reflux disease in infants
- Gastrostomy - common problems
- Gastrostomy acute replacement of displaced tubes
- Hirschsprung associated enterocolitis HAEC
- Intussusception
- Jaundice in early infancy
- Pyloric stenosis
- Vomiting

### Renal / Urology / GU  (17)

- Acute scrotal pain or swelling
- Antenatal urinary tract dilation
- Electrolyte abnormalities
- Enuresis - Bed wetting and Monosymptomatic Enuresis
- Haematuria
- Hyperkalaemia
- Hypermagnesaemia
- Hypernatraemia
- Hyperphosphataemia
- Hypokalaemia
- Hypomagnesaemia
- Hyponatraemia
- Hypophosphataemia
- Nephrotic syndrome
- The penis and foreskin
- Urinary Incontinence - Daytime wetting
- Urinary tract infection

### Endocrine / Metabolic  (14)

- Adrenal crisis and acute adrenal insufficiency
- Adrenal insufficiency steroid replacement before and after surgery or procedure requiring GA
- Diabetes Mellitus: new presentation
- Diabetes insipidus
- Diabetes mellitus and endoscopy
- Diabetes mellitus and surgery
- Diabetes mellitus: management of unwell children with established diabetes at home
- Diabetes mellitus: management of unwell children with established diabetes in hospital
- Diabetic ketoacidosis
- Hyperosmolar hyperglycaemic state
- Hypoglycaemia
- Metabolic disorders
- Micronutrient deficiency
- Vitamin D deficiency

### Haematology / Oncology  (17)

- Anaemia
- Anticoagulation therapy
- Antifungal prophylaxis for children with cancer or undergoing haematopoietic stem cell transplant
- Blood product prescription
- Childrens cancer centre - blood culture
- Haemophilia
- Henoch-Schönlein purpura
- IV Immunoglobulin
- Immune thrombocytopenic purpura
- Oncological emergencies: Hyperleukocytosis
- Oncological emergencies: Mediastinal mass
- Patient Blood Management in the Surgical Setting
- Petechiae and purpura
- Primary immunodeficiencies
- Sickle cell disease
- Vancomycin
- von Willebrand disease

### Skin / Allergy  (14)

- Anaphylaxis
- Antibiotic prescribing in children with reported penicillin or cephalosporin allergy
- Cellulitis and other bacterial skin infections
- Eczema
- Food allergy - IgE mediated food allergy
- Hereditary angioedema (C1-esterase inhibitor deficiency)
- Molluscum contagiosum
- Nappy rash
- Non-IgE mediated food allergy
- Periorbital and orbital cellulitis
- Serum Sickness and Serum Sickness like reactions (SSLRs)
- Urticaria
- Vulval and vaginal conditions
- Vulval ulcers

### Poisoning / Toxicology  (44)

- Alkalis poisoning
- Anticholinergic syndrome
- Anticonvulsant poisoning
- Antihistamine poisoning
- Benzodiazepine poisoning
- Camphor poisoning
- Cannabis withdrawal syndrome
- Capsicum spray
- Carbamazepine poisoning
- Chloral hydrate poisoning
- Corrosives - Caustic Poisoning
- Essential Oil Poisoning
- Ethanol poisoning
- Eucalyptus Oil Poisoning
- High risk - low dose paediatric ingestions
- Hydrocarbon poisoning
- Hydrofluoric acid exposure
- Iron deficiency
- Iron poisoning
- Local anaesthetic poisoning
- Nicotine Poisoning
- Nitrous Oxide - oxygen mix
- Nitrous Oxide Misuse
- Nonsteroidal Anti-inflammatory Drug NSAID poisoning
- Oral Hypoglycaemic Poisoning
- Paracetamol poisoning
- Phenobarbitone poisoning
- Phenytoin poisoning
- Poisoning - Acute Guidelines For Initial Management
- Quetiapine Poisoning
- Recreational drug use and overdose
- Risperidone Poisoning
- Salicylates poisoning
- Selective serotonin re-uptake inhibitors SSRIs poisoning
- Serotonin and noradrenaline re-uptake inhibitors SNRIs poisoning
- Serotonin toxicity
- Snakebite
- Sodium valproate poisoning
- Spider Bite - Big Black Spider
- Spider Bite – Redback Spider
- Theophylline poisoning
- Toxidromes poisoning
- Tricyclic Antidepressant (TCA) Poisoning
- Use of Activated Charcoal in Poisonings

### ENT / Ophthalmology  (10)

- Acute otitis media
- Acute red eye
- Cervical lymphadenopathy
- Dental conditions - non traumatic
- Epistaxis
- Eye Examination
- HSV Gingivostomatitis
- Oral Hypoglycaemic Poisoning
- Positional plagiocephaly
- Sore throat

### Orthopaedics (non-trauma)  (5)

- Cervical spine assessment
- Sizing a one-piece hard collar
- Slipped upper femoral epiphysis SUFE - Emergency Department
- The acutely swollen joint
- Upper limb non-use

### Gynaecology / Sexual health  (7)

- Adolescent gynaecology - heavy menstrual bleeding
- Adolescent gynaecology - lower abdominal pain
- Contraception
- Dysmenorrhoea
- Menstrual management in adolescents with disabilities
- Sexual health history taking in the adolescent
- Sexually transmitted infections (STIs)

### Neonatal  (9)

- Antenatal urinary tract dilation
- Infantile spasms
- Jaundice in early infancy
- Neonatal antimicrobial guidelines
- Neonatal intravenous fluids
- Recognition of the seriously unwell neonate and young infant
- Slow weight gain
- Unsettled or crying babies
- Weight loss acute

### Mental health / Behavioural  (8)

- Acute behavioural disturbance: Acute management
- Acute behavioural disturbance: Code Response
- Anxiety: identification and management
- Autism and developmental disability: management of distress/agitation
- Inhalants / volatile substance use - chroming
- Management of Eating Disorders in the Emergency Department
- Mental state examination
- Substance use (abuse)

### Procedures / Resources  (40)

- Acceptable ranges for physiological variables
- Acute pain management
- Bier block
- Blood product prescription
- CSF interpretation
- Communicating procedures to children
- Death of a child
- Death of a child: New South Wales resources
- Death of a child: Queensland resources
- Death of a child: Resources
- Death of a child: Sudden unexpected death in infancy SUDI
- Death of a child: Victorian resources
- Dehydration
- Fascia iliaca block of the femoral nerve
- Fasting for general anaesthesia
- Fracture casting videos
- Intranasal fentanyl
- Intraosseous access
- Intravenous access - Peripheral
- Intravenous fluids
- Ketamine use for procedural sedation
- Local anaesthetic poisoning
- Lumbar puncture
- Minimising distress in healthcare setting
- NPA
- Nasogastric fluids
- Neonatal intravenous fluids
- Pain - acute pain management link
- Parent resources
- Patient Blood Management in the Surgical Setting
- Procedural sedation
- Retrieval services
- Scan meeting resources
- Sizing a one-piece hard collar
- Slow weight gain
- Suprapubic aspirate
- The limping or non-weight bearing child
- Thoracocentesis and chest drain insertion
- Weight loss acute
- x - Complete an Online Death Certificate

### Resources / Equity  (7)

- Aboriginal and Torres Strait Islander health: services and support
- Admission criteria for general medicine SSU and IPU
- CPG Committee Calendar
- Engaging with and assessing the adolescent patient
- Family violence
- Immigrant health - acute presentations
- Immigrant health resources