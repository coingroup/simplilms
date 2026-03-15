-- ============================================================================
-- Seed: Sector Question Bank — Sample questions for all 8 sectors
-- ============================================================================
-- Each sector gets 5-8 representative questions covering key topics.
-- These serve as starter content; more can be added via admin UI.
-- ============================================================================

-- Helper: Get sector_module_id by key
-- We use subqueries to reference sector_modules by sector_key.

-- ============================================================================
-- REAL ESTATE — 6 questions
-- ============================================================================

INSERT INTO public.sector_question_banks (sector_module_id, topic, subtopic, difficulty, blooms_level, question_type, question_text, explanation, options, tags, regulatory_reference, sort_order) VALUES

((SELECT id FROM public.sector_modules WHERE sector_key = 'real_estate'),
'Property Law', 'Ownership Types', 'beginner', 'remember', 'multiple_choice',
'Which type of property ownership gives the owner the most complete form of ownership?',
'Fee simple absolute provides the most complete form of ownership with no conditions or limitations on use, other than government restrictions.',
'[{"id":"a","text":"Fee simple absolute","is_correct":true},{"id":"b","text":"Life estate","is_correct":false},{"id":"c","text":"Leasehold estate","is_correct":false},{"id":"d","text":"Fee simple defeasible","is_correct":false}]'::jsonb,
'["property-law","ownership","fee-simple"]'::jsonb,
'State property law statutes', 1),

((SELECT id FROM public.sector_modules WHERE sector_key = 'real_estate'),
'Agency Law', 'Fiduciary Duties', 'intermediate', 'understand', 'multiple_choice',
'The fiduciary duty of "obedience" requires a real estate agent to:',
'The duty of obedience requires agents to follow all lawful instructions from their client, as long as those instructions do not violate the law.',
'[{"id":"a","text":"Follow all lawful instructions from the client","is_correct":true},{"id":"b","text":"Keep all information confidential","is_correct":false},{"id":"c","text":"Disclose all material facts","is_correct":false},{"id":"d","text":"Account for all funds received","is_correct":false}]'::jsonb,
'["agency-law","fiduciary","obedience"]'::jsonb,
'Common law agency duties', 2),

((SELECT id FROM public.sector_modules WHERE sector_key = 'real_estate'),
'Contracts', 'Contingencies', 'intermediate', 'apply', 'multiple_choice',
'A buyer signs a purchase agreement contingent on financing. The buyer cannot secure a mortgage. What is the most likely outcome?',
'A financing contingency protects the buyer by allowing them to cancel the contract and receive their earnest money back if they cannot secure a mortgage.',
'[{"id":"a","text":"The contract is voidable by the buyer and earnest money is returned","is_correct":true},{"id":"b","text":"The seller can sue for specific performance","is_correct":false},{"id":"c","text":"The buyer forfeits the earnest money","is_correct":false},{"id":"d","text":"The contract automatically becomes void","is_correct":false}]'::jsonb,
'["contracts","contingencies","financing"]'::jsonb,
'State contract law', 3),

((SELECT id FROM public.sector_modules WHERE sector_key = 'real_estate'),
'Fair Housing', 'Protected Classes', 'beginner', 'remember', 'multiple_choice',
'Which of the following is NOT a protected class under the federal Fair Housing Act?',
'The federal Fair Housing Act protects race, color, religion, national origin, sex, familial status, and disability. Marital status is not a federally protected class, though some states include it.',
'[{"id":"a","text":"Marital status","is_correct":true},{"id":"b","text":"Familial status","is_correct":false},{"id":"c","text":"National origin","is_correct":false},{"id":"d","text":"Disability","is_correct":false}]'::jsonb,
'["fair-housing","protected-classes","federal"]'::jsonb,
'Fair Housing Act, 42 USC 3601-3619', 4),

((SELECT id FROM public.sector_modules WHERE sector_key = 'real_estate'),
'Property Valuation', 'Appraisal Methods', 'intermediate', 'analyze', 'multiple_choice',
'When appraising a single-family residence, which approach is most commonly used?',
'The sales comparison approach (also called market approach) compares the subject property to recently sold similar properties. It is the most widely used method for residential appraisals.',
'[{"id":"a","text":"Sales comparison approach","is_correct":true},{"id":"b","text":"Income capitalization approach","is_correct":false},{"id":"c","text":"Cost approach","is_correct":false},{"id":"d","text":"Gross rent multiplier approach","is_correct":false}]'::jsonb,
'["valuation","appraisal","residential"]'::jsonb,
'USPAP Standards', 5),

