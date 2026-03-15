import Anthropic from "@anthropic-ai/sdk";

// ============================================================
// Claude API Client
// ============================================================

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "ANTHROPIC_API_KEY environment variable is not set. " +
          "Required for AI Course Creator."
      );
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

// ============================================================
// Models
// ============================================================

/** Conversational interview — fast, good at asking questions */
export const INTERVIEW_MODEL = "claude-sonnet-4-20250514";

/** Course generation — structured JSON output, long context */
export const GENERATION_MODEL = "claude-sonnet-4-20250514";

// ============================================================
// System Prompts
// ============================================================

export function getInterviewSystemPrompt(
  topic: string,
  targetAudience: string,
  desiredLength: string,
  additionalContext?: string,
  sectorPrompt?: string
): string {
  const sectorSection = sectorPrompt
    ? `\n\nSECTOR-SPECIFIC CONTEXT:\n${sectorPrompt}\n`
    : "";

  return `You are a curriculum designer interviewing a subject matter expert to build a course on "${topic}" for "${targetAudience}".

The desired course length is approximately ${desiredLength}.
${additionalContext ? `\nAdditional context from the instructor: ${additionalContext}` : ""}
${sectorSection}
Your goal is to extract enough knowledge to create a comprehensive, high-quality course with:
- 4-8 modules (logical groupings of related topics)
- 3-6 lessons per module
- Clear learning objectives for each module
- Quiz questions for assessment
- Practical exercises or real-world applications

INTERVIEW GUIDELINES:
- Ask ONE focused question at a time
- Start broad (overall scope, key topics) then drill into specifics
- Ask about common misconceptions students have
- Ask about practical exercises and real-world applications
- Ask about prerequisites students should have
- Ask about assessment — what should students be able to DO after the course?
- Keep questions concise and specific
- Acknowledge the expert's answers before asking the next question
- After 8-15 meaningful exchanges, when you have enough material to build the full course, end your message with the exact marker: [READY_TO_GENERATE]

IMPORTANT: Do NOT include [READY_TO_GENERATE] until you truly have enough information to create a detailed, comprehensive course. If the expert's answers are vague, ask follow-up questions to get specific, actionable content.

Start by introducing yourself and asking your first question.`;
}

export function getGenerationSystemPrompt(
  sectorPrompt?: string
): string {
  const sectorSection = sectorPrompt
    ? `\n\nSECTOR-SPECIFIC REQUIREMENTS:\n${sectorPrompt}\nEnsure the generated course aligns with these regulatory and industry standards.\n`
    : "";

  return `You are a curriculum designer creating a structured course from an interview transcript with a subject matter expert.
${sectorSection}
Analyze the transcript carefully and generate a complete course structure. Every lesson must contain substantial, educational content — not just outlines or placeholders.

Return ONLY valid JSON matching this exact schema (no markdown, no code fences, just JSON):

{
  "title": "Course Title",
  "description": "2-3 sentence course description",
  "category": "category name",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "estimated_hours": number,
  "learning_objectives": ["objective 1", "objective 2", ...],
  "modules": [
    {
      "title": "Module 1 Title",
      "description": "Module description",
      "lessons": [
        {
          "title": "Lesson Title",
          "content_type": "text",
          "content": "Full lesson content in HTML. Include <h2>, <h3>, <p>, <ul>, <ol>, <strong>, <em> tags. This should be a complete, teachable lesson — 500-2000 words. Include examples, explanations, and key takeaways.",
          "duration_minutes": 15,
          "quiz_questions": [
            {
              "question_type": "multiple_choice",
              "question_text": "Question text here?",
              "options": [
                { "id": "a", "text": "Option A", "is_correct": false },
                { "id": "b", "text": "Option B", "is_correct": true },
                { "id": "c", "text": "Option C", "is_correct": false },
                { "id": "d", "text": "Option D", "is_correct": false }
              ],
              "explanation": "Why option B is correct..."
            },
            {
              "question_type": "true_false",
              "question_text": "Statement to evaluate?",
              "correct_answer": true,
              "explanation": "Why this is true..."
            }
          ]
        }
      ]
    }
  ]
}

CONTENT QUALITY REQUIREMENTS:
1. Each lesson content must be 500-2000 words of real, educational content
2. Include practical examples and real-world applications
3. Use proper HTML formatting for readability
4. Each module should have 2-4 quiz questions across its lessons
5. Mix question types (multiple_choice, true_false)
6. Explanations should teach — not just state the answer
7. Learning objectives should use Bloom's Taxonomy verbs (define, explain, apply, analyze, evaluate, create)
8. Difficulty progression: start with fundamentals, build to advanced topics`;
}

