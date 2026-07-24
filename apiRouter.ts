import { Router } from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const groqApiKey = process.env.GROQ_API_KEY;

// Unified LLM caller using Groq API (e.g., llama-3.3-70b-versatile)
async function generateJsonFromLLM(prompt: string, systemInstruction?: string) {
  if (!groqApiKey || !groqApiKey.trim()) {
    throw new Error('GROQ_API_KEY is not configured.');
  }
  try {
    const groq = new Groq({ apiKey: groqApiKey.trim() });
    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction + '\nCRITICAL: Respond ONLY with valid, raw JSON.' });
    } else {
      messages.push({ role: 'system', content: 'Respond ONLY with valid, raw JSON.' });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const text = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(text.trim());
  } catch (groqErr: any) {
    console.error('Groq API error:', groqErr?.message || groqErr);
    throw groqErr;
  }
}

// 1. Resume Parsing & Role Alignment Endpoint
router.post('/resume/parse', async (req, res) => {
  try {
    const { resumeText, targetRole, customRoleName } = req.body;
    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({ error: 'Resume text is required' });
    }

    const roleName = targetRole === 'Custom' && customRoleName ? customRoleName : targetRole;

    const systemInstruction = `You are a Senior Technical Recruiter & Hiring Manager at a top Tech firm specializing in campus and lateral placements for ${roleName}. Parse the provided candidate resume text, extract key info, align with the ${roleName} role requirements, and output strict JSON.`;

    const prompt = `Analyze this resume for the role of "${roleName}":

Resume Text:
"""
${resumeText.slice(0, 8000)}
"""

Evaluate candidate match, skills, gaps, and output strict JSON with this structure:
{
  "candidateName": string or "Candidate",
  "detectedSkills": array of string (up to 12 key technical skills),
  "yearsExperience": string summary (e.g. "Final Year Student / 2 Internships"),
  "topProjects": array of string (top project titles),
  "education": string,
  "matchScore": number (0 to 100 placement readiness score for ${roleName}),
  "strengths": array of 3-4 specific strength strings,
  "weaknessesOrGaps": array of 2-3 specific gap strings for ${roleName},
  "recommendedFocusAreas": array of 3 specific topics candidate must study for interviews
}`;

    const parsed = await generateJsonFromLLM(prompt, systemInstruction);
    res.json({ success: true, profile: parsed });
  } catch (err: any) {
    console.error('Resume parse error:', err);
    res.status(500).json({ error: 'Failed to parse resume: ' + (err.message || 'Server error') });
  }
});

// 2. Start Interview - Generate Tailored Questions
router.post('/interview/start', async (req, res) => {
  try {
    const { targetRole, customRoleName, candidateProfile } = req.body;
    const roleName = targetRole === 'Custom' && customRoleName ? customRoleName : targetRole;

    const skillsContext = candidateProfile?.resume?.detectedSkills?.join(', ') || 'General Core Computer Science';
    const projectsContext = candidateProfile?.resume?.topProjects?.join(', ') || 'Academic Projects';

    const systemInstruction = `You are an expert AI Interviewer conducting a realistic, placement-focused interview for a ${roleName} position. Generate 5 distinct, highly relevant, realistic interview questions.`;

    const prompt = `Generate a structured set of 5 interview questions for a ${roleName} candidate.
Candidate Skills: ${skillsContext}
Candidate Projects: ${projectsContext}

Questions structure:
1. Behavioral Question (STAR format expected, e.g. handling team conflict, tough deadline, technical decision)
2. Core Technical Question (Fundamental domain concepts for ${roleName})
3. Resume Project Deep-Dive (Probing architecture, decisions, or trade-offs in candidate projects)
4. Advanced Problem Solving / Architecture Question
5. Practical Coding / Analytical Challenge Question

Return JSON array of 5 questions with this structure:
[
  {
    "id": "q1",
    "number": 1,
    "type": "behavioral" | "technical" | "resume_deep_dive" | "system_design" | "coding",
    "role": "${targetRole}",
    "title": "Short descriptive title",
    "question": "Full realistic interview question text",
    "contextHint": "Quick tip on what the interviewer is evaluating",
    "expectedKeywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
  },
  ...
]`;

    const questions = await generateJsonFromLLM(prompt, systemInstruction);
    res.json({ success: true, questions });
  } catch (err: any) {
    console.error('Start interview error:', err);
    res.status(500).json({ error: 'Failed to generate questions: ' + (err.message || 'Server error') });
  }
});

