--------------------------------------------------------------------------------
-- SENA ACADEMY LMS SYSTEM: CURRICULUM SEED DATA SCRIPT
-- Run this in your Supabase SQL Editor to populate the 'modules' table.
-- Designed to be safe to re-run (uses ON CONFLICT update on module_number).
--------------------------------------------------------------------------------

-- Seed Module 1
INSERT INTO public.modules (
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
    1,
    'Builder Mindset & AI Foundations',
    'Understand how AI is changing software development and set up a modern AI development workflow.',
    ARRAY[
        'Set up a local development environment with Node.js and Git',
        'Implement basic prompt engineering patterns (context, constraints, few-shot)',
        'Build and deploy a simple utility tool using Cursor AI',
        'Manage code using Git commits and GitHub repositories'
    ],
    ARRAY[
        'Explain the mindset shift from learning-first to building-first',
        'Differentiate between general chat assistants and AI-native IDEs like Cursor',
        'Identify the limitations of LLMs including context windows and hallucinations'
    ],
    '[
        {"name": "OpenAI Prompt Engineering Guide", "url": "https://platform.openai.com/docs/guides/prompt-engineering", "category": "documentation"},
        {"name": "Cursor Learn Portal", "url": "https://cursor.com/learn", "category": "documentation"},
        {"name": "GitHub Git Handbook", "url": "https://guides.github.com/introduction/git-handbook/", "category": "documentation"},
        {"name": "Cursor AI Tutorial for Beginners (2026)", "url": "https://www.youtube.com/watch?v=HzWJ-S95U_8", "category": "video"},
        {"name": "Git and GitHub for Beginners - Crash Course", "url": "https://www.youtube.com/watch?v=RGOj5yH7evk", "category": "video"}
    ]'::jsonb,
    'Build and Deploy Your First AI-Assisted App',
    'Build a small command-line or static web utility tool (e.g., calculator, task list, password generator) using Cursor AI. Setup a GitHub repository, push your code, and write a README.md explaining your application.',
    NOW() + INTERVAL '7 days',
    '[
        {"criteria": "Functionality & Working Code", "max_points": 40},
        {"criteria": "Git Commits & GitHub Repository Setup", "max_points": 30},
        {"criteria": "README Documentation & Code Explanation", "max_points": 30}
    ]'::jsonb,
    NOW(),
    TRUE
)
ON CONFLICT (module_number) DO UPDATE SET
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
    2,
    'UI/UX Design with AI',
    'Design interfaces before writing code.',
    ARRAY[
        'Conduct basic user persona and pain point mapping',
        'Apply visual hierarchy, layout, and color contrast accessibility principles',
        'Build reusable UI components and Auto-layouts in Figma',
        'Generate high-fidelity web/mobile screens using Google Labs Stitch'
    ],
    ARRAY[
        'Outline the phases of Design Thinking (Empathize, Define, Ideate, Prototype, Test)',
        'Differentiate between low-fidelity wireframes and high-fidelity prototypes',
        'Explain the role of AI accelerators like Google Stitch in design workflows'
    ],
    '[
        {"name": "Google Stitch Web App", "url": "https://stitch.withgoogle.com/", "category": "tool"},
        {"name": "Figma Auto Layout Help Guide", "url": "https://help.figma.com/hc/en-us/articles/360040451373-Create-dynamic-designs-with-Auto-layout", "category": "documentation"},
        {"name": "Stanford d.school Design Thinking Guide", "url": "https://dschool.stanford.edu/resources/design-thinking-bootleg", "category": "documentation"},
        {"name": "Google Stitch Mobile App Tutorial Video", "url": "https://www.youtube.com/watch?v=AUZIYQEw88xj", "category": "video"},
        {"name": "Figma UI/UX Design Tutorial Video", "url": "https://www.youtube.com/watch?v=c9Wg6Ry_YWI", "category": "video"}
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
ON CONFLICT (module_number) DO UPDATE SET
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
    3,
    'Website Development',
    'Build responsive websites using AI.',
    ARRAY[
        'Write clean semantic HTML and build responsive layouts with Flexbox/Grid',
        'Implement utility-first styling using Tailwind CSS',
        'Develop interactive page behaviors and fetch API data using JavaScript',
        'Deploy a web project live to Vercel/Netlify with CI/CD GitHub integration'
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
        {"name": "Tailwind CSS Course for Beginners", "url": "https://www.youtube.com/watch?v=kYJ5A3-9G24", "category": "video"},
        {"name": "DOM Manipulation Video Tutorial", "url": "https://www.youtube.com/watch?v=5fb2aPlgoys", "category": "video"},
        {"name": "Vercel Static Deployment Video Guide", "url": "https://www.youtube.com/watch?v=J_uH0vK851U", "category": "video"}
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
ON CONFLICT (module_number) DO UPDATE SET
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
    4,
    'Android App Development',
    'Build modern Android applications.',
    ARRAY[
        'Create mobile user interfaces using Flutter widget trees',
        'Program app logic, data models, and asynchronous requests in Dart',
        'Integrate Firebase Authentication and Cloud Firestore databases',
        'Process external HTTP REST APIs and render content in Flutter'
    ],
    ARRAY[
        'Differentiate between Stateless and Stateful widgets',
        'Understand Firestore collections, documents, and real-time syncing',
        'Explain Play Store publishing registration and review processes'
    ],
    '[
        {"name": "Flutterfire Official Guides", "url": "https://firebase.google.com/docs/flutter/setup", "category": "documentation"},
        {"name": "Dart Programming Language Tour", "url": "https://dart.dev/language", "category": "documentation"},
        {"name": "Flutter Widget Catalog", "url": "https://docs.flutter.dev/reference/widgets", "category": "documentation"},
        {"name": "Flutter Crash Course Video Tutorial", "url": "https://www.youtube.com/watch?v=x0uinJ5HV68", "category": "video"},
        {"name": "Flutter Firebase Auth & Database Video Guide", "url": "https://www.youtube.com/watch?v=SfO8X2Cg_z4", "category": "video"}
    ]'::jsonb,
    'Authenticated Flutter App with Firestore Backend',
    'Build a Flutter mobile application featuring user email signup/login via Firebase Auth. Once authenticated, users must be able to view, add, and update database records inside Firestore (e.g., a shared notes, budget tracker, or profile log app).',
    NOW() + INTERVAL '28 days',
    '[
        {"criteria": "Firebase Auth User Management & Sessions", "max_points": 30},
        {"criteria": "Firestore CRUD Integration & Security Rules", "max_points": 30},
        {"criteria": "UI Layout, Loading & Error States", "max_points": 20},
        {"criteria": "Code Structure & Dart Asynchronous Handling", "max_points": 20}
    ]'::jsonb,
    NOW() + INTERVAL '21 days',
    TRUE
)
ON CONFLICT (module_number) DO UPDATE SET
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
    5,
    'Backend Development',
    'Build scalable backends.',
    ARRAY[
        'Create database schemas and relationships in PostgreSQL',
        'Build API paths and request validation schemas in FastAPI',
        'Secure passwords using bcrypt and implement JWT user session tokens',
        'Implement robust CRUD operations with dependency injection ORM models'
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
        {"name": "FastAPI User CRUD with JWT Auth Video", "url": "https://www.youtube.com/watch?v=6hTRw_80cQA", "category": "video"},
        {"name": "FastAPI Crash Course Video Tutorial", "url": "https://www.youtube.com/watch?v=0sOvCWFmrtA", "category": "video"}
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
ON CONFLICT (module_number) DO UPDATE SET
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
    6,
    'AI Integration',
    'Build intelligent software.',
    ARRAY[
        'Call large language models programmatically via API keys',
        'Configure context parameters, model temperature, and JSON responses',
        'Build custom RAG pipelines using document embeddings and vector search',
        'Chain multiple AI prompts to execute complex, multi-step automation workflows'
    ],
    ARRAY[
        'Explain Retrieval-Augmented Generation (RAG) concepts and chunking',
        'Understand token pricing, input/output structures, and safety configurations',
        'Evaluate trade-offs between linear agent loops and autonomous workflows'
    ],
    '[
        {"name": "Gemini API File Search & Embeddings Guide", "url": "https://ai.google.dev/gemini-api/docs/file-search", "category": "documentation"},
        {"name": "Anthropic Claude API Cookbook", "url": "https://github.com/anthropics/anthropic-cookbook", "category": "documentation"},
        {"name": "OpenAI Assistants API Overview", "url": "https://platform.openai.com/docs/assistants/overview", "category": "documentation"},
        {"name": "Gemini RAG File Search Video Tutorial", "url": "https://www.youtube.com/watch?v=AUZIYQEaqF62", "category": "video"},
        {"name": "Vector Database & Embeddings Intro Video", "url": "https://www.youtube.com/watch?v=ySEx_BqxoQs", "category": "video"}
    ]'::jsonb,
    'Integrate a Custom RAG Feature into Your App',
    'Integrate artificial intelligence capabilities into your application. Create a service that accepts a file, creates chunks, calls the embeddings API, indexes data in a vector store, and utilizes a generative LLM to provide grounded, citation-backed answers.',
    NOW() + INTERVAL '42 days',
    '[
        {"criteria": "Embeddings Generation & Vector Database Indexing", "max_points": 30},
        {"criteria": "Augmented Context Delivery to the LLM (RAG)", "max_points": 30},
        {"criteria": "User Query Flow & Citation UI presentation", "max_points": 20},
        {"criteria": "Error Mitigation & Token Efficiency Checks", "max_points": 20}
    ]'::jsonb,
    NOW() + INTERVAL '35 days',
    TRUE
)
ON CONFLICT (module_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    learning_outcomes = EXCLUDED.learning_outcomes,
    objectives = EXCLUDED.objectives,
    resources = EXCLUDED.resources,
    assignment_title = EXCLUDED.assignment_title,
    assignment_description = EXCLUDED.assignment_description,
    assignment_rubric = EXCLUDED.assignment_rubric;

-- Seed Module 7
INSERT INTO public.modules (
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
    7,
    'Product Development',
    'Build software people can actually use.',
    ARRAY[
        'Define and document a scoped Minimum Viable Product (MVP)',
        'Conduct live user interview tests to record usage metrics',
        'Perform structured manual QA smoke testing and bug tracking logs',
        'Iterate and deploy production code hotfixes based on user data'
    ],
    ARRAY[
        'Contrast features vs. products and outline prioritization models',
        'Differentiate between stated preferences and actual observed behaviors',
        'Understand staging configurations vs. live release pipelines'
    ],
    '[
        {"name": "Y Combinator Startup Library", "url": "https://www.ycombinator.com/library", "category": "documentation"},
        {"name": "The Mom Test Book Summary", "url": "https://www.effectiveengineer.com/blog/the-mom-test", "category": "documentation"},
        {"name": "Y Combinator: How to Build an MVP Video Guide", "url": "https://www.youtube.com/watch?v=ZRQDqgJHPh0", "category": "video"},
        {"name": "YC: How to Talk to Users Video Tutorial", "url": "https://www.youtube.com/watch?v=MT4Ig2uqjTc", "category": "video"},
        {"name": "Manual QA testing tutorial for beginners", "url": "https://www.youtube.com/watch?v=52A0_vjS9a0", "category": "video"}
    ]'::jsonb,
    'Launch Your MVP and Collect User Feedback',
    'Deploy a functional version of your product live to staging/production. Conduct user feedback sessions with at least 5 target users using "The Mom Test" guidelines. Document their friction points, write a QA checklist, and push a bug-fix iteration.',
    NOW() + INTERVAL '49 days',
    '[
        {"criteria": "MVP Scoping & Core Feature Delivery", "max_points": 30},
        {"criteria": "User Testing Interviews & Recorded Friction Log", "max_points": 30},
        {"criteria": "Successful Production Deploy & Iteration Pushes", "max_points": 20},
        {"criteria": "QA Smoke Test Log & Bug Reports Clarity", "max_points": 20}
    ]'::jsonb,
    NOW() + INTERVAL '42 days',
    TRUE
)
ON CONFLICT (module_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    learning_outcomes = EXCLUDED.learning_outcomes,
    objectives = EXCLUDED.objectives,
    resources = EXCLUDED.resources,
    assignment_title = EXCLUDED.assignment_title,
    assignment_description = EXCLUDED.assignment_description,
    assignment_rubric = EXCLUDED.assignment_rubric;

-- Seed Module 8
INSERT INTO public.modules (
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
    8,
    'Career & Freelancing',
    'Leave with opportunities, not just skills.',
    ARRAY[
        'Optimize a GitHub profile README and clean repository histories',
        'Refactor LinkedIn profile summaries, headlines, and pinned features',
        'Create professional profiles and bid proposals on freelance sites',
        'Practice technical portfolio walkthroughs and coding interview questions'
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
        {"name": "LinkedIn Optimization for Software Engineers Video", "url": "https://www.youtube.com/watch?v=uK1Xk3p2kG0", "category": "video"},
        {"name": "How to Get Your First Client on Upwork Video Guide", "url": "https://www.youtube.com/watch?v=3M6B1H85R_M", "category": "video"}
    ]'::jsonb,
    'Career Brand Portfolio and Capstone Assessment',
    'Prepare your developer portfolio and public profiles. This includes: an optimized GitHub Profile README, clean readme files on your projects, an updated LinkedIn profile with pinned project media, and a capstone presentation slide deck.',
    NOW() + INTERVAL '56 days',
    '[
        {"criteria": "Capstone Project Quality & Technical Defence", "max_points": 40},
        {"criteria": "GitHub Profile & Project Repositories Cleanup", "max_points": 20},
        {"criteria": "LinkedIn Branding, Headline & Project Pinned Assets", "max_points": 20},
        {"criteria": "Freelance Profile Readiness / Resume Polish", "max_points": 20}
    ]'::jsonb,
    NOW() + INTERVAL '49 days',
    TRUE
)
ON CONFLICT (module_number) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    learning_outcomes = EXCLUDED.learning_outcomes,
    objectives = EXCLUDED.objectives,
    resources = EXCLUDED.resources,
    assignment_title = EXCLUDED.assignment_title,
    assignment_description = EXCLUDED.assignment_description,
    assignment_rubric = EXCLUDED.assignment_rubric;