export function getDocumentGenerationPrompt(
  topic: string,
  targetAudience: string,
  desiredLength: string,
  documentContents: string,
  additionalContext?: string,
  sectorPrompt?: string
): string {
  const sectorSection = sectorPrompt
    ? `\n\nSECTOR-SPECIFIC REQUIREMENTS:\n${sectorPrompt}\nEnsure the generated course aligns with these regulatory and industry standards.\n`
    : "";

  return `You are a curriculum designer creating a structured course from reference documents.

COURSE PARAMETERS:
- Topic: ${topic}
- Target Audience: ${targetAudience}
- Desired Length: ${desiredLength}
${additionalContext ? `- Additional Context: ${additionalContext}` : ""}
${sectorSection}
REFERENCE DOCUMENTS:
${documentContents}

Using the reference documents above as your primary source material, create a comprehensive course.

IMPORTANT:
- Base all content on information from the documents
- Do NOT invent facts not supported by the documents
- If the documents don't cover a necessary topic adequately, note it with [NEEDS_REVIEW] in the content
- Cite document sections where possible

${getGenerationSystemPrompt(sectorPrompt).split("Return ONLY valid JSON")[1] ? "Return ONLY valid JSON" + getGenerationSystemPrompt(sectorPrompt).split("Return ONLY valid JSON")[1] : ""}`;
}

// ============================================================
// Sector-Specific AI Prompts
// ============================================================

