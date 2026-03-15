# Phase 11: Core LMS — Implementation Plan

## Overview

Add course creation, delivery, and progress tracking to SimpliLMS. Students complete courses made up of modules → lessons. Quizzes assess understanding. Progress is tracked per-student. Certificates are issued on course completion.

---

## Database Schema (New Tables)

### 9 new tables, all with `tenant_id` column + RLS

```sql
-- ============================================================
-- COURSES
-- ============================================================
courses
  id uuid PK DEFAULT gen_random_uuid()
  tenant_id uuid FK → tenants NOT NULL
  title text NOT NULL
  slug text NOT NULL                    -- URL-friendly, unique per tenant
  description text
  thumbnail_url text                    -- Course card image
  category text                         -- e.g., "Development", "Business", "Healthcare"
  difficulty text CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
  estimated_hours numeric               -- Estimated completion time
  is_published boolean DEFAULT false     -- Draft vs. published
  is_free boolean DEFAULT false          -- Free courses (no enrollment fee)
  price_cents integer                    -- Per-course pricing (null = included with enrollment)
  max_students integer                   -- null = unlimited
  instructor_id uuid FK → profiles      -- Primary instructor
  prerequisites jsonb DEFAULT '[]'       -- Array of course IDs
  learning_objectives jsonb DEFAULT '[]' -- Array of strings
  tags jsonb DEFAULT '[]'                -- Array of strings for search
  settings jsonb DEFAULT '{}'            -- Completion threshold, certificate template, etc.
  sort_order integer DEFAULT 0
  published_at timestamptz
  created_at timestamptz DEFAULT NOW()
  updated_at timestamptz DEFAULT NOW()
  UNIQUE (tenant_id, slug)

-- ============================================================
-- MODULES (groupings within a course)
-- ============================================================
modules
  id uuid PK DEFAULT gen_random_uuid()
  tenant_id uuid FK → tenants NOT NULL
  course_id uuid FK → courses NOT NULL ON DELETE CASCADE
  title text NOT NULL
  description text
  sort_order integer DEFAULT 0
  is_published boolean DEFAULT true
  unlock_rule text CHECK (unlock_rule IN ('immediate', 'sequential', 'date'))
  unlock_date timestamptz               -- For date-based unlock
  created_at timestamptz DEFAULT NOW()
  updated_at timestamptz DEFAULT NOW()

-- ============================================================
-- LESSONS (individual learning units)
-- ============================================================
lessons
  id uuid PK DEFAULT gen_random_uuid()
  tenant_id uuid FK → tenants NOT NULL
  module_id uuid FK → modules NOT NULL ON DELETE CASCADE
  title text NOT NULL
  description text
  content_type text CHECK (content_type IN ('text', 'video', 'document', 'embed', 'quiz'))
  content jsonb NOT NULL DEFAULT '{}'
    -- text:     { "body": "<rich html>" }
    -- video:    { "url": "https://...", "provider": "youtube|vimeo|upload", "duration_seconds": 300 }
    -- document: { "file_url": "https://...", "file_name": "guide.pdf", "file_size": 1024 }
    -- embed:    { "html": "<iframe ...>", "url": "https://..." }
    -- quiz:     { "quiz_id": "uuid" }   -- References quizzes table
  duration_minutes integer               -- Estimated time to complete
  is_required boolean DEFAULT true       -- Required for course completion
  is_published boolean DEFAULT true
  sort_order integer DEFAULT 0
  created_at timestamptz DEFAULT NOW()
  updated_at timestamptz DEFAULT NOW()

-- ============================================================
-- QUIZZES
-- ============================================================
quizzes
  id uuid PK DEFAULT gen_random_uuid()
  tenant_id uuid FK → tenants NOT NULL
  course_id uuid FK → courses NOT NULL ON DELETE CASCADE
  lesson_id uuid FK → lessons           -- null = standalone quiz
  title text NOT NULL
  description text
  quiz_type text CHECK (quiz_type IN ('graded', 'practice', 'survey'))
  passing_score integer DEFAULT 70       -- Percentage (0-100)
  max_attempts integer                   -- null = unlimited
  time_limit_minutes integer             -- null = no limit
  shuffle_questions boolean DEFAULT false
  show_answers_after text CHECK (show_answers_after IN ('never', 'submission', 'grading'))
    DEFAULT 'submission'
  is_published boolean DEFAULT true
  created_at timestamptz DEFAULT NOW()
  updated_at timestamptz DEFAULT NOW()

-- ============================================================
-- QUIZ QUESTIONS
-- ============================================================
quiz_questions
  id uuid PK DEFAULT gen_random_uuid()
  tenant_id uuid FK → tenants NOT NULL
  quiz_id uuid FK → quizzes NOT NULL ON DELETE CASCADE
  question_type text CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay'))
  question_text text NOT NULL
  explanation text                       -- Shown after answer (learning aid)
  options jsonb DEFAULT '[]'
    -- multiple_choice: [{ "id": "a", "text": "Option A", "is_correct": true }, ...]
    -- true_false:      [{ "id": "true", "text": "True", "is_correct": false }, { "id": "false", "text": "False", "is_correct": true }]
    -- short_answer:    [{ "id": "answer", "text": "expected answer" }]  -- For auto-grading
    -- essay:           []  -- Manual grading
  points integer DEFAULT 1
  sort_order integer DEFAULT 0
  created_at timestamptz DEFAULT NOW()

-- ============================================================
-- COURSE ENROLLMENTS (student ↔ course)
-- ============================================================
course_enrollments
  id uuid PK DEFAULT gen_random_uuid()
  tenant_id uuid FK → tenants NOT NULL
  course_id uuid FK → courses NOT NULL
  student_id uuid FK → profiles NOT NULL
  status text CHECK (status IN ('active', 'completed', 'dropped', 'expired'))
    DEFAULT 'active'
  enrolled_at timestamptz DEFAULT NOW()
  completed_at timestamptz
  expires_at timestamptz                 -- For time-limited access
  certificate_id uuid FK → certificates
  progress_pct numeric DEFAULT 0         -- Cached: 0.00 - 100.00
  last_accessed_at timestamptz
  created_at timestamptz DEFAULT NOW()
  UNIQUE (tenant_id, course_id, student_id)

-- ============================================================
-- LESSON PROGRESS (per-student, per-lesson)
-- ============================================================
lesson_progress
  id uuid PK DEFAULT gen_random_uuid()
  tenant_id uuid FK → tenants NOT NULL
  student_id uuid FK → profiles NOT NULL
  lesson_id uuid FK → lessons NOT NULL
  course_id uuid FK → courses NOT NULL   -- Denormalized for query perf
  status text CHECK (status IN ('not_started', 'in_progress', 'completed'))
    DEFAULT 'not_started'
  started_at timestamptz
  completed_at timestamptz
  time_spent_seconds integer DEFAULT 0   -- Accumulated time
  last_position jsonb                    -- Video timestamp, scroll position, etc.
  created_at timestamptz DEFAULT NOW()
  updated_at timestamptz DEFAULT NOW()
  UNIQUE (tenant_id, student_id, lesson_id)

-- ============================================================
-- QUIZ ATTEMPTS
-- ============================================================
quiz_attempts
  id uuid PK DEFAULT gen_random_uuid()
  tenant_id uuid FK → tenants NOT NULL
  quiz_id uuid FK → quizzes NOT NULL
  student_id uuid FK → profiles NOT NULL
  attempt_number integer NOT NULL        -- 1, 2, 3...
  status text CHECK (status IN ('in_progress', 'submitted', 'graded'))
    DEFAULT 'in_progress'
  answers jsonb DEFAULT '[]'
    -- [{ "question_id": "uuid", "selected": "a", "text": "..." }, ...]
  score_pct numeric                      -- Percentage (0.00 - 100.00)
  points_earned integer
  points_possible integer
  passed boolean
  started_at timestamptz DEFAULT NOW()
  submitted_at timestamptz
  graded_at timestamptz
  graded_by uuid FK → profiles           -- For essay/manual grading
  time_spent_seconds integer
  created_at timestamptz DEFAULT NOW()
  UNIQUE (tenant_id, quiz_id, student_id, attempt_number)

-- ============================================================
-- CERTIFICATES
-- ============================================================
certificates
  id uuid PK DEFAULT gen_random_uuid()
  tenant_id uuid FK → tenants NOT NULL
  student_id uuid FK → profiles NOT NULL
  course_id uuid FK → courses NOT NULL
  certificate_number text UNIQUE         -- e.g., "CERT-2026-000042"
  issued_at timestamptz DEFAULT NOW()
  template_data jsonb DEFAULT '{}'       -- Student name, course title, date, etc.
  pdf_url text                           -- Generated PDF in Supabase Storage
  verification_code text UNIQUE          -- Public verification code
  created_at timestamptz DEFAULT NOW()
  UNIQUE (tenant_id, student_id, course_id)
```