((SELECT id FROM public.sector_modules WHERE sector_key = 'real_estate'),
'Closing & Settlement', 'RESPA', 'advanced', 'evaluate', 'true_false',
'Under RESPA, a real estate broker is permitted to receive a referral fee from a mortgage lender for referring buyers to that lender.',
'RESPA (Real Estate Settlement Procedures Act) Section 8 prohibits kickbacks and referral fees between settlement service providers. A broker cannot receive compensation for referring a buyer to a specific lender.',
'[]'::jsonb,
'["respa","closing","referral-fees"]'::jsonb,
'RESPA Section 8, 12 USC 2607', 6),

-- ============================================================================
-- INSURANCE — 6 questions
-- ============================================================================

((SELECT id FROM public.sector_modules WHERE sector_key = 'insurance'),
'Property & Casualty', 'Homeowners Insurance', 'beginner', 'remember', 'multiple_choice',
'Which homeowners insurance form provides the broadest coverage?',
'HO-5 (Comprehensive Form) provides open-peril coverage for both the dwelling and personal property, making it the broadest standard homeowners policy.',
'[{"id":"a","text":"HO-5 (Comprehensive Form)","is_correct":true},{"id":"b","text":"HO-3 (Special Form)","is_correct":false},{"id":"c","text":"HO-2 (Broad Form)","is_correct":false},{"id":"d","text":"HO-1 (Basic Form)","is_correct":false}]'::jsonb,
'["property-casualty","homeowners","coverage-forms"]'::jsonb,
'ISO Homeowners Forms', 1),

((SELECT id FROM public.sector_modules WHERE sector_key = 'insurance'),
'Life Insurance', 'Policy Types', 'intermediate', 'understand', 'multiple_choice',
'What distinguishes whole life insurance from term life insurance?',
'Whole life insurance provides lifelong coverage with a guaranteed death benefit AND accumulates cash value over time. Term life only provides a death benefit for a specified period with no cash value.',
'[{"id":"a","text":"Whole life builds cash value and provides permanent coverage","is_correct":true},{"id":"b","text":"Whole life is always less expensive","is_correct":false},{"id":"c","text":"Term life has no death benefit","is_correct":false},{"id":"d","text":"Whole life requires annual renewals","is_correct":false}]'::jsonb,
'["life-insurance","whole-life","term-life"]'::jsonb,
'State insurance statutes', 2),

((SELECT id FROM public.sector_modules WHERE sector_key = 'insurance'),
'Ethics & Compliance', 'Agent Conduct', 'intermediate', 'apply', 'multiple_choice',
'An insurance agent discovers that a client has provided false information on their application. What is the agent''s legal obligation?',
'Insurance agents have a legal and ethical duty to report material misrepresentations to the insurer. Failing to do so can result in E&O liability and license revocation.',
'[{"id":"a","text":"Report the misrepresentation to the insurer","is_correct":true},{"id":"b","text":"Cancel the policy immediately","is_correct":false},{"id":"c","text":"Correct the application without notifying anyone","is_correct":false},{"id":"d","text":"Ignore it if the client is otherwise trustworthy","is_correct":false}]'::jsonb,
'["ethics","agent-conduct","misrepresentation"]'::jsonb,
'NAIC Model Act, state DOI regulations', 3),

((SELECT id FROM public.sector_modules WHERE sector_key = 'insurance'),
'Health Insurance', 'ACA Provisions', 'beginner', 'remember', 'true_false',
'Under the Affordable Care Act (ACA), insurance companies can deny coverage based on pre-existing conditions.',
'The ACA prohibits insurance companies from denying coverage or charging higher premiums based on pre-existing health conditions. This applies to all individual and group health plans.',
'[]'::jsonb,
'["health-insurance","aca","pre-existing"]'::jsonb,
'ACA, 42 USC 300gg-3', 4),

((SELECT id FROM public.sector_modules WHERE sector_key = 'insurance'),
'Commercial Insurance', 'Business Policies', 'advanced', 'analyze', 'multiple_choice',
'A commercial general liability (CGL) policy typically covers which of the following?',
'A CGL policy covers bodily injury and property damage liability, personal and advertising injury, and medical payments. It does NOT cover professional errors (that requires E&O insurance).',
'[{"id":"a","text":"Bodily injury and property damage to third parties","is_correct":true},{"id":"b","text":"Employee workplace injuries","is_correct":false},{"id":"c","text":"Damage to the insured''s own property","is_correct":false},{"id":"d","text":"Professional errors and omissions","is_correct":false}]'::jsonb,
'["commercial","cgl","liability"]'::jsonb,
'ISO CGL Forms', 5),

