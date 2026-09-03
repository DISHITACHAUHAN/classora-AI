import React, { useState } from 'react';
import { 
  MicOff, Pause, Play, ShieldAlert, Award, LogOut, 
  Settings2, CheckCircle2, AlertTriangle, Sparkles 
} from 'lucide-react';

export const TeacherControls = ({ 
  sessionId, 
  aiMode, 
  onAction, 
  onTriggerQuiz, 
  onEndClass,
  isEnding = false 
}) => {
  const [activeAction, setActiveAction] = useState(null);

  const handleControl = async (action) => {
    setActiveAction(action);
    try {
      await onAction(action);
    } finally {
      setTimeout(() => setActiveAction(null), 800);
    }
  };

  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2">
          <Settings2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Teacher Master Control Panel
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400">Current AI Mode:</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
            aiMode === 'MUTED' 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
              : aiMode === 'PAUSED'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : aiMode === 'OVERRIDDEN'
              ? 'bg-red-600/30 text-red-200 border border-red-500/50'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {aiMode || 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Control Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        
        {/* Mute AI */}
        <button
          onClick={() => handleControl('MUTE')}
          className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            aiMode === 'MUTED'
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-slate-800/90 text-slate-200 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700/60'
          }`}
        >
          <MicOff className="w-3.5 h-3.5" />
          <span>Mute AI</span>
        </button>

        {/* Pause AI */}
        <button
          onClick={() => handleControl('PAUSE')}
          className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            aiMode === 'PAUSED'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
              : 'bg-slate-800/90 text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 border border-slate-700/60'
          }`}
        >
          <Pause className="w-3.5 h-3.5" />
          <span>Pause AI</span>
        </button>

        {/* Allow AI */}
        <button
          onClick={() => handleControl('ALLOW')}
          className={`flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
            aiMode === 'ACTIVE'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm'
              : 'bg-slate-800/90 text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-700/60'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Allow AI</span>
        </button>

        {/* Override AI */}
        <button
          onClick={() => handleControl('OVERRIDE')}
          className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:shadow-lg hover:shadow-red-500/25 border border-red-500/50 transition-all active:scale-95"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Override AI</span>
        </button>

        {/* Start AI Quiz */}
        <button
          onClick={onTriggerQuiz}
          className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 border border-cyan-400/40 transition-all active:scale-95"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Start AI Quiz</span>
        </button>

        {/* End Class */}
        <button
          onClick={onEndClass}
          disabled={isEnding}
          className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{isEnding ? 'Analyzing...' : 'End Class'}</span>
        </button>

      </div>
    </div>
  );
};
