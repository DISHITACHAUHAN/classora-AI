import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, ArrowRight, Lock, Mail, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage = ({ setActiveTab }) => {
  const { login, register, loginAsDemoTeacher, loginAsDemoStudent } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [learningLevel, setLearningLevel] = useState('BEGINNER');
  const [preferredLang, setPreferredLang] = useState('Hinglish');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register({
          email,
          password,
          name,
          role,
          learning_level: learningLevel,
          preferred_language: preferredLang
        });
      } else {
        await login(email, password);
      }
      setActiveTab('classroom');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handle1ClickDemo = async (type) => {
    setLoading(true);
    try {
      if (type === 'TEACHER') {
        await loginAsDemoTeacher();
      } else {
        await loginAsDemoStudent(type.toLowerCase());
      }
      setActiveTab('classroom');
    } catch (err) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100">
            {isRegister ? 'Join Classora AI' : 'Sign in to Classora AI'}
          </h2>
          <p className="text-xs text-slate-400">
            Real-Time Voice Co-Teacher Classroom Platform
          </p>
        </div>

        {/* 1-Click Fast Access For Hackathon Judges */}
        <div className="p-4 rounded-2xl glass-panel border border-cyan-500/30 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Hackathon Demo Personas:</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handle1ClickDemo('TEACHER')}
              className="p-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-left transition-all group"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-300">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Dr. Sharma</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Teacher (Full Control)</p>
            </button>

            <button
              onClick={() => handle1ClickDemo('Rahul')}
              className="p-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-left transition-all group"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-300">
                <User className="w-3.5 h-3.5" />
                <span>Rahul Verma</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Beginner (Hinglish)</p>
            </button>

            <button
              onClick={() => handle1ClickDemo('Priya')}
              className="p-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-left transition-all group"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                <User className="w-3.5 h-3.5" />
                <span>Priya Patel</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Advanced (English)</p>
            </button>

            <button
              onClick={() => handle1ClickDemo('Aman')}
              className="p-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-left transition-all group"
            >
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
                <User className="w-3.5 h-3.5" />
                <span>Aman Gupta</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Intermediate</p>
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 shadow-2xl space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sharma / Rahul Verma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-all"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@classora.ai"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>

            {isRegister && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Language
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                  >
                    <option value="Hinglish">Hinglish</option>
                    <option value="English">English</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