---

## Feature Flags

Add to `TenantConfig.features`:

```typescript
features: {
  // ... existing
  lmsEnabled: boolean;           // Core LMS module
  aiCourseCreator: boolean;      // Phase 12 AI course builder
  certificates: boolean;         // Certificate generation
  quizzes: boolean;              // Quiz engine (subset of LMS)
};
```

---

## Routes (New)

### Admin Routes (super_admin)

```
/admin/courses                      → Course catalog management
/admin/courses/new                  → Create course wizard
/admin/courses/[courseId]            → Course detail + module/lesson editor
/admin/courses/[courseId]/analytics  → Course-level analytics
/admin/quizzes                      → Quiz bank (standalone + course-linked)
/admin/certificates                 → Certificate templates + issued list
```

### Teacher Routes (teacher_paid, teacher_unpaid)

```
/teacher/courses                    → Instructor's assigned courses
/teacher/courses/[courseId]         → Course content + student progress view
/teacher/courses/[courseId]/grades  → Quiz grading (essay questions)
```

### Student Routes (student)

```
/student/courses                    → My enrolled courses (grid)
/student/courses/[courseId]         → Course player (module sidebar + lesson viewer)
/student/courses/[courseId]/quiz/[quizId] → Quiz attempt
/student/certificates               → My certificates
```

