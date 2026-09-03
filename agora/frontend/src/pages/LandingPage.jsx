import React from 'react';
import { 
  Radio, Sparkles, Volume2, ShieldCheck, Brain, Award, 
  Globe, ArrowRight, Play, CheckCircle2, Zap, GraduationCap, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = ({ setActiveTab }) => {
  const { loginAsDemoTeacher, loginAsDemoStudent } = useAuth();

  const handleLaunchDemoTeacher = async () => {
    await loginAsDemoTeacher();
    setActiveTab('classroom');
  };

  const handleLaunchDemoStudent = async () => {
    await loginAsDemoStudent('rahul');
    setActiveTab('classroom');
  };

  return (
    <div className="min-h-screen py-12 px-4 lg:px-8 max-w-7xl mx-auto space-y-20">
      
      {/* Hero Section */}
      <div className="relative text-center space-y-6 pt-8 pb-4">
        {/* Glow background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Agora Powered Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-card border border-cyan-500/30 text-xs font-bold text-cyan-300 shadow-lg shadow-cyan-500/10">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>POWERED BY AGORA CONVERSATIONAL AI & RTC</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            CLASSORA
          </span>{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            AI
          </span>
          <br />
          <span className="text-2xl sm:text-4xl font-bold text-slate-300 block mt-2 font-['Outfit',sans-serif]">
            "Your Real-Time Voice Co-Teacher"
          </span>
        </h1>

        {/* Tagline */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
          <span className="font-semibold text-cyan-400">Listen. Understand. Assist. Empower.</span>
          <br />
          The AI co-teacher that sits in your live Agora voice classroom, respects teacher priority, answers contextual student questions, detects learning gaps in real time, and conducts spoken quizzes.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={handleLaunchDemoTeacher}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-xl hover:shadow-cyan-500/25 transition-all flex items-center space-x-2 active:scale-95"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Enter Live Classroom as Teacher</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleLaunchDemoStudent}
            className="px-6 py-3.5 rounded-xl glass-card border border-slate-700 hover:border-cyan-500/40 text-slate-200 font-bold text-sm hover:text-white transition-all flex items-center space-x-2 active:scale-95"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Join as Student (Rahul - Hinglish)</span>
          </button>

          <button
            onClick={() => setActiveTab('demo_guide')}
            className="px-5 py-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-sm transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Judges Demo Guide</span>
          </button>
        </div>
      </div>

      {/* Architecture Flow Banner */}
      <div className="p-8 rounded-3xl glass-panel border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-8">
          <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">
            Core Agora Voice Pipeline
          </span>
          <h2 className="text-2xl font-extrabold text-slate-100 mt-1">
            How Classora AI Operates in the Live Voice Mesh
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-card border-t-2 border-t-blue-500 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-100">Live Agora RTC Room</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Teacher, students, and Classora AI join a single real-time voice channel with zero audio latency.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border-t-2 border-t-amber-500 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-100">Intelligent Turn-Taking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI listens (WAIT) while teacher explains. When teacher pauses and a student asks, AI seamlessly assists.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border-t-2 border-t-emerald-500 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-100">Personalized Voice Response</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Answers in Hinglish/English with depth tailored to the student's mastery level and recent difficulties.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border-t-2 border-t-cyan-500 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h4 className="text-sm font-bold text-slate-100">Learning Gap Intelligence</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects repeated student confusion, alerts the teacher dashboard, and generates post-class summaries.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-100">
            Engineered for Real Classrooms
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Eight foundational pillars powering Classora AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-card space-y-2 hover:border-cyan-500/30 transition-all">
            <Radio className="w-6 h-6 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-100">Agora Conversational AI</h4>
            <p className="text-xs text-slate-400">
              Low-latency real-time voice streaming with turn-taking and interruption handling.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card space-y-2 hover:border-cyan-500/30 transition-all">
            <Brain className="w-6 h-6 text-amber-400" />
            <h4 className="text-sm font-bold text-slate-100">Classroom Context Engine</h4>
            <p className="text-xs text-slate-400">
              Maintains current syllabus topic, teacher remarks, and individual student learning profiles.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card space-y-2 hover:border-cyan-500/30 transition-all">
            <Globe className="w-6 h-6 text-purple-400" />
            <h4 className="text-sm font-bold text-slate-100">Hinglish Code-Switching</h4>
            <p className="text-xs text-slate-400">
              Understands natural Hindi + English queries and speaks back in empathetic Hinglish.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card space-y-2 hover:border-cyan-500/30 transition-all">
            <Award className="w-6 h-6 text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-100">Spoken Quizzes</h4>
            <p className="text-xs text-slate-400">
              AI conducts oral voice quizzes and evaluates student spoken answers in real time.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card space-y-2 hover:border-cyan-500/30 transition-all">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
            <h4 className="text-sm font-bold text-slate-100">Teacher Master Override</h4>
            <p className="text-xs text-slate-400">
              Teacher can Mute, Pause, Allow, or Override the AI co-teacher at any moment.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card space-y-2 hover:border-cyan-500/30 transition-all">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h4 className="text-sm font-bold text-slate-100">Turn-Taking State Machine</h4>
            <p className="text-xs text-slate-400">
              Visibly tracks WAIT, LISTEN, THINK, SPEAK, ALERT_TEACHER states.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card space-y-2 hover:border-cyan-500/30 transition-all">
            <Users className="w-6 h-6 text-blue-400" />
            <h4 className="text-sm font-bold text-slate-100">Learning Gap Clustering</h4>
            <p className="text-xs text-slate-400">
              Semantic analysis clusters confusion across students and suggests teacher interventions.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card space-y-2 hover:border-cyan-500/30 transition-all">
            <Sparkles className="w-6 h-6 text-teal-400" />
            <h4 className="text-sm font-bold text-slate-100">Post-Class Intelligence</h4>
            <p className="text-xs text-slate-400">
              Generates executive summary, struggling students count, and personalized next steps.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
