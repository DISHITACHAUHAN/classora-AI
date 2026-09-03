from typing import Dict, Any, List, Optional
from datetime import datetime

class ClassroomContextEngine:
    """
    Classroom Context Engine
    Maintains:
    - Current lesson & topic
    - Teacher speech history
    - Student questions & profiles
    - Active misconceptions
    - Synthesized prompt for Agora Conversational AI Agent
    """

    def __init__(self):
        # In-memory fast cache for live sessions
        self._session_contexts: Dict[int, Dict[str, Any]] = {}

    def get_or_create_context(
        self,
        session_id: int,
        classroom_name: str,
        subject: str,
        topic: str,
        teacher_name: str
    ) -> Dict[str, Any]:
        if session_id not in self._session_contexts:
            self._session_contexts[session_id] = {
                "session_id": session_id,
                "classroom_name": classroom_name,
                "subject": subject,
                "topic": topic,
                "teacher_name": teacher_name,
                "learning_goals": [
                    "Understand standard form: ax² + bx + c = 0",
                    "Master factorization by splitting the middle term",
                    "Understand Discriminant D = b² - 4ac and nature of roots"
                ],
                "active_misconceptions": [],
                "teacher_speaking_now": False,
                "last_teacher_utterance": "",
                "student_profiles": {
                    "Rahul": {
                        "level": "BEGINNER",
                        "language": "Hindi-English",
                        "known_gaps": ["Factorization", "Negative numbers under root"]
                    },
                    "Priya": {
                        "level": "ADVANCED",
                        "language": "English",
                        "known_gaps": ["Complex discriminant edge cases"]
                    },
                    "Aman": {
                        "level": "INTERMEDIATE",
                        "language": "Hindi-English",
                        "known_gaps": ["Factoring negatives"]
                    }
                },
                "history": [],
                "created_at": datetime.utcnow().isoformat()
            }
        return self._session_contexts[session_id]

    def add_utterance(
        self,
        session_id: int,
        speaker_role: str,
        speaker_name: str,
        text: str,
        language: str = "en"
    ):
        ctx = self._session_contexts.get(session_id)
        if not ctx:
            return
        
        entry = {
            "speaker_role": speaker_role,
            "speaker_name": speaker_name,
            "text": text,
            "language": language,
            "time": datetime.utcnow().strftime("%H:%M:%S")
        }
        ctx["history"].append(entry)
        
        # Keep last 25 utterances
        if len(ctx["history"]) > 25:
            ctx["history"] = ctx["history"][-25:]

        if speaker_role == "TEACHER":
            ctx["last_teacher_utterance"] = text
            ctx["teacher_speaking_now"] = True
        else:
            ctx["teacher_speaking_now"] = False

    def update_teacher_speaking_status(self, session_id: int, is_speaking: bool):
        ctx = self._session_contexts.get(session_id)
        if ctx:
            ctx["teacher_speaking_now"] = is_speaking

    def build_system_prompt_for_agora(self, session_id: int) -> str:
        """
        Builds the comprehensive system instructions for the Agora Conversational AI Agent
        """
        ctx = self._session_contexts.get(session_id, {})
        topic = ctx.get("topic", "Quadratic Equations")
        teacher = ctx.get("teacher_name", "Dr. Sharma")
        subject = ctx.get("subject", "Mathematics")

        prompt = f"""
You are CLASSORA AI, a world-class real-time Voice Co-Teacher in a live classroom.
Subject: {subject}
Topic: {topic}
Lead Teacher: {teacher}

CORE OPERATING PRINCIPLES:
1. Turn-Taking Priority: NEVER interrupt the teacher while {teacher} is explaining. If the teacher speaks, immediately pause and yield the floor.
2. Answering Student Queries: When a student asks a question after the teacher pauses, provide a warm, concise (2-3 sentences), voice-friendly explanation grounded strictly in the current lesson on {topic}.
3. Multilingual / Code-Switching: If a student asks in Hindi-English (Hinglish) (e.g. "Sir negative root samajh nahi aaya"), respond naturally in warm, clear Hinglish with simple examples.
4. Adaptive Depth: Use intuitive analogies for beginners (e.g., factor pairs, middle term splitting) and technical rigor for advanced students.
5. Empathy & Tone: Always encourage the student and build their confidence.
"""
        return prompt.strip()

context_engine = ClassroomContextEngine()