((SELECT id FROM public.sector_modules WHERE sector_key = 'insurance'),
'Licensing', 'Requirements', 'beginner', 'understand', 'multiple_choice',
'What is the primary purpose of continuing education (CE) requirements for insurance agents?',
'CE requirements ensure that licensed agents stay current with industry changes, new regulations, and emerging products to properly serve their clients.',
'[{"id":"a","text":"To keep agents current with industry changes and regulations","is_correct":true},{"id":"b","text":"To generate revenue for the state","is_correct":false},{"id":"c","text":"To reduce the number of licensed agents","is_correct":false},{"id":"d","text":"To prepare agents for management roles","is_correct":false}]'::jsonb,
'["licensing","continuing-education"]'::jsonb,
'State DOI CE requirements', 6),

-- ============================================================================
-- HEALTHCARE — 5 questions
-- ============================================================================

((SELECT id FROM public.sector_modules WHERE sector_key = 'healthcare'),
'Patient Safety', 'Infection Control', 'beginner', 'remember', 'multiple_choice',
'What is the single most effective way to prevent the spread of infection in a healthcare setting?',
'Hand hygiene (proper handwashing or use of alcohol-based hand sanitizer) is consistently identified as the single most effective measure to prevent healthcare-associated infections.',
'[{"id":"a","text":"Proper hand hygiene","is_correct":true},{"id":"b","text":"Wearing gloves at all times","is_correct":false},{"id":"c","text":"Using antibiotics prophylactically","is_correct":false},{"id":"d","text":"Isolating all patients","is_correct":false}]'::jsonb,
'["infection-control","hand-hygiene","patient-safety"]'::jsonb,
'CDC Hand Hygiene Guidelines, OSHA BBP Standard', 1),

((SELECT id FROM public.sector_modules WHERE sector_key = 'healthcare'),
'HIPAA', 'Privacy Rule', 'intermediate', 'understand', 'multiple_choice',
'Under HIPAA, which of the following is considered Protected Health Information (PHI)?',
'PHI includes any individually identifiable health information that is created or received by a covered entity. A patient''s name combined with their diagnosis is PHI. De-identified data is NOT PHI.',
'[{"id":"a","text":"A patient''s name combined with their diagnosis","is_correct":true},{"id":"b","text":"De-identified aggregate health statistics","is_correct":false},{"id":"c","text":"A doctor''s published research article","is_correct":false},{"id":"d","text":"General hospital admission rates","is_correct":false}]'::jsonb,
'["hipaa","privacy","phi"]'::jsonb,
'HIPAA Privacy Rule, 45 CFR 164.514', 2),

((SELECT id FROM public.sector_modules WHERE sector_key = 'healthcare'),
'Nursing Fundamentals', 'Vital Signs', 'beginner', 'apply', 'multiple_choice',
'A CNA takes a patient''s blood pressure reading of 160/100 mmHg. This reading indicates:',
'A blood pressure reading of 160/100 mmHg is classified as Stage 2 hypertension according to the AHA guidelines (systolic >=140 or diastolic >=90).',
'[{"id":"a","text":"Stage 2 hypertension","is_correct":true},{"id":"b","text":"Normal blood pressure","is_correct":false},{"id":"c","text":"Hypotension","is_correct":false},{"id":"d","text":"Elevated blood pressure","is_correct":false}]'::jsonb,
'["vital-signs","blood-pressure","hypertension"]'::jsonb,
'AHA Blood Pressure Categories', 3),

((SELECT id FROM public.sector_modules WHERE sector_key = 'healthcare'),
'Medical Terminology', 'Prefixes and Suffixes', 'beginner', 'remember', 'multiple_choice',
'The medical suffix "-itis" refers to:',
'The suffix "-itis" means inflammation. Examples: arthritis (inflammation of joints), bronchitis (inflammation of bronchi), appendicitis (inflammation of appendix).',
'[{"id":"a","text":"Inflammation","is_correct":true},{"id":"b","text":"Surgical removal","is_correct":false},{"id":"c","text":"Study of","is_correct":false},{"id":"d","text":"Abnormal condition","is_correct":false}]'::jsonb,
'["terminology","suffixes"]'::jsonb,
NULL, 4),

