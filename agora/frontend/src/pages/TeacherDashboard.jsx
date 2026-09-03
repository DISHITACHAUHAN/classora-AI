import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, Plus, BookOpen, Users, Brain, Award, 
  ArrowRight, Radio, CheckCircle2, TrendingUp, Sparkles, Clock
} from 'lucide-react';

export const TeacherDashboard = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Quadratic Equations');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cls = await api.getClassrooms();
        setClassrooms(cls);
        if (cls.length > 0) {
          const stats = await api.getAnalytics(cls[0].id);
          setAnalytics(stats);
        }
      } catch (err) {
        console.error('Teacher dashboard load error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    try {
      const newClass = await api.createClassroom({
        name: className,
        subject,
        current_topic: topic,
        description: `Live interactive classroom with Classora AI co-teaching.`
      });
      setClassrooms([...classrooms, newClass]);
      setIsModalOpen(false);
      setClassName('');
    } catch (err) {
      console.error('Error creating classroom', err);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 lg:px-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Top Welcome Banner */}
      <div className="p-6 rounded-3xl glass-panel border border-slate-800/80 flex flex-wrap items-center justify-between gap-4 shadow-2xl relative overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-slate-100">
                Welcome, {user?.name || 'Dr. Sharma'}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Lead Teacher
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Department of Mathematics • Classora AI Co-Teaching Assistant Active
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl glass-card border border-slate-700 hover:border-cyan-500/40 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Classroom</span>
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-xs font-bold hover:shadow-xl hover:shadow-cyan-500/25 transition-all flex items-center space-x-2"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Launch Live Classroom</span>
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border-t-2 border-t-cyan-500 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Classrooms</span>
          <div className="text-2xl font-extrabold text-slate-100">{classrooms.length || 1}</div>
          <p className="text-[11px] text-cyan-400">Connected with Agora RTC</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-t-2 border-t-amber-500 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Learning Gaps</span>
          <div className="text-2xl font-extrabold text-amber-400">{analytics?.active_learning_gaps?.length || 2}</div>
          <p className="text-[11px] text-slate-400">Semantic clusters detected</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-t-2 border-t-purple-500 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Quizzes Done</span>
          <div className="text-2xl font-extrabold text-purple-400">{analytics?.total_quizzes_conducted || 4}</div>
          <p className="text-[11px] text-purple-400">Spoken voice evaluations</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border-t-2 border-t-emerald-500 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Class Mastery Index</span>
          <div className="text-2xl font-extrabold text-emerald-400">{analytics?.class_average_mastery || 78.5}%</div>
          <p className="text-[11px] text-emerald-400">Real-time turn-based index</p>
        </div>
      </div>

      {/* Active Classrooms & Learning Gaps Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Classrooms Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
              Active Voice Classrooms
            </h3>
            <span className="text-xs text-slate-400">{classrooms.length} Total</span>
          </div>

          <div className="space-y-3">
            {classrooms.map((cls) => (
              <div
                key={cls.id}
                className="p-5 rounded-2xl glass-card hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-100">{cls.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Active Channel
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Subject: <span className="text-slate-200 font-semibold">{cls.subject}</span> • Topic: <span className="text-cyan-300 font-semibold">{cls.current_topic}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('classroom')}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center space-x-1.5"
                  >
                    <span>Enter Live</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Channel: {cls.agora_channel}</span>
                  <span className="text-emerald-400">Classora AI Voice Attached</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Gap Intelligence Overview Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
              Active Conceptual Gaps
            </h3>
            <span className="text-xs text-amber-400">High Priority</span>
          </div>

          <div className="space-y-3">
            {(analytics?.active_learning_gaps || [
              {
                gap_title: "Factorization & Middle Term Splitting",
                description: "Students struggle with identifying factor pairs for negative coefficients.",
                affected_students: ["Rahul Verma", "Aman Gupta"],
                severity: "HIGH",
                recommendation: "Provide 2 simple factor pair examples before negative coefficients."
              },
              {
                gap_title: "Negative Roots & Discriminant Signs",
                description: "Confusion between negative roots and negative discriminant values.",
                affected_students: ["Rahul Verma", "Priya Patel"],
                severity: "MEDIUM",
                recommendation: "Clarify real number line solutions vs complex conjugate roots."
              }
            ]).map((gap, idx) => (
              <div key={idx} className="p-4 rounded-xl glass-card border-l-4 border-l-amber-500 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-100">{gap.gap_title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {gap.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  {gap.description}
                </p>
                <div className="text-[10px] text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                  <span className="font-bold">Recommended: </span> {gap.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal for Creating Classroom */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl glass-panel border border-slate-700 p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-100">
              Create New Live Voice Classroom
            </h3>

            <form onSubmit={handleCreateClassroom} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                  Classroom Name
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Grade 10 - Advanced Mathematics"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Mathematics"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1">
                    Initial Topic
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Quadratic Equations"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  Create & Launch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