// 3. Evaluate Candidate Answer (Text or Speech Transcript)
router.post('/interview/evaluate', async (req, res) => {
  try {
    const { question, userResponse, timeSpentSeconds, isVoiceInput } = req.body;
    if (!question || !userResponse) {
      return res.status(400).json({ error: 'Question and candidate response are required.' });
    }

    const systemInstruction = `You are a strict yet encouraging Lead Technical Interviewer & HR Assessor evaluating a candidate's answer for a placement interview. Evaluate the response thoroughly, rate confidence and communication, detect filler words, check keyword coverage, evaluate STAR methodology if behavioral, and provide model answers and improvement tips.`;

    const prompt = `Evaluate the candidate's answer to this interview question:

Target Role: ${question.role}
Question Type: ${question.type}
Question Title: "${question.title}"
Interview Question: "${question.question}"
Expected Keywords: ${JSON.stringify(question.expectedKeywords || [])}

Candidate's Answer (${isVoiceInput ? 'Spoken via Voice' : 'Typed Text'}, duration: ${timeSpentSeconds || 30}s):
"""
${userResponse}
"""

Provide a detailed evaluation in strict JSON format:
{
  "technicalAccuracyScore": number (0 to 100),
  "communicationScore": number (0 to 100 based on structure, clarity, grammar, articulation),
  "confidenceScore": number (0 to 100 based on answer conviction, directness, lack of extreme hesitation),
  "overallQuestionScore": number (0 to 100 weighted average),
  "fillerWordsDetected": array of strings found in answer (e.g. ["um", "uh", "you know", "basically", "like", "actually"]),
  "fillerWordCount": number of filler word instances,
  "keywordHits": array of strings (expected keywords present in answer),
  "missingKeywords": array of strings (important domain concepts missing),
  "strengths": array of 2-3 specific positive aspects of their response,
  "areasToImprove": array of 2-3 specific critique points,
  "starBreakdown": {
    "situationPresent": boolean,
    "taskPresent": boolean,
    "actionPresent": boolean,
    "resultPresent": boolean,
    "starFeedback": "Feedback on STAR usage"
  },
  "idealModelAnswer": "A top-scoring, polished sample response that gets 100%",
  "improvementTips": array of 3 actionable bullet tips for the candidate to score higher next time
}`;

    const feedback = await generateJsonFromLLM(prompt, systemInstruction);
    res.json({ success: true, feedback });
  } catch (err: any) {
    console.error('Evaluate answer error:', err);
    res.status(500).json({ error: 'Failed to evaluate answer: ' + (err.message || 'Server error') });
  }
});

