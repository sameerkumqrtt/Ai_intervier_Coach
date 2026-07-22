export type TargetRole = 'SDE' | 'Web Developer' | 'Data Analyst' | 'DevOps / Cloud' | 'Product Manager' | 'Custom';

export interface ResumeData {
  fileName?: string;
  rawText: string;
  candidateName?: string;
  detectedSkills: string[];
  yearsExperience?: string;
  topProjects: string[];
  education?: string;
}

export interface CandidateProfile {
  resume: ResumeData;
  targetRole: TargetRole;
  customRoleName?: string;
  matchScore: number; // 0-100
  strengths: string[];
  weaknessesOrGaps: string[];
  recommendedFocusAreas: string[];
}

export type QuestionType = 'technical' | 'behavioral' | 'resume_deep_dive' | 'coding' | 'system_design';

export interface InterviewQuestion {
  id: string;
  number: number;
  type: QuestionType;
  role: TargetRole;
  title: string;
  question: string;
  contextHint?: string;
  expectedKeywords: string[];
  sampleStarFramework?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  codingProblem?: CodingProblem;
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    javascript: string;
    python: string;
    typescript: string;
  };
  testCases: {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden?: boolean;
  }[];
}

export interface AnswerFeedback {
  technicalAccuracyScore: number; // 0 - 100
  communicationScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  overallQuestionScore: number; // 0 - 100
  fillerWordsDetected: string[];
  fillerWordCount: number;
  keywordHits: string[];
  missingKeywords: string[];
  strengths: string[];
  areasToImprove: string[];
  starBreakdown?: {
    situationPresent: boolean;
    taskPresent: boolean;
    actionPresent: boolean;
    resultPresent: boolean;
    starFeedback: string;
  };
  idealModelAnswer: string;
  improvementTips: string[];
}

export interface UserAnswerRecord {
  questionId: string;
  userResponse: string;
  isVoiceInput: boolean;
  timeSpentSeconds: number;
  feedback?: AnswerFeedback;
  codeSubmission?: {
    language: string;
    code: string;
    passedAllTests: boolean;
    testsPassedRatio: string;
    complexityAnalysis?: {
      timeComplexity: string;
      spaceComplexity: string;
      explanation: string;
    };
  };
}

export interface InterviewSession {
  id: string;
  createdAt: string;
  targetRole: TargetRole;
  customRoleName?: string;
  candidateProfile?: CandidateProfile;
  questions: InterviewQuestion[];
  answers: Record<string, UserAnswerRecord>;
  currentQuestionIndex: number;
  isCompleted: boolean;
  finalReport?: PlacementReport;
}

export interface PlacementReport {
  sessionId: string;
  completedAt: string;
  targetRole: TargetRole;
  overallReadinessScore: number; // 0 - 100
  confidenceAvg: number;
  communicationAvg: number;
  technicalAccuracyAvg: number;
  placementVerdict: 'Hired / Highly Recommended' | 'Strong Potential (Minor Polish)' | 'Needs Targeted Practice';
  keyStrengths: string[];
  criticalGaps: string[];
  actionablePlan: {
    step: number;
    title: string;
    description: string;
  }[];
}

export interface CodeExecutionDetail {
  testId: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
  logs?: string[];
}

export interface CodeExecutionResult {
  passedAll: boolean;
  totalTests: number;
  passedTests: number;
  details: CodeExecutionDetail[];
  consoleLogs: string[];
  executionTimeMs: number;
}
