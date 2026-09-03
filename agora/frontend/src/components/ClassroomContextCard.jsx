import React from 'react';
import { BookOpen, GraduationCap, Target, AlertTriangle, Layers } from 'lucide-react';

export const ClassroomContextCard = ({ classroom, session, isTeacherSpeaking }) => {
  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 shadow-xl space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Classroom Context Engine
          </h3>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          Grounded Memory
        </span>
      </div>

      {/* Main Metadata */}
      <div className="p-3 rounded-xl glass-card space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span>Topic:</span>
          </span>
          <span className="font-bold text-slate-100">{session?.topic || classroom?.current_topic || 'Quadratic Equations'}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center space-x-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>Lead Teacher:</span>
          </span>
          <span className="font-semibold text-slate-200">Dr. Sharma</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Teacher Voice State:</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
            isTeacherSpeaking 
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse' 
              : 'bg-slate-800 text-slate-400'
          }`}>
            {isTeacherSpeaking ? '🎙️ Teacher Speaking (AI Yields)' : 'Teacher Paused (AI Ready)'}
          </span>
        </div>
      </div>

      {/* Core Learning Goals */}
      <div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Active Learning Objectives:
        </span>
        <div className="space-y-1.5">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2">
            <Target className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Standard Form: ax² + bx + c = 0</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2">
            <Target className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Factorization: Splitting the middle term</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 flex items-center space-x-2">
            <Target className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Discriminant: D = b² - 4ac & Real Roots</span>
          </div>
        </div>
      </div>
    </div>
  );
};
