import type { LucideIcon } from "lucide-react";
import {
  Home,
  Shield,
  HeartPulse,
  Truck,
  Scissors,
  Monitor,
  Scale,
  Landmark,
} from "lucide-react";

export interface SectorFeature {
  title: string;
  description: string;
}

export interface SectorRegulator {
  name: string;
  jurisdiction: string;
}

export interface SectorData {
  slug: string;
  name: string;
  tagline: string;
  heroDescription: string;
  icon: LucideIcon;
  color: string; // Tailwind color class
  colorBg: string;
  colorText: string;
  modulePrice: string;
  painPoints: string[];
  features: SectorFeature[];
  regulators: SectorRegulator[];
  aiCapabilities: string[];
  complianceDocs: string[];
  questionBankSize: string;
  ctaText: string;
  testimonialQuote?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
}

export const SECTORS: Record<string, SectorData> = {
  "real-estate": {
    slug: "real-estate",
    name: "Real Estate Schools",
    tagline: "Pre-licensing to CE — fully automated",
    heroDescription:
      "SimpliLMS helps real estate schools manage admissions, generate state-compliant curriculum, and track continuing education hours — all under your brand. Support for TREC, GREC, FREC, DRE, and 45+ state commissions.",
    icon: Home,
    color: "blue",
    colorBg: "bg-blue-50",
    colorText: "text-blue-700",
    modulePrice: "$149",
    painPoints: [
      "Manually updating curriculum every time state regulations change",
      "Juggling multi-state compliance with different documentation formats",
      "Hours spent formatting syllabi for regulatory submissions",
      "No unified system for admissions, enrollment, and course delivery",
      "Tracking CE hours across multiple categories per student",
    ],
    features: [
      {
        title: "Multi-State Compliance",
        description:
          "Generate curriculum documentation in formats required by TREC (Texas), GREC (Georgia), FREC (Florida), DRE (California), and 45+ other state commissions. One course, multiple state submissions.",
      },
      {
        title: "CE Hour Tracking",
        description:
          "Automatically track continuing education hours by category (ethics, fair housing, electives, core). Students see their progress; admins see compliance status across all students.",
      },
      {
        title: "AI Curriculum Builder",
        description:
          "Generate pre-licensing, post-licensing, and broker courses with AI that understands real estate regulations, exam topics, and state-specific requirements.",
      },
      {
        title: "Exam Prep Question Bank",
        description:
          "500+ pre-loaded questions aligned to national and state-specific portions of the real estate licensing exam. Bloom's Taxonomy tagged for difficulty progression.",
      },
      {
        title: "Instructor Compliance",
        description:
          "Track instructor licensing, CE completions, and teaching qualifications. Auto-generate instructor qualification documentation for state submissions.",
      },
      {
        title: "Automated Enrollment",
        description:
          "Prospects apply, pay, and enroll — automatically. No manual data entry. Stripe-powered payments with installment plan support.",
      },
    ],
    regulators: [
      { name: "TREC", jurisdiction: "Texas" },
      { name: "GREC", jurisdiction: "Georgia" },
      { name: "FREC", jurisdiction: "Florida" },
      { name: "DRE", jurisdiction: "California" },
      { name: "DOS", jurisdiction: "New York" },
      { name: "ARELLO", jurisdiction: "National" },
    ],
    aiCapabilities: [
      "Generate pre-licensing course outlines aligned to state exam topics",
      "Create CE courses with proper hour categorization",
      "Build broker qualifying education curriculum",
      "Produce state-formatted syllabi and lesson plans",
      "Generate exam-style practice questions by topic",
      "Auto-update content when regulations change",
    ],
    complianceDocs: [
      "Course of Instruction forms (CSC-302COI for TWC)",
      "Syllabus in state-required format",
      "Written lesson plans with contact hours",
      "Instructor qualification documentation",
      "Program advisory committee records",
      "Student outcome tracking reports",
    ],
    questionBankSize: "500+",
    ctaText: "Start Your Real Estate School on SimpliLMS",
  },
  insurance: {
    slug: "insurance",
    name: "Insurance & Financial Services",
    tagline: "P&C, Life & Health, CE — one platform",
    heroDescription:
      "SimpliLMS powers insurance training schools with AI-generated curriculum aligned to state Department of Insurance requirements. Manage pre-licensing, continuing education, and adjuster training with automated compliance documentation.",
    icon: Shield,
    color: "green",
    colorBg: "bg-green-50",
    colorText: "text-green-700",
    modulePrice: "$149",
    painPoints: [
      "Each state DOI has different CE requirements and credit categories",
      "Updating courses across 50 states when regulations change",
      "Manual tracking of student CE hours and credit types",
      "Time-consuming state approval applications for new courses",
      "No connection between enrollment, payment, and course delivery",
    ],
    features: [
      {
        title: "Multi-State DOI Compliance",
        description:
          "Generate course documentation formatted for any state's Department of Insurance. Support for P&C, Life & Health, adjuster, and specialty license types across all 50 states.",
      },
      {
        title: "CE Credit Management",
        description:
          "Track CE credits by type (ethics, flood, long-term care, general) per state. Automated completion certificates with proper CE provider numbers.",
      },
      {
        title: "AI Course Generation",
        description:
          "Create pre-licensing and CE courses with AI that understands insurance regulations, product types, and state-specific requirements. Includes NAIC model law references.",
      },
      {
        title: "Exam Prep Materials",
        description:
          "400+ questions aligned to state licensing exam formats. Covers P&C concepts, Life & Health fundamentals, ethics, and state-specific regulations.",
      },
      {
        title: "Provider Approval Docs",
        description:
          "Auto-generate CE provider applications, course approval requests, and renewal documentation for state DOI submissions.",
      },
      {
        title: "NMLS Integration Ready",
        description:
          "Track mortgage loan originator education requirements. Generate documentation aligned to NMLS continuing education standards.",
      },
    ],
    regulators: [
      { name: "State DOI", jurisdiction: "All 50 States" },
      { name: "NAIC", jurisdiction: "National" },
      { name: "FINRA", jurisdiction: "National (Securities)" },
      { name: "NMLS", jurisdiction: "National (Mortgage)" },
    ],
    aiCapabilities: [
      "Generate P&C and Life & Health pre-licensing curriculum",
      "Create CE courses categorized by credit type",
      "Build adjuster training programs by state",
      "Produce state DOI-formatted course applications",
      "Generate practice exams matching state exam formats",
      "Auto-categorize content by CE credit type",
    ],
    complianceDocs: [
      "CE provider applications per state",
      "Course approval request forms",
      "Instructor qualification records",
      "Student CE completion certificates",
      "Annual renewal documentation",
      "Credit hour classification reports",
    ],
    questionBankSize: "400+",
    ctaText: "Start Your Insurance School on SimpliLMS",
  },
  healthcare: {
    slug: "healthcare",
    name: "Healthcare Training",
    tagline: "CNA, MA, Phlebotomy — compliant and complete",
    heroDescription:
      "SimpliLMS helps healthcare training schools manage the full student lifecycle — from application to clinical competency documentation. AI-powered curriculum generation aligned to state nursing boards, NAACLS, and CMS requirements.",
    icon: HeartPulse,
    color: "red",
    colorBg: "bg-red-50",
    colorText: "text-red-700",
    modulePrice: "$199",
    painPoints: [
      "Complex documentation for state nursing board approval",
      "Tracking theory hours separately from clinical and lab hours",
      "Maintaining competency checklists for each student",
      "OSHA and infection control training compliance tracking",
      "No unified system for admissions, clinical scheduling, and grades",
    ],
    features: [
      {
        title: "Clinical Hour Tracking",
        description:
          "Separate tracking for theory, clinical, and lab hours with state-specific minimums. CNA programs automatically enforce the 75+ hour federal minimum with state supplements.",
      },
      {
        title: "Competency Documentation",
        description:
          "Digital competency checklists for every required skill. Track student proficiency across vital signs, patient care, infection control, and specialty procedures.",
      },
      {
        title: "AI Curriculum Builder",
        description:
          "Generate CNA, Medical Assistant, and Phlebotomy curriculum aligned to state nursing board requirements, NAACLS standards, and ABHES competencies.",
      },
      {
        title: "OSHA Integration",
        description:
          "Built-in OSHA bloodborne pathogens, infection control, and workplace safety training modules. Track completion and generate compliance reports.",
      },
      {
        title: "State Board Documentation",
        description:
          "Auto-generate program approval documentation, faculty qualification records, and clinical site agreements in formats required by state nursing boards.",
      },
      {
        title: "Exam Prep Engine",
        description:
          "800+ questions aligned to CNA competency exam, NAACLS phlebotomy exam, and state-specific certification requirements.",
      },
    ],
    regulators: [
      { name: "State Nursing Boards", jurisdiction: "All 50 States" },
      { name: "CMS", jurisdiction: "Federal (CNA)" },
      { name: "NAACLS", jurisdiction: "National (Phlebotomy)" },
      { name: "ABHES", jurisdiction: "National (MA)" },
      { name: "OSHA", jurisdiction: "Federal (Safety)" },
    ],
    aiCapabilities: [
      "Generate CNA 75+ hour curriculum with theory/clinical split",
      "Create phlebotomy programs aligned to NAACLS standards",
      "Build Medical Assistant competency frameworks",
      "Produce clinical skills checklists per program type",
      "Generate state nursing board submission documentation",
      "Auto-create OSHA compliance training modules",
    ],
    complianceDocs: [
      "Program approval applications",
      "Clinical competency checklists",
      "Faculty credential documentation",
      "Clinical site agreements",
      "OSHA training completion records",
      "Student outcome and placement reports",
    ],
    questionBankSize: "800+",
    ctaText: "Start Your Healthcare School on SimpliLMS",
  },
  "cdl-trucking": {
    slug: "cdl-trucking",
    name: "CDL Trucking Schools",
    tagline: "ELDT-compliant from day one",
    heroDescription:
      "SimpliLMS is built for CDL training schools that need FMCSA ELDT compliance without the paperwork headaches. Manage theory and behind-the-wheel hours, track endorsements, and automate enrollment — all in one platform.",
    icon: Truck,
    color: "amber",
    colorBg: "bg-amber-50",
    colorText: "text-amber-700",
    modulePrice: "$149",
    painPoints: [
      "ELDT compliance documentation is time-consuming and error-prone",
      "Tracking theory hours separately from behind-the-wheel (BTW) hours",
      "Managing multiple endorsement types per student",
      "FMCSA Training Provider Registry reporting",
      "No unified system connecting enrollment to training records",
    ],
    features: [
      {
        title: "ELDT Compliance",
        description:
          "Full Entry-Level Driver Training compliance with automatic theory hour and BTW hour tracking. Documentation formatted for FMCSA requirements.",
      },
      {
        title: "Theory + BTW Tracking",
        description:
          "Separate tracking for classroom theory hours and behind-the-wheel training. Minimum hour requirements enforced per FMCSA standards.",
      },
      {
        title: "Endorsement Management",
        description:
          "Track Class A, Class B, Hazmat, Passenger, Tank, and combination endorsement training per student. Each endorsement has its own hour requirements.",
      },
      {
        title: "AI Curriculum Builder",
        description:
          "Generate ELDT-compliant curriculum covering vehicle systems, driving skills, non-driving activities, and endorsement-specific topics.",
      },
      {
        title: "Pre-Trip Inspection Checklists",
        description:
          "Digital pre-trip, en-route, and post-trip inspection competency checklists. Students demonstrate proficiency; instructors verify digitally.",
      },
      {
        title: "Training Provider Registry",
        description:
          "Documentation and reporting aligned to FMCSA Training Provider Registry requirements. Track completions for TPR submission.",
      },
    ],
    regulators: [
      { name: "FMCSA", jurisdiction: "Federal" },
      { name: "State DMV", jurisdiction: "All 50 States" },
      { name: "PTDI", jurisdiction: "National (Voluntary)" },
      { name: "CVTA", jurisdiction: "National (Industry)" },
    ],
    aiCapabilities: [
      "Generate ELDT theory curriculum by endorsement type",
      "Create BTW skills assessment rubrics",
      "Build pre-trip inspection training modules",
      "Produce FMCSA-formatted training documentation",
      "Generate CDL knowledge test practice questions",
      "Auto-create endorsement-specific training plans",
    ],
    complianceDocs: [
      "ELDT theory training records",
      "Behind-the-wheel training logs",
      "Skills test preparation documentation",
      "Pre-trip inspection competency records",
      "Training Provider Registry reports",
      "Endorsement completion certificates",
    ],
    questionBankSize: "350+",
    ctaText: "Start Your CDL School on SimpliLMS",
  },
  cosmetology: {
    slug: "cosmetology",
    name: "Cosmetology & Beauty Schools",
    tagline: "1,000 to 2,100 hours — tracked automatically",
    heroDescription:
      "SimpliLMS helps cosmetology schools manage the long-duration training programs that state boards require. Track theory and practical hours, document skills competencies, and generate state board-ready documentation with AI assistance.",
    icon: Scissors,
    color: "pink",
    colorBg: "bg-pink-50",
    colorText: "text-pink-700",
    modulePrice: "$99",
    painPoints: [
      "State-mandated hour requirements vary from 1,000 to 2,100 hours",
      "Tracking theory vs. practical hours across long programs",
      "Documenting practical skills competencies for state boards",
      "Different requirements for cosmetology, esthetics, nails, and barbering",
      "Paper-based hour logging is inefficient and error-prone",
    ],
    features: [
      {
        title: "Hour Tracking by Category",
        description:
          "Track theory, practical, and clinical hours separately with state-specific minimums. Support for cosmetology, esthetics, nail technology, and barbering programs.",
      },
      {
        title: "Skills Competency Documentation",
        description:
          "Digital checklists for every required practical skill — cuts, colors, chemical services, skin care, nail services. Students build a verified competency portfolio.",
      },
      {
        title: "AI Curriculum Builder",
        description:
          "Generate curriculum aligned to state cosmetology board requirements and NIC exam objectives. Covers theory, sanitation, and practical application topics.",
      },
      {
        title: "State Board Documentation",
        description:
          "Auto-generate the documentation your state cosmetology board requires — program outlines, hour breakdowns, instructor qualifications, and facility descriptions.",
      },
      {
        title: "NIC Exam Prep",
        description:
          "300+ questions aligned to National-Interstate Council written and practical exam formats. Covers theory, safety, and sanitation topics.",
      },
      {
        title: "Enrollment & Payments",
        description:
          "Full admissions pipeline — application, payment processing, enrollment — built for the unique needs of beauty schools with long-duration programs.",
      },
    ],
    regulators: [
      { name: "State Cosmetology Boards", jurisdiction: "All 50 States" },
      { name: "NIC", jurisdiction: "National" },
      { name: "NACCAS", jurisdiction: "National (Accreditation)" },
    ],
    aiCapabilities: [
      "Generate state-specific cosmetology curriculum by hour requirement",
      "Create practical skills training sequences",
      "Build sanitation and safety modules",
      "Produce state board-formatted program documentation",
      "Generate NIC exam-aligned practice assessments",
      "Auto-adjust curriculum for esthetics, nails, or barbering tracks",
    ],
    complianceDocs: [
      "Program hour breakdown by category",
      "Practical skills competency records",
      "Instructor license and qualification documentation",
      "State board program approval applications",
      "Student hour transcripts",
      "Facility and equipment documentation",
    ],
    questionBankSize: "300+",
    ctaText: "Start Your Beauty School on SimpliLMS",
  },
  "it-tech": {
    slug: "it-tech",
    name: "IT & Tech Training",
    tagline: "CompTIA to cloud certs — AI-powered",
    heroDescription:
      "SimpliLMS helps IT training schools and coding bootcamps deliver certification-aligned curriculum with AI assistance. Map courses to CompTIA, AWS, Azure, and other certification exam objectives automatically.",
    icon: Monitor,
    color: "violet",
    colorBg: "bg-violet-50",
    colorText: "text-violet-700",
    modulePrice: "$99",
    painPoints: [
      "Certification exam objectives change frequently",
      "Mapping course content to specific exam domains is tedious",
      "Tracking lab completions alongside theory lessons",
      "Students need hands-on practice, not just lectures",
      "Bootcamp enrollment and payment processes are manual",
    ],
    features: [
      {
        title: "Certification Alignment",
        description:
          "Map courses directly to CompTIA A+, Network+, Security+, AWS, Azure, and other certification exam objectives. Students see exactly which objectives each lesson covers.",
      },
      {
        title: "Lab Completion Tracking",
        description:
          "Track hands-on lab exercises alongside theory lessons. Students build practical skills with documented completion records.",
      },
      {
        title: "AI Curriculum Builder",
        description:
          "Generate courses aligned to certification exam objectives. AI understands CompTIA domains, AWS service categories, and cybersecurity frameworks.",
      },
      {
        title: "Practice Exam Engine",
        description:
          "400+ questions aligned to certification exam formats. Performance-based, multiple choice, and drag-and-drop question types.",
      },
      {
        title: "Student Portfolio Tracking",
        description:
          "Track student projects, capstones, and portfolio items. Generate skills-to-job mapping documentation for employer partnerships.",
      },
      {
        title: "Bootcamp Enrollment",
        description:
          "Full admissions pipeline optimized for bootcamp-style programs — application, income share agreements, installment payments, and automated enrollment.",
      },
    ],
    regulators: [
      { name: "CompTIA", jurisdiction: "Industry Certification" },
      { name: "AWS", jurisdiction: "Cloud Certification" },
      { name: "Microsoft", jurisdiction: "Cloud/IT Certification" },
      { name: "State Regulators", jurisdiction: "TWC, BPPE, etc." },
    ],
    aiCapabilities: [
      "Generate courses mapped to CompTIA exam objectives",
      "Create cloud certification training aligned to AWS/Azure domains",
      "Build cybersecurity curriculum following NIST framework",
      "Produce lab exercise specifications and rubrics",
      "Generate certification practice exams by domain",
      "Auto-update content when exam objectives change",
    ],
    complianceDocs: [
      "Certification alignment mapping documents",
      "Lab exercise completion records",
      "Student skills portfolio documentation",
      "Program approval applications (for state-regulated schools)",
      "Employer partnership documentation",
      "Student outcome and placement reports",
    ],
    questionBankSize: "400+",
    ctaText: "Start Your Tech School on SimpliLMS",
  },
  "corporate-compliance": {
    slug: "corporate-compliance",
    name: "Corporate Compliance Training",
    tagline: "OSHA, HIPAA, harassment — all tracked",
    heroDescription:
      "SimpliLMS helps compliance training providers deliver, track, and certify mandatory workplace training. AI-generated courses for OSHA, HIPAA, sexual harassment prevention, and industry-specific regulations — with automated completion tracking and audit-ready reports.",
    icon: Scale,
    color: "orange",
    colorBg: "bg-orange-50",
    colorText: "text-orange-700",
    modulePrice: "$149",
    painPoints: [
      "Tracking who has completed mandatory training is a spreadsheet nightmare",
      "Certifications expire and renewal tracking is manual",
      "Creating updated compliance courses takes weeks",
      "Audit requests require scrambling for documentation",
      "No system connects training delivery to compliance reporting",
    ],
    features: [
      {
        title: "Mandatory Training Tracker",
        description:
          "Track which employees have completed required training, when certifications expire, and who needs renewal. Dashboard view by department, location, or individual.",
      },
      {
        title: "Automated Renewal Alerts",
        description:
          "Automatic email and in-portal notifications when certifications are approaching expiration. Configurable reminder windows (30, 14, 7 days).",
      },
      {
        title: "AI Course Generation",
        description:
          "Generate OSHA, HIPAA, harassment prevention, and other compliance courses with AI that understands federal and state-specific requirements.",
      },
      {
        title: "Certificate Generation",
        description:
          "Auto-generate completion certificates with unique verification codes. Employers can verify authenticity via public verification URL.",
      },
      {
        title: "Audit-Ready Reports",
        description:
          "One-click export of compliance status reports by organization, department, or individual. Formatted for OSHA, HIPAA, and state audit requirements.",
      },
      {
        title: "Multi-Organization Support",
        description:
          "Serve multiple client organizations from one account. Each organization sees only their employees and training data.",
      },
    ],
    regulators: [
      { name: "OSHA", jurisdiction: "Federal (Safety)" },
      { name: "HHS/OCR", jurisdiction: "Federal (HIPAA)" },
      { name: "EEOC", jurisdiction: "Federal (EEO)" },
      { name: "State Agencies", jurisdiction: "State-Specific" },
      { name: "SEC/SOX", jurisdiction: "Federal (Financial)" },
    ],
    aiCapabilities: [
      "Generate OSHA 10-hour and 30-hour course content",
      "Create HIPAA Privacy and Security Rule training",
      "Build sexual harassment prevention courses (state-specific)",
      "Produce workplace safety modules by industry",
      "Generate compliance assessment questions",
      "Auto-update courses when regulations change",
    ],
    complianceDocs: [
      "Training completion certificates",
      "Compliance status reports by organization",
      "Certification expiration tracking reports",
      "OSHA training log documentation",
      "HIPAA training verification records",
      "Audit response documentation packages",
    ],
    questionBankSize: "600+",
    ctaText: "Start Your Compliance Training Business on SimpliLMS",
  },
  government: {
    slug: "government",
    name: "Government Agencies",
    tagline: "Federal and state employee training — simplified",
    heroDescription:
      "SimpliLMS helps government agencies and public-sector training providers manage mandatory employee training programs. AI-powered curriculum development, Individual Development Plan tracking, and agency-level compliance reporting — all accessible and secure.",
    icon: Landmark,
    color: "slate",
    colorBg: "bg-slate-100",
    colorText: "text-slate-700",
    modulePrice: "$199",
    painPoints: [
      "OPM-mandated training requirements are complex and varied",
      "Tracking training across large agencies with multiple departments",
      "Individual Development Plans (IDPs) are managed on paper or spreadsheets",
      "Accessibility (Section 508) compliance for training materials",
      "Budget tracking for training expenditures per employee/department",
    ],
    features: [
      {
        title: "Agency-Level Reporting",
        description:
          "Training completion dashboards by department, division, and individual. Track compliance with OPM, EEOC, and agency-specific mandated training requirements.",
      },
      {
        title: "IDP Integration",
        description:
          "Individual Development Plan tracking tied directly to training courses. Employees and supervisors collaboratively manage professional development goals.",
      },
      {
        title: "AI Curriculum Builder",
        description:
          "Generate training content for supervisory skills, EEO, cybersecurity awareness, ethics, and other government-mandated topics. AI understands federal training frameworks.",
      },
      {
        title: "Accessibility Built-In",
        description:
          "All generated content follows Section 508 accessibility guidelines. Screen reader compatible, keyboard navigable, and WCAG 2.1 AA compliant.",
      },
      {
        title: "Budget & Expenditure Tracking",
        description:
          "Track training costs per employee, per department, and per program. Generate budget reports for fiscal year planning and justification.",
      },
      {
        title: "Secure & Compliant",
        description:
          "Role-based access control, audit logging, and data encryption. Suitable for CUI (Controlled Unclassified Information) training environments.",
      },
    ],
    regulators: [
      { name: "OPM", jurisdiction: "Federal" },
      { name: "EEOC", jurisdiction: "Federal" },
      { name: "OMB", jurisdiction: "Federal (Budget)" },
      { name: "CISA", jurisdiction: "Federal (Cybersecurity)" },
      { name: "State HR Departments", jurisdiction: "State" },
    ],
    aiCapabilities: [
      "Generate supervisory and leadership development courses",
      "Create EEO and diversity training aligned to EEOC guidelines",
      "Build cybersecurity awareness training (NIST 800-50 aligned)",
      "Produce ethics training for government employees",
      "Generate new employee onboarding curriculum",
      "Auto-create Section 508 compliant training materials",
    ],
    complianceDocs: [
      "Agency training completion reports",
      "Individual Development Plan documentation",
      "Mandated training compliance summaries",
      "Budget expenditure reports by department",
      "Accessibility compliance documentation",
      "Annual training plan documentation",
    ],
    questionBankSize: "500+",
    ctaText: "Modernize Your Agency's Training with SimpliLMS",
  },
};

export const SECTOR_LIST = Object.values(SECTORS);