**Total new routes: ~14 routes**

---

## Server Actions (New)

### `packages/core/src/actions/courses.ts`
- `createCourse(formData)` → admin creates course
- `updateCourse(courseId, formData)` → admin updates course metadata
- `publishCourse(courseId)` → toggle publish state
- `deleteCourse(courseId)` → soft delete (unpublish + archive)

### `packages/core/src/actions/modules.ts`
- `createModule(courseId, data)` → add module to course
- `updateModule(moduleId, data)` → update module metadata
- `reorderModules(courseId, orderedIds)` → drag-and-drop reorder
- `deleteModule(moduleId)` → cascade deletes lessons

### `packages/core/src/actions/lessons.ts`
- `createLesson(moduleId, data)` → add lesson to module
- `updateLesson(lessonId, data)` → update lesson content
- `reorderLessons(moduleId, orderedIds)` → drag-and-drop reorder
- `deleteLesson(lessonId)` → cascade deletes progress
- `uploadLessonFile(lessonId, file)` → upload to Supabase Storage

### `packages/core/src/actions/quizzes.ts`
- `createQuiz(data)` → create quiz (standalone or lesson-linked)
- `updateQuiz(quizId, data)` → update quiz settings
- `addQuestion(quizId, data)` → add question to quiz
- `updateQuestion(questionId, data)` → update question
- `reorderQuestions(quizId, orderedIds)` → reorder

### `packages/core/src/actions/progress.ts`
- `startLesson(lessonId)` → mark as in_progress
- `completeLesson(lessonId)` → mark as completed, recalculate course progress
- `updateLessonTime(lessonId, seconds)` → periodic time tracking heartbeat
- `startQuizAttempt(quizId)` → create new attempt
- `submitQuizAttempt(attemptId, answers)` → auto-grade + calculate score
- `gradeEssayQuestion(attemptId, questionId, score, feedback)` → teacher grades essay

### `packages/core/src/actions/certificates.ts`
- `issueCertificate(courseId, studentId)` → generate cert + PDF
- `verifyCertificate(verificationCode)` → public verification endpoint

---

## Components (New)

### `packages/core/src/components/lms/`

**Course Management (Admin):**
- `course-form.tsx` — Create/edit course form (title, description, category, difficulty, pricing)
- `course-table.tsx` — Admin course list with status, students, publish toggle
- `course-builder.tsx` — Visual course structure editor (modules + lessons tree)
- `module-editor.tsx` — Inline module edit (title, description, sort)
- `lesson-editor.tsx` — Lesson content editor (rich text, video URL, file upload)
- `lesson-type-selector.tsx` — Content type picker (text/video/document/embed/quiz)

**Quiz Builder (Admin):**
- `quiz-form.tsx` — Quiz settings (type, passing score, attempts, time limit)
- `question-editor.tsx` — Question form with type-specific options editor
- `question-preview.tsx` — Preview how student sees the question

