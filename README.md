# 🎙️ CLASSORA AI — "Your Real-Time Voice Co-Teacher"

> **"Listen. Understand. Assist. Empower."**  
> *An AI co-teacher that sits in your live Agora voice classroom, respects teacher priority, answers contextual student questions in Hinglish/English, detects learning gaps in real time, and conducts spoken quizzes.*

---

## 🌟 1. Project Overview

**CLASSORA AI** is a production-grade hackathon platform built around **Agora Conversational AI** and **Agora RTC**. 
👉 **[Open Agora Project](https://github.com/DISHITACHAUHAN/classora-AI/tree/main/agora)**

The goal of Classora AI is **NOT** to replace the teacher. Rather, Classora AI operates as an empathetic, context-aware co-teacher that:
- Listens to ongoing classroom discussions
- Respects the lead teacher's authority and turn-taking priority
- Intervenes with personalized explanations when students ask questions
- Understands multilingual code-switching (**Hindi + English / Hinglish**)
- Aggregates recurring student confusion into real-time **Learning Gap Intelligence alerts**
- Conducts **Spoken Voice Quizzes** with instant oral evaluation
- Gives teachers instant master controls (**MUTE**, **PAUSE**, **ALLOW**, **OVERRIDE**)
- Generates post-class intelligence reports with pedagogical recommendations

---

## 🚀 2. Problem & Innovation

| The Problem | How Classora AI Solves It |
| :--- | :--- |
| **Teacher Bandwidth Bottleneck** | A single teacher cannot provide individual 1-on-1 differentiated voice explanations to 30+ students simultaneously without disrupting the lecture flow. |
| **Intrusive AI Chatbots** | Traditional chatbots require students to look away, type text queries, and lose focus on the spoken classroom dialogue. |
| **Language & Tone Barriers** | Students often think and express confusion in code-switched dialects (e.g., Hinglish) which conventional STT/TTS bots fail to comprehend. |
| **Unnoticed Learning Gaps** | When multiple students silently struggle with the same core misunderstanding, teachers only discover it weeks later in written exams. |

---

## 🏗️ 3. Architecture & Agora Voice Pipeline

```
                                  LIVE DIGITAL CLASSROOM
                                             │
      ┌──────────────────────────────────────┼──────────────────────────────────────┐
      │                                      │                                      │
 👨‍🏫 Lead Teacher                    👩‍🎓 Students                      🤖 Classora AI Co-Teacher
(Dr. Sharma: Host/Audio)           (Rahul, Priya, Aman)               (Agora Agent / REST API v2)
      │                                      │                                      │
      └──────────────────────────────────────┬──────────────────────────────────────┘
                                             │
                                             ▼
                             🎙️ Agora RTC Real-Time Voice Mesh
                                (Channel: ClassoraClassroom_id)
                                             │
                    ┌────────────────────────┴────────────────────────┐
                    ▼                                                 ▼
     ⚡ FastAPI Orchestrator                                ✨ React + Tailwind Frontend
    (Auth, Agora Tokens, WebSockets)                     (VoiceOrb, Live Captions, Controls)
                    │
   ┌────────────────┼────────────────┬────────────────┬────────────────┐
   ▼                ▼                ▼                ▼                ▼
Agora Service   Turn Manager   Context Engine  Learning Gap    Spoken Quiz
(REST API v2)  (WAIT/LISTEN/   (Grounded DB    (Semantic Gap   (Oral Voice
               THINK/SPEAK)     Memory)         Clustering)     Evaluation)
   │                │                │                │                │
   └────────────────┴────────────────┼────────────────┴────────────────┘
                                     ▼
                           🧠 Gemini 1.5 Flash
                         (Hinglish Multi-Turn LLM)
                                     │
                                     ▼
                       Post-Class Intelligence Engine
                     (Topic Mastery & Student Scorecards)
```

---

## ⚙️ 4. Tech Stack

- **Voice & Real-Time Audio (Core)**: Agora Conversational AI Agent REST API v2, Agora RTC Web SDK (`agora-rtc-sdk-ng`), HMAC Dynamic RTC Token Engine.
- **Backend**: Python 3.14 / FastAPI, SQLAlchemy, Pydantic, WebSockets, Google Gemini API (`google-generativeai`), PyJWT.
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, Glassmorphism design system.
- **Database**: SQLite (built-in out-of-the-box) and PostgreSQL support (`DATABASE_URL`).

---

## 🔌 5. Agora Integration Deep Dive

Agora is the core pillar of Classora AI. The integration leverages:

### 1. Multi-Participant Agora RTC Voice Channel
- Every classroom creates a unique Agora RTC channel (e.g., `Classora_Math_Grade10`).
- Teacher, Students, and Classora AI publish and subscribe to real-time audio streams.
- Client uses `AgoraRTC.createMicrophoneAudioTrack()` and dynamic volume indicators (`client.enableAudioVolumeIndicator()`) for real-time speaker detection and visual pulses.

### 2. Agora Conversational AI REST API v2
- The backend interacts with Agora's Conversational AI Agent endpoint:  
  `POST https://api.agora.io/api/conversational-ai-agent/v2/projects/{appid}/join`
- Provisions real-time ASR (`ares`), LLM (`gpt-4o-mini` / Gemini adapter), and TTS (`microsoft` multilingual voice) with custom system prompts synthesized dynamically from the active lesson context.
- Manages agent lifecycles via `/agents/{id}/leave` and `/agents/{id}/update`.

### 3. Turn-Taking State Machine & Voice Bridge
- Synchronizes audio states across WebSocket events:
  - 🟢 `AI LISTENING`: Activated when student speaks.
  - 🟡 `AI THINKING`: Formulates personalized response.
  - 🔵 `AI SPEAKING`: Voice output streamed through Agora.
  - ⚪ `AI WAITING`: Yields floor when teacher speaks.
  - 🔴 `TEACHER OVERRIDE`: Immediate voice silencing upon teacher intervention.

---

## 🛠️ 6. Quickstart & Installation

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js 18+ (Node.js v20 LTS included)

### Project Structure

```text
classora-AI/
│
├── agora/
│   ├── backend/
│   ├── frontend/
│   └── .env.example
│
└── README.md
```

### Step 1: Clone Repository
```bash
git clone https://github.com/DISHITACHAUHAN/classora-AI.git
cd classora-AI
cd agora
```

### Step 2: Backend Setup
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# (Optional) Set your API Keys in .env or run with defaults
cp .env.example .env
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
```

---

## 🚀 7. Running Locally

### 1. Start Backend Server (Port 8000)
```bash
# In project root:
python backend/run.py
```
*The FastAPI backend will start at `http://localhost:8000` with auto-seeded demo data (Dr. Sharma, Rahul, Priya, Aman).*

### 2. Start Frontend Dev Server (Port 5173)
```bash
# In frontend directory:
cd frontend
npm run dev
```
*Open your browser at `http://localhost:5173`.*

---

## 🧪 8. Run Automated Test Suite

Run the full end-to-end capability verification script covering all 8 modules:
```bash
python backend/test_backend.py
```
**Output:**
```
=== 1. Initializing Database & Seeding ===
Teacher loaded: Dr. Sharma (teacher@classora.ai)
Students loaded: 3 students ['Rahul Verma', 'Priya Patel', 'Aman Gupta']
=== 2. Testing Agora RTC Token Generation ===
Generated Agora RTC Token: 006a1b2c3d4e5f6g7h8i9j0classor...
=== 3. Testing Context Engine & Agora System Prompt ===
=== 4. Testing Turn-Taking State Machine ===
=== 5. Testing Gemini Hinglish Co-Teacher Reasoning ===
=== 6. Testing Real-Time Learning Gap Clustering ===
=== 7. Testing Spoken Quiz Generation & Oral Evaluation ===
=== 8. Testing Post-Class Intelligence Summary ===
==========================================
 ALL 8 BACKEND CAPABILITY TESTS PASSED! 
==========================================
```

---

## 🏆 9. Hackathon Judges Demo Walkthrough

The platform features **1-Click Demo Personas** and an interactive **Judges Demo Guide** (`/demo_guide` tab):

1. **Step 1 — Open the App**: Navigate to `http://localhost:5173`. Click **1-Click Demo** or **Judges Guide**.
2. **Step 2 — Join as Teacher**: Click **Dr. Sharma (Teacher)** -> Enters the live Agora voice room.
3. **Step 3 — Observe Turn-Taking (Teacher Speaking)**:
   - Click **"Teacher Lecturing"** -> VoiceOrb displays ⚪ `AI WAITING (TEACHER PRIORITY)`.
   - Click **"Simulate Teacher Pause"** -> VoiceOrb transitions to ready state.
4. **Step 4 — Student Spoken Question (Hinglish)**:
   - Click **"Rahul: Middle term split samajh nahi aa raha"**.
   - Watch VoiceOrb transition: 🟢 `AI LISTENING` &rarr; 🟡 `AI THINKING` &rarr; 🔵 `AI SPEAKING`.
   - Classora AI responds in warm Hinglish explaining factor pairs for $x^2 + 5x + 6 = 0$.
5. **Step 5 — Adaptive Depth for Advanced Students**:
   - Click **"Priya: Why no real roots when D < 0?"** -> Classora explains discriminants with algebraic precision.
6. **Step 6 — Learning Gap Detection Alert**:
   - After multiple students ask about factorization, the **Learning Intelligence Panel** alerts the teacher with severity: `HIGH` and recommended action: *"Pause and demonstrate factor pair trees"*.
7. **Step 7 — Teacher Master Control**:
   - Click `[OVERRIDE AI]` -> VoiceOrb immediately switches to 🔴 `TEACHER OVERRIDE` and silences AI.
   - Click `[ALLOW AI]` -> AI resumes co-teaching.
8. **Step 8 — Spoken AI Quiz**:
   - Click `[START AI QUIZ]` -> Classora asks: *"What is the discriminant of x² + 5x + 6 = 0?"*.
   - Click **"Submit Spoken Answer"** -> AI orally evaluates with confetti celebration.
9. **Step 9 — Post-Class Intelligence**:
   - Click `[END CLASS]` -> Generates comprehensive analytics, topics mastered, struggling student count, and personalized next steps.

---

## 🔒 10. Security & Secrets Management

- **No Secrets in Frontend**: Agora App Certificate and Customer Secrets are strictly maintained server-side.
- **Dynamic HMAC Token Generation**: Generates scoped, time-bound Agora RTC tokens for clients on demand.
- **JWT Authentication**: Secure role-based authorization for Teachers and Students.

---

## 🔮 11. Future Scalability

- Multi-channel breakout rooms for small-group AI co-tutoring.
- Real-time whiteboard synchronization using Agora RTM.
- Direct voice emotion and cognitive load detection.

---

**Developed with ❤️ for the Agora Conversational AI Hackathon**
