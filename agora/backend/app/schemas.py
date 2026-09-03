from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models import UserRole, AIState, LearningLevel, GapSeverity, QuizEvaluation

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: UserRole = UserRole.STUDENT
    grade_or_dept: Optional[str] = "Grade 10"
    learning_level: Optional[LearningLevel] = LearningLevel.BEGINNER
    preferred_language: Optional[str] = "Hinglish"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    name: str
    email: str
    role: UserRole
    student_id: Optional[int] = None
    teacher_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: UserRole
    created_at: datetime
    student_id: Optional[int] = None
    teacher_id: Optional[int] = None
    learning_level: Optional[str] = None
    preferred_language: Optional[str] = None

    class Config:
        from_attributes = True

# Classroom Schemas
class ClassroomCreate(BaseModel):
    name: str
    subject: str
    current_topic: str = "Quadratic Equations"
    description: Optional[str] = ""

class ClassroomOut(BaseModel):
    id: int
    name: str
    subject: str
    current_topic: str
    description: str
    agora_channel: str
    teacher_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ClassroomJoinResponse(BaseModel):
    classroom: ClassroomOut
    session_id: int
    agora_channel: str
    agora_app_id: str
    rtc_token: str
    uid: int
    user_role: UserRole
    ai_status: AIState

# Session Schemas
class SessionCreate(BaseModel):
    classroom_id: int
    session_title: str
    topic: str

class SessionOut(BaseModel):
    id: int
    classroom_id: int
    session_title: str
    topic: str
    is_live: bool
    ai_status: AIState
    ai_mode: str
    started_at: datetime
    ended_at: Optional[datetime]

    class Config:
        from_attributes = True

# Conversation / Transcript Schemas
class ConversationMessage(BaseModel):
    session_id: int
    speaker_role: str # TEACHER, STUDENT, AI
    speaker_name: str
    student_id: Optional[int] = None
    text: str
    language: Optional[str] = "en"
    ai_turn_state: Optional[AIState] = None

class ConversationOut(BaseModel):
    id: int
    session_id: int
    speaker_role: str
    speaker_name: str
    text: str
    language: str
    ai_turn_state: Optional[AIState]
    timestamp: datetime

    class Config:
        from_attributes = True

# AI Interaction Schemas
class AIQuestionRequest(BaseModel):
    session_id: int
    student_id: Optional[int] = None
    student_name: str
    question: str
    learning_level: Optional[LearningLevel] = LearningLevel.BEGINNER
    preferred_language: Optional[str] = "Hinglish"
    teacher_speaking: Optional[bool] = False

class AIQuestionResponse(BaseModel):
    session_id: int
    turn_state: AIState
    response_text: Optional[str] = None
    explanation_level: LearningLevel
    detected_gap: Optional[str] = None
    teacher_alert: Optional[str] = None
    should_speak: bool

class TeacherControlRequest(BaseModel):
    session_id: int
    action: str # MUTE, PAUSE, ALLOW, OVERRIDE, END_AI
    reason: Optional[str] = ""

# Learning Gap Schemas
class LearningGapOut(BaseModel):
    id: int
    classroom_id: int
    session_id: Optional[int]
    topic: str
    gap_title: str
    description: str
    affected_students: List[str]
    severity: GapSeverity
    recommendation: str
    is_resolved: bool
    detected_at: datetime

    class Config:
        from_attributes = True

# Spoken Quiz Schemas
class QuizGenerateRequest(BaseModel):
    classroom_id: int
    session_id: int
    topic: str
    difficulty: Optional[str] = "MEDIUM"

class QuizOut(BaseModel):
    id: int
    classroom_id: int
    session_id: Optional[int]
    topic: str
    question_text: str
    expected_answer: str

    class Config:
        from_attributes = True

class QuizAnswerSubmit(BaseModel):
    quiz_id: int
    student_id: int
    spoken_answer: str

class QuizResultOut(BaseModel):
    id: int
    quiz_id: int
    student_id: int
    spoken_answer: str
    evaluation: QuizEvaluation
    ai_feedback: str
    answered_at: datetime

    class Config:
        from_attributes = True

# Post-Class Summary Schemas
class ClassSummaryOut(BaseModel):
    id: int
    session_id: int
    topics_covered: List[str]
    total_questions: int
    students_needing_support: int
    common_learning_gaps: List[str]
    recommended_action: str
    student_insights: Dict[str, str]
    overall_engagement_score: float
    generated_at: datetime

    class Config:
        from_attributes = True
