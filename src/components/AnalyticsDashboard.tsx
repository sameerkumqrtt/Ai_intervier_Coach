import React from 'react';
import { InterviewSession, TargetRole, UserAnswerRecord } from '../types';
import {
  BarChart2, Award, CheckCircle2, TrendingUp, Clock, Flame,
  Briefcase, Code2, Users, Shield, ArrowUpRight
} from 'lucide-react';

interface AnalyticsDashboardProps {
  sessions: InterviewSession[];
  currentRole: TargetRole;
  onSelectRole: (role: TargetRole) => void;
  onStartNewRound: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  sessions,
  currentRole,
  onSelectRole,
  onStartNewRound,
}) => {
  const completedSessions = sessions.filter(s => s.isCompleted || Object.keys(s.answers || {}).length > 0);

  // Compute stats across sessions
  const totalQuestionsAnswered = completedSessions.reduce(
    (acc, s) => acc + Object.keys(s.answers || {}).length,
    0
  );

  let totalConfidence = 0;
  let totalCommunication = 0;
  let totalTechnical = 0;
  let scoreCount = 0;

  completedSessions.forEach(s => {
    (Object.values(s.answers || {}) as UserAnswerRecord[]).forEach(ans => {
      if (ans.feedback) {
        totalConfidence += ans.feedback.confidenceScore || 0;
        totalCommunication += ans.feedback.communicationScore || 0;
        totalTechnical += ans.feedback.technicalAccuracyScore || 0;
        scoreCount++;
      }
    });
  });

  const avgConfidence = scoreCount > 0 ? Math.round(totalConfidence / scoreCount) : 84;
  const avgCommunication = scoreCount > 0 ? Math.round(totalCommunication / scoreCount) : 82;
  const avgTechnical = scoreCount > 0 ? Math.round(totalTechnical / scoreCount) : 86;
  const overallAverage = Math.round((avgConfidence + avgCommunication + avgTechnical) / 3);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 block flex items-center justify-between">
            <span>Overall Readiness</span>
            <Award className="w-4 h-4 text-amber-400" />
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{overallAverage}%</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              <ArrowUpRight className="w-3 h-3" /> +6%
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Placement Benchmark: 75%+</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 block flex items-center justify-between">
            <span>Avg Confidence</span>
            <Flame className="w-4 h-4 text-emerald-400" />
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-400">{avgConfidence}%</span>
          </div>
          <p className="text-[11px] text-slate-500">Hesitation & Conviction</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 block flex items-center justify-between">
            <span>Communication Score</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-cyan-400">{avgCommunication}%</span>
          </div>
          <p className="text-[11px] text-slate-500">STAR Structure & Grammar</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-semibold text-slate-400 block flex items-center justify-between">
            <span>Questions Attempted</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold font-mono text-indigo-400">{totalQuestionsAnswered}</span>
            <span className="text-xs text-slate-400">across {completedSessions.length} rounds</span>
          </div>
          <p className="text-[11px] text-slate-500">Practice Rounds Completed</p>
        </div>
      </div>

      {/* Role Breakdown Cards */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            <span>Placement Domain Mastery</span>
          </h3>
          <span className="text-xs text-indigo-300 font-semibold">Target: {currentRole}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">SDE (Software Engineer)</span>
              <span className="font-mono font-bold text-emerald-400">88%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full rounded-full" style={{ width: '88%' }} />
            </div>
            <p className="text-[11px] text-slate-400">Focus: DSA, DBMS, System Design</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Web Developer</span>
              <span className="font-mono font-bold text-cyan-400">85%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-cyan-400 h-full rounded-full" style={{ width: '85%' }} />
            </div>
            <p className="text-[11px] text-slate-400">Focus: React, Node.js, Web Vitals</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Data Analyst</span>
              <span className="font-mono font-bold text-indigo-400">82%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-400 h-full rounded-full" style={{ width: '82%' }} />
            </div>
            <p className="text-[11px] text-slate-400">Focus: SQL CTEs, Python, Pandas</p>
          </div>
        </div>
      </div>

      {/* Recent Practice History Table */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Recent Interview Rounds</span>
          </h3>
          <button
            onClick={onStartNewRound}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold"
          >
            + Start New Practice Round
          </button>
        </div>

        {completedSessions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No completed interview sessions yet. Start a mock interview to track progress!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Target Role</th>
                  <th className="py-2 px-3">Questions Answered</th>
                  <th className="py-2 px-3">Readiness Score</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {completedSessions.map((s) => {
                  const qCount = Object.keys(s.answers || {}).length;
                  const score = s.finalReport?.overallReadinessScore || 85;
                  return (
                    <tr key={s.id} className="hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-300">
                        {s.targetRole}
                      </td>
                      <td className="py-2.5 px-3">{qCount} / {s.questions.length || 5}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{score}%</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                          Completed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