((SELECT id FROM public.sector_modules WHERE sector_key = 'healthcare'),
'Clinical Skills', 'Patient Rights', 'intermediate', 'evaluate', 'multiple_choice',
'A patient refuses a prescribed treatment. The healthcare worker should:',
'Patients have the right to refuse treatment under the Patient Self-Determination Act. Healthcare workers must respect this right while documenting the refusal and ensuring the patient understands the consequences.',
'[{"id":"a","text":"Respect the refusal and document it, ensuring the patient understands consequences","is_correct":true},{"id":"b","text":"Administer the treatment anyway for the patient''s safety","is_correct":false},{"id":"c","text":"Contact law enforcement","is_correct":false},{"id":"d","text":"Discharge the patient immediately","is_correct":false}]'::jsonb,
'["patient-rights","refusal","documentation"]'::jsonb,
'Patient Self-Determination Act (PSDA)', 5),

-- ============================================================================
-- CDL TRUCKING — 5 questions
-- ============================================================================

((SELECT id FROM public.sector_modules WHERE sector_key = 'cdl_trucking'),
'Pre-Trip Inspection', 'Vehicle Systems', 'beginner', 'remember', 'multiple_choice',
'During a pre-trip inspection, the minimum tread depth for front tires on a CMV is:',
'FMCSA regulations (49 CFR 393.75) require a minimum tread depth of 4/32 inch on the front (steering) tires of a commercial motor vehicle.',
'[{"id":"a","text":"4/32 of an inch","is_correct":true},{"id":"b","text":"2/32 of an inch","is_correct":false},{"id":"c","text":"6/32 of an inch","is_correct":false},{"id":"d","text":"1/32 of an inch","is_correct":false}]'::jsonb,
'["pre-trip","tires","inspection"]'::jsonb,
'FMCSA 49 CFR 393.75', 1),

((SELECT id FROM public.sector_modules WHERE sector_key = 'cdl_trucking'),
'Hours of Service', 'Driving Limits', 'intermediate', 'understand', 'multiple_choice',
'Under current FMCSA Hours of Service rules, what is the maximum driving time after a required 10-hour off-duty period?',
'The 11-hour driving limit allows drivers to drive a maximum of 11 hours after 10 consecutive hours off duty.',
'[{"id":"a","text":"11 hours","is_correct":true},{"id":"b","text":"10 hours","is_correct":false},{"id":"c","text":"14 hours","is_correct":false},{"id":"d","text":"8 hours","is_correct":false}]'::jsonb,
'["hours-of-service","driving-limits","fmcsa"]'::jsonb,
'FMCSA 49 CFR 395.3', 2),

((SELECT id FROM public.sector_modules WHERE sector_key = 'cdl_trucking'),
'Vehicle Control', 'Braking', 'intermediate', 'apply', 'multiple_choice',
'When driving a vehicle with air brakes downhill, the correct technique is to:',
'The "stab braking" or controlled braking method on downgrades involves applying brakes firmly until speed is 5 mph below safe speed, releasing, then repeating. This prevents brake fade from overheating.',
'[{"id":"a","text":"Apply brakes until speed drops 5 mph below safe speed, release, repeat","is_correct":true},{"id":"b","text":"Ride the brakes lightly throughout the descent","is_correct":false},{"id":"c","text":"Shift to neutral and coast","is_correct":false},{"id":"d","text":"Apply the parking brake intermittently","is_correct":false}]'::jsonb,
'["vehicle-control","braking","downhill"]'::jsonb,
'FMCSA CDL General Knowledge', 3),

((SELECT id FROM public.sector_modules WHERE sector_key = 'cdl_trucking'),
'Hazardous Materials', 'Placarding', 'advanced', 'analyze', 'multiple_choice',
'A vehicle carrying 1,001 pounds or more of a Table 2 hazardous material must display:',
'Per 49 CFR 172.504, Table 2 materials require placards when the gross weight of the hazardous material is 1,001 pounds or more.',
'[{"id":"a","text":"The appropriate hazard class placard on all four sides","is_correct":true},{"id":"b","text":"A DANGEROUS placard only on the rear","is_correct":false},{"id":"c","text":"No placards until 5,000 pounds","is_correct":false},{"id":"d","text":"Only a placard on the driver side","is_correct":false}]'::jsonb,
'["hazmat","placarding","table-2"]'::jsonb,
'FMCSA 49 CFR 172.504', 4),

