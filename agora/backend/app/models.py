import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, Float, JSON
)
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"
    ADMIN = "ADMIN"

class AIState(str, enum.Enum):
    WAIT = "WAIT"
    LISTEN = "LISTEN"
    THINK = "THINK"
    SPEAK = "SPEAK"
    ALERT_TEACHER = "ALERT_TEACHER"
    TEACHER_OVERRIDE = "TEACHER_OVERRIDE"

class LearningLevel(str, enum.Enum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"

class GapSeverity(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class QuizEvaluation(str, enum.Enum):
    CORRECT = "CORRECT"
    INCORRECT = "INCORRECT"
    NEEDS_REVIEW = "NEEDS_REVIEW"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.STUDENT, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    teacher_profile = relationship("Teacher", back_populates="user", uselist=False, cascade="all, delete-orphan")
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    title = Column(String(100), default="Dr.")
    department = Column(String(255), default="Mathematics & Sciences")
    bio = Column(Text, default="Passionate educator leveraging AI co-teachers in real-time classrooms.")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="teacher_profile")
    classrooms = relationship("Classroom", back_populates="teacher", cascade="all, delete-orphan")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    grade = Column(String(50), default="Grade 10")
    learning_level = Column(Enum(LearningLevel), default=LearningLevel.BEGINNER)
    preferred_language = Column(String(50), default="Hinglish") # e.g. "English", "Hindi-English"
    misconceptions = Column(JSON, default=list) # e.g. ["Negative square roots", "Middle term splitting"]
    overall_mastery = Column(Float, default=70.0) # Percentage
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="student_profile")
    interactions = relationship("StudentInteraction", back_populates="student", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="student", cascade="all, delete-orphan")

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)
    name = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    current_topic = Column(String(255), default="Quadratic Equations")
    description = Column(Text, default="")
    agora_channel = Column(String(255), unique=True, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("Teacher", back_populates="classrooms")
    sessions = relationship("ClassSession", back_populates="classroom", cascade="all, delete-orphan")
    learning_gaps = relationship("LearningGap", back_populates="classroom", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="classroom", cascade="all, delete-orphan")

class ClassSession(Base):
    __tablename__ = "class_sessions"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    session_title = Column(String(255), nullable=False)
    topic = Column(String(255), nullable=False)
    is_live = Column(Boolean, default=True)
    ai_status = Column(Enum(AIState), default=AIState.WAIT)
    ai_mode = Column(String(50), default="ACTIVE") # ACTIVE, MUTED, PAUSED, OVERRIDDEN
    agora_agent_id = Column(String(255), nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)

    classroom = relationship("Classroom", back_populates="sessions")
    conversations = relationship("Conversation", back_populates="session", cascade="all, delete-orphan")
    summary = relationship("ClassSummary", back_populates="session", uselist=False, cascade="all, delete-orphan")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("class_sessions.id"), nullable=False)
    speaker_role = Column(String(50), nullable=False) # TEACHER, STUDENT, AI
    speaker_name = Column(String(255), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    text = Column(Text, nullable=False)
    audio_duration = Column(Float, default=0.0) # In seconds
    language = Column(String(50), default="en") # en, hi, hinglish
    ai_turn_state = Column(Enum(AIState), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("ClassSession", back_populates="conversations")

class StudentInteraction(Base):
    __tablename__ = "student_interactions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("class_sessions.id"), nullable=False)
    topic = Column(String(255), nullable=False)
    question_asked = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    adapted_for_level = Column(Enum(LearningLevel), default=LearningLevel.BEGINNER)
    language_used = Column(String(50), default="Hinglish")
    detected_gap = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="interactions")

class LearningGap(Base):
    __tablename__ = "learning_gaps"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("class_sessions.id"), nullable=True)
    topic = Column(String(255), nullable=False)
    gap_title = Column(String(255), nullable=False) # e.g. "Factorization / Splitting Middle Term"
    description = Column(Text, nullable=False)
    affected_students = Column(JSON, default=list) # List of student names e.g. ["Rahul", "Priya", "Aman"]
    severity = Column(Enum(GapSeverity), default=GapSeverity.HIGH)
    recommendation = Column(Text, nullable=False) # e.g. "Pause and revise factorization with a simpler example."
    is_resolved = Column(Boolean, default=False)
    detected_at = Column(DateTime, default=datetime.utcnow)

    classroom = relationship("Classroom", back_populates="learning_gaps")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    classroom_id = Column(Integer, ForeignKey("classrooms.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("class_sessions.id"), nullable=True)
    topic = Column(String(255), nullable=False)
    question_text = Column(Text, nullable=False)
    expected_answer = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    classroom = relationship("Classroom", back_populates="quizzes")
    results = relationship("QuizResult", back_populates="quiz", cascade="all, delete-orphan")

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    spoken_answer = Column(Text, nullable=False)
    evaluation = Column(Enum(QuizEvaluation), default=QuizEvaluation.NEEDS_REVIEW)
    ai_feedback = Column(Text, nullable=False)
    answered_at = Column(DateTime, default=datetime.utcnow)

    quiz = relationship("Quiz", back_populates="results")
    student = relationship("Student", back_populates="quiz_results")

class ClassSummary(Base):
    __tablename__ = "class_summaries"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("class_sessions.id"), unique=True, nullable=False)
    topics_covered = Column(JSON, default=list)
    total_questions = Column(Integer, default=0)
    students_needing_support = Column(Integer, default=0)
    common_learning_gaps = Column(JSON, default=list)
    recommended_action = Column(Text, nullable=False)
    student_insights = Column(JSON, default=dict) # e.g. {"Rahul": "Needs support with factorization", "Priya": "Needs practice with discriminant"}
    overall_engagement_score = Column(Float, default=85.0)
    generated_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ClassSession", back_populates="summary")
