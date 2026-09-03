import logging
from sqlalchemy.orm import Session
from app.models import (
    User, UserRole, Teacher, Student, Classroom, ClassSession,
    Conversation, LearningGap, GapSeverity, Quiz, QuizResult, QuizEvaluation, LearningLevel
)
from app.auth import get_password_hash

logger = logging.getLogger("seed_data")

def seed_database(db: Session):
    # Check if already seeded
    existing_user = db.query(User).filter(User.email == "teacher@classora.ai").first()
    if existing_user:
        return

    logger.info("Seeding initial demo data for Classora AI...")

    # 1. Create Teacher
    teacher_user = User(
        email="teacher@classora.ai",
        name="Dr. Sharma",
        hashed_password=get_password_hash("teacher123"),
        role=UserRole.TEACHER
    )
    db.add(teacher_user)
    db.flush()

    teacher = Teacher(
        user_id=teacher_user.id,
        title="Dr.",
        department="Mathematics & Computer Science",
        bio="Lead Mathematics Educator with 15+ years experience experimenting with AI co-teaching."
    )
    db.add(teacher)
    db.flush()

    # 2. Create Students (Rahul, Priya, Aman)
    students_data = [
        {
            "email": "rahul@classora.ai",
            "name": "Rahul Verma",
            "level": LearningLevel.BEGINNER,
            "lang": "Hinglish",
            "misconceptions": ["Factorization", "Negative square roots"],
            "mastery": 62.0
        },
        {
            "email": "priya@classora.ai",
            "name": "Priya Patel",
            "level": LearningLevel.ADVANCED,
            "lang": "English",
            "misconceptions": ["Discriminant edge cases"],
            "mastery": 88.0
        },
        {
            "email": "aman@classora.ai",
            "name": "Aman Gupta",
            "level": LearningLevel.INTERMEDIATE,
            "lang": "Hinglish",
            "misconceptions": ["Factoring negative coefficients"],
            "mastery": 74.0
        }
    ]

    student_objs = []
    for s_info in students_data:
        s_user = User(
            email=s_info["email"],
            name=s_info["name"],
            hashed_password=get_password_hash("student123"),
            role=UserRole.STUDENT
        )
        db.add(s_user)
        db.flush()

        student = Student(
            user_id=s_user.id,
            grade="Grade 10",
            learning_level=s_info["level"],
            preferred_language=s_info["lang"],
            misconceptions=s_info["misconceptions"],
            overall_mastery=s_info["mastery"]
        )
        db.add(student)
        db.flush()
        student_objs.append(student)

    # 3. Create Demo Classroom
    classroom = Classroom(
        teacher_id=teacher.id,
        name="Grade 10 - Advanced Mathematics",
        subject="Mathematics",
        current_topic="Quadratic Equations",
        description="Live interactive classroom covering standard forms, factorization, and discriminants with Classora AI co-teaching.",
        agora_channel="Classora_Math_Grade10",
        is_active=True
    )
    db.add(classroom)
    db.flush()

    # 4. Create Active Session
    session = ClassSession(
        classroom_id=classroom.id,
        session_title="Mastering Quadratic Equations & Factorization",
        topic="Quadratic Equations",
        is_live=True,
        ai_status="WAIT",
        ai_mode="ACTIVE",
        agora_agent_id=f"agent_classora_{classroom.agora_channel}"
    )
    db.add(session)
    db.flush()

    # 5. Seed Initial Conversations
    conversations = [
        Conversation(
            session_id=session.id,
            speaker_role="TEACHER",
            speaker_name="Dr. Sharma",
            text="Welcome students! Today we are exploring Quadratic Equations of the form ax² + bx + c = 0. Notice how the middle term 'bx' is crucial for factorization.",
            language="en"
        ),
        Conversation(
            session_id=session.id,
            speaker_role="STUDENT",
            speaker_name="Rahul Verma",
            student_id=student_objs[0].id,
            text="Sir mujhe samajh nahi aa raha ki middle term ko split kaise karte hain?",
            language="Hinglish"
        ),
        Conversation(
            session_id=session.id,
            speaker_role="AI",
            speaker_name="Classora AI",
            text="Koi baat nahi Rahul! Middle term split karne ke liye, do aise numbers dhoondiye jinka sum 'b' ho aur multiply karke 'a * c' mile. Jaise x² + 5x + 6 = 0 mein 2 aur 3!",
            language="Hinglish"
        )
    ]
    for c in conversations:
        db.add(c)

    # 6. Seed Learning Gap
    gap = LearningGap(
        classroom_id=classroom.id,
        session_id=session.id,
        topic="Quadratic Equations",
        gap_title="Factorization & Middle Term Splitting",
        description="Multiple students experienced confusion when identifying factor pairs for the middle term.",
        affected_students=["Rahul Verma", "Aman Gupta"],
        severity=GapSeverity.HIGH,
        recommendation="Pause and demonstrate 2 simple examples with factor pair visual trees before moving to negative terms.",
        is_resolved=False
    )
    db.add(gap)

    # 7. Seed Initial Spoken Quiz
    quiz = Quiz(
        classroom_id=classroom.id,
        session_id=session.id,
        topic="Quadratic Equations",
        question_text="What is the discriminant of x² + 5x + 6 = 0?",
        expected_answer="The discriminant is 1 (b² - 4ac = 25 - 24 = 1)."
    )
    db.add(quiz)
    db.flush()

    result = QuizResult(
        quiz_id=quiz.id,
        student_id=student_objs[0].id,
        spoken_answer="Sir, 5 square is 25 and 4 times 6 is 24, so discriminant is 1.",
        evaluation=QuizEvaluation.CORRECT,
        ai_feedback="Spot on, Rahul! You accurately calculated the discriminant as 1, which means two distinct real roots."
    )
    db.add(result)

    db.commit()
    logger.info("Demo database seeded successfully.")
