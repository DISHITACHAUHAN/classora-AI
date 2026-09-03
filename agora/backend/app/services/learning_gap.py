from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import LearningGap, GapSeverity

class LearningGapEngine:
    """
    Learning Gap Detection & Semantic Clustering Engine
    Identifies common hurdles across multiple students in real time
    """

    def __init__(self):
        # In-memory tracking of active confusion queries per session
        self._session_queries: Dict[int, List[Dict[str, Any]]] = {}

    def record_student_query(
        self,
        session_id: int,
        classroom_id: int,
        student_name: str,
        question: str,
        detected_gap_concept: Optional[str],
        db: Session
    ) -> Optional[Dict[str, Any]]:
        if session_id not in self._session_queries:
            self._session_queries[session_id] = []

        self._session_queries[session_id].append({
            "student": student_name,
            "question": question,
            "gap": detected_gap_concept,
            "time": datetime.utcnow()
        })

        # Cluster questions by semantic concept
        gap_cluster: Dict[str, List[str]] = {}
        for item in self._session_queries[session_id]:
            gap_name = item["gap"]
            if gap_name:
                if gap_name not in gap_cluster:
                    gap_cluster[gap_name] = []
                if item["student"] not in gap_cluster[gap_name]:
                    gap_cluster[gap_name].append(item["student"])

        # Check if any concept has >= 2 affected students or is marked critical
        new_gap_alert = None
        for concept, students in gap_cluster.items():
            if len(students) >= 2 or detected_gap_concept == concept:
                # Determine severity
                severity = GapSeverity.MEDIUM
                if len(students) >= 3:
                    severity = GapSeverity.HIGH
                elif len(students) >= 4:
                    severity = GapSeverity.CRITICAL

                # Check if already logged in DB for this session
                existing = db.query(LearningGap).filter(
                    LearningGap.classroom_id == classroom_id,
                    LearningGap.gap_title == concept,
                    LearningGap.is_resolved == False
                ).first()

                recommendation = self._generate_recommendation(concept, students)

                if not existing:
                    new_gap = LearningGap(
                        classroom_id=classroom_id,
                        session_id=session_id,
                        topic="Quadratic Equations",
                        gap_title=concept,
                        description=f"{len(students)} students ({', '.join(students)}) are experiencing difficulty with {concept}.",
                        affected_students=students,
                        severity=severity,
                        recommendation=recommendation,
                        is_resolved=False
                    )
                    db.add(new_gap)
                    db.commit()
                    db.refresh(new_gap)

                    new_gap_alert = {
                        "id": new_gap.id,
                        "gap_title": concept,
                        "affected_students": students,
                        "severity": severity.value,
                        "recommendation": recommendation,
                        "student_count": len(students)
                    }
                else:
                    # Update affected students list
                    existing.affected_students = list(set(existing.affected_students + students))
                    existing.severity = severity
                    existing.description = f"{len(existing.affected_students)} students ({', '.join(existing.affected_students)}) are experiencing difficulty with {concept}."
                    db.commit()
                    db.refresh(existing)

                    new_gap_alert = {
                        "id": existing.id,
                        "gap_title": concept,
                        "affected_students": existing.affected_students,
                        "severity": existing.severity.value,
                        "recommendation": existing.recommendation,
                        "student_count": len(existing.affected_students)
                    }

        return new_gap_alert

    def _generate_recommendation(self, concept: str, students: List[str]) -> str:
        if "Factorization" in concept or "Middle Term" in concept:
            return "Pause the lecture and demonstrate finding factor pairs with a simple positive equation like x² + 5x + 6 = 0 before introducing negative coefficients."
        elif "Negative" in concept or "Discriminant" in concept:
            return "Clarify the distinction between a negative root (e.g., x = -3) versus a negative discriminant (b² - 4ac < 0) on the number line."
        else:
            return f"Review foundational rules of {concept} with a step-by-step interactive example."

learning_gap_engine = LearningGapEngine()
