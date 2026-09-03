import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.database import init_db, SessionLocal
from app.models import User, Teacher, Student, Classroom, ClassSession, LearningGap, Quiz
from app.seed_data import seed_database
from app.services.agora_service import agora_service
from app.services.turn_manager import turn_manager
from app.services.context_engine import context_engine
from app.services.learning_gap import learning_gap_engine
from app.services.quiz_generator import spoken_quiz_engine
from app.services.summarizer import post_class_summarizer
from app.services.gemini_service import gemini_service
import asyncio

async def test_full_pipeline():
    print("=== 1. Initializing Database & Seeding ===")
    init_db()
    db = SessionLocal()
    seed_database(db)

    # Check Teacher & Students
    teacher = db.query(Teacher).first()
    students = db.query(Student).all()
    print(f"Teacher loaded: {teacher.user.name} ({teacher.user.email})")
    print(f"Students loaded: {len(students)} students {[s.user.name for s in students]}")
    assert teacher is not None
    assert len(students) >= 3

    print("\n=== 2. Testing Agora RTC Token Generation ===")
    classroom = db.query(Classroom).first()
    token = agora_service.generate_rtc_token(classroom.agora_channel, uid=12345)
    print(f"Generated Agora RTC Token for channel '{classroom.agora_channel}' (UID 12345): {token[:30]}...")
    assert token.startswith("006") or "classora" in token.lower()

    print("\n=== 3. Testing Context Engine & Agora System Prompt ===")
    session = db.query(ClassSession).first()
    ctx = context_engine.get_or_create_context(
        session_id=session.id,
        classroom_name=classroom.name,
        subject=classroom.subject,
        topic=classroom.current_topic,
        teacher_name=teacher.user.name
    )
    prompt = context_engine.build_system_prompt_for_agora(session.id)
    print(f"Synthesized Agora System Prompt:\n{prompt}")
    assert "CLASSORA AI" in prompt
    assert "Turn-Taking Priority" in prompt

    print("\n=== 4. Testing Turn-Taking State Machine ===")
    # Teacher speaks -> AI = WAIT
    s1 = turn_manager.set_teacher_speaking(session.id, True)
    print(f"Teacher speaking state: {s1['state']} ({s1['status_message']})")
    assert s1['state'].value == "WAIT"

    # Teacher pauses -> AI = WAIT ready
    s2 = turn_manager.set_teacher_speaking(session.id, False)
    print(f"Teacher paused state: {s2['state']} ({s2['status_message']})")

    # Student asks -> AI = LISTEN
    s3 = turn_manager.handle_student_question_start(session.id, "Rahul Verma")
    print(f"Student question start state: {s3['state']} ({s3['status_message']})")
    assert s3['state'].value == "LISTEN"

    # AI thinking -> THINK
    s4 = turn_manager.handle_ai_thinking(session.id)
    print(f"AI formulation state: {s4['state']}")
    assert s4['state'].value == "THINK"

    # AI speaking -> SPEAK
    s5 = turn_manager.handle_ai_speaking(session.id)
    print(f"AI speaking state: {s5['state']}")
    assert s5['state'].value == "SPEAK"

    # Teacher Override -> TEACHER_OVERRIDE
    s6 = turn_manager.handle_teacher_override(session.id)
    print(f"Teacher override state: {s6['state']}")
    assert s6['state'].value == "TEACHER_OVERRIDE"

    print("\n=== 5. Testing Gemini Hinglish Co-Teacher Reasoning ===")
    ai_res = await gemini_service.generate_co_teacher_response(
        question="Sir mujhe samajh nahi aa raha ki middle term split kaise karte hain?",
        student_name="Rahul Verma",
        learning_level="BEGINNER",
        preferred_language="Hinglish",
        topic=session.topic,
        lesson_context="Quadratic Equations",
        recent_history=[]
    )
    print(f"AI Hinglish Spoken Response:\n{ai_res['spoken_response']}")
    print(f"Detected Gap: {ai_res['detected_gap']}")
    assert "Rahul" in ai_res['spoken_response'] or "Middle term" in ai_res['spoken_response'] or "factor" in ai_res['spoken_response'].lower()

    print("\n=== 6. Testing Real-Time Learning Gap Clustering ===")
    gap_alert = learning_gap_engine.record_student_query(
        session_id=session.id,
        classroom_id=classroom.id,
        student_name="Rahul Verma",
        question="I don't understand factorization",
        detected_gap_concept="Factorization & Middle Term Splitting",
        db=db
    )
    print(f"Recorded Gap Alert: {gap_alert}")
    assert gap_alert is not None

    print("\n=== 7. Testing Spoken Quiz Generation & Oral Evaluation ===")
    quiz = await spoken_quiz_engine.generate_quiz(
        classroom_id=classroom.id,
        session_id=session.id,
        topic=session.topic,
        difficulty="MEDIUM",
        db=db
    )
    print(f"Generated Spoken Quiz: {quiz.question_text}")
    eval_res = await spoken_quiz_engine.evaluate_answer(
        quiz_id=quiz.id,
        student_id=students[0].id,
        student_name=students[0].user.name,
        spoken_answer="Sir, discriminant is 1 because 25 minus 24 equals 1",
        db=db
    )
    print(f"Evaluation: {eval_res.evaluation.value} | Feedback: {eval_res.ai_feedback}")
    assert eval_res.evaluation.value == "CORRECT"

    print("\n=== 8. Testing Post-Class Intelligence Summary ===")
    summary = post_class_summarizer.generate_session_summary(session.id, db)
    print(f"Post-Class Topics: {summary.topics_covered}")
    print(f"Recommended Teacher Action: {summary.recommended_action}")
    print(f"Student Insights: {summary.student_insights}")
    assert len(summary.topics_covered) > 0

    db.close()
    print("\n==========================================")
    print(" ALL 8 BACKEND CAPABILITY TESTS PASSED! ")
    print("==========================================")

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())
