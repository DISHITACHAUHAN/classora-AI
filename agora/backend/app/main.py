import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database import init_db, get_db
from app.models import (
    User, UserRole, Teacher, Student, Classroom, ClassSession,
    Conversation, StudentInteraction, LearningGap, Quiz, QuizResult, ClassSummary,
    AIState, LearningLevel, GapSeverity, QuizEvaluation
)
from app.schemas import (
    UserRegister, UserLogin, Token, UserOut,
    ClassroomCreate, ClassroomOut, ClassroomJoinResponse,
    SessionCreate, SessionOut,
    ConversationMessage, ConversationOut,
    AIQuestionRequest, AIQuestionResponse,
    TeacherControlRequest,
    LearningGapOut,
    QuizGenerateRequest, QuizOut, QuizAnswerSubmit, QuizResultOut,
    ClassSummaryOut
)
from app.auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_current_user, require_teacher
)
from app.services.agora_service import agora_service
from app.services.context_engine import context_engine
from app.services.turn_manager import turn_manager
from app.services.learning_gap import learning_gap_engine
from app.services.quiz_generator import spoken_quiz_engine
from app.services.summarizer import post_class_summarizer
from app.services.gemini_service import gemini_service
from app.seed_data import seed_database

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("classora_main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-Time Voice Co-Teacher Platform powered by Agora Conversational AI and RTC",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket Connections per Session
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, session_id: int, websocket: WebSocket):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, session_id: int, websocket: WebSocket):
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)

    async def broadcast_to_session(self, session_id: int, message: dict):
        if session_id in self.active_connections:
            for connection in list(self.active_connections[session_id]):
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.warning(f"Error sending WS message: {e}")

ws_manager = ConnectionManager()

@app.on_event("startup")
def on_startup():
    init_db()
    # Seed default teacher, students, classroom
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    logger.info("Classora AI Backend initialized successfully.")

# Root Endpoint
@app.get("/")
def read_root():
    return {
        "app": "CLASSORA AI",
        "tagline": "Your Real-Time Voice Co-Teacher",
        "status": "ONLINE",
        "agora_voice": "Agora Conversational AI + RTC v2",
        "timestamp": datetime.utcnow().isoformat()
    }

# ==================== AUTH ENDPOINTS ====================

@app.post("/auth/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    hashed_pw = get_password_hash(data.password)
    new_user = User(
        email=data.email,
        name=data.name,
        hashed_password=hashed_pw,
        role=data.role
    )
    db.add(new_user)
    db.flush()

    teacher_id = None
    student_id = None

    if data.role == UserRole.TEACHER:
        teacher = Teacher(
            user_id=new_user.id,
            department=data.grade_or_dept or "Mathematics"
        )
        db.add(teacher)
        db.flush()
        teacher_id = teacher.id
    else:
        student = Student(
            user_id=new_user.id,
            grade=data.grade_or_dept or "Grade 10",
            learning_level=data.learning_level or LearningLevel.BEGINNER,
            preferred_language=data.preferred_language or "Hinglish",
            misconceptions=[]
        )
        db.add(student)
        db.flush()
        student_id = student.id

    db.commit()
    db.refresh(new_user)

    token = create_access_token({"sub": new_user.email, "role": new_user.role.value})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        teacher_id=teacher_id,
        student_id=student_id
    )

@app.post("/auth/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    teacher_id = user.teacher_profile.id if user.teacher_profile else None
    student_id = user.student_profile.id if user.student_profile else None

    token = create_access_token({"sub": user.email, "role": user.role.value})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        teacher_id=teacher_id,
        student_id=student_id
    )

@app.get("/auth/me", response_model=UserOut)
def get_me(user: User = Depends(require_current_user)):
    t_id = user.teacher_profile.id if user.teacher_profile else None
    s_id = user.student_profile.id if user.student_profile else None
    level = user.student_profile.learning_level.value if user.student_profile else None
    lang = user.student_profile.preferred_language if user.student_profile else None

    return UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        created_at=user.created_at,
        teacher_id=t_id,
        student_id=s_id,
        learning_level=level,
        preferred_language=lang
    )

# ==================== CLASSROOM ENDPOINTS ====================

