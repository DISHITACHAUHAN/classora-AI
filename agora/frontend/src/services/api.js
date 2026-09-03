const API_BASE = '/api/v1';

// Helper to get token
const getAuthHeaders = () => {
  const token = localStorage.getItem('classora_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  // Classrooms
  async getClassrooms() {
    const res = await fetch(`${API_BASE}/classrooms`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch classrooms');
    return res.json();
  },

  async getClassroom(id) {
    const res = await fetch(`${API_BASE}/classrooms/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch classroom');
    return res.json();
  },

  async createClassroom(data) {
    const res = await fetch(`${API_BASE}/classrooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create classroom');
    return res.json();
  },

  async joinClassroom(id) {
    const res = await fetch(`${API_BASE}/classrooms/${id}/join`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to join classroom');
    return res.json();
  },

  // Students
  async getClassroomStudents(id) {
    const res = await fetch(`${API_BASE}/classrooms/${id}/students`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Sessions
  async endSession(id) {
    const res = await fetch(`${API_BASE}/sessions/${id}/end`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to end session');
    return res.json();
  },

  async getSummary(sessionId) {
    const res = await fetch(`${API_BASE}/summary/${sessionId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch summary');
    return res.json();
  },

  async getAnalytics(classroomId) {
    const res = await fetch(`${API_BASE}/analytics/${classroomId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // AI Co-Teacher Orchestration
  async askAI(data) {
    const res = await fetch(`${API_BASE}/ai/question`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to ask AI co-teacher');
    return res.json();
  },

  async sendTeacherControl(sessionId, action, reason = '') {
    const res = await fetch(`${API_BASE}/ai/teacher-control`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ session_id: sessionId, action, reason })
    });
    if (!res.ok) throw new Error('Failed to send teacher control');
    return res.json();
  },

  async setTeacherSpeaking(sessionId, isSpeaking, teacherText = null) {
    const res = await fetch(`${API_BASE}/ai/teacher-speaking?session_id=${sessionId}&is_speaking=${isSpeaking}${teacherText ? `&teacher_text=${encodeURIComponent(teacherText)}` : ''}`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to update teacher speaking');
    return res.json();
  },

  async triggerQuiz(classroomId, sessionId, topic) {
    const res = await fetch(`${API_BASE}/ai/quiz`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        classroom_id: classroomId,
        session_id: sessionId,
        topic,
        difficulty: 'MEDIUM'
      })
    });
    if (!res.ok) throw new Error('Failed to trigger quiz');
    return res.json();
  },

  async submitQuizAnswer(quizId, studentId, spokenAnswer) {
    const res = await fetch(`${API_BASE}/ai/quiz/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        quiz_id: quizId,
        student_id: studentId,
        spoken_answer: spokenAnswer
      })
    });
    if (!res.ok) throw new Error('Failed to submit quiz answer');
    return res.json();
  }
};