((SELECT id FROM public.sector_modules WHERE sector_key = 'cdl_trucking'),
'Safety', 'Coupling/Uncoupling', 'beginner', 'apply', 'multiple_choice',
'When coupling a tractor to a trailer, the correct order of steps begins with:',
'Proper coupling starts with inspecting the fifth wheel, backing under the trailer, locking the jaws, then connecting air and electrical lines and testing.',
'[{"id":"a","text":"Inspect the fifth wheel and trailer kingpin","is_correct":true},{"id":"b","text":"Connect the air lines","is_correct":false},{"id":"c","text":"Raise the landing gear","is_correct":false},{"id":"d","text":"Test the trailer brakes","is_correct":false}]'::jsonb,
'["coupling","safety","procedures"]'::jsonb,
'FMCSA CDL Skills Test', 5),

-- ============================================================================
-- COSMETOLOGY — 5 questions
-- ============================================================================

((SELECT id FROM public.sector_modules WHERE sector_key = 'cosmetology'),
'Sanitation & Safety', 'Disinfection', 'beginner', 'remember', 'multiple_choice',
'Which EPA-registered disinfectant is commonly used to disinfect non-porous tools in a salon?',
'Quaternary ammonium compounds (quats) are the most commonly used EPA-registered disinfectants in salons for non-porous tools. They are effective against bacteria, viruses, and fungi.',
'[{"id":"a","text":"Quaternary ammonium compounds (quats)","is_correct":true},{"id":"b","text":"Soap and water","is_correct":false},{"id":"c","text":"Hydrogen peroxide 3%","is_correct":false},{"id":"d","text":"Rubbing alcohol","is_correct":false}]'::jsonb,
'["sanitation","disinfection","tools"]'::jsonb,
'State Board Sanitation Requirements', 1),

((SELECT id FROM public.sector_modules WHERE sector_key = 'cosmetology'),
'Hair Science', 'Chemical Services', 'intermediate', 'understand', 'multiple_choice',
'During a permanent wave service, the chemical that breaks the disulfide bonds is the:',
'The waving/reducing lotion (typically ammonium thioglycolate) breaks the disulfide bonds, allowing the hair to be reshaped around rods. The neutralizer then reforms the bonds in the new shape.',
'[{"id":"a","text":"Waving/reducing lotion (ammonium thioglycolate)","is_correct":true},{"id":"b","text":"Neutralizer","is_correct":false},{"id":"c","text":"Conditioner","is_correct":false},{"id":"d","text":"Developer","is_correct":false}]'::jsonb,
'["hair-science","chemical-services","permanent-wave"]'::jsonb,
'NIC Cosmetology Exam Content', 2),

((SELECT id FROM public.sector_modules WHERE sector_key = 'cosmetology'),
'Skin Care', 'Anatomy', 'beginner', 'remember', 'multiple_choice',
'The outermost layer of the skin is called the:',
'The epidermis is the outermost layer of skin, composed of five sub-layers. It provides a waterproof barrier and creates skin tone.',
'[{"id":"a","text":"Epidermis","is_correct":true},{"id":"b","text":"Dermis","is_correct":false},{"id":"c","text":"Hypodermis","is_correct":false},{"id":"d","text":"Subcutaneous","is_correct":false}]'::jsonb,
'["skin-care","anatomy","epidermis"]'::jsonb,
'NIC Esthetics Exam Content', 3),

((SELECT id FROM public.sector_modules WHERE sector_key = 'cosmetology'),
'Nail Technology', 'Safety', 'intermediate', 'apply', 'multiple_choice',
'A client presents with signs of onychomycosis (nail fungus). The nail technician should:',
'Nail technicians cannot diagnose or treat medical conditions. If signs of infection or disease are present, the client should be referred to a physician. The technician should not perform services on the affected area.',
'[{"id":"a","text":"Decline service on the affected nails and refer the client to a physician","is_correct":true},{"id":"b","text":"Apply an antifungal product and proceed","is_correct":false},{"id":"c","text":"Perform the service but use extra disinfectant","is_correct":false},{"id":"d","text":"Cut away the affected nail portion","is_correct":false}]'::jsonb,
'["nail-technology","safety","fungal-infection"]'::jsonb,
'State Board Scope of Practice', 4),

((SELECT id FROM public.sector_modules WHERE sector_key = 'cosmetology'),
'Professional Development', 'Licensing', 'beginner', 'understand', 'true_false',
'A cosmetology license obtained in one state automatically allows practice in all other states.',
'Cosmetology licenses are state-specific. Each state has its own requirements for education hours, examination, and licensure. Reciprocity may exist between some states, but it is not automatic.',
'[]'::jsonb,
'["licensing","reciprocity","state-requirements"]'::jsonb,
'State cosmetology board regulations', 5),

