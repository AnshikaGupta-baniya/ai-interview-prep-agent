## YourNext — AI-Powered Interview Preparation Platform
YourNext is an AI-powered interview preparation platform that transforms traditional interview practice into a personalized, feedback-driven learning experience.
Unlike generic interview preparation tools, YourNext generates interview questions grounded in a candidate's actual resume, evaluates answers using the STAR framework, provides actionable coaching recommendations, and tracks continuous improvement over time.

## 🚀 Problem Statement
Interview preparation remains fragmented and inefficient.
Candidates often rely on:

- Generic question banks
- Random YouTube videos
- Unstructured self-practice
- One-time mock interviews
  
As a result, they struggle with:

- Lack of personalization
- No structured feedback
- Limited visibility into weak areas
- No measurable improvement tracking
- Inability to simulate real interview environments

YourNext addresses these challenges by combining Resume Intelligence, Retrieval-Augmented Generation (RAG), Voice AI, and Adaptive Coaching into a single interview preparation ecosystem.

## ✨ Key Features

### Resume-Aware Interview Preparation

Generate interview questions tailored to:

- Work experience
- Projects
- Skills
- Achievements
- Career history

Every question is grounded in the candidate's actual resume.

### Role & Seniority-Based Customization

Interview experiences adapt based on:

- Target Role
- Experience Level
- Career Goals

Examples:

- Product Analyst
- Product Manager
- Data Analyst
- Software Engineer

Questions become more advanced as seniority increases.

### Voice-Based Mock Interviews

Candidates answer questions verbally to simulate real interview conditions.

Benefits:
- Improved communication skills
- Better confidence building
- Realistic interview experience
- Reduced dependence on text-based practice
  
### Speech-to-Text Processing

Responses are automatically transcribed using Whisper Speech-to-Text before evaluation.
This enables structured AI analysis while maintaining a natural interview experience.

### STAR Framework Evaluation

Every answer is evaluated across five dimensions:

| Dimension | Description             |
| --------- | ----------------------- |
| Situation | Context clarity         |
| Task      | Problem definition      |
| Action    | Execution quality       |
| Result    | Business impact         |
| Relevance | Alignment with question |

Candidates receive:
- Dimension-wise scores
- Overall rating
- Gap analysis
- Coaching recommendations

### AI Coaching & Ideal Answers

YourNext acts as an AI interview coach by providing:

- Strength analysis
- Improvement opportunities
- Personalized coaching tips
- Resume-grounded ideal answers

Candidates not only learn what was wrong but also how to improve.

### Adaptive Interview Difficulty

The platform dynamically adjusts interview depth based on candidate performance.
When a candidate receives a low score (below the defined quality threshold), YourNext automatically generates follow-up questions targeting the weakest evaluation dimension.

Examples:
- Weak business impact → Follow-up on measurable outcomes
- Weak ownership demonstration → Follow-up on actions taken
- Missing STAR components → Follow-up on structure and clarity

This creates a more realistic interview experience that mirrors how real interviewers probe deeper into incomplete answers.

### Session History & Interview Repository

Every interview session is stored for future review.

Candidates can:
- Access past interview sessions
- Revisit questions and answers
- Review AI-generated feedback
- Download session reports
- Continue practicing anytime
- Track improvement across multiple sessions

Interview preparation becomes a continuous learning journey rather than a one-time activity.

### Skill-Based Improvement Insights

Each completed session generates personalized tags that help candidates focus on future improvement.

#### Improvement Tags

Examples:
- Quantifying Results
- Ownership Clarity
- Technical Depth
- Problem Solving

These insights help candidates understand exactly what to improve before their next interview.

## 🏗 System Architecture

YourNext follows a six-stage AI workflow:

Resume Upload
→ Resume Parsing
→ RAG Indexing
→ Personalized Question Generation
→ Voice Interview
→ AI Evaluation & Coaching

### Stage 1 — Resume Ingestion & Parsing

- PDF/DOCX upload
- Resume extraction
- Skill identification
- Experience mapping
- Structured candidate profile generation

### Stage 2 — Vectorization & Retrieval

- Resume chunking
- Embedding generation
- Vector storage
- Semantic retrieval

### Stage 3 — Role & Seniority Configuration

Users select:
- Target Role
- Seniority Level

This information calibrates both question generation and evaluation criteria.

### Stage 4 — RAG-Powered Question Generation

The platform retrieves the most relevant resume context and combines it with role and seniority information to generate personalized interview questions.

### Stage 5 — Voice Interview Simulation

Candidates answer verbally.

Audio is captured and processed through Whisper Speech-to-Text.

### Stage 6 — AI Evaluation & Coaching

The platform evaluates:
- Candidate Answer
- Resume Context
- Interview Question
- Role Context

to generate structured feedback and coaching recommendations.

## 🤖 Why RAG?

Traditional LLM-based interview systems generate generic questions.

Example:
 # "What are joins in SQL?"

YourNext instead retrieves relevant resume experience and generates contextual questions such as:

# "You automated QA workflows reducing manual effort by 90%. Walk me through the architecture, trade-offs, and challenges involved."

Benefits:
- Higher personalization
- Better relevance
- Reduced hallucinations
- Realistic interview conversations

## 📊 Evaluation Framework

Each evaluation produces:

### Score Breakdown
- Situation
- Task
- Action
- Result
- Relevance

### Gap Analysis
Highlights missing details and weak dimensions.

### Coaching Recommendations
Specific improvement suggestions based on candidate responses.

### Ideal Answer
AI-generated answer grounded in the candidate's actual resume context.

### Adaptive Follow-Up Question
Generated automatically when deeper probing is required.

## 🛠 Technology Stack

### Mobile Application
- React Native
- Expo

### Backend
- FastAPI
- Python

### AI Layer
- Groq LLM
- Retrieval-Augmented Generation (RAG)

### Embeddings
- Jina Embeddings

### Vector Database
- Supabase Vector Store

### Speech Processing
- OpenAI Whisper

### Resume Parsing
- PyMuPDF
- python-docx

### Deployment
- Render

## 📱 Product Modules

### Authentication & Onboarding
Secure user onboarding and profile management.

### Resume Intelligence
Resume parsing, skill extraction, and experience mapping.

### Interview Configuration
Role selection, seniority calibration, and resume upload.

### AI Interview Engine
Resume-aware question generation powered by RAG.

### Voice Interview Experience
Realistic verbal interview simulation.

### Adaptive Coaching Engine
Follow-up questions and targeted skill improvement.

### Feedback Engine
STAR evaluation and AI coaching recommendations.

### Interview Repository
Historical sessions, downloadable reports, and revision support.

### Progress Dashboard
Performance tracking and improvement analytics.

## 🎯 Success Metrics

| Metric                     | Target    |
| -------------------------- | --------- |
| Resume Parse Accuracy      | > 90%     |
| Question Relevance         | > 4.0 / 5 |
| Feedback Usefulness        | > 4.0 / 5 |
| Speech-to-Text Latency     | < 3 sec   |
| End-to-End Interview Cycle | < 8 sec   |

## 🔮 Future Roadmap

- Company-Specific Interview Preparation
- AI Voice Interviewer
- Multi-Round Interview Journeys
- Hiring Readiness Score
- Peer Benchmarking
- Video Interview Environment

## 👤 Author

Anshika Gupta

Product Analyst | On a journey to build products that matter.

Built as an end-to-end GenAI application demonstrating Retrieval-Augmented Generation, Resume Intelligence, Voice AI, Adaptive Coaching, and LLM-based evaluation systems.

## Vision

Transform interview preparation from random practice sessions into a personalized AI coaching experience available anytime, anywhere.
