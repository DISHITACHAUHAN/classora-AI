import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAgora } from '../context/AgoraContext';
import { 
  Radio, Sparkles, User, LogOut, ChevronDown, 
  GraduationCap, Mic, CheckCircle2, Award, BookOpen, Activity
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, loginAsDemoTeacher, loginAsDemoStudent } = useAuth();
  const { isJoined, channelInfo } = useAgora();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDemoSwitch = async (role) => {
    if (role === 'TEACHER') {
      await loginAsDemoTeacher();
    } else {
      await loginAsDemoStudent(role.toLowerCase());
    }
    setDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('landing')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                CLASSORA
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              REAL-TIME VOICE CO-TEACHER
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center space-x-1 glass-card px-2 py-1 rounded-xl border border-slate-700/40">
          <button
            onClick={() => setActiveTab('landing')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'landing'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('classroom')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-all ${
              activeTab === 'classroom'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Classroom</span>
            {isJoined && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
            )}
          </button>

          <button
            onClick={() => setActiveTab(user?.role === 'TEACHER' ? 'teacher_dash' : 'student_dash')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'teacher_dash' || activeTab === 'student_dash'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'summary'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Post-Class Report
          </button>

          <button
            onClick={() => setActiveTab('demo_guide')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg flex items-center space-x-1 transition-all ${
              activeTab === 'demo_guide'
                ? 'bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-300 border border-amber-500/50'
                : 'text-amber-400/90 hover:bg-amber-500/10'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Judges Guide</span>
          </button>
        </div>

        {/* Agora Voice Status & Auth Controls */}
        <div className="flex items-center space-x-3">
          {/* Agora Voice Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className={`w-2 h-2 rounded-full ${isJoined ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-500'}`} />
            <span className="text-[11px] font-mono text-slate-300">
              {isJoined ? `Agora Voice: ${channelInfo?.channel?.slice(0, 14)}...` : 'Agora: Ready'}
            </span>
          </div>

          {/* User Menu / 1-Click Demo Switcher */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl glass-card hover:border-cyan-500/40 transition-all text-xs font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-slate-200 font-semibold leading-tight">{user.name}</div>
                  <div className="text-[10px] text-cyan-400 font-mono">{user.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl glass-panel p-2 shadow-2xl border border-slate-700/60 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <div className="text-xs font-bold text-slate-200">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                  </div>

                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mt-1">
                    Switch Demo Persona:
                  </div>

                  <button
                    onClick={() => handleDemoSwitch('TEACHER')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 flex items-center space-x-2 text-slate-300 hover:text-white"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dr. Sharma (Teacher)</span>
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('Rahul')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 flex items-center space-x-2 text-slate-300 hover:text-white"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Rahul (Beginner / Hinglish)</span>
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('Priya')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 flex items-center space-x-2 text-slate-300 hover:text-white"
                  >
                    <User className="w-3.5 h-3.5 text-purple-400" />
                    <span>Priya (Advanced / English)</span>
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('Aman')}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs hover:bg-slate-800/80 flex items-center space-x-2 text-slate-300 hover:text-white"
                  >
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Aman (Intermediate)</span>
                  </button>

                  <div className="border-t border-slate-800/80 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                      setActiveTab('landing');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </button>
              <button
                onClick={async () => {
                  await loginAsDemoTeacher();
                  setActiveTab('classroom');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                1-Click Demo
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};