-- ============================================================================
-- IT & TECH — 5 questions
-- ============================================================================

((SELECT id FROM public.sector_modules WHERE sector_key = 'it_tech'),
'Networking', 'TCP/IP Model', 'beginner', 'remember', 'multiple_choice',
'Which layer of the OSI model is responsible for routing packets between networks?',
'The Network Layer (Layer 3) handles routing, addressing, and packet forwarding between different networks. Routers operate at this layer.',
'[{"id":"a","text":"Network Layer (Layer 3)","is_correct":true},{"id":"b","text":"Transport Layer (Layer 4)","is_correct":false},{"id":"c","text":"Data Link Layer (Layer 2)","is_correct":false},{"id":"d","text":"Application Layer (Layer 7)","is_correct":false}]'::jsonb,
'["networking","osi-model","routing"]'::jsonb,
'CompTIA Network+ N10-009 Objective 1.1', 1),

((SELECT id FROM public.sector_modules WHERE sector_key = 'it_tech'),
'Security', 'Authentication', 'intermediate', 'understand', 'multiple_choice',
'Multi-factor authentication (MFA) requires at least two factors from which categories?',
'MFA requires factors from at least two different categories: something you know (password), something you have (token/phone), and something you are (biometric).',
'[{"id":"a","text":"Something you know, something you have, something you are","is_correct":true},{"id":"b","text":"Two different passwords","is_correct":false},{"id":"c","text":"A password and a security question","is_correct":false},{"id":"d","text":"An email address and a phone number","is_correct":false}]'::jsonb,
'["security","authentication","mfa"]'::jsonb,
'CompTIA Security+ SY0-701 Objective 4.6', 2),

((SELECT id FROM public.sector_modules WHERE sector_key = 'it_tech'),
'Cloud Computing', 'Service Models', 'beginner', 'understand', 'multiple_choice',
'In which cloud service model does the provider manage everything except the application and data?',
'In PaaS (Platform as a Service), the provider manages infrastructure, OS, and middleware. The customer manages only the application code and data. Examples: AWS Elastic Beanstalk, Azure App Service.',
'[{"id":"a","text":"Platform as a Service (PaaS)","is_correct":true},{"id":"b","text":"Infrastructure as a Service (IaaS)","is_correct":false},{"id":"c","text":"Software as a Service (SaaS)","is_correct":false},{"id":"d","text":"Function as a Service (FaaS)","is_correct":false}]'::jsonb,
'["cloud","service-models","paas"]'::jsonb,
'CompTIA Cloud+ CV0-004, AWS SAA-C03', 3),

((SELECT id FROM public.sector_modules WHERE sector_key = 'it_tech'),
'Linux Administration', 'File Permissions', 'intermediate', 'apply', 'multiple_choice',
'The Linux file permission "chmod 755" sets which permissions?',
'chmod 755 sets: owner=rwx (7=4+2+1), group=r-x (5=4+0+1), others=r-x (5=4+0+1). Owner can read/write/execute, group and others can only read and execute.',
'[{"id":"a","text":"Owner: read/write/execute; Group and Others: read/execute","is_correct":true},{"id":"b","text":"Everyone: read/write/execute","is_correct":false},{"id":"c","text":"Owner: read/write; Group and Others: read only","is_correct":false},{"id":"d","text":"Owner: all; Group: write; Others: none","is_correct":false}]'::jsonb,
'["linux","permissions","chmod"]'::jsonb,
'CompTIA Linux+ XK0-005 Objective 2.5', 4),

((SELECT id FROM public.sector_modules WHERE sector_key = 'it_tech'),
'Troubleshooting', 'Methodology', 'beginner', 'apply', 'multiple_choice',
'What is the first step in the CompTIA troubleshooting methodology?',
'The CompTIA troubleshooting methodology begins with identifying the problem through gathering information, questioning users, determining scope, and establishing a theory.',
'[{"id":"a","text":"Identify the problem","is_correct":true},{"id":"b","text":"Establish a theory of probable cause","is_correct":false},{"id":"c","text":"Test the theory","is_correct":false},{"id":"d","text":"Document findings","is_correct":false}]'::jsonb,
'["troubleshooting","methodology","a-plus"]'::jsonb,
'CompTIA A+ 220-1102 Objective 1.1', 5),

