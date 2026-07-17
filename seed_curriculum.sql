--------------------------------------------------------------------------------
-- SENA ACADEMY LMS SYSTEM: CURRICULUM SEED DATA SCRIPT (FOUNDING BUILDERS COHORT)
-- Run this in your Supabase SQL Editor to populate the 'modules' table.
-- Designed to be safe to re-run (uses ON CONFLICT update on cohort_id, module_number).
--------------------------------------------------------------------------------

-- Seed Module 1
INSERT INTO public.modules (
    cohort_id,
    module_number,
    title,
    description,
    learning_outcomes,
    objectives,
    resources,
    assignment_title,
    assignment_description,
    assignment_deadline,
    assignment_rubric,
    unlock_date,
    is_visible
) VALUES (
    'e8aa03c6-3cd1-4069-9315-fea19a0da580', -- Founding Builders Cohort ID
    1,
    'Builder Mindset & AI Foundations',
    'Understand how AI is changing software development and set up a modern AI development workflow.',
    ARRAY[
        'The Builder Mindset: Shifting from "I need to know everything" to "I can figure it out as I build." Bias towards shipping small, working things. Comfort with ambiguity. Debugging as learning.',
        'AI Fundamentals',
        'Prompt Engineering: Clarity, structure, context, constraints. Iterative prompting. Few-shot prompting. Chain-of-thought prompting.',
        'AI Developer Tools: General-purpose AI assistants (Claude, ChatGPT, Gemini) vs. AI-native IDEs (Cursor). Understanding when to use which.'
    ],
    ARRAY[
        'Explain the mindset shift from learning-first to building-first',
        'Differentiate between general chat assistants and AI-native IDEs like Cursor',
        'Identify the limitations of LLMs including context windows and hallucinations'
    ],
    '[
        {"name": "OpenAI Prompt Engineering Guide", "url": "https://platform.openai.com/docs/guides/prompt-engineering", "category": "documentation"},
        {"name": "Anthropic Claude Prompt Library", "url": "https://docs.anthropic.com/en/prompt-library/library", "category": "documentation"},
        {"name": "Cursor Learn Portal", "url": "https://docs.cursor.com/", "category": "documentation"},
        {"name": "Cursor AI Tutorial for Beginners (2026) - Build Apps with Vibe Coding", "url": "https://www.youtube.com/watch?v=HzWJ-S95U_8", "category": "video"},
        {"name": "Git and GitHub for Beginners - Crash Course", "url": "https://www.youtube.com/watch?v=RGOj5yH7evk", "category": "video"},
        {"name": "Introduction to Prompt Engineering & LLM Basics", "url": "https://www.youtube.com/watch?v=uK1Xk3p2kG0", "category": "video"}
    ]'::jsonb,
    'Build and Deploy Your First AI-Assisted App',
    'Build a small static web utility tool using Cursor AI. Setup a GitHub repository, push your code, and write a README.md.',
    NOW() + INTERVAL '7 days',
    '[
        {"criteria": "Functionality & Working Code", "max_points": 40},
        {"criteria": "Git Commits & GitHub Repository Setup", "max_points": 30},
        {"criteria": "README Documentation & Code Explanation", "max_points": 30}
    ]'::jsonb,
    NOW(),
    TRUE
)
ON CONFLICT (cohort_id, module_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    learning_outcomes = EXCLUDED.learning_outcomes,
    objectives = EXCLUDED.objectives,
    resources = EXCLUDED.resources,
    assignment_title = EXCLUDED.assignment_title,
    assignment_description = EXCLUDED.assignment_description,
    assignment_rubric = EXCLUDED.assignment_rubric;

-- Seed Module 2
INSERT INTO public.modules (
    cohort_id,
    module_number,
    title,
    description,
    learning_outcomes,
    objectives,
    resources,
    assignment_title,
    assignment_description,
    assignment_deadline,
    assignment_rubric,
    unlock_date,
    is_visible
) VALUES (
    'e8aa03c6-3cd1-4069-9315-fea19a0da580', -- Founding Builders Cohort ID
    2,
    'UI/UX Design with AI',
    'Design interfaces before writing code.',
    ARRAY[
        'Design Thinking: Empathize, define, ideate, prototype, test. Identifying target users and pain points before starting layout.',
        'UI Fundamentals: Visual hierarchy, size, color, placement, spacing, grouping, typography readability, and color contrast.',
        'UX Principles: Usability heuristics, error prevention, cognitive load reduction, accessibility target sizes, and screen readers.',
        'Wireframing: Low-fidelity sketches, layout planning, mapping user flows between screens.',
        'Figma: Frames, responsive layout, reusable components, Auto-layout, and interactive clickable prototypes.',
        'Google Labs Stitch: Natural-language to UI creation, Standard (Text-to-UI) vs. Experimental (Sketch-to-UI) modes, exporting to Figma and HTML/CSS.',
        'AI-Assisted UI: Rapid layout generation, treatment of AI output as a first draft, manual refinement.',
        'Design Systems: Reusable color palettes, typography scale, spacing rules, and buttons/cards cohesiveness.'
    ],
    ARRAY[
        'Outline the phases of Design Thinking (Empathize, Define, Ideate, Prototype, Test)',
        'Differentiate between low-fidelity wireframes and high-fidelity prototypes',
        'Explain the role of AI accelerators like Google Stitch in design workflows'
    ],
    '[
        {"name": "Google Stitch Web App", "url": "https://stitch.withgoogle.com/", "category": "tool"},
        {"name": "Figma Auto Layout Help Guide", "url": "https://help.figma.com/hc/en-us/articles/360040451373-Create-dynamic-designs-with-Auto-layout", "category": "documentation"},
        {"name": "Stanford d.school Design Thinking Bootleg", "url": "https://dschool.stanford.edu/resources/design-thinking-bootleg", "category": "documentation"},
        {"name": "Laws of UX", "url": "https://lawsofux.com/", "category": "documentation"},
        {"name": "Google Stitch Tutorial: How to Design a Mobile App with AI in Minutes", "url": "https://www.youtube.com/watch?v=AUZIYQEw88xj", "category": "video"},
        {"name": "Figma UI/UX Design Tutorial for Beginners", "url": "https://www.youtube.com/watch?v=c9Wg6Ry_YWI", "category": "video"},
        {"name": "Visual Hierarchy Design Principles", "url": "https://www.youtube.com/watch?v=SfO8X2Cg_z4", "category": "video"}
    ]'::jsonb,
    'Design a Mobile App Prototype in Figma',
    'Design a complete high-fidelity mobile application prototype in Figma. Your design must cover the full user flow (at least 3 screens), use reusable components, apply Auto-layout for alignment, and implement a consistent design system (colors, typography).',
    NOW() + INTERVAL '14 days',
    '[
        {"criteria": "Visual Hierarchy & Layout Spacing", "max_points": 30},
        {"criteria": "Use of Figma Components & Auto-layout", "max_points": 30},
        {"criteria": "User Flow Logic & Prototyping Interactions", "max_points": 20},
        {"criteria": "Design System Consistency & Accessibility", "max_points": 20}
    ]'::jsonb,
    NOW() + INTERVAL '7 days',
    TRUE
)
ON CONFLICT (cohort_id, module_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    learning_outcomes = EXCLUDED.learning_outcomes,
    objectives = EXCLUDED.objectives,
    resources = EXCLUDED.resources,
    assignment_title = EXCLUDED.assignment_title,
    assignment_description = EXCLUDED.assignment_description,
    assignment_rubric = EXCLUDED.assignment_rubric;

-- Seed Module 3
INSERT INTO public.modules (
    cohort_id,
    module_number,
    title,
    description,
    learning_outcomes,
    objectives,
    resources,
    assignment_title,
    assignment_description,
    assignment_deadline,
    assignment_rubric,
    unlock_date,
    is_visible
) VALUES (
    'e8aa03c6-3cd1-4069-9315-fea19a0da580', -- Founding Builders Cohort ID
    3,
    'Website Development',
    'Build responsive websites using AI.',
    ARRAY[
        'HTML: Semantic tags (header, nav, article, section, footer), form tags, nested document structure, media embedding.',
        'CSS: The Box Model (content, padding, border, margin), Flexbox, CSS Grid layouts, and utility styling using Tailwind CSS.',
        'JavaScript: Variable declarations, loops, conditionals, functions, DOM selection/manipulation, event handling, Fetch API, and async/await.',
        'Responsive Design: Media queries, mobile-first strategies, fluid layouts, viewport testing.',
        'AI-Assisted Frontend: Cursor/Claude code generation, design-to-code translation, layout debugging, review and refactoring.',
        'Deployment: Hosting static sites (Vercel, Netlify), connecting custom domains, setting up DNS, CI/CD auto-deployment via GitHub.',
        'Version Control & Env Setup: Git commands, GitHub setup, pull requests, issues, READMEs. Local runtime environment (Node.js, IDE setup).',
        'GitHub Optimization: Clear profile READMEs, clean repository directories, descriptive commit messages, project tags.'
    ],
    ARRAY[
        'Understand CSS Box Model parameters (margin, border, padding)',
        'Explain asynchronous programming concepts (promises, async/await)',
        'Configure custom domain names and understand DNS resolution basics'
    ],
    '[
        {"name": "MDN Web Docs: CSS Layouts", "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout", "category": "documentation"},
        {"name": "Tailwind CSS Official Documentation", "url": "https://tailwindcss.com/docs", "category": "documentation"},
        {"name": "JavaScript.info: DOM Tree", "url": "https://javascript.info/dom-nodes", "category": "documentation"},
        {"name": "Vercel Quickstart Deployment Docs", "url": "https://vercel.com/docs/deployments/overview", "category": "documentation"},
        {"name": "GitHub Git Handbook", "url": "https://guides.github.com/introduction/git-handbook/", "category": "documentation"},
        {"name": "Tailwind CSS Full Course for Beginners", "url": "https://www.youtube.com/watch?v=kYJ5A3-9G24", "category": "video"},
        {"name": "Learn DOM Manipulation In 18 Minutes", "url": "https://www.youtube.com/watch?v=5fb2aPlgoys", "category": "video"},
        {"name": "Deploying a Website to Vercel (Beginner Tutorial)", "url": "https://www.youtube.com/watch?v=J_uH0vK851U", "category": "video"}
    ]'::jsonb,
    'Responsive Business Website & Live Deployment',
    'Develop a fully responsive landing page or business website from scratch using semantic HTML, Tailwind CSS, and JavaScript. The page must adjust to mobile/desktop viewports, fetch and display data dynamically from an API (e.g. weather, news, products), and be deployed live on Vercel.',
    NOW() + INTERVAL '21 days',
    '[
        {"criteria": "Semantic HTML & CSS Layout Responsiveness", "max_points": 30},
        {"criteria": "Dynamic Javascript API Data Fetching", "max_points": 30},
        {"criteria": "Styling Completeness with Tailwind CSS", "max_points": 20},
        {"criteria": "GitHub Integration & Successful Vercel Deployment", "max_points": 20}
    ]'::jsonb,
    NOW() + INTERVAL '14 days',
    TRUE
)
ON CONFLICT (cohort_id, module_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    learning_outcomes = EXCLUDED.learning_outcomes,
    objectives = EXCLUDED.objectives,
    resources = EXCLUDED.resources,
    assignment_title = EXCLUDED.assignment_title,
    assignment_description = EXCLUDED.assignment_description,
    assignment_rubric = EXCLUDED.assignment_rubric;

-- Seed Module 4
INSERT INTO public.modules (
    cohort_id,
    module_number,
    title,
    description,
    learning_outcomes,
    objectives,
    resources,
    assignment_title,
    assignment_description,
    assignment_deadline,
    assignment_rubric,
    unlock_date,
    is_visible
) VALUES (
    'e8aa03c6-3cd1-4069-9315-fea19a0da580', -- Founding Builders Cohort ID
    4,
    'Android App Development with AI',
    'Build a modern, working Android app — end to end, from a completely zero-coding starting point through to an installable APK — by using Claude to generate and iterate on real React Native (Expo) code, connecting it to a live Supabase backend, and shipping it.',
    ARRAY[
        'Environment Setup: Node.js, VS Code, a Claude.ai account, a GitHub account, and the Expo Go app.',
        'React Native & Expo: JavaScript/TypeScript framework rendering real native components; Expo removes native build tooling, gives instant device preview, and provides EAS.',
        'AI-Assisted App Generation: Using Claude.ai to turn a written screen-by-screen description into a complete React Native project.',
        'Screens, Components & Layout: Page structures, reusable components, arrangement of elements on screen.',
        'Navigation: Mapping and implementation of navigation flows between screens.',
        'State Management: Tracking local session, auth, cart, theme, and interactive states.',
        'Forms & Input Validation: Input checking requested from Claude in plain language.',
        'Version Control with GitHub: git init/add/commit/push, remote connection, and proper .gitignore setup.',
        'Backend & Authentication with Supabase: Postgres DB, RLS policies, and email/password sign-in.',
        'Databases, Real-Time Data & CRUD: Table schemas, RLS rules, and DB interaction patterns.',
        'Local Storage vs. a Database: Determining offline/preferences storage vs. centralized backend storage.',
        'Image & File Uploads: Pick -> upload -> save-the-link pattern with Supabase Storage.',
        'Consuming External APIs: Integration of external REST JSON endpoints.',
        'Embedding AI Inside the App: Front-facing user features (chatbot, image recognition, voice) vs. development utility.',
        'Debugging with AI: Structured resolution of mobile/Expo red-screen errors.',
        'Refactoring AI-Generated Code: Requesting Claude to review, refactor, and explain generated patterns.',
        'Publishing an APK: eas.json configurations and generating installable APKs via EAS Build.',
        'Prompt Engineering: Structured prompting to drive precise mobile screen outcomes.'
    ],
    ARRAY[
        'Explain React Native layout and architectural differences from standard web DOM',
        'Differentiate between stateless layout presentation and local stateful variables',
        'Outline Cloud Auth workflows and role-based data isolation via RLS'
    ],
    '[
        {"name": "Expo Documentation — Using React Native and Expo Tutorial", "url": "https://docs.expo.dev/tutorial/introduction/", "category": "documentation"},
        {"name": "React Native — Official Docs", "url": "https://reactnative.dev/docs/getting-started", "category": "documentation"},
        {"name": "Expo Application Services (EAS) Build — Overview", "url": "https://docs.expo.dev/build/introduction/", "category": "documentation"},
        {"name": "Supabase — Quickstart for Expo / React Native", "url": "https://supabase.com/docs/guides/getting-started/quickstarts/react-native", "category": "documentation"},
        {"name": "Supabase — Auth Quickstart for React Native", "url": "https://supabase.com/docs/guides/auth/auth-helpers/expo", "category": "documentation"},
        {"name": "GitHub Docs — Hello World Guide", "url": "https://docs.github.com/en/get-started/start-your-journey/hello-world", "category": "documentation"},
        {"name": "Anthropic — Prompt Engineering Overview", "url": "https://docs.anthropic.com/en/docs/welcome", "category": "documentation"},
        {"name": "React Native Full Course 2026 | Build a Mobile App Using Expo", "url": "https://www.youtube.com/watch?v=x0uinJ5HV68", "category": "video"},
        {"name": "Expo Router — Beginner''s Crash Course (Code with Beto)", "url": "https://www.youtube.com/watch?v=SfO8X2Cg_z4", "category": "video"},
        {"name": "Intro to Supabase — Full Tutorial for Beginners (freeCodeCamp)", "url": "https://www.youtube.com/watch?v=6hTRw_80cQA", "category": "video"},
        {"name": "Building an Android APK with React Native + Expo | EAS Build Tutorial (Code with Beto)", "url": "https://www.youtube.com/watch?v=0sOvCWFmrtA", "category": "video"}
    ]'::jsonb,
    'Authenticated React Native App with Supabase Backend',
    'Build a mobile app with Expo featuring user signup/login via Supabase Auth. Once authenticated, users must be able to perform CRUD operations on a real Supabase Postgres database. Configure eas.json and generate a shareable, installable APK.',
    NOW() + INTERVAL '28 days',
    '[
        {"criteria": "Supabase Auth User Management & Sessions", "max_points": 30},
        {"criteria": "Postgres CRUD Integration & RLS Rules", "max_points": 30},
        {"criteria": "UI Layout, Loading & Error States", "max_points": 20},
        {"criteria": "Code Structure & EAS APK Build Generation", "max_points": 20}
    ]'::jsonb,
    NOW() + INTERVAL '21 days',
    TRUE
)
ON CONFLICT (cohort_id, module_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    learning_outcomes = EXCLUDED.learning_outcomes,
    objectives = EXCLUDED.objectives,
    resources = EXCLUDED.resources,
    assignment_title = EXCLUDED.assignment_title,
    assignment_description = EXCLUDED.assignment_description,
    assignment_rubric = EXCLUDED.assignment_rubric;

-- Seed Module 5
INSERT INTO public.modules (
    cohort_id,
    module_number,
    title,
    description,
    learning_outcomes,
    objectives,
    resources,
    assignment_title,
    assignment_description,
    assignment_deadline,
    assignment_rubric,
    unlock_date,
    is_visible
) VALUES (
    'e8aa03c6-3cd1-4069-9315-fea19a0da580', -- Founding Builders Cohort ID
    5,
    'Backend Development',
    'Build scalable backends.',
    ARRAY[
        'APIs: REST architecture, HTTP methods (GET, POST, PUT, DELETE), status codes, path parameters, request headers.',
        'FastAPI: Python types validation, automatic OpenAPI (Swagger) generation, Pydantic schemas, route definitions.',
        'Databases: Relational PostgreSQL, tables, schemas, relations (one-to-many, many-to-many), SQLAlchemy ORM.',
        'Authentication: Password cryptography (bcrypt), JSON Web Tokens (JWT), token generation, route protection dependencies.',
        'CRUD Operations: Query execution, user input validation, relationship mappings, error handling (HTTPException).',
        'OpenAI, Claude, & Gemini APIs: Auth headers, model parameters (temperature, max tokens), pricing metrics (input vs. output tokens).',
        'AI-Assisted Backend: Auto-generating database models, routing templates, security vulnerability audits.'
    ],
    ARRAY[
        'Explain the principles of REST and key HTTP status codes',
        'Understand SQL relations, primary keys, and foreign keys',
        'Detect security risks like unvalidated inputs or missing route guards'
    ],
    '[
        {"name": "FastAPI Official Documentation", "url": "https://fastapi.tiangolo.com/", "category": "documentation"},
        {"name": "SQLAlchemy Database Guide", "url": "https://fastapi.tiangolo.com/tutorial/sql-databases/", "category": "documentation"},
        {"name": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com/", "category": "documentation"},
        {"name": "Python FastAPI JWT Authentication - Complete User CRUD Tutorial", "url": "https://www.youtube.com/watch?v=6hTRw_80cQA", "category": "video"},
        {"name": "FastAPI Crash Course for Beginners", "url": "https://www.youtube.com/watch?v=0sOvCWFmrtA", "category": "video"},
        {"name": "Relational Databases & SQL Essentials in 60 Minutes", "url": "https://www.youtube.com/watch?v=ySEx_BqxoQs", "category": "video"}
    ]'::jsonb,
    'Secure CRUD REST API in FastAPI with PostgreSQL',
    'Develop a secure custom backend API using FastAPI and PostgreSQL. Implement endpoints for user account registration, password hashing, and token-based login. Protect your main resource endpoints (CRUD operations) behind JWT authentication guards.',
    NOW() + INTERVAL '35 days',
    '[
        {"criteria": "JWT Authentication & Secure Password Hashing", "max_points": 30},
        {"criteria": "PostgreSQL Database Schema & CRUD Integration", "max_points": 30},
        {"criteria": "API Design, Validation & Error Handlers", "max_points": 20},
        {"criteria": "Auto-Generated Documentation (Swagger/OpenAPI)", "max_points": 20}
    ]'::jsonb,
    NOW() + INTERVAL '28 days',
    TRUE
)
ON CONFLICT (cohort_id, module_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    learning_outcomes = EXCLUDED.learning_outcomes,
    objectives = EXCLUDED.objectives,
    resources = EXCLUDED.resources,
    assignment_title = EXCLUDED.assignment_title,
    assignment_description = EXCLUDED.assignment_description,
    assignment_rubric = EXCLUDED.assignment_rubric;

-- Seed Module 6
INSERT INTO public.modules (
    cohort_id,
    module_number,
    title,
    description,
    learning_outcomes,
    objectives,
    resources,
    assignment_title,
    assignment_description,
    assignment_deadline,
    assignment_rubric,
    unlock_date,
    is_visible
) VALUES (
    'e8aa03c6-3cd1-4069-9315-fea19a0da580', -- Founding Builders Cohort ID
    6,
    'Career & Freelancing',
    'Leave with opportunities, not just skills.',
    ARRAY[
        'Portfolio: Curated highlights, write-ups (problem, approach, stack, outcome), live demos.',
        'LinkedIn Branding: Professional headshots, keyword headlines, featured section pins, work sharing.',
        'Freelancing: Platforms (Upwork, Fiverr), rate setting, contract scope, invoice collection.',
        'Client Acquisition: Tailored cold outreach, project pitches, expectations alignment.'
    ],
    ARRAY[
        'Understand freelance scoping constraints and payment collection procedures',
        'Formulate value-based networking and brand headlines',
        'Outline technical interview formats (live, take-home, system design)'
    ],
    '[
        {"name": "Awesome GitHub Profile README List", "url": "https://github.com/abhisheknaiidu/awesome-github-profile-readme", "category": "documentation"},
        {"name": "Upwork Resource Center: Freelancer Guide", "url": "https://www.upwork.com/resources/how-to-create-a-profile-that-stands-out", "category": "documentation"},
        {"name": "Tech Interview Handbook", "url": "https://www.techinterviewhandbook.org/", "category": "documentation"},
        {"name": "LinkedIn Profile Optimization for Software Engineers", "url": "https://www.youtube.com/watch?v=uK1Xk3p2kG0", "category": "video"},
        {"name": "How to Get Your First Client on Upwork", "url": "https://www.youtube.com/watch?v=3M6B1H85R_M", "category": "video"},
        {"name": "Software Engineer Portfolio Walkthrough & Tips", "url": "https://www.youtube.com/watch?v=uK1Xk3p2kG0", "category": "video"}
    ]'::jsonb,
    'Career Brand Portfolio and Capstone Assessment',
    'Prepare your developer portfolio and public profiles. This includes: an optimized GitHub Profile README, clean readme files on your projects, an updated LinkedIn profile with pinned project media, and a capstone presentation slide deck.',
    NOW() + INTERVAL '42 days',
    '[
        {"criteria": "Capstone Project Quality & Technical Defence", "max_points": 40},
        {"criteria": "GitHub Profile & Project Repositories Cleanup", "max_points": 20},
        {"criteria": "LinkedIn Branding, Headline & Project Pinned Assets", "max_points": 20},
        {"criteria": "Freelance Profile Readiness / Resume Polish", "max_points": 20}
    ]'::jsonb,
    NOW() + INTERVAL '35 days',
    TRUE
)
ON CONFLICT (cohort_id, module_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    learning_outcomes = EXCLUDED.learning_outcomes,
    objectives = EXCLUDED.objectives,
    resources = EXCLUDED.resources,
    assignment_title = EXCLUDED.assignment_title,
    assignment_description = EXCLUDED.assignment_description,
    assignment_rubric = EXCLUDED.assignment_rubric;
