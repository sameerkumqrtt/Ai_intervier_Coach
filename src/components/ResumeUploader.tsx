import React, { useState } from 'react';
import { TargetRole, CandidateProfile } from '../types';
import { SAMPLE_RESUMES } from '../data/sampleData';
import { Upload, FileText, Sparkles, CheckCircle2, AlertCircle, RefreshCw, UserCheck, Code, Award } from 'lucide-react';

interface ResumeUploaderProps {
  selectedRole: TargetRole;
  customRoleName?: string;
  candidateProfile?: CandidateProfile;
  onProfileGenerated: (profile: CandidateProfile) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  selectedRole,
  customRoleName,
  candidateProfile,
  onProfileGenerated,
}) => {
  const [rawText, setRawText] = useState(candidateProfile?.resume?.rawText || '');
  const [fileName, setFileName] = useState(candidateProfile?.resume?.fileName || '');
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const displayRole = selectedRole === 'Custom' && customRoleName ? customRoleName : selectedRole;

  // Handle direct file upload (Text, MD, PDF reading as text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      parseResumeWithAI(text, file.name);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file. Please try pasting raw resume text.');
    };
    reader.readAsText(file);
  };

  // Load sample resume for instant demo
  const loadSample = (sampleKey: string) => {
    const sample = SAMPLE_RESUMES[sampleKey];
    if (sample) {
      setFileName(sample.resume.fileName || 'Sample_Resume.pdf');
      setRawText(sample.resume.rawText);
      parseResumeWithAI(sample.resume.rawText, sample.resume.fileName);
    }
  };

  // Send to AI endpoint `/api/resume/parse`
  const parseResumeWithAI = async (textToParse: string, nameOfFile?: string) => {
    if (!textToParse.trim()) {
      setErrorMsg('Please upload or paste resume content.');
      return;
    }

    setIsParsing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/resume/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: textToParse,
          targetRole: selectedRole,
          customRoleName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      const parsed = data.profile;
      const fullProfile: CandidateProfile = {
        resume: {
          fileName: nameOfFile || 'Uploaded_Resume.pdf',
          rawText: textToParse,
          candidateName: parsed.candidateName || 'Candidate',
          detectedSkills: parsed.detectedSkills || [],
          yearsExperience: parsed.yearsExperience || 'N/A',
          topProjects: parsed.topProjects || [],
          education: parsed.education || 'N/A',
        },
        targetRole: selectedRole,
        customRoleName,
        matchScore: parsed.matchScore || 80,
        strengths: parsed.strengths || [],
        weaknessesOrGaps: parsed.weaknessesOrGaps || [],
        recommendedFocusAreas: parsed.recommendedFocusAreas || [],
      };

      onProfileGenerated(fullProfile);
    } catch (err: any) {
      console.error('Resume parsing error:', err);
      setErrorMsg(err.message || 'Error processing resume. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Upload Resume for Placement Audit</span>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
              Step 2 of 2
            </span>
          </h2>
          <p className="text-sm text-slate-400">
            Upload your resume or pick a sample candidate profile. AI will extract projects, skills, and compute a placement readiness match for <span className="text-indigo-300 font-semibold">{displayRole}</span>.
          </p>
        </div>

        {/* Preset Sample Candidate Profile Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span className="text-xs text-slate-400 font-medium">Quick Demo Resumes:</span>
          <button
            onClick={() => loadSample('sde_fresh_grad')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-colors"
          >
            SDE Fresh Grad
          </button>
          <button
            onClick={() => loadSample('web_dev_frontend')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
          >
            Web Developer
          </button>
          <button
            onClick={() => loadSample('data_analyst_grad')}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 transition-colors"
          >
            Data Analyst
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Drag & Drop Upload + Text Box */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-200">
            1. Drag & Drop Resume File or Paste Text
          </label>

          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl p-6 text-center bg-slate-950/40 transition-all">
            <input
              type="file"
              accept=".pdf,.txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-file-input"
            />
            <label htmlFor="resume-file-input" className="cursor-pointer space-y-3 block">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center border border-indigo-500/20">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  Click to browse or drop your resume file here
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PDF, TXT, MD, DOC (Text format)
                </p>
              </div>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Or paste raw resume text:</span>
              {fileName && <span className="text-indigo-400 font-mono">File: {fileName}</span>}
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your resume content here (Skills, Projects, Education, Experience)..."
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 font-mono"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center space-x-2 text-rose-400 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            id="btn-analyze-resume"
            onClick={() => parseResumeWithAI(rawText, fileName)}
            disabled={isParsing || !rawText.trim()}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            {isParsing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Resume against {displayRole}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Alignment & Extract Skills</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI Analysis Result Preview */}
        <div className="bg-slate-950/60 rounded-xl border border-slate-800 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Resume Placement Match</span>
            </h3>
            {candidateProfile && (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                <span>{candidateProfile.matchScore}% Match for {displayRole}</span>
              </div>
            )}
          </div>

          {!candidateProfile ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm">No resume analyzed yet.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Upload a file, paste resume text, or click a demo candidate profile on top to parse your skills & generate customized interview questions.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Candidate Metadata */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Candidate Name</span>
                  <span className="font-bold text-slate-100">{candidateProfile.resume.candidateName || 'Alex Chen'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Target Role</span>
                  <span className="font-semibold text-indigo-300">{displayRole}</span>
                </div>
              </div>

              {/* Detected Technical Skills */}
              <div>
                <span className="text-slate-400 font-semibold block mb-1.5 flex items-center space-x-1">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Detected Technical Skills ({candidateProfile.resume.detectedSkills.length})</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {candidateProfile.resume.detectedSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono text-[11px]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extracted Projects */}
              {candidateProfile.resume.topProjects.length > 0 && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Top Resume Projects</span>
                  <ul className="space-y-1">
                    {candidateProfile.resume.topProjects.map((proj, i) => (
                      <li key={i} className="flex items-center space-x-1.5 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{proj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Strengths & Gaps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                  <span className="font-semibold text-emerald-400 block mb-1">Key Resume Strengths</span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {candidateProfile.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <span className="font-semibold text-amber-400 block mb-1">Recommended Focus Areas</span>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {candidateProfile.recommendedFocusAreas.map((f, i) => (
                      <li key={i}>• {f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