-- ============================================================================
-- CORPORATE COMPLIANCE — 5 questions
-- ============================================================================

((SELECT id FROM public.sector_modules WHERE sector_key = 'corporate_compliance'),
'OSHA', 'General Duty Clause', 'beginner', 'remember', 'multiple_choice',
'OSHA''s General Duty Clause requires employers to:',
'The General Duty Clause (Section 5(a)(1) of the OSH Act) requires employers to provide a workplace free from recognized hazards that are causing or likely to cause death or serious physical harm.',
'[{"id":"a","text":"Provide a workplace free from recognized hazards","is_correct":true},{"id":"b","text":"Provide health insurance to all employees","is_correct":false},{"id":"c","text":"Conduct annual safety audits by third parties","is_correct":false},{"id":"d","text":"Report all workplace injuries to the public","is_correct":false}]'::jsonb,
'["osha","general-duty","workplace-safety"]'::jsonb,
'OSHA Section 5(a)(1), 29 USC 654', 1),

((SELECT id FROM public.sector_modules WHERE sector_key = 'corporate_compliance'),
'Harassment Prevention', 'Legal Framework', 'intermediate', 'understand', 'multiple_choice',
'Under Title VII of the Civil Rights Act, which of the following is considered quid pro quo harassment?',
'Quid pro quo harassment occurs when employment decisions (hiring, firing, promotions) are based on submission to or rejection of unwelcome sexual conduct by a person in authority.',
'[{"id":"a","text":"A supervisor conditioning a promotion on acceptance of sexual advances","is_correct":true},{"id":"b","text":"Coworkers telling offensive jokes","is_correct":false},{"id":"c","text":"A customer making inappropriate comments","is_correct":false},{"id":"d","text":"An employee displaying offensive posters","is_correct":false}]'::jsonb,
'["harassment","quid-pro-quo","title-vii"]'::jsonb,
'Title VII, 42 USC 2000e', 2),

((SELECT id FROM public.sector_modules WHERE sector_key = 'corporate_compliance'),
'HIPAA', 'Breach Notification', 'intermediate', 'apply', 'multiple_choice',
'Under HIPAA, a covered entity must notify affected individuals of a data breach within:',
'HIPAA requires covered entities to notify affected individuals without unreasonable delay, and no later than 60 calendar days from discovery of the breach.',
'[{"id":"a","text":"60 calendar days from discovery","is_correct":true},{"id":"b","text":"30 calendar days from discovery","is_correct":false},{"id":"c","text":"24 hours from discovery","is_correct":false},{"id":"d","text":"1 year from discovery","is_correct":false}]'::jsonb,
'["hipaa","breach-notification","compliance"]'::jsonb,
'HIPAA Breach Notification Rule, 45 CFR 164.404', 3),

((SELECT id FROM public.sector_modules WHERE sector_key = 'corporate_compliance'),
'Workplace Safety', 'Fire Safety', 'beginner', 'remember', 'multiple_choice',
'The acronym PASS, used for operating a fire extinguisher, stands for:',
'PASS: Pull the pin, Aim at the base of the fire, Squeeze the handle, Sweep side to side.',
'[{"id":"a","text":"Pull, Aim, Squeeze, Sweep","is_correct":true},{"id":"b","text":"Push, Aim, Spray, Stop","is_correct":false},{"id":"c","text":"Pull, Activate, Spray, Stop","is_correct":false},{"id":"d","text":"Point, Aim, Squeeze, Spray","is_correct":false}]'::jsonb,
'["fire-safety","extinguisher","pass"]'::jsonb,
'OSHA Fire Prevention Plan, 29 CFR 1910.39', 4),

((SELECT id FROM public.sector_modules WHERE sector_key = 'corporate_compliance'),
'Anti-Corruption', 'FCPA', 'advanced', 'analyze', 'multiple_choice',
'Under the Foreign Corrupt Practices Act (FCPA), which action would be considered a violation?',
'The FCPA prohibits payments to foreign government officials to obtain or retain business. This includes payments made through intermediaries or third parties.',
'[{"id":"a","text":"Paying a foreign official through a third-party agent to win a government contract","is_correct":true},{"id":"b","text":"Making a routine payment to expedite customs clearance (facilitating payment)","is_correct":false},{"id":"c","text":"Hosting foreign officials at a reasonable business dinner","is_correct":false},{"id":"d","text":"Donating to a foreign charity unrelated to business interests","is_correct":false}]'::jsonb,
'["anti-corruption","fcpa","bribery"]'::jsonb,
'FCPA, 15 USC 78dd-1', 5),

