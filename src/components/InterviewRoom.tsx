import React, { useState, useEffect } from 'react';
import { InterviewQuestion, UserAnswerRecord, AnswerFeedback, TargetRole, CandidateProfile } from '../types';
import { speakText, stopSpeaking, useSpeechRecognition } from '../utils/speech';
import {
  Mic, MicOff, Volume2, VolumeX, Send, RefreshCw, Sparkles, CheckCircle,
  AlertTriangle, ArrowRight, ShieldCheck, HelpCircle, Flame, Clock, Award, ChevronDown, ChevronUp
} from 'lucide-react';

interface InterviewRoomProps {
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, UserAnswerRecord>;
  targetRole: TargetRole;
  customRoleName?: string;
  candidateProfile?: CandidateProfile;
  onAnswerEvaluated: (questionId: string, record: UserAnswerRecord) => void;
  onNextQuestion: () => void;
  onFinishInterview: () => void;
  isLoadingQuestions?: boolean;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  targetRole,
  customRoleName,
  candidateProfile,
  onAnswerEvaluated,
  onNextQuestion,
  onFinishInterview,
  isLoadingQuestions,
}) => {
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswerRecord = currentQuestion ? answers[currentQuestion.id] : undefined;

  const [responseText, setResponseText] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const displayRole = targetRole === 'Custom' && customRoleName ? customRoleName : targetRole;

  // Speech Recognition hook
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Sync transcript to responseText when voice is active
  useEffect(() => {
    if (isListening && transcript) {
      setResponseText(transcript);
    }
  }, [transcript, isListening]);

  // Timer counting during answer phase
  useEffect(() => {
    if (!currentQuestion || currentAnswerRecord) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestion, currentAnswerRecord]);

  // Reset local state when switching question
  useEffect(() => {
    if (currentQuestion) {
      const existing = answers[currentQuestion.id];
      if (existing) {
        setResponseText(existing.userResponse);
      } else {
        setResponseText('');
        resetTranscript();
        setTimerSeconds(0);
      }
      setShowModelAnswer(false);
      setErrorMsg('');
    }
  }, [currentQuestionIndex, currentQuestion]);

  const toggleInterviewerVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else if (currentQuestion) {
      setIsSpeaking(true);
      speakText(currentQuestion.question, () => setIsSpeaking(false));
    }
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopListening();
      setIsVoiceActive(false);
    } else {
      setIsVoiceActive(true);
      startListening();
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;
    if (!responseText.trim()) {
      setErrorMsg('Please type or speak your answer before submitting.');
      return;
    }

    if (isListening) {
      stopListening();
    }
    stopSpeaking();

    setIsEvaluating(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          userResponse: responseText,
          timeSpentSeconds: timerSeconds,
          isVoiceInput: isVoiceActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Evaluation failed.');
      }

      const feedback: AnswerFeedback = data.feedback;

      const record: UserAnswerRecord = {
        questionId: currentQuestion.id,
        userResponse: responseText,
        isVoiceInput: isVoiceActive,
        timeSpentSeconds: timerSeconds,
        feedback,
      };

      onAnswerEvaluated(currentQuestion.id, record);
    } catch (err: any) {
      console.error('Answer evaluation error:', err);
      setErrorMsg(err.message || 'Error evaluating answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  if (isLoadingQuestions) {
    return (
      <div className="bg-slate-900 rounded-2xl p-12 border border-slate-800 text-center space-y-4">
        <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full w-16 h-16 mx-auto flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-slate-100">Generating Placement Questions...</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          AI is analyzing {displayRole} core topics & candidate resume projects to curate 5 placement interview rounds.
        </p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center space-y-4">
        <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">No questions loaded</h3>
        <p className="text-sm text-slate-400">Please start a new interview session from the top bar.</p>
      </div>
    );
  }

  const feedback = currentAnswerRecord?.feedback;

  return (
    <div className="space-y-6">
      {/* Top Question Progress & Category Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20 font-bold font-mono text-sm">
            Q{currentQuestionIndex + 1}/{questions.length}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100 text-base">{currentQuestion.title}</span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">
                {currentQuestion.type.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentQuestion.contextHint}</p>
          </div>
        </div>

        {/* Question Counter Dots & Timer */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentQuestionIndex;
              return (
                <div
                  key={q.id}
                  className={`w-3 h-3 rounded-full transition-all ${isAnswered
                      ? 'bg-emerald-500 ring-2 ring-emerald-500/30'
                      : isCurrent
                        ? 'bg-indigo-500 ring-2 ring-indigo-500/50 scale-110'
                        : 'bg-slate-700'
                    }`}
                  title={`Question ${idx + 1}: ${q.title}`}
                />
              );
            })}
          </div>

          <div className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Main Question Card & Interviewer Avatar */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-start space-x-4">
          {/* AI Interviewer Avatar */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 tracking-wide uppercase">
                AI Interviewer ({displayRole} Panel)
              </span>

              <button
                id="btn-speak-question"
                onClick={toggleInterviewerVoice}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Speak Question</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-lg font-medium text-slate-100 leading-relaxed">
              "{currentQuestion.question}"
            </p>

            {/* Expected Keyword Tags */}
            {currentQuestion.expectedKeywords && currentQuestion.expectedKeywords.length > 0 && (
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Keywords Evaluated:</span>
                <div className="flex flex-wrap gap-1">
                  {currentQuestion.expectedKeywords.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Answer Input Area */}
        {!feedback ? (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-200 flex items-center space-x-2">
                <span>Your Answer</span>
                <span className="text-xs text-slate-400 font-normal">
                  ({responseText.split(/\s+/).filter(Boolean).length} words)
                </span>
              </label>

              {/* Voice vs Text toggle buttons */}
              {isSupported && (
                <button
                  id="btn-toggle-mic"
                  onClick={handleToggleMic}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
                    }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Recording Voice... (Click to Pause)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Practice Speaking (Voice Mic)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <textarea
              id="answer-input-textarea"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder={
                isListening
                  ? 'Listening to your speech in real-time... Speak clearly into your microphone!'
                  : 'Type or speak your answer here. Use the STAR method (Situation, Task, Action, Result) for behavioral questions or structure technical answers clearly...'
              }
              rows={5}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all font-sans"
            />

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
                {errorMsg}
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                💡 Tip: Speak or write in full sentences. Mention core trade-offs and key metrics for top scores.
              </span>

              <button
                id="btn-submit-answer"
                onClick={handleSubmitAnswer}
                disabled={isEvaluating || !responseText.trim()}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 active:scale-95"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Evaluating Answer...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Answer for AI Review</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Detailed Answer Feedback Panel */
          <div className="space-y-6 pt-4 border-t border-slate-800 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">Overall Answer Score</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-white font-mono">{feedback.overallQuestionScore}%</span>
                  <span className="text-xs text-indigo-400 font-medium">
                    {feedback.overallQuestionScore >= 80 ? '🌟 Placement Ready' : feedback.overallQuestionScore >= 60 ? '👍 Satisfactory' : '⚠️ Needs Polish'}
                  </span>
                </div>
              </div>

              {/* 3 Metrics: Confidence, Communication, Technical */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Confidence</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{feedback.confidenceScore}%</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Communication</span>
                  <span className="font-bold text-cyan-400 font-mono text-sm">{feedback.communicationScore}%</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Technical Accuracy</span>
                  <span className="font-bold text-indigo-400 font-mono text-sm">{feedback.technicalAccuracyScore}%</span>
                </div>
              </div>
            </div>

            {/* STAR Breakdown & Fillers Detected */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* STAR Breakdown */}
              {feedback.starBreakdown && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="font-bold text-slate-200 block flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>STAR Method Structure Check</span>
                  </span>
                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-[10px] pt-1">
                    <div className={`p-1.5 rounded ${feedback.starBreakdown.situationPresent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                      Situation
                    </div>
                    <div className={`p-1.5 rounded ${feedback.starBreakdown.taskPresent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                      Task
                    </div>
                    <div className={`p-1.5 rounded ${feedback.starBreakdown.actionPresent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                      Action
                    </div>
                    <div className={`p-1.5 rounded ${feedback.starBreakdown.resultPresent ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                      Result
                    </div>
                  </div>
                  <p className="text-slate-400 text-[11px] pt-1">{feedback.starBreakdown.starFeedback}</p>
                </div>
              )}

              {/* Filler Words & Keyword Coverage */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block flex items-center space-x-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Fillers & Keyword Coverage</span>
                </span>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Filler Words Detected:</span>
                  <span className="font-bold text-amber-400">{feedback.fillerWordCount || 0} words</span>
                </div>

                {feedback.fillerWordsDetected && feedback.fillerWordsDetected.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {feedback.fillerWordsDetected.map((w, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px]">
                        "{w}"
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 text-[11px] space-y-1">
                  <div className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Hits: {feedback.keywordHits.join(', ') || 'General response'}</span>
                  </div>
                  {feedback.missingKeywords.length > 0 && (
                    <div className="flex items-center space-x-1 text-rose-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Missing: {feedback.missingKeywords.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Improvement Tips */}
            <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20 space-y-2 text-xs">
              <span className="font-bold text-indigo-300 block flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>AI Improvement Tips to Boost Your Score</span>
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {feedback.improvementTips.map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ideal Model Answer Accordion */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowModelAnswer(!showModelAnswer)}
                className="w-full flex items-center justify-between p-3.5 bg-slate-950 text-left text-xs font-bold text-slate-200 hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>View Ideal Model Answer (100% Benchmark)</span>
                </div>
                {showModelAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showModelAnswer && (
                <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
                  {feedback.idealModelAnswer}
                </div>
              )}
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  // Retry answer
                  onAnswerEvaluated(currentQuestion.id, undefined as any);
                  setResponseText('');
                }}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Retry this question
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  id="btn-next-question"
                  onClick={onNextQuestion}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-all"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="btn-finish-interview"
                  onClick={onFinishInterview}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <span>Complete Interview & View Report</span>
                  <Award className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
