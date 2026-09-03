import React from 'react';
import { Volume2, Mic, Sparkles, ShieldAlert, PauseCircle, Radio } from 'lucide-react';

export const VoiceOrb = ({ state = 'WAIT', aiMode = 'ACTIVE', statusMessage, volume = 0 }) => {
  // State styling configs
  const getStateConfig = () => {
    if (aiMode === 'MUTED') {
      return {
        label: 'AI MUTED BY TEACHER',
        badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        orbGlow: 'from-rose-600/40 to-slate-800',
        borderGlow: 'border-rose-500/50',
        icon: <PauseCircle className="w-8 h-8 text-rose-400" />,
        dotColor: 'bg-rose-500',
        ringColor: 'border-rose-500/30'
      };
    }

    if (state === 'TEACHER_OVERRIDE') {
      return {
        label: 'TEACHER OVERRIDE',
        badgeBg: 'bg-rose-600/30 text-rose-200 border-rose-500/60',
        orbGlow: 'from-red-600/50 via-rose-700/30 to-slate-900',
        borderGlow: 'border-rose-500',
        icon: <ShieldAlert className="w-9 h-9 text-rose-400 animate-bounce" />,
        dotColor: 'bg-rose-500',
        ringColor: 'border-rose-500/50'
      };
    }

    switch (state) {
      case 'LISTEN':
        return {
          label: 'AI LISTENING',
          badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          orbGlow: 'from-emerald-500/40 via-teal-600/30 to-slate-900',
          borderGlow: 'border-emerald-400 glow-emerald',
          icon: <Mic className="w-8 h-8 text-emerald-400 animate-pulse" />,
          dotColor: 'bg-emerald-400',
          ringColor: 'border-emerald-500/40'
        };
      case 'THINK':
        return {
          label: 'AI THINKING',
          badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          orbGlow: 'from-amber-500/40 via-orange-600/30 to-slate-900',
          borderGlow: 'border-amber-400 glow-amber',
          icon: <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />,
          dotColor: 'bg-amber-400',
          ringColor: 'border-amber-500/40'
        };
      case 'SPEAK':
        return {
          label: 'AI SPEAKING',
          badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          orbGlow: 'from-cyan-500/50 via-blue-600/30 to-slate-900',
          borderGlow: 'border-cyan-400 glow-cyan',
          icon: <Volume2 className="w-9 h-9 text-cyan-300 animate-pulse" />,
          dotColor: 'bg-cyan-400',
          ringColor: 'border-cyan-500/50'
        };
      case 'ALERT_TEACHER':
        return {
          label: 'GAP DETECTED (ALERTING TEACHER)',
          badgeBg: 'bg-amber-600/30 text-amber-200 border-amber-500/60',
          orbGlow: 'from-amber-600/50 via-red-600/30 to-slate-900',
          borderGlow: 'border-amber-500 glow-amber',
          icon: <Sparkles className="w-9 h-9 text-amber-300 animate-bounce" />,
          dotColor: 'bg-amber-400',
          ringColor: 'border-amber-500/60'
        };
      case 'WAIT':
      default:
        return {
          label: 'AI WAITING (TEACHER PRIORITY)',
          badgeBg: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
          orbGlow: 'from-slate-700/30 via-slate-800/20 to-slate-950',
          borderGlow: 'border-slate-600',
          icon: <Radio className="w-8 h-8 text-slate-400 opacity-80" />,
          dotColor: 'bg-slate-400',
          ringColor: 'border-slate-700/50'
        };
    }
  };

  const config = getStateConfig();

  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl glass-panel border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Dynamic Background Glow */}
      <div className={`absolute inset-0 bg-gradient-radial ${config.orbGlow} opacity-30 pointer-events-none transition-all duration-700`} />

      {/* Live State Badge */}
      <div className="z-10 mb-4">
        <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-bold tracking-wide shadow-md transition-all ${config.badgeBg}`}>
          <span className={`w-2 h-2 rounded-full ${config.dotColor} ${state === 'SPEAK' || state === 'LISTEN' ? 'animate-ping' : ''}`} />
          <span>{config.label}</span>
        </div>
      </div>

      {/* The Central Voice Orb */}
      <div className="relative z-10 w-36 h-36 flex items-center justify-center my-2">
        {/* Outer Pulsing Ring */}
        <div className={`absolute inset-0 rounded-full border-2 ${config.ringColor} ${state === 'SPEAK' || state === 'LISTEN' ? 'animate-ping opacity-40' : 'opacity-20'}`} />

        {/* Middle Glowing Ring */}
        <div className={`absolute inset-2 rounded-full border ${config.borderGlow} ${state === 'THINK' ? 'animate-spin duration-3000' : 'animate-pulse-slow'}`} />

        {/* Inner Core */}
        <div className={`w-24 h-24 rounded-full bg-gradient-to-tr ${config.orbGlow} flex items-center justify-center shadow-inner border border-white/10 backdrop-blur-md`}>
          {config.icon}
        </div>
      </div>

      {/* Dynamic Audio Visualizer Bars */}
      <div className="z-10 flex items-center space-x-1.5 h-8 my-2">
        <span className={`w-1 rounded-full bg-cyan-400 transition-all ${state === 'SPEAK' ? 'wave-bar-1' : state === 'LISTEN' ? 'wave-bar-3' : 'h-1.5 opacity-40'}`} />
        <span className={`w-1 rounded-full bg-cyan-400 transition-all ${state === 'SPEAK' ? 'wave-bar-2' : state === 'LISTEN' ? 'wave-bar-1' : 'h-2 opacity-40'}`} />
        <span className={`w-1 rounded-full bg-cyan-300 transition-all ${state === 'SPEAK' ? 'wave-bar-3' : state === 'LISTEN' ? 'wave-bar-4' : 'h-3 opacity-50'}`} />
        <span className={`w-1 rounded-full bg-cyan-400 transition-all ${state === 'SPEAK' ? 'wave-bar-4' : state === 'LISTEN' ? 'wave-bar-2' : 'h-2 opacity-40'}`} />
        <span className={`w-1 rounded-full bg-cyan-400 transition-all ${state === 'SPEAK' ? 'wave-bar-5' : state === 'LISTEN' ? 'wave-bar-5' : 'h-1.5 opacity-40'}`} />
      </div>

      {/* Real-time Status Message */}
      <div className="z-10 text-center mt-2 max-w-sm">
        <p className="text-xs font-medium text-slate-300 leading-relaxed">
          {statusMessage || 'Classora AI is synchronized with classroom audio.'}
        </p>
        <span className="text-[10px] text-cyan-400/80 font-mono mt-1 block">
          Agora Conversational AI • Turn-Taking Active
        </span>
      </div>
    </div>
  );
};