@app.post("/classrooms", response_model=ClassroomOut)
def create_classroom(
    data: ClassroomCreate,
    user: User = Depends(require_teacher),
    db: Session = Depends(get_db)
):
    teacher = user.teacher_profile
    channel_name = f"Classora_{data.subject.replace(' ', '')}_{int(datetime.utcnow().timestamp())}"
    classroom = Classroom(
        teacher_id=teacher.id,
        name=data.name,
        subject=data.subject,
        current_topic=data.current_topic,
        description=data.description or "",
        agora_channel=channel_name,
        is_active=True
    )
    db.add(classroom)
    db.commit()
    db.refresh(classroom)
    return classroom

@app.get("/classrooms", response_model=List[ClassroomOut])
def list_classrooms(db: Session = Depends(get_db)):
    return db.query(Classroom).all()

@app.get("/classrooms/{id}", response_model=ClassroomOut)
def get_classroom(id: int, db: Session = Depends(get_db)):
    classroom = db.query(Classroom).filter(Classroom.id == id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    return classroom

@app.post("/classrooms/{id}/join", response_model=ClassroomJoinResponse)
async def join_classroom(
    id: int,
    user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    classroom = db.query(Classroom).filter(Classroom.id == id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    # Find or create active session
    session = db.query(ClassSession).filter(
        ClassSession.classroom_id == classroom.id,
        ClassSession.is_live == True
    ).order_by(ClassSession.id.desc()).first()

    if not session:
        session = ClassSession(
            classroom_id=classroom.id,
            session_title=f"Live Session: {classroom.current_topic}",
            topic=classroom.current_topic,
            is_live=True,
            ai_status=AIState.WAIT,
            ai_mode="ACTIVE",
            agora_agent_id=f"agent_classora_{classroom.agora_channel}"
        )
        db.add(session)
        db.commit()
        db.refresh(session)

    # Initialize Context Engine
    teacher_name = classroom.teacher.user.name if classroom.teacher else "Dr. Sharma"
    context_engine.get_or_create_context(
        session_id=session.id,
        classroom_name=classroom.name,
        subject=classroom.subject,
        topic=classroom.current_topic,
        teacher_name=teacher_name
    )

    # Assign UID
    uid = user.id if user else (int(datetime.utcnow().timestamp()) % 100000 + 1000)
    role = user.role if user else UserRole.STUDENT

    # Generate Secure Agora RTC Token
    token = agora_service.generate_rtc_token(
        channel_name=classroom.agora_channel,
        uid=uid,
        role=1
    )

    # If AI Agent is not started, start Agora Conversational Agent
    if not session.agora_agent_id or session.agora_agent_id.startswith("agent_classora_"):
        system_prompt = context_engine.build_system_prompt_for_agora(session.id)
        agent_res = await agora_service.start_conversational_agent(
            channel_name=classroom.agora_channel,
            topic=classroom.current_topic,
            teacher_name=teacher_name,
            system_prompt=system_prompt
        )
        session.agora_agent_id = agent_res.get("agent_id")
        db.commit()

    return ClassroomJoinResponse(
        classroom=classroom,
        session_id=session.id,
        agora_channel=classroom.agora_channel,
        agora_app_id=settings.AGORA_APP_ID,
        rtc_token=token,
        uid=uid,
        user_role=role,
        ai_status=session.ai_status
    )

# ==================== SESSION ENDPOINTS ====================

@app.post("/sessions", response_model=SessionOut)
def create_session(data: SessionCreate, db: Session = Depends(get_db)):
    session = ClassSession(
        classroom_id=data.classroom_id,
        session_title=data.session_title,
        topic=data.topic,
        is_live=True,
        ai_status=AIState.WAIT,
        ai_mode="ACTIVE"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@app.get("/sessions/{id}", response_model=SessionOut)
def get_session(id: int, db: Session = Depends(get_db)):
    session = db.query(ClassSession).filter(ClassSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.post("/sessions/{id}/end", response_model=ClassSummaryOut)
async def end_session(id: int, db: Session = Depends(get_db)):
    session = db.query(ClassSession).filter(ClassSession.id == id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session.is_live = False
    session.ended_at = datetime.utcnow()
    db.commit()

    # Stop Agora Agent
    if session.agora_agent_id:
        await agora_service.stop_conversational_agent(session.agora_agent_id)

    # Generate Post-Class Intelligence Summary
    summary = post_class_summarizer.generate_session_summary(session.id, db)

    # Broadcast Class Ended Event
    await ws_manager.broadcast_to_session(session.id, {
        "type": "CLASS_ENDED",
        "session_id": session.id,
        "summary": {
            "topics_covered": summary.topics_covered,
            "total_questions": summary.total_questions,
            "students_needing_support": summary.students_needing_support,
            "common_learning_gaps": summary.common_learning_gaps,
            "recommended_action": summary.recommended_action
        }
    })

    return summary

# ==================== STUDENTS & ANALYTICS ====================

@app.get("/students/{id}")
def get_student(id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return {
        "id": student.id,
        "name": student.user.name,
        "email": student.user.email,
        "grade": student.grade,
        "learning_level": student.learning_level.value,
        "preferred_language": student.preferred_language,
        "misconceptions": student.misconceptions,
        "overall_mastery": student.overall_mastery
    }

@app.get("/classrooms/{id}/students")
def get_classroom_students(id: int, db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return [
        {
            "id": s.id,
            "name": s.user.name,
            "grade": s.grade,
            "learning_level": s.learning_level.value,
            "preferred_language": s.preferred_language,
            "misconceptions": s.misconceptions,
            "overall_mastery": s.overall_mastery
        }
        for s in students
    ]

@app.get("/analytics/{classroom_id}")
def get_classroom_analytics(classroom_id: int, db: Session = Depends(get_db)):
    classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    gaps = db.query(LearningGap).filter(LearningGap.classroom_id == classroom_id).all()
    sessions = db.query(ClassSession).filter(ClassSession.classroom_id == classroom_id).all()
    quizzes = db.query(Quiz).filter(Quiz.classroom_id == classroom_id).all()

    return {
        "classroom_name": classroom.name,
        "total_sessions": len(sessions),
        "active_learning_gaps": [
            {
                "id": g.id,
                "gap_title": g.gap_title,
                "description": g.description,
                "affected_students": g.affected_students,
                "severity": g.severity.value,
                "recommendation": g.recommendation
            }
            for g in gaps
        ],
        "total_quizzes_conducted": len(quizzes),
        "class_average_mastery": 78.5
    }

@app.get("/summary/{session_id}", response_model=ClassSummaryOut)
def get_session_summary(session_id: int, db: Session = Depends(get_db)):
    summary = post_class_summarizer.generate_session_summary(session_id, db)
    return summary

# ==================== AI CO-TEACHER ORCHESTRATION ====================

@app.post("/ai/question", response_model=AIQuestionResponse)
async def ask_co_teacher(data: AIQuestionRequest, db: Session = Depends(get_db)):
    session = db.query(ClassSession).filter(ClassSession.id == data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 1. Turn-Taking Check: Is Teacher Speaking?
    if data.teacher_speaking:
        state_obj = turn_manager.set_teacher_speaking(session.id, True)
        await ws_manager.broadcast_to_session(session.id, {
            "type": "TURN_STATE_UPDATE",
            "state": AIState.WAIT.value,
            "status_message": "Teacher is speaking — Classora is listening respectfully."
        })
        return AIQuestionResponse(
            session_id=session.id,
            turn_state=AIState.WAIT,
            response_text=None,
            explanation_level=data.learning_level or LearningLevel.BEGINNER,
            detected_gap=None,
            teacher_alert=None,
            should_speak=False
        )

    # 2. Student speaks -> AI transitions to LISTEN
    turn_manager.handle_student_question_start(session.id, data.student_name)
    await ws_manager.broadcast_to_session(session.id, {
        "type": "TURN_STATE_UPDATE",
        "state": AIState.LISTEN.value,
        "status_message": f"Classora is listening to {data.student_name}'s question..."
    })

    # Record Student Utterance in Context & DB
    context_engine.add_utterance(
        session_id=session.id,
        speaker_role="STUDENT",
        speaker_name=data.student_name,
        text=data.question,
        language=data.preferred_language or "Hinglish"
    )

    conv = Conversation(
        session_id=session.id,
        speaker_role="STUDENT",
        speaker_name=data.student_name,
        student_id=data.student_id,
        text=data.question,
        language=data.preferred_language or "Hinglish",
        ai_turn_state=AIState.LISTEN
    )
    db.add(conv)
    db.commit()

    # Broadcast Student Karaoke Caption
    await ws_manager.broadcast_to_session(session.id, {
        "type": "TRANSCRIPT_UTTERANCE",
        "speaker_role": "STUDENT",
        "speaker_name": data.student_name,
        "text": data.question,
        "language": data.preferred_language or "Hinglish",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S")
    })

    # 3. AI transitions to THINK
    turn_manager.handle_ai_thinking(session.id)
    await ws_manager.broadcast_to_session(session.id, {
        "type": "TURN_STATE_UPDATE",
        "state": AIState.THINK.value,
        "status_message": "Classora is formulating a personalized explanation..."
    })

    # 4. Generate Context-Aware Personalized Response
    ctx = context_engine.get_or_create_context(
        session_id=session.id,
        classroom_name=session.classroom.name,
        subject=session.classroom.subject,
        topic=session.topic,
        teacher_name=session.classroom.teacher.user.name if session.classroom.teacher else "Dr. Sharma"
    )

    ai_res = await gemini_service.generate_co_teacher_response(
        question=data.question,
        student_name=data.student_name,
        learning_level=(data.learning_level.value if data.learning_level else "BEGINNER"),
        preferred_language=(data.preferred_language or "Hinglish"),
        topic=session.topic,
        lesson_context=f"Subject: {session.classroom.subject}, Topic: {session.topic}",
        recent_history=ctx.get("history", [])
    )

    spoken_text = ai_res.get("spoken_response", "")
    detected_gap = ai_res.get("detected_gap")
    teacher_alert = ai_res.get("teacher_alert")

    # 5. Record Learning Gap Clustering
    gap_alert_data = None
    if detected_gap:
        gap_alert_data = learning_gap_engine.record_student_query(
            session_id=session.id,
            classroom_id=session.classroom_id,
            student_name=data.student_name,
            question=data.question,
            detected_gap_concept=detected_gap,
            db=db
        )
        if gap_alert_data:
            # Broadcast Learning Gap Alert to Teacher Dashboard
            await ws_manager.broadcast_to_session(session.id, {
                "type": "LEARNING_GAP_ALERT",
                "gap": gap_alert_data
            })

    # 6. AI transitions to SPEAK
    turn_manager.handle_ai_speaking(session.id)
    await ws_manager.broadcast_to_session(session.id, {
        "type": "TURN_STATE_UPDATE",
        "state": AIState.SPEAK.value,
        "status_message": "Classora is speaking via Agora voice..."
    })

    # Record AI Utterance in Context & DB
    context_engine.add_utterance(
        session_id=session.id,
        speaker_role="AI",
        speaker_name="Classora AI",
        text=spoken_text,
        language=data.preferred_language or "Hinglish"
    )

    ai_conv = Conversation(
        session_id=session.id,
        speaker_role="AI",
        speaker_name="Classora AI",
        text=spoken_text,
        language=data.preferred_language or "Hinglish",
        ai_turn_state=AIState.SPEAK
    )
    db.add(ai_conv)

    if data.student_id:
        interaction = StudentInteraction(
            student_id=data.student_id,
            session_id=session.id,
            topic=session.topic,
            question_asked=data.question,
            ai_response=spoken_text,
            adapted_for_level=data.learning_level or LearningLevel.BEGINNER,
            language_used=data.preferred_language or "Hinglish",
            detected_gap=detected_gap
        )
        db.add(interaction)

    db.commit()

    # Broadcast AI Karaoke Caption & Voice Event
    await ws_manager.broadcast_to_session(session.id, {
        "type": "TRANSCRIPT_UTTERANCE",
        "speaker_role": "AI",
        "speaker_name": "Classora AI",
        "text": spoken_text,
        "language": data.preferred_language or "Hinglish",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S")
    })

    return AIQuestionResponse(
        session_id=session.id,
        turn_state=AIState.SPEAK,
        response_text=spoken_text,
        explanation_level=data.learning_level or LearningLevel.BEGINNER,
        detected_gap=detected_gap,
        teacher_alert=teacher_alert,
        should_speak=True
    )

@app.post("/ai/teacher-control")
async def handle_teacher_control(data: TeacherControlRequest, db: Session = Depends(get_db)):
    session = db.query(ClassSession).filter(ClassSession.id == data.session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    state_obj = turn_manager.handle_teacher_control_action(session.id, data.action)
    session.ai_status = state_obj["state"]
    session.ai_mode = state_obj["ai_mode"]
    db.commit()

    # Broadcast Teacher Control Event
    await ws_manager.broadcast_to_session(session.id, {
        "type": "TEACHER_CONTROL_EVENT",
        "action": data.action,
        "state": state_obj["state"].value,
        "ai_mode": state_obj["ai_mode"],
        "status_message": state_obj["status_message"]
    })

    return {
        "status": "SUCCESS",
        "action": data.action,
        "state": state_obj["state"].value,
        "message": state_obj["status_message"]
    }

@app.post("/ai/teacher-speaking")
async def handle_teacher_speaking(
    session_id: int,
    is_speaking: bool,
    teacher_text: Optional[str] = None,
    db: Session = Depends(get_db)
):
    session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    state_obj = turn_manager.set_teacher_speaking(session_id, is_speaking)
    context_engine.update_teacher_speaking_status(session_id, is_speaking)

    if teacher_text:
        context_engine.add_utterance(session_id, "TEACHER", "Dr. Sharma", teacher_text)
        conv = Conversation(
            session_id=session.id,
            speaker_role="TEACHER",
            speaker_name="Dr. Sharma",
            text=teacher_text,
            language="en"
        )
        db.add(conv)
        db.commit()

        # Broadcast Teacher Utterance
        await ws_manager.broadcast_to_session(session_id, {
            "type": "TRANSCRIPT_UTTERANCE",
            "speaker_role": "TEACHER",
            "speaker_name": "Dr. Sharma",
            "text": teacher_text,
            "language": "en",
            "timestamp": datetime.utcnow().strftime("%H:%M:%S")
        })

    await ws_manager.broadcast_to_session(session_id, {
        "type": "TURN_STATE_UPDATE",
        "state": state_obj["state"].value,
        "status_message": state_obj["status_message"]
    })

    return {"status": "SUCCESS", "state": state_obj["state"].value}

@app.post("/ai/quiz", response_model=QuizOut)
async def trigger_spoken_quiz(data: QuizGenerateRequest, db: Session = Depends(get_db)):
    quiz = await spoken_quiz_engine.generate_quiz(
        classroom_id=data.classroom_id,
        session_id=data.session_id,
        topic=data.topic,
        difficulty=data.difficulty or "MEDIUM",
        db=db
    )

    # Broadcast Spoken Quiz Question to all students via Agora Voice
    await ws_manager.broadcast_to_session(data.session_id, {
        "type": "SPOKEN_QUIZ_START",
        "quiz_id": quiz.id,
        "topic": quiz.topic,
        "question_text": quiz.question_text
    })

    return quiz

@app.post("/ai/quiz/submit", response_model=QuizResultOut)
async def submit_quiz_answer(data: QuizAnswerSubmit, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    student_name = student.user.name if student else "Student"

    result = await spoken_quiz_engine.evaluate_answer(
        quiz_id=data.quiz_id,
        student_id=data.student_id,
        student_name=student_name,
        spoken_answer=data.spoken_answer,
        db=db
    )

    # Broadcast Quiz Result to Classroom
    await ws_manager.broadcast_to_session(result.quiz.session_id, {
        "type": "SPOKEN_QUIZ_EVALUATION",
        "quiz_id": result.quiz_id,
        "student_name": student_name,
        "spoken_answer": result.spoken_answer,
        "evaluation": result.evaluation.value,
        "ai_feedback": result.ai_feedback
    })

    return result

# ==================== WEBSOCKET ENDPOINT ====================

@app.websocket("/ws/classroom/{session_id}")
async def classroom_websocket(websocket: WebSocket, session_id: int):
    await ws_manager.connect(session_id, websocket)
    try:
        # Send initial turn state
        state_obj = turn_manager.get_state(session_id)
        await websocket.send_json({
            "type": "INIT_STATE",
            "session_id": session_id,
            "turn_state": state_obj["state"].value,
            "ai_mode": state_obj["ai_mode"],
            "status_message": state_obj["status_message"]
        })

        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            if msg_type == "PING":
                await websocket.send_json({"type": "PONG"})
            elif msg_type == "SPEECH_ACTIVITY":
                # Real-time audio activity detected on client side
                speaker = data.get("speaker", "UNKNOWN")
                role = data.get("role", "STUDENT")
                await ws_manager.broadcast_to_session(session_id, {
                    "type": "SPEAKER_ACTIVE",
                    "speaker": speaker,
                    "role": role,
                    "volume": data.get("volume", 50)
                })
    except WebSocketDisconnect:
        ws_manager.disconnect(session_id, websocket)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        ws_manager.disconnect(session_id, websocket)
