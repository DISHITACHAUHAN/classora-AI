import React, { useState } from 'react';
import { Award, Mic, Volume2, CheckCircle2, XCircle, AlertTriangle, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SpokenQuizModal = ({ quiz, isOpen, onClose, onSubmitAnswer, isSubmitting }) => {
  const [spokenAnswer, setSpokenAnswer] = useState('Sir, the discriminant is 1 because b² - 4ac = 25 - 24 = 1.');
  const [evalResult, setEvalResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  if (!isOpen || !quiz) return null;

  const handleSubmit = async (customAnswer) => {
    const answerToSubmit = customAnswer || spokenAnswer;
    try {
      const result = await onSubmitAnswer(quiz.id, answerToSubmit);
      setEvalResult(result);
      if (result.evaluation === 'CORRECT') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (e) {
      console.error('Quiz submit error', e);
    }
  };

  const handleSimulateStudentVoice = (text) => {
    setSpokenAnswer(text);
    handleSubmit(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl glass-panel border border-cyan-500/30 p-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow background */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-100 uppercase tracking-wider">
              Classora AI Spoken Quiz
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Topic: {quiz.topic || 'Quadratic Equations'}
            </p>
          </div>
        </div>

        {/* Question Card */}
        <div className="p-4 rounded-xl glass-card border-l-4 border-l-cyan-400 bg-cyan-950/20 my-3">
          <div className="flex items-center space-x-2 mb-1 text-[11px] font-bold text-cyan-300">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Classora Spoken Question:</span>
          </div>
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            "{quiz.question_text}"
          </p>
        </div>

        {/* Student Spoken Answer Section */}
        {!evalResult ? (
          <div className="space-y-3 mt-4">
            <label className="text-xs font-bold text-slate-300 block">
              Student Voice Answer:
            </label>
            <div className="relative">
              <textarea
                value={spokenAnswer}
                onChange={(e) => setSpokenAnswer(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-all font-sans"
                placeholder="Student speaks their answer via Agora microphone..."
              />
            </div>

            {/* 1-Click Quick Spoken Answers */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Voice Scenarios:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSimulateStudentVoice("Sir, discriminant is 1 because 5 square is 25 minus 24 equals 1.")}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium text-left truncate transition-all"
                >
                  🟢 Correct Answer (D = 1)
                </button>
                <button
                  onClick={() => handleSimulateStudentVoice("Sir, the discriminant is zero because both roots are equal.")}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-medium text-left truncate transition-all"
                >
                  🔴 Incorrect Answer (D = 0)
                </button>
              </div>
            </div>

            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'AI Evaluating Spoken Answer...' : 'Submit Spoken Answer'}</span>
            </button>
          </div>
        ) : (
          /* Evaluation Result Card */
          <div className="space-y-4 my-3 animate-in zoom-in-95">
            <div className={`p-4 rounded-xl border ${
              evalResult.evaluation === 'CORRECT'
                ? 'bg-emerald-950/30 border-emerald-500/50'
                : evalResult.evaluation === 'INCORRECT'
                ? 'bg-rose-950/30 border-rose-500/50'
                : 'bg-amber-950/30 border-amber-500/50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {evalResult.evaluation === 'CORRECT' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-400" />
                )}
                <span className={`text-xs font-extrabold uppercase tracking-wider ${
                  evalResult.evaluation === 'CORRECT' ? 'text-emerald-300' : 'text-rose-300'
                }`}>
                  Evaluation: {evalResult.evaluation}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {evalResult.ai_feedback}
              </p>
            </div>

            <button
              onClick={() => {
                setEvalResult(null);
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-all"
            >
              Done / Return to Class
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