**Course Player (Student):**
- `course-sidebar.tsx` — Module/lesson tree with completion checkmarks
- `lesson-viewer.tsx` — Renders lesson content by type
- `video-player.tsx` — Video wrapper with progress tracking
- `document-viewer.tsx` — PDF/document display with download
- `quiz-player.tsx` — Quiz taking interface (one question at a time or all-at-once)
- `quiz-results.tsx` — Score display, correct/wrong indicators, explanations
- `progress-bar.tsx` — Course progress indicator

**Teacher Views:**
- `student-progress-table.tsx` — Per-student progress across all lessons
- `grade-quiz-dialog.tsx` — Teacher grades essay questions

**Certificates:**
- `certificate-card.tsx` — Display certificate with download + verify link
- `certificate-template.tsx` — Visual template for PDF generation

---

## Queries (New additions to `queries.ts`)

```typescript
// Course catalog
getCourses(filters?)                    // Admin: all, Student: published only
getCourseById(id)                       // Full course with modules + lessons
getCourseBySlug(slug)                   // URL-friendly lookup
getCourseWithProgress(courseId, studentId) // Course + lesson progress overlay

// Course enrollments
getStudentCourseEnrollments(studentId)  // Student's enrolled courses
getCourseStudents(courseId)             // Students enrolled in a course

// Progress
getStudentProgress(studentId, courseId) // All lesson progress for a course
getCourseAnalytics(courseId)            // Aggregate stats (completion rate, avg score)

// Quizzes
getQuizById(quizId)                    // Quiz with questions
getQuizAttempts(quizId, studentId)     // Student's attempts
getQuizSubmissions(quizId)             // All submissions for teacher grading

// Certificates
getCertificatesByStudent(studentId)
getCertificateByCourseAndStudent(courseId, studentId)
getCertificateByVerificationCode(code) // Public verification
```

---

## RLS Policies (New)

Pattern follows existing conventions:

| Table | Policy | Who |
|-------|--------|-----|
| courses | SELECT published courses | all authenticated |
| courses | SELECT all courses | super_admin, teacher (own courses) |
| courses | INSERT/UPDATE/DELETE | super_admin |
| modules | SELECT in published courses | all authenticated |
| modules | INSERT/UPDATE/DELETE | super_admin |
| lessons | SELECT in published courses | all authenticated |
| lessons | INSERT/UPDATE/DELETE | super_admin |
| quizzes | SELECT in own courses | student (enrolled), teacher (own), admin |
| quiz_questions | SELECT during attempt | student (active attempt), teacher, admin |
| course_enrollments | SELECT own | student |
| course_enrollments | SELECT/INSERT/UPDATE | super_admin |
| lesson_progress | SELECT/INSERT/UPDATE own | student |
| lesson_progress | SELECT all in course | teacher (own courses), admin |
| quiz_attempts | SELECT/INSERT own | student |
| quiz_attempts | SELECT all in course | teacher (own courses), admin |
| quiz_attempts | UPDATE (grading) | teacher (own courses), admin |
| certificates | SELECT own | student |
| certificates | SELECT all | admin |
| certificates | SELECT by verification_code | public (anon) |

---

## Sidebar Navigation Updates

```typescript
// super_admin additions:
{ label: "Courses", href: "/admin/courses", icon: BookOpen }
{ label: "Certificates", href: "/admin/certificates", icon: Award }

// teacher additions (both paid/unpaid):
{ label: "Courses", href: "/teacher/courses", icon: BookOpen }

// student additions:
{ label: "Courses", href: "/student/courses", icon: BookOpen }
{ label: "Certificates", href: "/student/certificates", icon: Award }
```

---

## Implementation Order

```
Step 1: Database migration (9 tables + RLS + indexes)
Step 2: TypeScript types generation
Step 3: Query functions + server actions
Step 4: Admin course builder (create, modules, lessons, quizzes)
Step 5: Student course player (viewer, progress tracking, quiz engine)
Step 6: Teacher course views (progress overview, quiz grading)
Step 7: Certificate generation
Step 8: Feature flag integration + sidebar nav
```

---

## File Count Estimate

| Step | New Files | Modified Files | Description |
|------|-----------|----------------|-------------|
| 1 | 1 | 0 | Migration SQL |
| 2 | 0 | 1 | types.ts regeneration |
| 3 | 5 | 1 | Actions + queries |
| 4 | ~15 | 0 | Admin pages + components |
| 5 | ~12 | 0 | Student pages + course player |
| 6 | ~5 | 0 | Teacher pages + grading |
| 7 | ~3 | 0 | Certificate generation + pages |
| 8 | 0 | 3 | Constants, tenant-config, feature checks |
| **Total** | **~41** | **~5** | |

