import React from 'react';
import { 
  Sparkles, Radio, CheckCircle2, ArrowRight, Play, 
  Volume2, ShieldAlert, Award, Brain, Users, Globe, BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DemoJudgesGuide = ({ setActiveTab }) => {
  const { loginAsDemoTeacher, loginAsDemoStudent } = useAuth();

  const handleLaunchTeacher = async () => {
    await loginAsDemoTeacher();
    setActiveTab('classroom');
  };

  const handleLaunchStudent = async () => {
    await loginAsDemoStudent('rahul');
    setActiveTab('classroom');
  };

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8 max-w-5xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900 to-cyan-950/20 shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-100">
                Hackathon Judging & Interactive Demo Guide
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                JUDGE FAST-TRACK
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Step-by-step walkthrough demonstrating all core Agora Conversational AI & Co-Teaching requirements.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={handleLaunchTeacher}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center space-x-2"
          >
            <span>Launch Demo Classroom as Teacher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleLaunchStudent}
            className="px-5 py-2.5 rounded-xl glass-card border border-slate-700 hover:border-emerald-500/40 text-slate-200 text-xs font-bold hover:text-white transition-all flex items-center space-x-2"
          >
            <span>Launch as Student (Rahul - Hinglish)</span>
          </button>
        </div>
      </div>

      {/* 10 Step Interactive Checklist */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-200">
          Core Capabilities Verification Checklist
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Step 1 */}
          <div className="p-4 rounded-2xl glass-card border-l-4 border-l-blue-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 font-mono">01. REAL-TIME AGORA RTC VOICE</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">Live Voice Mesh & Token Generation</h4>
            <p className="text-xs text-slate-400">
              Teacher, students, and Classora AI co-teacher connect to the same Agora RTC channel with live volume meters and audio tracks.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl glass-card border-l-4 border-l-cyan-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 font-mono">02. VISIBLE AI TURN-TAKING STATES</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">VoiceOrb State Transitions</h4>
            <p className="text-xs text-slate-400">
              Watch the VoiceOrb transition visually between 🟢 LISTENING, 🟡 THINKING, 🔵 SPEAKING, ⚪ WAITING, and 🔴 OVERRIDE.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl glass-card border-l-4 border-l-amber-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 font-mono">03. TEACHER PRIORITY & PAUSE DETECTION</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">Non-Intrusive Turn Management</h4>
            <p className="text-xs text-slate-400">
              When teacher is speaking, AI automatically holds (WAIT). When teacher pauses, AI responds to student questions.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl glass-card border-l-4 border-l-purple-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 font-mono">04. HINGLISH CODE-SWITCHING</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">Multilingual Natural Dialogue</h4>
            <p className="text-xs text-slate-400">
              Ask in Hindi + English ("Sir middle term split samajh nahi aaya") &rarr; Classora AI responds naturally in warm Hinglish.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl glass-card border-l-4 border-l-emerald-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 font-mono">05. PERSONALIZED EXPLANATIONS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">Adaptive Student Depth</h4>
            <p className="text-xs text-slate-400">
              Beginner students (Rahul) receive intuitive analogies, while Advanced students (Priya) get algebraic rigor.
            </p>
          </div>

          {/* Step 6 */}
          <div className="p-4 rounded-2xl glass-card border-l-4 border-l-rose-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 font-mono">06. LEARNING GAP INTELLIGENCE</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">Real-Time Semantic Clustering</h4>
            <p className="text-xs text-slate-400">
              When multiple students ask about factorization or negative roots, AI alerts the teacher dashboard with recommended actions.
            </p>
          </div>

          {/* Step 7 */}
          <div className="p-4 rounded-2xl glass-card border-l-4 border-l-yellow-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-400 font-mono">07. SPOKEN VOICE QUIZZES</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">Live Oral Evaluation</h4>
            <p className="text-xs text-slate-400">
              Click "Start AI Quiz" &rarr; Classora asks a question orally &rarr; Student responds with voice &rarr; AI evaluates accuracy.
            </p>
          </div>

          {/* Step 8 */}
          <div className="p-4 rounded-2xl glass-card border-l-4 border-l-red-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 font-mono">08. TEACHER MASTER OVERRIDE</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">Full Teacher Authority</h4>
            <p className="text-xs text-slate-400">
              Teacher can click [MUTE AI], [PAUSE AI], [ALLOW AI], or [OVERRIDE AI] at any time with instant synchronization.
            </p>
          </div>

          {/* Step 9 */}
          <div className="p-4 rounded-2xl glass-card border-l-4 border-l-teal-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 font-mono">09. KARAOKE LIVE CAPTIONS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">Real-Time Transcription</h4>
            <p className="text-xs text-slate-400">
              Live captions stream automatically with role tags (Teacher, Student, AI) and timestamping.
            </p>
          </div>

          {/* Step 10 */}
          <div className="p-4 rounded-2xl glass-card border-l-4 border-l-indigo-500 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 font-mono">10. POST-CLASS INTELLIGENCE</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">Comprehensive Class Analytics</h4>
            <p className="text-xs text-slate-400">
              Ending the class generates topics covered, question count, struggling students list, and recommended next steps.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