-- ============================================================================
-- GOVERNMENT — 5 questions
-- ============================================================================

((SELECT id FROM public.sector_modules WHERE sector_key = 'government'),
'Ethics', 'Standards of Conduct', 'beginner', 'remember', 'multiple_choice',
'Federal employees are generally prohibited from accepting gifts valued above:',
'Under the Standards of Ethical Conduct for Employees of the Executive Branch (5 CFR 2635), the general gift limit from prohibited sources is $20 per occasion, not to exceed $50 per year from a single source.',
'[{"id":"a","text":"$20 per occasion from a prohibited source","is_correct":true},{"id":"b","text":"$100 per occasion","is_correct":false},{"id":"c","text":"$50 per occasion","is_correct":false},{"id":"d","text":"Any amount is acceptable if disclosed","is_correct":false}]'::jsonb,
'["ethics","gifts","standards-of-conduct"]'::jsonb,
'5 CFR 2635, OGE Standards', 1),

((SELECT id FROM public.sector_modules WHERE sector_key = 'government'),
'Cybersecurity', 'NIST Framework', 'intermediate', 'understand', 'multiple_choice',
'The NIST Cybersecurity Framework core consists of five functions. Which is NOT one of them?',
'The five NIST CSF core functions are: Identify, Protect, Detect, Respond, and Recover. "Remediate" is not a core function.',
'[{"id":"a","text":"Remediate","is_correct":true},{"id":"b","text":"Identify","is_correct":false},{"id":"c","text":"Protect","is_correct":false},{"id":"d","text":"Respond","is_correct":false}]'::jsonb,
'["cybersecurity","nist","framework"]'::jsonb,
'NIST CSF 2.0, CISA Requirements', 2),

((SELECT id FROM public.sector_modules WHERE sector_key = 'government'),
'Accessibility', 'Section 508', 'intermediate', 'apply', 'multiple_choice',
'Section 508 of the Rehabilitation Act requires federal agencies to make their electronic content accessible. This primarily means compliance with:',
'Section 508 requires federal agencies to comply with WCAG (Web Content Accessibility Guidelines) standards, specifically WCAG 2.0 Level AA, for all electronic information and technology.',
'[{"id":"a","text":"WCAG 2.0 Level AA standards","is_correct":true},{"id":"b","text":"ISO 9001 quality standards","is_correct":false},{"id":"c","text":"HIPAA security standards","is_correct":false},{"id":"d","text":"FedRAMP authorization requirements","is_correct":false}]'::jsonb,
'["accessibility","section-508","wcag"]'::jsonb,
'Section 508, 29 USC 794d; WCAG 2.0', 3),

((SELECT id FROM public.sector_modules WHERE sector_key = 'government'),
'Anti-Discrimination', 'EEO Principles', 'beginner', 'understand', 'multiple_choice',
'The primary federal agency responsible for enforcing employment anti-discrimination laws is the:',
'The Equal Employment Opportunity Commission (EEOC) is the federal agency responsible for enforcing Title VII, ADA, ADEA, EPA, GINA, and other workplace anti-discrimination laws.',
'[{"id":"a","text":"Equal Employment Opportunity Commission (EEOC)","is_correct":true},{"id":"b","text":"Department of Labor (DOL)","is_correct":false},{"id":"c","text":"Office of Personnel Management (OPM)","is_correct":false},{"id":"d","text":"Merit Systems Protection Board (MSPB)","is_correct":false}]'::jsonb,
'["eeo","anti-discrimination","eeoc"]'::jsonb,
'Title VII, 42 USC 2000e; EEOC', 4),

((SELECT id FROM public.sector_modules WHERE sector_key = 'government'),
'Records Management', 'FOIA', 'advanced', 'evaluate', 'multiple_choice',
'Under the Freedom of Information Act (FOIA), which category of information is generally exempt from disclosure?',
'FOIA Exemption 1 covers classified national defense or foreign policy information. Other exemptions cover trade secrets, law enforcement records, and personal privacy, among others.',
'[{"id":"a","text":"Classified national security information","is_correct":true},{"id":"b","text":"Budget allocation data","is_correct":false},{"id":"c","text":"Meeting minutes from public hearings","is_correct":false},{"id":"d","text":"Published agency regulations","is_correct":false}]'::jsonb,
'["foia","records-management","exemptions"]'::jsonb,
'FOIA, 5 USC 552(b)', 5);
