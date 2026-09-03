import React from 'react';
import { User, Volume2, Sparkles, MessageCircle, Mic } from 'lucide-react';

export const StudentGrid = ({ 
  students = [], 
  activeSpeakerUid, 
  onSimulateStudentQuestion,
  isAsking 
}) => {
  const getLevelBadge = (level) => {
    switch (level) {
      case 'ADVANCED':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">Advanced</span>;
      case 'INTERMEDIATE':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">Intermediate</span>;
      case 'BEGINNER':
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Beginner</span>;
    }
  };

  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Connected Students ({students.length})
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
          Agora RTC Voice Mesh
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {students.map((student) => {
          const isSpeaking = activeSpeakerUid === student.id;

          return (
            <div
              key={student.id}
              className={`p-3 rounded-xl glass-card transition-all relative overflow-hidden ${
                isSpeaking ? 'border-cyan-400 glow-cyan ring-1 ring-cyan-400' : 'hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white ${
                    student.name.includes('Rahul')
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                      : student.name.includes('Priya')
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-500'
                      : 'bg-gradient-to-tr from-amber-600 to-orange-500'
                  }`}>
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{student.name}</h4>
                    <p className="text-[10px] text-slate-400">{student.grade || 'Grade 10'}</p>
                  </div>
                </div>

                {getLevelBadge(student.learning_level)}
              </div>

              {/* Preferences & Badges */}
              <div className="flex items-center space-x-1.5 my-2">
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {student.preferred_language || 'Hinglish'}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 font-mono">
                  Mastery: {student.overall_mastery || 70}%
                </span>
              </div>

              {/* 1-Click Spoken Question Simulator for Testing */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <button
                  disabled={isAsking}
                  onClick={() => onSimulateStudentQuestion(student)}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-all active:scale-95"
                >
                  <Mic className="w-3 h-3 text-cyan-400" />
                  <span>Ask Spoken Query</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
