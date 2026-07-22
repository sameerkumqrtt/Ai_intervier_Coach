import React, { useState, useEffect } from 'react';
import { TargetRole, CandidateProfile, InterviewSession, UserAnswerRecord, InterviewQuestion } from './types';
import { SAMPLE_RESUMES } from './data/sampleData';
import { Navbar } from './components/Navbar';
import { RoleSelector } from './components/RoleSelector';
import { ResumeUploader } from './components/ResumeUploader';
import { InterviewRoom } from './components/InterviewRoom';
import { CodingEnvironment } from './components/CodingEnvironment';
import { FeedbackReport } from './components/FeedbackReport';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { Sparkles, ArrowRight, Bot, Play, Award, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'interview' | 'resume' | 'coding' | 'analytics'>('interview');
  const [selectedRole, setSelectedRole] = useState<TargetRole>('SDE');
  const [customRoleName, setCustomRoleName] = useState('');

  // Default candidate profile with SDE sample resume
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | undefined>(() => {
    const defaultSample = SAMPLE_RESUMES.sde_fresh_grad;
    return {
      resume: defaultSample.resume,
      targetRole: 'SDE',
      matchScore: 88,
      strengths: ['Strong Data Structures foundation', 'Java & Spring Boot backend experience', 'Redis & PostgreSQL knowledge'],
      weaknessesOrGaps: ['System design scalability trade-offs', 'Microservices monitoring'],
      recommendedFocusAreas: ['Distributed Systems', 'OS Concurrency', 'Behavioral STAR stories'],
    };
  });

  const [currentSession, setCurrentSession] = useState<InterviewSession | undefined>(undefined);
  const [allSessions, setAllSessions] = useState<InterviewSession[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Sync candidate profile role if role selector changes
  const handleSelectRole = (role: TargetRole, customName?: string) => {
    setSelectedRole(role);
    if (customName) setCustomRoleName(customName);

    if (candidateProfile) {
      setCandidateProfile({
        ...candidateProfile,
        targetRole: role,
        customRoleName: customName,
      });
    }
  };

  // Start new interview session by calling `/api/interview/start`
  const startNewInterviewSession = async (roleOverride?: TargetRole) => {
    const roleToUse = roleOverride || selectedRole;
    setIsLoadingQuestions(true);
    setIsSessionFinished(false);

    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole: roleToUse,
          customRoleName,
          candidateProfile,
        }),
      });

      const data = await res.json();
      let questions: InterviewQuestion[] = [];

      if (res.ok && data.success && Array.isArray(data.questions)) {
        questions = data.questions;
      } else {
        // Fallback standard placement questions
        questions = [
          {
            id: 'q1',
            number: 1,
            type: 'behavioral',
            role: roleToUse,
            title: 'STAR Conflict & Deadline Management',
            question: 'Tell me about a time when you faced a tight project deadline or conflicting technical priorities. How did you organize your work and communicate with your team?',
            contextHint: 'Evaluates behavioral STAR structure (Situation, Task, Action, Result) and team collaboration.',
            expectedKeywords: ['Situation', 'Action', 'Prioritization', 'Result', 'Communication'],
          },
          {
            id: 'q2',
            number: 2,
            type: 'technical',
            role: roleToUse,
            title: `${roleToUse} Core Fundamentals & Scalability`,
            question: `In the context of ${roleToUse === 'SDE' ? 'backend system performance' : roleToUse === 'Web Developer' ? 'web page rendering speed' : 'database query optimization'}, how do you handle bottleneck identification and trade-offs between memory, speed, and clean architecture?`,
            contextHint: 'Evaluates domain technical depth, time vs space trade-offs, and architectural clarity.',
            expectedKeywords: ['Indexing', 'Caching', 'Latency', 'Trade-offs', 'Bottleneck'],
          },
          {
            id: 'q3',
            number: 3,
            type: 'resume_deep_dive',
            role: roleToUse,
            title: 'Resume Project Deep-Dive',
            question: `I see in your resume you worked on "${candidateProfile?.resume?.topProjects?.[0] || 'software projects'}". Walk me through the key architectural decisions you made, what failed or broke during testing, and how you fixed it.`,
            contextHint: 'Evaluates genuine ownership, debugging skills, and technical accountability.',
            expectedKeywords: ['Architecture', 'Debugging', 'Optimization', 'Trade-offs'],
          },
          {
            id: 'q4',
            number: 4,
            type: 'system_design',
            role: roleToUse,
            title: 'System Design & High Availability',
            question: 'How would you design a rate-limiting service or query cache that handles 100,000 requests per second with sub-10ms latency?',
            contextHint: 'Evaluates concurrency, caching algorithms (Token Bucket, Leaky Bucket, Redis), and fault tolerance.',
            expectedKeywords: ['Redis', 'Rate Limiting', 'Token Bucket', 'Concurrency', 'Latency'],
          },
          {
            id: 'q5',
            number: 5,
            type: 'coding',
            role: roleToUse,
            title: 'Practical Problem Solving & Edge Cases',
            question: 'When writing code for production pipelines, how do you handle null pointers, race conditions, and boundary edge cases?',
            contextHint: 'Evaluates edge case defensive coding and production readiness.',
            expectedKeywords: ['Defensive Coding', 'Error Handling', 'Boundary Cases', 'Unit Testing'],
          },
        ];
      }

      const newSession: InterviewSession = {
        id: 'session_' + Date.now(),
        createdAt: new Date().toISOString(),
        targetRole: roleToUse,
        customRoleName,
        candidateProfile,
        questions,
        answers: {},
        currentQuestionIndex: 0,
        isCompleted: false,
      };

      setCurrentSession(newSession);
      setAllSessions(prev => [newSession, ...prev]);
    } catch (err) {
      console.error('Start interview round error:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Auto initialize first round on mount
  useEffect(() => {
    if (!currentSession) {
      startNewInterviewSession('SDE');
    }
  }, []);

  const handleAnswerEvaluated = (questionId: string, record: UserAnswerRecord) => {
    if (!currentSession) return;
    const updatedAnswers = { ...currentSession.answers };
    if (record) {
      updatedAnswers[questionId] = record;
    } else {
      delete updatedAnswers[questionId];
    }

    const updatedSession = {
      ...currentSession,
      answers: updatedAnswers,
    };

    setCurrentSession(updatedSession);
    setAllSessions(prev => prev.map(s => (s.id === updatedSession.id ? updatedSession : s)));
  };

  const handleNextQuestion = () => {
    if (!currentSession) return;
    if (currentSession.currentQuestionIndex < currentSession.questions.length - 1) {
      setCurrentSession({
        ...currentSession,
        currentQuestionIndex: currentSession.currentQuestionIndex + 1,
      });
    }
  };

  const handleFinishInterview = () => {
    if (!currentSession) return;
    setCurrentSession({
      ...currentSession,
      isCompleted: true,
    });
    setIsSessionFinished(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedRole={selectedRole}
        customRoleName={customRoleName}
        onResetSession={() => {
          setActiveTab('interview');
          startNewInterviewSession();
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: Mock Interview */}
        {activeTab === 'interview' && (
          <div className="space-y-6">
            {!isSessionFinished ? (
              <>
                {/* Role & Resume Setup Panel (Compact) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-7">
                    <RoleSelector
                      selectedRole={selectedRole}
                      onSelectRole={handleSelectRole}
                      customRoleName={customRoleName}
                    />
                  </div>

                  <div className="lg:col-span-5 bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                        <span className="font-bold text-slate-100 text-sm flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Candidate Profile Audit</span>
                        </span>
                        <button
                          onClick={() => setActiveTab('resume')}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                        >
                          Change Resume
                        </button>
                      </div>

                      {candidateProfile ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Candidate:</span>
                            <span className="font-semibold text-slate-200">{candidateProfile.resume.candidateName || 'Alex Chen'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Match Score:</span>
                            <span className="font-bold text-emerald-400 font-mono">{candidateProfile.matchScore}% Match</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Top Resume Skill:</span>
                            <span className="text-indigo-300 font-mono">{candidateProfile.resume.detectedSkills[0] || 'Java'}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Upload a resume or select a demo candidate to customize AI questions.
                        </p>
                      )}
                    </div>

                    <button
                      id="btn-start-placement-round"
                      onClick={() => startNewInterviewSession()}
                      disabled={isLoadingQuestions}
                      className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-extrabold bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start {selectedRole} Mock Interview Round</span>
                    </button>
                  </div>
                </div>

                {/* Active Interview Room Component */}
                {currentSession && (
                  <InterviewRoom
                    questions={currentSession.questions}
                    currentQuestionIndex={currentSession.currentQuestionIndex}
                    answers={currentSession.answers}
                    targetRole={selectedRole}
                    customRoleName={customRoleName}
                    candidateProfile={candidateProfile}
                    onAnswerEvaluated={handleAnswerEvaluated}
                    onNextQuestion={handleNextQuestion}
                    onFinishInterview={handleFinishInterview}
                    isLoadingQuestions={isLoadingQuestions}
                  />
                )}
              </>
            ) : (
              /* Finished Session Feedback Report */
              currentSession && (
                <FeedbackReport
                  session={currentSession}
                  onRestart={() => {
                    setIsSessionFinished(false);
                    startNewInterviewSession();
                  }}
                  onGoToCoding={() => setActiveTab('coding')}
                />
              )
            )}
          </div>
        )}

        {/* Tab 2: Resume Audit */}
        {activeTab === 'resume' && (
          <ResumeUploader
            selectedRole={selectedRole}
            customRoleName={customRoleName}
            candidateProfile={candidateProfile}
            onProfileGenerated={(profile) => {
              setCandidateProfile(profile);
            }}
          />
        )}

        {/* Tab 3: Mock Coding Environment */}
        {activeTab === 'coding' && (
          <CodingEnvironment
            targetRole={selectedRole}
            customRoleName={customRoleName}
          />
        )}

        {/* Tab 4: Placement Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            sessions={allSessions}
            currentRole={selectedRole}
            onSelectRole={handleSelectRole}
            onStartNewRound={() => {
              setActiveTab('interview');
              startNewInterviewSession();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI Interview Coach ⭐⭐⭐⭐⭐ — Empowering Students & Candidates for Placement Drives</span>
          <span className="font-mono text-slate-600">Server-Side Groq Integration</span>
        </div>
      </footer>
    </div>
  );
}
