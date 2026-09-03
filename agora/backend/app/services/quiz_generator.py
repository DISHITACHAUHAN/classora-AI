from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import Quiz, QuizResult, QuizEvaluation
from app.services.gemini_service import gemini_service

class SpokenQuizEngine:
    """
    Spoken Quiz Generator & Real-Time Oral Evaluation
    """

    SAMPLE_TOPIC_QUIZZES = {
        "Quadratic Equations": [
            {
                "question": "What is the discriminant of the quadratic equation x² + 5x + 6 = 0?",
                "expected": "The discriminant is 1 because b² - 4ac = 5² - 4(1)(6) = 25 - 24 = 1."
            },
            {
                "question": "If the discriminant b² - 4ac is strictly less than zero, how many real roots exist?",
                "expected": "Zero real roots (or no real roots, since the roots are complex conjugate pairs)."
            },
            {
                "question": "In the equation 2x² - 4x + 2 = 0, what is the value of the discriminant?",
                "expected": "Zero, because (-4)² - 4(2)(2) = 16 - 16 = 0, indicating two equal real roots."
            }
        ]
    }

    async def generate_quiz(
        self,
        classroom_id: int,
        session_id: int,
        topic: str,
        difficulty: str,
        db: Session
    ) -> Quiz:
        # Check predefined pool or generate
        topic_pool = self.SAMPLE_TOPIC_QUIZZES.get(topic, self.SAMPLE_TOPIC_QUIZZES["Quadratic Equations"])
        
        # Select appropriate question
        selected = topic_pool[0]
        
        quiz = Quiz(
            classroom_id=classroom_id,
            session_id=session_id,
            topic=topic,
            question_text=selected["question"],
            expected_answer=selected["expected"]
        )
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        return quiz

    async def evaluate_answer(
        self,
        quiz_id: int,
        student_id: int,
        student_name: str,
        spoken_answer: str,
        db: Session
    ) -> QuizResult:
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")

        eval_res = await gemini_service.evaluate_spoken_quiz_answer(
            question_text=quiz.question_text,
            expected_answer=quiz.expected_answer,
            student_spoken_answer=spoken_answer,
            student_name=student_name
        )

        eval_enum = QuizEvaluation.NEEDS_REVIEW
        if eval_res["evaluation"] == "CORRECT":
            eval_enum = QuizEvaluation.CORRECT
        elif eval_res["evaluation"] == "INCORRECT":
            eval_enum = QuizEvaluation.INCORRECT

        result = QuizResult(
            quiz_id=quiz.id,
            student_id=student_id,
            spoken_answer=spoken_answer,
            evaluation=eval_enum,
            ai_feedback=eval_res["ai_feedback"]
        )
        db.add(result)
        db.commit()
        db.refresh(result)
        return result

spoken_quiz_engine = SpokenQuizEngine()