// 4. Generate Role-Specific Coding Challenge
router.post('/coding/generate', async (req, res) => {
  try {
    const { role, difficulty = 'Medium', topic } = req.body;

    const systemInstruction = `You are a Lead Data Structures & Algorithms Problem Setter for Top Tech Placement Drives. Generate an original, high-quality coding problem tailored for a ${role} candidate at ${difficulty} level.`;

    const prompt = `Generate a complete coding problem for a ${role} interview (${difficulty} difficulty ${topic ? 'focusing on ' + topic : ''}).

Output strict JSON structure:
{
  "id": "code_" + random_id,
  "title": "Problem Title",
  "difficulty": "${difficulty}",
  "category": "e.g. Arrays / Strings / Dynamic Programming / Web DOM / SQL Data",
  "description": "Clear problem statement with inputs and expected output.",
  "constraints": ["1 <= N <= 10^5", "Space complexity O(N)"],
  "examples": [
    { "input": "...", "output": "...", "explanation": "..." }
  ],
  "starterCode": {
    "javascript": "function solve(...) { \\n  // Write solution here\\n}",
    "typescript": "function solve(...): ... { \\n  // Write solution here\\n}",
    "python": "def solve(...):\\n    # Write solution here\\n    pass"
  },
  "testCases": [
    { "id": "t1", "input": "[[2, 7, 11, 15], 9]", "expectedOutput": "[0, 1]" },
    { "id": "t2", "input": "[[3, 2, 4], 6]", "expectedOutput": "[1, 2]" },
    { "id": "t3", "input": "[[3, 3], 6]", "expectedOutput": "[0, 1]", "isHidden": true }
  ]
}`;

    const problem = await generateJsonFromLLM(prompt, systemInstruction);
    res.json({ success: true, problem });
  } catch (err: any) {
    console.error('Generate coding challenge error:', err);
    res.status(500).json({ error: 'Failed to generate coding problem: ' + (err.message || 'Server error') });
  }
});

// 5. Code Review & Complexity Analysis
router.post('/coding/review', async (req, res) => {
  try {
    const { problem, code, language, executionResults } = req.body;

    const systemInstruction = `You are a Senior Principal Engineer reviewing code submitted by a candidate during an online coding assessment round. Provide accurate Big-O analysis, code quality critique, and edge case evaluation.`;

    const prompt = `Review this code submission:
Problem: ${problem?.title || 'Coding Challenge'}
Language: ${language}
Test Cases Status: ${executionResults?.passedAll ? 'Passed All Tests' : `${executionResults?.passedTests}/${executionResults?.totalTests} Passed`}

Code Submitted:
\`\`\`${language}
${code}
\`\`\`

Return JSON with:
{
  "timeComplexity": "e.g. O(N) or O(N log N)",
  "spaceComplexity": "e.g. O(1) or O(N)",
  "explanation": "Brief explanation of how the time and space complexity was calculated",
  "codeQualityRating": number (0 to 100),
  "strengths": array of 2 bullet points,
  "potentialBugsOrEdgeCases": array of 2 edge case bullet points,
  "optimizationSuggestions": "Actionable feedback on how to make the code cleaner or faster"
}`;

    const review = await generateJsonFromLLM(prompt, systemInstruction);
    res.json({ success: true, review });
  } catch (err: any) {
    console.error('Code review error:', err);
    res.status(500).json({ error: 'Failed to review code: ' + (err.message || 'Server error') });
  }
});

// 6. Generate Placement Readiness Report
router.post('/report/generate', async (req, res) => {
  try {
    const { session } = req.body;
    if (!session) {
      return res.status(400).json({ error: 'Session data is required' });
    }

    const systemInstruction = `You are the Lead Placement Director at a top institute. Review the completed mock interview session and provide a final verdict and personalized preparation roadmap.`;

    const prompt = `Analyze this interview session and generate a placement report:
Role: ${session.targetRole}
Answers Count: ${Object.keys(session.answers || {}).length}
Answer Details: ${JSON.stringify(session.answers || {})}

Output strict JSON:
{
  "overallReadinessScore": number (0 to 100),
  "confidenceAvg": number (0 to 100),
  "communicationAvg": number (0 to 100),
  "technicalAccuracyAvg": number (0 to 100),
  "placementVerdict": "Hired / Highly Recommended" | "Strong Potential (Minor Polish)" | "Needs Targeted Practice",
  "keyStrengths": array of 3 strings,
  "criticalGaps": array of 3 strings,
  "actionablePlan": [
    { "step": 1, "title": "...", "description": "..." },
    { "step": 2, "title": "...", "description": "..." },
    { "step": 3, "title": "...", "description": "..." }
  ]
}`;

    const report = await generateJsonFromLLM(prompt, systemInstruction);
    res.json({ success: true, report });
  } catch (err: any) {
    console.error('Report generation error:', err);
    res.status(500).json({ error: 'Failed to generate report: ' + (err.message || 'Server error') });
  }
});

export default router;
