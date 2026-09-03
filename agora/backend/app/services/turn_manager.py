import asyncio
from typing import Dict, Any, Optional
from datetime import datetime
from app.models import AIState

class TurnTakingManager:
    """
    Intelligent Turn-Taking Engine for Classora AI
    Enforces non-intrusive co-teaching etiquette:
    - Teacher priority over AI
    - Pause detection
    - Adaptive state transitions: WAIT -> LISTEN -> THINK -> SPEAK -> ALERT_TEACHER -> TEACHER_OVERRIDE
    """

    def __init__(self):
        # Current state per session_id
        self._session_states: Dict[int, Dict[str, Any]] = {}

    def get_state(self, session_id: int) -> Dict[str, Any]:
        if session_id not in self._session_states:
            self._session_states[session_id] = {
                "state": AIState.WAIT,
                "ai_mode": "ACTIVE", # ACTIVE, MUTED, PAUSED, OVERRIDDEN
                "current_speaker": "TEACHER",
                "status_message": "Classora is waiting for teacher instruction...",
                "last_state_change": datetime.utcnow().isoformat(),
                "confusion_count": 0
            }
        return self._session_states[session_id]

    def set_teacher_speaking(self, session_id: int, is_speaking: bool) -> Dict[str, Any]:
        state_obj = self.get_state(session_id)
        if state_obj["ai_mode"] == "MUTED" or state_obj["ai_mode"] == "PAUSED":
            return state_obj

        if is_speaking:
            state_obj["current_speaker"] = "TEACHER"
            state_obj["state"] = AIState.WAIT
            state_obj["status_message"] = "Teacher is speaking — Classora is listening respectfully."
        else:
            state_obj["current_speaker"] = "NONE"
            if state_obj["state"] == AIState.WAIT:
                state_obj["status_message"] = "Teacher paused — Classora is standing by to assist."
        state_obj["last_state_change"] = datetime.utcnow().isoformat()
        return state_obj

    def handle_student_question_start(self, session_id: int, student_name: str) -> Dict[str, Any]:
        state_obj = self.get_state(session_id)
        if state_obj["ai_mode"] in ["MUTED", "PAUSED", "OVERRIDDEN"]:
            return state_obj

        state_obj["current_speaker"] = f"STUDENT:{student_name}"
        state_obj["state"] = AIState.LISTEN
        state_obj["status_message"] = f"Classora is listening to {student_name}'s question..."
        state_obj["last_state_change"] = datetime.utcnow().isoformat()
        return state_obj

    def handle_ai_thinking(self, session_id: int) -> Dict[str, Any]:
        state_obj = self.get_state(session_id)
        state_obj["state"] = AIState.THINK
        state_obj["status_message"] = "Classora is formulating a personalized explanation..."
        state_obj["last_state_change"] = datetime.utcnow().isoformat()
        return state_obj

    def handle_ai_speaking(self, session_id: int) -> Dict[str, Any]:
        state_obj = self.get_state(session_id)
        state_obj["state"] = AIState.SPEAK
        state_obj["current_speaker"] = "AI_CO_TEACHER"
        state_obj["status_message"] = "Classora is speaking to the classroom via Agora RTC."
        state_obj["last_state_change"] = datetime.utcnow().isoformat()
        return state_obj

    def handle_teacher_alert(self, session_id: int, reason: str) -> Dict[str, Any]:
        state_obj = self.get_state(session_id)
        state_obj["state"] = AIState.ALERT_TEACHER
        state_obj["status_message"] = f"Learning Gap Alert: {reason}"
        state_obj["last_state_change"] = datetime.utcnow().isoformat()
        return state_obj

    def handle_teacher_override(self, session_id: int) -> Dict[str, Any]:
        state_obj = self.get_state(session_id)
        state_obj["state"] = AIState.TEACHER_OVERRIDE
        state_obj["ai_mode"] = "OVERRIDDEN"
        state_obj["current_speaker"] = "TEACHER"
        state_obj["status_message"] = "Teacher Override active: Teacher instruction has full priority."
        state_obj["last_state_change"] = datetime.utcnow().isoformat()
        return state_obj

    def handle_teacher_control_action(self, session_id: int, action: str) -> Dict[str, Any]:
        state_obj = self.get_state(session_id)
        if action == "MUTE":
            state_obj["ai_mode"] = "MUTED"
            state_obj["state"] = AIState.WAIT
            state_obj["status_message"] = "Classora AI is MUTED by the teacher."
        elif action == "PAUSE":
            state_obj["ai_mode"] = "PAUSED"
            state_obj["state"] = AIState.WAIT
            state_obj["status_message"] = "Classora AI is PAUSED."
        elif action == "ALLOW":
            state_obj["ai_mode"] = "ACTIVE"
            state_obj["state"] = AIState.WAIT
            state_obj["status_message"] = "Classora AI is ACTIVE and ready to assist."
        elif action == "OVERRIDE":
            return self.handle_teacher_override(session_id)
        elif action == "END_AI":
            state_obj["ai_mode"] = "DISCONNECTED"
            state_obj["state"] = AIState.WAIT
            state_obj["status_message"] = "Classora AI session concluded."

        state_obj["last_state_change"] = datetime.utcnow().isoformat()
        return state_obj

turn_manager = TurnTakingManager()