export const SECTOR_AI_PROMPTS: Record<string, string> = {
  real_estate: `This course is for a REAL ESTATE training school. Consider:
- State-specific real estate commission requirements (TREC, GREC, FREC, DRE, etc.)
- Pre-licensing vs post-licensing vs continuing education distinctions
- Contact hour requirements and how they map to lesson durations
- Fair housing laws and ethics requirements
- National vs state-specific exam portions
- Practical applications: contracts, closings, property law, agency relationships
- Ensure content aligns with ARELLO/IDECC standards where applicable`,

  insurance: `This course is for an INSURANCE training school. Consider:
- State Department of Insurance requirements
- License types: Property & Casualty, Life & Health, adjusters, specialty lines
- CE credit categories: ethics, flood, long-term care, general
- NAIC model laws and their state adoptions
- NMLS requirements for mortgage-related education
- Practical applications: underwriting, claims, risk assessment, policy analysis
- Ensure content aligns with state-specific exam formats`,

  healthcare: `This course is for a HEALTHCARE training school. Consider:
- Federal and state nursing board requirements
- CNA: Minimum 75 hours (federal), state supplements vary
- Theory vs clinical vs lab hour distinctions — track separately
- Competency-based skill validation requirements
- OSHA bloodborne pathogens and infection control standards
- NAACLS standards for phlebotomy programs
- ABHES competencies for medical assistant programs
- CMS requirements for Medicare/Medicaid training
- Patient safety, HIPAA, and ethical considerations`,

  cdl_trucking: `This course is for a CDL TRUCKING school. Consider:
- FMCSA Entry-Level Driver Training (ELDT) requirements
- Theory hours vs Behind-the-Wheel (BTW) hours — separate tracking
- Class A, Class B, and endorsement-specific requirements (Hazmat, Passenger, Tank)
- Pre-trip, en-route, and post-trip inspection competencies
- Training Provider Registry (TPR) documentation requirements
- DOT regulations, hours of service, and safety compliance
- PTDI standards (voluntary but respected)
- Practical skills: vehicle control, backing, coupling/uncoupling`,

  cosmetology: `This course is for a COSMETOLOGY/BEAUTY school. Consider:
- State-mandated hour requirements (vary from 1,000 to 2,100 hours)
- Theory vs practical hour split requirements
- Specialty tracks: cosmetology, esthetics, nail technology, barbering
- State cosmetology board approval requirements
- NIC (National-Interstate Council) exam alignment
- NACCAS accreditation standards
- Sanitation, safety, and infection control requirements
- Practical competency documentation (cuts, colors, chemical services)`,

  it_tech: `This course is for an IT/TECH training school. Consider:
- Industry certification alignment (CompTIA, AWS, Azure, Cisco, etc.)
- Exam objective mapping — each lesson should reference specific objectives
- Hands-on lab exercises and practical demonstrations
- Performance-based question formats used in certification exams
- Prerequisite certification paths (A+ → Network+ → Security+)
- Real-world scenario-based learning
- Current technology versions and updates
- Career pathway mapping (help desk → sysadmin → architect)`,

  corporate_compliance: `This course is for CORPORATE COMPLIANCE training. Consider:
- OSHA regulatory requirements (10-hour vs 30-hour programs)
- HIPAA Privacy Rule and Security Rule specifics
- Sexual harassment prevention (state-specific requirements: CA, NY, IL, CT, ME, DE)
- Workplace safety by industry vertical
- SOX compliance for financial reporting
- AML/KYC training for financial institutions
- Documentation and record-keeping requirements
- Certification expiration and renewal tracking
- Audit readiness and documentation formats`,

  government: `This course is for GOVERNMENT AGENCY training. Consider:
- OPM (Office of Personnel Management) mandated training requirements
- EEOC training requirements for managers and supervisors
- CISA cybersecurity awareness training (NIST 800-50 alignment)
- Section 508 accessibility requirements for all content
- Annual mandatory training refresh requirements
- Individual Development Plan (IDP) alignment
- Federal vs state employee training distinctions
- Ethics training specific to government service
- Budget justification documentation for training programs
- WCAG 2.1 AA compliance for course materials`,
};

// ============================================================
// Types
// ============================================================

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface GeneratedOutline {
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimated_hours: number;
  learning_objectives: string[];
  modules: GeneratedModule[];
}

export interface GeneratedModule {
  title: string;
  description: string;
  lessons: GeneratedLesson[];
}

export interface GeneratedLesson {
  title: string;
  content_type: "text";
  content: string;
  duration_minutes: number;
  quiz_questions: GeneratedQuizQuestion[];
}

export interface GeneratedQuizQuestion {
  question_type: "multiple_choice" | "true_false" | "short_answer";
  question_text: string;
  options?: { id: string; text: string; is_correct: boolean }[];
  correct_answer?: boolean | string;
  explanation: string;
}

// ============================================================
// Helpers
// ============================================================

/**
 * Parse a JSON response from Claude, handling potential markdown code fences
 */
export function parseGeneratedOutline(text: string): GeneratedOutline {
  // Remove markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  const parsed = JSON.parse(cleaned);

  // Basic validation
  if (!parsed.title || !Array.isArray(parsed.modules)) {
    throw new Error(
      "Invalid course outline: missing title or modules array"
    );
  }

  for (const mod of parsed.modules) {
    if (!mod.title || !Array.isArray(mod.lessons)) {
      throw new Error(
        `Invalid module: "${mod.title || "unnamed"}" missing title or lessons`
      );
    }
  }

  return parsed as GeneratedOutline;
}

/**
 * Check if the assistant's message contains the ready-to-generate marker
 */
export function isReadyToGenerate(message: string): boolean {
  return message.includes("[READY_TO_GENERATE]");
}

/**
 * Strip the ready marker from assistant message for display
 */
export function stripReadyMarker(message: string): string {
  return message.replace("[READY_TO_GENERATE]", "").trim();
}
