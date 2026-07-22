import React, { useState } from 'react';
import { CodingProblem, CodeExecutionResult, TargetRole } from '../types';
import { SAMPLE_CODING_PROBLEMS } from '../data/sampleData';
import { executeJavaScript } from '../utils/codeRunner';
import {
  Code2, Play, RefreshCw, CheckCircle2, XCircle, Sparkles, Terminal,
  Lightbulb, Layers, HelpCircle, FileCode, Clock
} from 'lucide-react';

interface CodingEnvironmentProps {
  targetRole: TargetRole;
  customRoleName?: string;
}

export const CodingEnvironment: React.FC<CodingEnvironmentProps> = ({
  targetRole,
  customRoleName,
}) => {
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(SAMPLE_CODING_PROBLEMS[0]);
  const [language, setLanguage] = useState<'javascript' | 'typescript' | 'python'>('javascript');
  const [code, setCode] = useState<string>(SAMPLE_CODING_PROBLEMS[0].starterCode.javascript);
  const [activeTab, setActiveTab] = useState<'tests' | 'console' | 'ai_review'>('tests');

  const [executionResult, setExecutionResult] = useState<CodeExecutionResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [aiReview, setAiReview] = useState<any>(null);
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [aiHint, setAiHint] = useState<string>('');
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);

  const displayRole = targetRole === 'Custom' && customRoleName ? customRoleName : targetRole;

  // Handle problem switch
  const handleSelectProblem = (p: CodingProblem) => {
    setSelectedProblem(p);
    setCode(p.starterCode[language] || p.starterCode.javascript);
    setExecutionResult(null);
    setAiReview(null);
    setAiHint('');
  };

  // Handle Language switch
  const handleLanguageChange = (lang: 'javascript' | 'typescript' | 'python') => {
    setLanguage(lang);
    setCode(selectedProblem.starterCode[lang] || selectedProblem.starterCode.javascript);
    setExecutionResult(null);
  };

  // Execute Code Locally against Test Cases
  const handleRunCode = () => {
    setIsCompiling(true);
    setActiveTab('tests');

    setTimeout(() => {
      try {
        const res = executeJavaScript(code, selectedProblem.testCases);
        setExecutionResult(res);
      } catch (err: any) {
        console.error('Execution error:', err);
      } finally {
        setIsCompiling(false);
      }
    }, 150);
  };

  // Generate dynamic AI problem
  const handleGenerateAiProblem = async () => {
    setIsGeneratingProblem(true);
    try {
      const res = await fetch('/api/coding/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: displayRole, difficulty: 'Medium' }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.problem) {
        setSelectedProblem(data.problem);
        setCode(data.problem.starterCode[language] || data.problem.starterCode.javascript);
        setExecutionResult(null);
        setAiReview(null);
        setAiHint('');
      }
    } catch (err) {
      console.error('Error generating coding problem:', err);
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  // Request AI Complexity Review
  const handleRequestAiReview = async () => {
    if (!executionResult) {
      handleRunCode();
    }

    setIsAiReviewing(true);
    setActiveTab('ai_review');

    try {
      const res = await fetch('/api/coding/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: selectedProblem,
          code,
          language,
          executionResults: executionResult,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAiReview(data.review);
      }
    } catch (err) {
      console.error('Error getting code review:', err);
    } finally {
      setIsAiReviewing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Problem Header & Toolbar */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100 text-sm sm:text-base">{selectedProblem.title}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedProblem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {selectedProblem.difficulty}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {selectedProblem.category}
              </span>
            </div>
            <p className="text-xs text-slate-400">Mock Placement Coding Assessment Round</p>
          </div>
        </div>

        {/* Problem Selector Dropdown & AI Problem Generator */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <select
            value={selectedProblem.id}
            onChange={(e) => {
              const p = SAMPLE_CODING_PROBLEMS.find(item => item.id === e.target.value);
              if (p) handleSelectProblem(p);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {SAMPLE_CODING_PROBLEMS.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>

          <button
            id="btn-generate-ai-problem"
            onClick={handleGenerateAiProblem}
            disabled={isGeneratingProblem}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
          >
            {isGeneratingProblem ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>Generate AI Challenge</span>
          </button>
        </div>
      </div>

      {/* Main Split Grid: Problem Statement (Left) vs Code Editor & Test Runner (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Problem Description & Examples (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4 overflow-y-auto max-h-[700px]">
          <div>
            <h3 className="font-bold text-slate-100 text-sm mb-2">Problem Description</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
              {selectedProblem.description}
            </p>
          </div>

          {/* Constraints */}
          {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-200 block">Constraints:</span>
              <ul className="space-y-1 text-[11px] text-slate-400 font-mono">
                {selectedProblem.constraints.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Examples */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-200 block">Examples:</span>
            {selectedProblem.examples.map((ex, i) => (
              <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="text-slate-400">
                  <span className="text-indigo-400 font-semibold">Input:</span> {ex.input}
                </div>
                <div className="text-slate-400">
                  <span className="text-emerald-400 font-semibold">Output:</span> {ex.output}
                </div>
                {ex.explanation && (
                  <p className="text-[11px] text-slate-500 font-sans italic pt-1">
                    Explanation: {ex.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* AI Hint Section */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <button
              onClick={() => setAiHint(selectedProblem.category + ': Think about hash map frequency tracking or sliding window pointer optimization.')}
              className="flex items-center space-x-1.5 text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Need an Algorithm Hint?</span>
            </button>
            {aiHint && (
              <p className="p-2.5 bg-amber-500/10 text-amber-300 rounded-lg border border-amber-500/20 text-xs">
                💡 {aiHint}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Test Suite (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            {/* Editor Top Bar */}
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">Solution Editor</span>
                
                {/* Language Selector */}
                <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                  <button
                    onClick={() => handleLanguageChange('javascript')}
                    className={`px-2 py-0.5 rounded ${language === 'javascript' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    JavaScript
                  </button>
                  <button
                    onClick={() => handleLanguageChange('typescript')}
                    className={`px-2 py-0.5 rounded ${language === 'typescript' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    TypeScript
                  </button>
                  <button
                    onClick={() => handleLanguageChange('python')}
                    className={`px-2 py-0.5 rounded ${language === 'python' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    Python
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  id="btn-run-tests"
                  onClick={handleRunCode}
                  disabled={isCompiling}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isCompiling ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>Run Tests</span>
                </button>

                <button
                  id="btn-ai-code-review"
                  onClick={handleRequestAiReview}
                  disabled={isAiReviewing}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Review</span>
                </button>
              </div>
            </div>

            {/* Code Textarea with line numbers */}
            <div className="relative bg-slate-950 font-mono text-xs">
              <textarea
                id="code-editor-textarea"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                spellCheck={false}
                className="w-full bg-slate-950 text-indigo-100 p-4 focus:outline-none leading-relaxed font-mono resize-none border-none"
              />
            </div>
          </div>

          {/* Test Results & Output Panel */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl p-4 space-y-3">
            {/* Tabs */}
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-2 text-xs font-bold">
              <button
                onClick={() => setActiveTab('tests')}
                className={`flex items-center space-x-1.5 pb-1 border-b-2 transition-all ${
                  activeTab === 'tests' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Test Cases ({executionResult ? `${executionResult.passedTests}/${executionResult.totalTests}` : selectedProblem.testCases.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('console')}
                className={`flex items-center space-x-1.5 pb-1 border-b-2 transition-all ${
                  activeTab === 'console' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Console Logs</span>
              </button>

              <button
                onClick={() => setActiveTab('ai_review')}
                className={`flex items-center space-x-1.5 pb-1 border-b-2 transition-all ${
                  activeTab === 'ai_review' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Big-O Complexity & AI Review</span>
              </button>

              {executionResult && (
                <span className="ml-auto text-[11px] font-mono text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{executionResult.executionTimeMs}ms</span>
                </span>
              )}
            </div>

            {/* Tab Contents */}
            {activeTab === 'tests' && (
              <div>
                {!executionResult ? (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    Click "Run Tests" to compile and execute your code against real test cases.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {executionResult.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                          detail.passed
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                            : 'bg-rose-500/5 border-rose-500/20 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="flex items-center space-x-1.5">
                            {detail.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-400" />
                            )}
                            <span>Test Case #{idx + 1}</span>
                          </span>
                          <span className={detail.passed ? 'text-emerald-400' : 'text-rose-400'}>
                            {detail.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-slate-400">
                          <div>
                            <span className="block text-[10px] text-slate-500">Input</span>
                            <span className="truncate block text-slate-300">{detail.input}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500">Expected Output</span>
                            <span className="truncate block text-emerald-300">{detail.expected}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-500">Actual Output</span>
                            <span className={`truncate block ${detail.passed ? 'text-emerald-300' : 'text-rose-300'}`}>
                              {detail.actual}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'console' && (
              <div className="bg-slate-950 p-3 rounded-xl font-mono text-xs text-slate-300 min-h-[100px] max-h-[200px] overflow-y-auto">
                {!executionResult?.consoleLogs || executionResult.consoleLogs.length === 0 ? (
                  <span className="text-slate-600">Console output empty. Use console.log() in your function.</span>
                ) : (
                  executionResult.consoleLogs.map((log, i) => <div key={i}>&gt; {log}</div>)
                )}
              </div>
            )}

            {activeTab === 'ai_review' && (
              <div>
                {isAiReviewing ? (
                  <div className="py-8 text-center text-indigo-400 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-400" />
                    <p className="text-xs">Analyzing code algorithm complexity & edge cases...</p>
                  </div>
                ) : !aiReview ? (
                  <div className="py-6 text-center text-slate-500 text-xs space-y-2">
                    <Sparkles className="w-6 h-6 mx-auto text-slate-600" />
                    <p>Click "AI Review" above to get Big-O time & space complexity analysis and refactoring tips.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Time Complexity</span>
                        <span className="font-bold font-mono text-indigo-400 text-sm">{aiReview.timeComplexity}</span>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Space Complexity</span>
                        <span className="font-bold font-mono text-cyan-400 text-sm">{aiReview.spaceComplexity}</span>
                      </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                      {aiReview.explanation}
                    </p>

                    {aiReview.optimizationSuggestions && (
                      <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/20 space-y-1">
                        <span className="font-bold text-indigo-300 block">AI Refactoring Recommendation:</span>
                        <p className="text-slate-300">{aiReview.optimizationSuggestions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
