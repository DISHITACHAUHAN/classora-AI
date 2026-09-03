import React, { useRef, useEffect } from 'react';
import { Volume2, Sparkles, GraduationCap, User, Globe, MessageSquare } from 'lucide-react';

export const LiveCaptions = ({ transcript = [], activeTurnState }) => {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const getSpeakerBadge = (role, name) => {
    if (role === 'TEACHER') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
          <GraduationCap className="w-3 h-3" />
          <span>{name || 'Teacher'}</span>
        </span>
      );
    }
    if (role === 'AI' || role === 'AI_CO_TEACHER') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
          <Sparkles className="w-3 h-3" />
          <span>Classora AI</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
        <User className="w-3 h-3" />
        <span>{name || 'Student'}</span>
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full rounded-2xl glass-panel border border-slate-800/80 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Live Spoken Transcript & Karaoke Captions
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
            <Globe className="w-2.5 h-2.5 text-cyan-400" />
            <span>Hinglish + English Auto-Detect</span>
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Transcript Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[380px]">
        {transcript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <Volume2 className="w-8 h-8 mb-2 opacity-40 animate-pulse" />
            <p className="text-xs font-medium">Waiting for classroom speech...</p>
            <p className="text-[11px] text-slate-600 mt-1">
              Teacher or student speech will appear with live turn-taking synchronization.
            </p>
          </div>
        ) : (
          transcript.map((item, idx) => {
            const isAI = item.speaker_role === 'AI' || item.speaker_role === 'AI_CO_TEACHER';
            const isTeacher = item.speaker_role === 'TEACHER';

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-xl transition-all ${
                  isAI
                    ? 'glass-card border-l-4 border-l-cyan-400 bg-cyan-950/20'
                    : isTeacher
                    ? 'glass-card border-l-4 border-l-blue-500 bg-blue-950/20'
                    : 'glass-card border-l-4 border-l-amber-500 bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    {getSpeakerBadge(item.speaker_role, item.speaker_name)}
                    {item.language && item.language !== 'en' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                        {item.language}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    {item.timestamp || 'Just now'}
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {item.text}
                </p>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};