---

# Phase 12: AI Course Creator — Implementation Plan

## Overview

An AI-powered tool that interviews subject matter experts (SMEs) conversationally, then automatically generates a complete course structure (modules, lessons, quizzes, learning objectives) from the interview transcript. Uses the Claude API.

---

## How It Works

### User Flow

```
1. Admin clicks "Create Course with AI" in the admin course builder
2. Enters: course topic, target audience, desired length
3. AI begins a multi-turn conversation:
   - "What are the key topics students need to learn?"
   - "Can you explain [topic X] in more detail?"
   - "What are common misconceptions about [topic Y]?"
   - "What exercises would help students practice this?"
   - Continues until the AI has enough material (~10-20 turns)
4. AI generates:
   - Course outline (modules + lessons)
   - Learning objectives per module
   - Lesson content (text-based)
   - Quiz questions per module (multiple choice + short answer)
   - Difficulty assessment
   - Estimated completion time
5. Admin reviews the generated course, edits as needed
6. Admin publishes the course
```

### Architecture

```
Browser ←→ Next.js Server Action ←→ Claude API (streaming)
                                        ↕
                                   Interview State
                                   (stored in Supabase)
                                        ↕
                                   Generated Course
                                   (inserted into courses/modules/lessons/quizzes tables)
```

---

## Database Schema (New Tables)

```sql
-- ============================================================
-- AI COURSE INTERVIEWS
-- ============================================================
ai_course_interviews
  id uuid PK DEFAULT gen_random_uuid()
  tenant_id uuid FK → tenants NOT NULL
  created_by uuid FK → profiles NOT NULL
  status text CHECK (status IN ('interviewing', 'generating', 'review', 'completed', 'failed'))
    DEFAULT 'interviewing'
  topic text NOT NULL                    -- Initial topic/subject
  target_audience text                   -- Who is this course for?
  desired_length text                    -- e.g., "4 weeks", "10 hours"
  additional_context text                -- Any extra instructions
  messages jsonb DEFAULT '[]'
    -- [{ "role": "assistant", "content": "...", "timestamp": "..." }, { "role": "user", "content": "...", "timestamp": "..." }]
  system_prompt text                     -- The system prompt used
  total_tokens_used integer DEFAULT 0
  generated_course_id uuid FK → courses  -- Link to the created course (after generation)
  generated_outline jsonb                -- Intermediate: the AI-generated structure before DB insertion
  error_message text
  created_at timestamptz DEFAULT NOW()
  updated_at timestamptz DEFAULT NOW()
```

---

## Routes (New)

### Admin Routes

```
/admin/courses/ai                    → AI course creator landing (start new interview)
/admin/courses/ai/[interviewId]      → Live interview chat interface
/admin/courses/ai/[interviewId]/review → Review generated outline before creating
```

**Total new routes: 3**

---

## Server Actions (New)

### `packages/core/src/actions/ai-course.ts`

```typescript
startInterview(data: { topic, targetAudience, desiredLength, additionalContext })
  → Creates ai_course_interviews row, returns interviewId
  → Sends initial system prompt to Claude, gets first question

sendInterviewMessage(interviewId: string, message: string)
  → Appends user message to messages array
  → Calls Claude API with full conversation history
  → Claude either asks another question or signals "ready to generate"
  → Returns assistant response + readyToGenerate flag

generateCourseFromInterview(interviewId: string)
  → Sends full transcript to Claude with structured generation prompt
  → Claude returns JSON: { modules: [{ title, lessons: [{ title, content, quiz_questions }] }] }
  → Validates JSON structure
  → Stores in generated_outline column
  → Returns outline for review

createCourseFromOutline(interviewId: string, edits?: Partial<Outline>)
  → Reads generated_outline (with any user edits applied)
  → Inserts into courses, modules, lessons, quizzes, quiz_questions tables
  → Links generated_course_id
  → Returns courseId for redirect to course editor
```

---

## Claude API Integration

### System Prompt (Interview Phase)

