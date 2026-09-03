import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  User, BookOpen, Brain, Award, Radio, 
  ArrowRight, CheckCircle2, TrendingUp, Sparkles, AlertCircle 
} from 'lucide-react';

export const StudentDashboard = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const cls = await api.getClassrooms();
        setClassrooms(cls);
      } catch (err) {
        console.error('Error loading student dashboard', err);
      }
    };
    fetchClassrooms();
  }, []);

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Student Welcome Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-100">
                Welcome, {user?.name || 'Rahul Verma'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Student
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Grade 10 • Learning Profile: <span className="text-emerald-400 font-semibold">{user?.learning_level || 'BEGINNER'}</span> • Voice Language: <span className="text-cyan-300 font-semibold">{user?.preferred_language || 'Hinglish'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('classroom')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-bold hover:shadow-xl hover:shadow-cyan-500/25 transition-all flex items-center space-x-2"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          <span>Join Live Voice Classroom</span>
        </button>
      </div>

      {/* Progress & Misconceptions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Classrooms */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
              Your Enrolled Classes
            </h3>
            <span className="text-xs text-slate-400">{classrooms.length} Active</span>
          </div>

          <div className="space-y-3">
            {classrooms.map((cls) => (
              <div
                key={cls.id}
                className="p-5 rounded-2xl glass-card hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">{cls.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Subject: <span className="text-slate-200 font-semibold">{cls.subject}</span> • Topic: <span className="text-cyan-300 font-semibold">{cls.current_topic}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('classroom')}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <span>Join Class</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Agora Voice Channel: {cls.agora_channel}</span>
                  <span className="text-cyan-400 font-semibold">AI Co-Teacher Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Personal Misconceptions & Spoken Quiz Tracker */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
              Personalized Learning Focus
            </h3>
            <span className="text-xs text-amber-400 font-mono">AI Adaptive</span>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800/80 space-y-4 shadow-xl">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-bold">Quadratic Equations Mastery</span>
                <span className="text-cyan-400 font-bold">68%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 w-[68%]" />
              </div>
            </div>

            {/* Targeted Misconception Guidance */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Identified Concepts to Practice:
              </span>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-200 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Factorization Middle Term Splitting</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Classora AI will provide simpler factor pair examples when you ask questions.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-200 space-y-1">
                <div className="flex items-center space-x-1.5 font-bold text-blue-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Discriminant Sign Interpretation</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Remember: D &gt; 0 has two distinct real roots, D = 0 has two equal roots, D &lt; 0 has no real roots.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
