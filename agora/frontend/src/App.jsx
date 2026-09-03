import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LiveClassroom } from './pages/LiveClassroom';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { PostClassSummary } from './pages/PostClassSummary';
import { DemoJudgesGuide } from './pages/DemoJudgesGuide';
import { LoginPage } from './pages/LoginPage';
import { Radio, Heart, Sparkles, ShieldCheck } from 'lucide-react';

export default function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('landing');
  const [postClassSessionId, setPostClassSessionId] = useState(1);

  const renderContent = () => {
    switch (activeTab) {
      case 'classroom':
        return (
          <LiveClassroom
            setActiveTab={setActiveTab}
            setPostClassSessionId={setPostClassSessionId}
          />
        );
      case 'teacher_dash':
        return <TeacherDashboard setActiveTab={setActiveTab} />;
      case 'student_dash':
        return <StudentDashboard setActiveTab={setActiveTab} />;
      case 'summary':
        return (
          <PostClassSummary
            sessionId={postClassSessionId}
            setActiveTab={setActiveTab}
          />
        );
      case 'demo_guide':
        return <DemoJudgesGuide setActiveTab={setActiveTab} />;
      case 'login':
        return <LoginPage setActiveTab={setActiveTab} />;
      case 'landing':
      default:
        return <LandingPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content View */}
      <main className="flex-1 pb-12">
        {renderContent()}
      </main>

      {/* Futuristic Footer with Agora Attribution */}
      <footer className="border-t border-slate-800/80 glass-panel py-8 px-4 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-200">
                CLASSORA AI
              </span>
              <span className="text-[11px] text-slate-400 block font-mono">
                Powered by Agora Conversational AI & RTC
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <button onClick={() => setActiveTab('demo_guide')} className="hover:text-cyan-400 transition-colors">
              Judges Demo
            </button>
            <button onClick={() => setActiveTab('classroom')} className="hover:text-cyan-400 transition-colors">
              Live Classroom
            </button>
            <button onClick={() => setActiveTab('summary')} className="hover:text-cyan-400 transition-colors">
              Class Intelligence
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            &copy; 2026 Classora AI • Hackathon Edition
          </div>
        </div>
      </footer>

    </div>
  );
}