```
You are a curriculum designer interviewing a subject matter expert to build a
course on "{topic}" for "{targetAudience}".

Your goal is to extract enough knowledge to create a comprehensive course with:
- 4-8 modules
- 3-6 lessons per module
- Learning objectives for each module
- Quiz questions for assessment

Ask focused questions one at a time. When you have enough material to build the
full course (typically after 10-20 exchanges), respond with exactly:
[READY_TO_GENERATE]

Guidelines:
- Start broad, then drill into specifics
- Ask about common misconceptions
- Ask about practical exercises
- Ask about prerequisites
- Keep questions concise and specific
```

### System Prompt (Generation Phase)

```
You are a curriculum designer. Using the following interview transcript,
generate a complete course structure.

Return ONLY valid JSON matching this schema:
{
  "title": "Course Title",
  "description": "2-3 sentence description",
  "difficulty": "beginner|intermediate|advanced",
  "estimated_hours": 10,
  "learning_objectives": ["..."],
  "modules": [
    {
      "title": "Module 1 Title",
      "description": "Module description",
      "lessons": [
        {
          "title": "Lesson Title",
          "content_type": "text",
          "content": "<rich HTML content of the full lesson>",
          "duration_minutes": 15,
          "quiz_questions": [
            {
              "question_type": "multiple_choice",
              "question_text": "...",
              "options": [
                { "id": "a", "text": "Option A", "is_correct": true },
                { "id": "b", "text": "Option B", "is_correct": false }
              ],
              "explanation": "Why the correct answer is correct"
            }
          ]
        }
      ]
    }
  ]
}
```

### API Configuration

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Interview messages: claude-sonnet-4-20250514 (fast, good at conversation)
// Course generation: claude-sonnet-4-20250514 (structured output, long context)

const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 4096,
  system: systemPrompt,
  messages: conversationHistory,
});
```

---

## Components (New)

### `packages/core/src/components/ai-course/`

- `interview-chat.tsx` — Chat interface for SME interview (message bubbles, input, send)
- `interview-progress.tsx` — Shows interview stage (asking → ready → generating → review)
- `outline-review.tsx` — Displays generated course outline with edit capability
- `outline-module-card.tsx` — Collapsible module with lessons list
- `outline-lesson-editor.tsx` — Inline edit for lesson title/content
- `generate-button.tsx` — "Generate Course" button with loading state

---

## Feature Flag

```typescript
features: {
  aiCourseCreator: boolean;  // Enabled on Professional + Enterprise tiers
};
```

---

## Environment Variables

```env
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Implementation Order

```
Step 1: Install @anthropic-ai/sdk dependency
Step 2: Database migration (ai_course_interviews table + RLS)
Step 3: Claude API helper (client factory, system prompts, JSON parsing)
Step 4: Server actions (startInterview, sendMessage, generate, create)
Step 5: Interview chat UI
Step 6: Outline review + edit UI
Step 7: Course creation from outline (insert into Phase 11 tables)
Step 8: Feature flag integration
```

---

## File Count Estimate

| Step | New Files | Modified Files | Description |
|------|-----------|----------------|-------------|
| 1 | 0 | 1 | package.json (add dependency) |
| 2 | 1 | 0 | Migration SQL |
| 3 | 1 | 0 | AI client helper |
| 4 | 1 | 0 | Server actions |
| 5 | ~5 | 0 | Interview chat UI components |
| 6 | ~4 | 0 | Outline review components |
| 7 | 0 | 1 | Extend course creation action |
| 8 | 0 | 2 | Constants, tenant-config |
| **Total** | **~12** | **~4** | |

---

## Pricing Tier Mapping

| Feature | Starter ($99) | Professional ($299) | Enterprise ($999) |
|---------|:---:|:---:|:---:|
| Core LMS (Phase 11) | ✅ (up to 5 courses) | ✅ Unlimited | ✅ Unlimited |
| Quiz Engine | ✅ | ✅ | ✅ |
| Certificates | ❌ | ✅ | ✅ |
| AI Course Creator (Phase 12) | ❌ | ✅ | ✅ |
| Custom certificate templates | ❌ | ❌ | ✅ |

---

## Combined Timeline Estimate

| Phase | Steps | Estimated Files | Effort |
|-------|-------|----------------|--------|
| Phase 11: Core LMS | 8 steps | ~46 files | Large |
| Phase 12: AI Course Creator | 8 steps | ~16 files | Medium |
| **Total** | **16 steps** | **~62 files** | |

Phase 11 should be completed first — Phase 12 depends on the course/module/lesson tables created in Phase 11.
