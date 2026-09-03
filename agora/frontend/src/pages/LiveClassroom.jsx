import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAgora } from '../context/AgoraContext';
import { api } from '../services/api';
import { ClassroomWebSocket } from '../services/websocket';
import { VoiceOrb } from '../components/VoiceOrb';
import { LiveCaptions } from '../components/LiveCaptions';
import { TeacherControls } from '../components/TeacherControls';
import { StudentGrid } from '../components/StudentGrid';
import { LearningGapPanel } from '../components/LearningGapPanel';
import { SpokenQuizModal } from '../components/SpokenQuizModal';
import { ClassroomContextCard } from '../components/ClassroomContextCard';
import { 
  Radio, Mic, MicOff, Volume2, Sparkles, GraduationCap, 
  BookOpen, HelpCircle, MessageSquare, Play, Pause, Award
} from 'lucide-react';

export const LiveClassroom = ({ setActiveTab, setPostClassSessionId }) => {
  const { user } = useAuth();
  const { 
    isJoined, isMuted, toggleMute, joinChannel, 
    leaveChannel, connectionState, channelInfo, activeSpeaker 
  } = useAgora();

  // Classroom & Session state
  const [classroom, setClassroom] = useState(null);
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [transcript, setTranscript] = useState([]);
  const [turnState, setTurnState] = useState('WAIT');
  const [aiMode, setAiMode] = useState('ACTIVE');
  const [statusMessage, setStatusMessage] = useState('Classora is listening respectfully to the teacher...');
  
  // Teacher Speaking Simulation for Turn Taking Demo
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);

  // Student Custom Spoken Query Input
  const [customQuestion, setCustomQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Spoken Quiz Modal State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isEndingClass, setIsEndingClass] = useState(false);

  const wsRef = useRef(null);

  // 1. Initialize Classroom & Join Agora Channel
  useEffect(() => {
    let isMounted = true;

    const initClassroom = async () => {
      try {
        const classrooms = await api.getClassrooms();
        if (classrooms.length === 0) return;
        
        const targetClass = classrooms[0];
        if (!isMounted) return;
        setClassroom(targetClass);

        // Fetch students
        const studentList = await api.getClassroomStudents(targetClass.id);
        if (isMounted) setStudents(studentList);

        // Fetch analytics/gaps
        const analytics = await api.getAnalytics(targetClass.id);
        if (isMounted && analytics.active_learning_gaps) {
          setGaps(analytics.active_learning_gaps);
        }

        // Join Classroom & retrieve Agora RTC credentials
        const joinData = await api.joinClassroom(targetClass.id);
        if (!isMounted) return;

        setSession({
          id: joinData.session_id,
          topic: targetClass.current_topic,
          is_live: true
        });

        setTurnState(joinData.ai_status || 'WAIT');

        // Join Agora RTC Voice Mesh
        await joinChannel({
          appId: joinData.agora_app_id,
          channel: joinData.agora_channel,
          token: joinData.rtc_token,
          uid: joinData.uid
        });

        // Connect Real-Time WebSocket for Live Co-Teacher Events
        wsRef.current = new ClassroomWebSocket(joinData.session_id, (msg) => {
          handleWebSocketMessage(msg);
        });

      } catch (err) {
        console.error('Error initializing live classroom:', err);
      }
    };

    initClassroom();

    return () => {
      isMounted = false;
      if (wsRef.current) wsRef.current.disconnect();
    };
  }, []);

  // 2. Handle Real-Time WebSocket Events
  const handleWebSocketMessage = (data) => {
    if (data.type === 'TURN_STATE_UPDATE') {
      setTurnState(data.state);
      if (data.status_message) setStatusMessage(data.status_message);
    } else if (data.type === 'TRANSCRIPT_UTTERANCE') {
      setTranscript((prev) => [...prev, {
        speaker_role: data.speaker_role,
        speaker_name: data.speaker_name,
        text: data.text,
        language: data.language,
        timestamp: data.timestamp
      }]);
    } else if (data.type === 'LEARNING_GAP_ALERT') {
      setGaps((prev) => {
        const exists = prev.find((g) => g.gap_title === data.gap.gap_title);
        if (exists) {
          return prev.map((g) => g.gap_title === data.gap.gap_title ? data.gap : g);
        }
        return [data.gap, ...prev];
      });
      // Trigger voice speech on AI co-teacher
      setTurnState('ALERT_TEACHER');
      setStatusMessage(`Learning Gap Alert: ${data.gap.gap_title}`);
    } else if (data.type === 'TEACHER_CONTROL_EVENT') {
      setAiMode(data.ai_mode);
      setTurnState(data.state);
      setStatusMessage(data.status_message);
    } else if (data.type === 'SPOKEN_QUIZ_START') {
      setActiveQuiz({
        id: data.quiz_id,
        topic: data.topic,
        question_text: data.question_text
      });
      setIsQuizModalOpen(true);
      setTurnState('SPEAK');
      setStatusMessage('Classora AI is conducting the spoken quiz orally.');
    } else if (data.type === 'CLASS_ENDED') {
      setPostClassSessionId(data.session_id);
      setActiveTab('summary');
    }
  };

  // 3. Teacher Turn-Taking Simulation (Teacher speaks -> AI = WAIT; Teacher pauses -> AI = THINK/SPEAK)
  const handleToggleTeacherSpeaking = async () => {
    if (!session) return;
    const newState = !isTeacherSpeaking;
    setIsTeacherSpeaking(newState);

    const teacherUtterance = newState 
      ? "Pay close attention: when factoring ax² + bx + c = 0, we split the middle term 'b' into two numbers whose product is a * c."
      : null;

    await api.setTeacherSpeaking(session.id, newState, teacherUtterance);
  };

  // 4. Trigger Student Spoken Question (English / Hinglish)
  const handleStudentAsk = async (questionText, studentObj = null) => {
    if (!session || !questionText) return;
    setIsAsking(true);

    const studentName = studentObj?.name || user?.name || 'Rahul Verma';
    const learningLevel = studentObj?.learning_level || user?.learning_level || 'BEGINNER';
    const preferredLang = studentObj?.preferred_language || user?.preferred_language || 'Hinglish';
    const studentId = studentObj?.id || user?.student_id || 1;

    try {
      await api.askAI({
        session_id: session.id,
        student_id: studentId,
        student_name: studentName,
        question: questionText,
        learning_level: learningLevel,
        preferred_language: preferredLang,
        teacher_speaking: isTeacherSpeaking
      });
      setCustomQuestion('');
    } catch (e) {
      console.error('Ask AI error', e);
    } finally {
      setIsAsking(false);
    }
  };

  // 5. Teacher Controls
  const handleTeacherControl = async (action) => {
    if (!session) return;
    await api.sendTeacherControl(session.id, action);
  };

  // 6. Trigger Spoken Quiz
  const handleTriggerQuiz = async () => {
    if (!classroom || !session) return;
    const quiz = await api.triggerQuiz(classroom.id, session.id, session.topic || 'Quadratic Equations');
    setActiveQuiz(quiz);
    setIsQuizModalOpen(true);
  };

  // 7. Submit Spoken Quiz Answer
  const handleSubmitQuizAnswer = async (quizId, spokenAns) => {
    setIsSubmittingQuiz(true);
    const studentId = user?.student_id || 1;
    try {
      const res = await api.submitQuizAnswer(quizId, studentId, spokenAns);
      return res;
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // 8. End Class
  const handleEndClass = async () => {
    if (!session) return;
    setIsEndingClass(true);
    try {
      const summary = await api.endSession(session.id);
      setPostClassSessionId(session.id);
      setActiveTab('summary');
    } catch (e) {
      console.error('End session error', e);
    } finally {
      setIsEndingClass(false);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 lg:px-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-slate-100">
                {classroom?.name || 'Grade 10 - Advanced Mathematics'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE AGORA VOICE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Topic: <span className="text-cyan-300 font-semibold">{session?.topic || 'Quadratic Equations'}</span> • Lead: Dr. Sharma
            </p>
          </div>
        </div>

        {/* Agora Voice Controls & Live Indicators */}
        <div className="flex items-center space-x-2.5">
          {/* Microphone Toggle */}
          <button
            onClick={toggleMute}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isMuted
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
            }`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 animate-pulse" />}
            <span>{isMuted ? 'Mic Muted' : 'Mic Active'}</span>
          </button>

          {/* Teacher Speaking Simulation Button (Crucial for Turn-Taking Hackathon Demo) */}
          <button
            onClick={handleToggleTeacherSpeaking}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              isTeacherSpeaking
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isTeacherSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-cyan-400" />}
            <span>{isTeacherSpeaking ? 'Teacher Lecturing (AI Waits)' : 'Simulate Teacher Pause'}</span>
          </button>
        </div>
      </div>

      {/* Main Classroom Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Voice Orb & Context Engine */}
        <div className="lg:col-span-4 space-y-6">
          {/* Futuristic Animated Voice Orb */}
          <VoiceOrb
            state={turnState}
            aiMode={aiMode}
            statusMessage={statusMessage}
            volume={activeSpeaker ? 75 : 0}
          />

          {/* Classroom Context Card */}
          <ClassroomContextCard
            classroom={classroom}
            session={session}
            isTeacherSpeaking={isTeacherSpeaking}
          />
        </div>

        {/* Center Column: Live Karaoke Transcript & Spoken Query Console */}
        <div className="lg:col-span-8 space-y-6 flex flex-col">
          
          {/* Live Captions Transcript */}
          <div className="flex-1 min-h-[380px]">
            <LiveCaptions
              transcript={transcript}
              activeTurnState={turnState}
            />
          </div>

          {/* Interactive Spoken Query Bar */}
          <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Speak / Ask Classora AI (Hinglish & English Supported)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">
                Turn-Taking Grounded
              </span>
            </div>

            {/* Spoken Query Input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStudentAsk(customQuestion)}
                placeholder="Ask query (e.g. 'Sir mujhe samajh nahi aa raha ki middle term kaise split karte hain?')"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-cyan-400 transition-all font-sans"
              />
              <button
                onClick={() => handleStudentAsk(customQuestion)}
                disabled={isAsking || !customQuestion.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAsking ? 'Thinking...' : 'Ask AI'}</span>
              </button>
            </div>

            {/* 1-Click Quick Classroom Voice Triggers for Judging */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                1-Click Spoken Scenarios for Judges:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleStudentAsk("Sir mujhe samajh nahi aa raha ki middle term split kaise karte hain?", { name: "Rahul Verma", learning_level: "BEGINNER", preferred_language: "Hinglish" })}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium text-left truncate transition-all"
                >
                  🎙️ Rahul: "Middle term split samajh nahi aa raha" (Hinglish)
                </button>

                <button
                  onClick={() => handleStudentAsk("Why are there no real roots when discriminant is negative?", { name: "Priya Patel", learning_level: "ADVANCED", preferred_language: "English" })}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-medium text-left truncate transition-all"
                >
                  🎙️ Priya: "Why no real roots when D &lt; 0?" (English)
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Connected Students & Learning Gap Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Connected Students Grid */}
        <div className="lg:col-span-7">
          <StudentGrid
            students={students}
            activeSpeakerUid={activeSpeaker}
            onSimulateStudentQuestion={(student) => {
              const query = student.name.includes('Rahul')
                ? "Sir factorization mein factors kaise find karein?"
                : student.name.includes('Priya')
                ? "How do we geometrically interpret the discriminant?"
                : "Middle term split karne par sign kab change hota hai?";
              handleStudentAsk(query, student);
            }}
            isAsking={isAsking}
          />
        </div>

        {/* Real-time Learning Gap Intelligence */}
        <div className="lg:col-span-5">
          <LearningGapPanel gaps={gaps} />
        </div>
      </div>

      {/* Teacher Master Command Bar */}
      <div className="sticky bottom-4 z-40">
        <TeacherControls
          sessionId={session?.id}
          aiMode={aiMode}
          onAction={handleTeacherControl}
          onTriggerQuiz={handleTriggerQuiz}
          onEndClass={handleEndClass}
          isEnding={isEndingClass}
        />
      </div>

      {/* Spoken Quiz Modal */}
      <SpokenQuizModal
        quiz={activeQuiz}
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onSubmitAnswer={handleSubmitQuizAnswer}
        isSubmitting={isSubmittingQuiz}
      />

    </div>
  );
};
