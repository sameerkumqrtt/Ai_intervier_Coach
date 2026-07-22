import React from 'react';
import { Sparkles, Bot, FileText, Code2, BarChart2, Award, RotateCcw } from 'lucide-react';
import { TargetRole } from '../types';

interface NavbarProps {
  activeTab: 'interview' | 'resume' | 'coding' | 'analytics';
  setActiveTab: (tab: 'interview' | 'resume' | 'coding' | 'analytics') => void;
  selectedRole: TargetRole;
  customRoleName?: string;
  onResetSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedRole,
  customRoleName,
  onResetSession,
}) => {
  const displayRole = selectedRole === 'Custom' && customRoleName ? customRoleName : selectedRole;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('interview')}>
            <div className="p-2 bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  AI Interview Coach
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  ⭐⭐⭐⭐⭐ Best for Placements
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Role-Tailored Practice • Real-Time AI Feedback • Mock Coding Suite
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="nav-btn-interview"
              onClick={() => setActiveTab('interview')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'interview'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Mock Interview</span>
            </button>

            <button
              id="nav-btn-resume"
              onClick={() => setActiveTab('resume')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'resume'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Resume Audit</span>
            </button>

            <button
              id="nav-btn-coding"
              onClick={() => setActiveTab('coding')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'coding'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Coding Sandbox</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                Live
              </span>
            </button>

            <button
              id="nav-btn-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Placement Metrics</span>
            </button>
          </nav>

          {/* Right Action & Active Role Badge */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300">
              <Award className="w-3.5 h-3.5 text-indigo-400" />
              <span>Role:</span>
              <span className="font-semibold text-indigo-300">{displayRole}</span>
            </div>

            <button
              id="btn-new-round"
              onClick={onResetSession}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 shadow-sm"
              title="Start a new interview session"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>New Round</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('interview')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'interview' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Interview</span>
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'resume' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Resume</span>
          </button>
          <button
            onClick={() => setActiveTab('coding')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'coding' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Coding</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'analytics' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Metrics</span>
          </button>
        </div>
      </div>
    </header>
  );
};
