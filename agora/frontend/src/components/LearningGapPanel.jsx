import React from 'react';
import { AlertCircle, Brain, Lightbulb, Users, CheckCircle2, TrendingUp } from 'lucide-react';

export const LearningGapPanel = ({ gaps = [] }) => {
  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600/30 text-red-200 border border-red-500">CRITICAL</span>;
      case 'HIGH':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">HIGH</span>;
      case 'MEDIUM':
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">MEDIUM</span>;
    }
  };

  return (
    <div className="p-4 rounded-2xl glass-panel border border-slate-800/80 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2">
          <Brain className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Real-Time Learning Gap Intelligence
          </h3>
        </div>
        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          AI Semantic Clustering
        </span>
      </div>

      {/* Gaps List */}
      <div className="space-y-3">
        {gaps.length === 0 ? (
          <div className="p-4 rounded-xl glass-card text-center text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5 opacity-80" />
            <p className="text-xs font-medium">No severe learning gaps detected yet.</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Classora AI is continuously analyzing student questions for conceptual friction.
            </p>
          </div>
        ) : (
          gaps.map((gap, idx) => (
            <div
              key={gap.id || idx}
              className="p-3.5 rounded-xl glass-card border-l-4 border-l-amber-500 bg-amber-950/10 space-y-2.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>{gap.gap_title}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {gap.description}
                  </p>
                </div>
                {getSeverityBadge(gap.severity)}
              </div>

              {/* Affected Students */}
              <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Affected Students:</span>
                <div className="flex flex-wrap gap-1">
                  {(gap.affected_students || []).map((name, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-medium border border-slate-700"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Teacher Recommendation */}
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] flex items-start space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Teacher Action: </span>
                  {gap.recommendation}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
