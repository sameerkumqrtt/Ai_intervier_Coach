import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { InterviewSession, PlacementReport } from '../types';
import {
  Award, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw,
  Sparkles, Download, ShieldCheck, FileText, Check, TrendingUp
} from 'lucide-react';

interface FeedbackReportProps {
  session: InterviewSession;
  onRestart: () => void;
  onGoToCoding: () => void;
}

export const FeedbackReport: React.FC<FeedbackReportProps> = ({
  session,
  onRestart,
  onGoToCoding,
}) => {
  const [report, setReport] = React.useState<PlacementReport | null>(session.finalReport || null);
  const [isLoading, setIsLoading] = React.useState(!session.finalReport);

  useEffect(() => {
    if (!session.finalReport) {
      fetchReport();
    } else if (session.finalReport.overallReadinessScore >= 75) {
      triggerConfetti();
    }
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.report) {
        setReport(data.report);
        if (data.report.overallReadinessScore >= 75) {
          triggerConfetti();
        }
      }
    } catch (err) {
      console.error('Error fetching placement report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 rounded-2xl p-12 border border-slate-800 text-center space-y-4">
        <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full w-16 h-16 mx-auto flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Generating Placement Readiness Report...</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          AI is synthesizing your communication scores, confidence rating, technical precision, and STAR methodology to formulate your final hiring verdict.
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">Could not generate report</h3>
        <button onClick={fetchReport} className="px-4 py-2 bg-indigo-600 text-white text-xs rounded-xl font-bold">
          Retry Report Generation
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner Verdict */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 rounded-2xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/20 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-bold">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Campus & Lateral Placement Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Interview Evaluation: {session.targetRole}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Completed on {new Date().toLocaleDateString()} • Candidate: {session.candidateProfile?.resume?.candidateName || 'Alex Chen'}
            </p>
          </div>

          <div className="text-right sm:text-right bg-slate-950/80 p-4 rounded-xl border border-indigo-500/30">
            <span className="text-xs text-slate-400 block font-medium">Placement Readiness Score</span>
            <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-300 to-indigo-300 font-mono">
              {report.overallReadinessScore}%
            </span>
          </div>
        </div>

        {/* Verdict Badge & Score Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-center space-y-2 flex flex-col justify-center">
            <span className="text-xs text-slate-400 block font-semibold">Placement Verdict</span>
            <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-extrabold ${report.overallReadinessScore >= 80
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : report.overallReadinessScore >= 60
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
              {report.placementVerdict}
            </span>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold block">Avg Confidence</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-emerald-400">{report.confidenceAvg}%</span>
              <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${report.confidenceAvg}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold block">Avg Communication</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-cyan-400">{report.communicationAvg}%</span>
              <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${report.communicationAvg}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-semibold block">Technical Accuracy</span>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold font-mono text-indigo-400">{report.technicalAccuracyAvg}%</span>
              <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${report.technicalAccuracyAvg}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Critical Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Key Placement Strengths</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.keyStrengths.map((str, i) => (
              <li key={i} className="flex items-start space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-3">
          <h3 className="font-bold text-slate-100 text-sm flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Critical Focus Gaps</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.criticalGaps.map((gap, i) => (
              <li key={i} className="flex items-start space-x-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold">•</span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Prep Plan */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <h3 className="font-bold text-slate-100 text-base flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <span>Recommended 3-Step Action Plan for Placement Round</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.actionablePlan.map((plan, i) => (
            <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-mono text-xs font-bold flex items-center justify-center">
                  {plan.step}
                </span>
                <span className="font-bold text-xs text-slate-200">{plan.title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF Report</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={onGoToCoding}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
          >
            <span>Practice Coding Sandbox</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onRestart}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Start New Interview Round</span>
          </button>
        </div>
      </div>
    </div>
  );
};
