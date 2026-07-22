import { TargetRole, ResumeData, CodingProblem } from '../types';

export interface RoleInfo {
  role: TargetRole;
  title: string;
  badge: string;
  description: string;
  keySkills: string[];
  avgDifficulty: string;
  targetCompanies: string[];
}

export const ROLE_DEFINITIONS: RoleInfo[] = [
  {
    role: 'SDE',
    title: 'Software Development Engineer',
    badge: '⭐ Most Popular for Campus Placements',
    description: 'Data Structures & Algorithms, System Design, OOPs, DBMS, Operating Systems, and scalable backend architecture.',
    keySkills: ['Data Structures', 'Algorithms', 'System Design', 'Java / C++ / Python', 'SQL & DBMS', 'Multithreading'],
    avgDifficulty: 'Medium - Hard',
    targetCompanies: ['Google', 'Amazon', 'Microsoft', 'Atlassian', 'Flipkart', 'Uber']
  },
  {
    role: 'Web Developer',
    title: 'Full-Stack / Frontend Web Developer',
    badge: '🚀 High Demand',
    description: 'React, Node.js, Next.js, Web Performance, Async JavaScript, REST/GraphQL APIs, State Management, and CSS/Tailwind.',
    keySkills: ['React', 'JavaScript / TypeScript', 'Node.js & Express', 'Web Vitals & Performance', 'CSS3 & Tailwind', 'State Management'],
    avgDifficulty: 'Medium',
    targetCompanies: ['Meta', 'Stripe', 'Vercel', 'Swiggy', 'Zomato', 'Airbnb']
  },
  {
    role: 'Data Analyst',
    title: 'Data Analyst & BI Specialist',
    badge: '📊 High Placement Rate',
    description: 'Advanced SQL, Python (Pandas/NumPy), Data Visualization (Tableau/PowerBI), AB Testing, Statistics, and Business Metrics.',
    keySkills: ['SQL Query Optimization', 'Python Pandas & NumPy', 'A/B Testing & Statistics', 'Power BI / Tableau', 'ETL Pipelines', 'Excel Analysis'],
    avgDifficulty: 'Easy - Medium',
    targetCompanies: ['Deloitte', 'McKinsey', 'Accenture', 'JPMorgan', 'Analytic Edge', 'Fractal']
  },
  {
    role: 'DevOps / Cloud',
    title: 'DevOps & Cloud Solutions Engineer',
    badge: '☁️ Enterprise Focus',
    description: 'Docker, Kubernetes, CI/CD pipelines, AWS/GCP, Infrastructure as Code (Terraform), Monitoring & Linux Administration.',
    keySkills: ['Docker & Kubernetes', 'CI/CD Pipelines (GitHub Actions)', 'AWS / GCP / Azure', 'Terraform', 'Linux Bash Scripting', 'Prometheus & Grafana'],
    avgDifficulty: 'Medium - Hard',
    targetCompanies: ['Red Hat', 'AWS', 'Google Cloud', 'Salesforce', 'Cisco', 'IBM']
  },
  {
    role: 'Product Manager',
    title: 'Associate Product Manager (APM)',
    badge: '💡 Leadership Track',
    description: 'Product Sense, Root Cause Analysis, Metrics & KPIs, Agile/Scrum, User Journey Mapping, and Prioritization frameworks.',
    keySkills: ['Product Design & Specs', 'Metrics (North Star, DAU/MAU)', 'User Research', 'PRD Writing', 'Prioritization (RICE/Kano)', 'A/B Experimentation'],
    avgDifficulty: 'Medium',
    targetCompanies: ['Razorpay', 'CRED', 'MakeMyTrip', 'Swiggy', 'Microsoft APM', 'Google APM']
  }
];

export const SAMPLE_RESUMES: Record<string, { label: string; role: TargetRole; resume: ResumeData }> = {
  sde_fresh_grad: {
    label: 'SDE Candidate (CS Final Year)',
    role: 'SDE',
    resume: {
      fileName: 'Alex_Chen_SDE_Resume.pdf',
      candidateName: 'Alex Chen',
      rawText: `Alex Chen
Email: alex.chen@university.edu | GitHub: github.com/alexc-dev | LinkedIn: linkedin.com/in/alexc
Education: B.Tech in Computer Science & Engineering (GPA: 3.8/4.0), Expected May 2026

TECHNICAL SKILLS:
Languages: Java, C++, Python, JavaScript, SQL
Data Structures & Algorithms: Trees, Graphs, Dynamic Programming, Heap, Binary Search
Tools & Frameworks: React.js, Node.js, Spring Boot, Git, Docker, PostgreSQL, Redis

PROJECTS:
1. Distributed Task Scheduler (Java, Spring Boot, Redis, PostgreSQL)
- Developed a high-throughput job queue supporting over 10,000 requests/sec using Redis pub/sub.
- Designed idempotency mechanisms and dead-letter queues to eliminate duplicate task processing.
- Implemented rate limiting using Token Bucket algorithm with Redis scripts.

2. Real-time Collaborative Code Editor (React, WebSockets, Node.js)
- Built a multi-user code environment with Operational Transformation (OT) for simultaneous editing.
- Integrated WebSockets to achieve sub-50ms sync latency across up to 50 active room participants.

WORK EXPERIENCE:
Software Engineer Intern | TechCorp Solutions (Summer 2025)
- Optimized DB query execution time by 42% through PostgreSQL indexing and connection pooling.
- Designed RESTful API endpoints for user authorization using JWT and OAuth2 integration.`,
      detectedSkills: ['Java', 'C++', 'Python', 'Spring Boot', 'Data Structures', 'Redis', 'PostgreSQL', 'WebSockets', 'Algorithms', 'Docker'],
      yearsExperience: '1 Internships / Final Year Student',
      topProjects: ['Distributed Task Scheduler', 'Real-time Collaborative Code Editor'],
      education: 'B.Tech Computer Science (GPA 3.8/4.0)'
    }
  },

  web_dev_frontend: {
    label: 'Web Dev Candidate (Full Stack)',
    role: 'Web Developer',
    resume: {
      fileName: 'Maya_Patel_WebDev_Resume.pdf',
      candidateName: 'Maya Patel',
      rawText: `Maya Patel
Frontend & Web Developer | portfolio.mayapatel.dev | maya@devmail.io

SUMMARY:
Passionate Web Developer with 2+ years of experience building responsive, fast, and accessible web applications using React, TypeScript, Next.js, and Tailwind CSS.

SKILLS:
Frontend: React 18, TypeScript, Next.js, Tailwind CSS, Redux Toolkit, React Query, Web Vitals Optimization
Backend: Node.js, Express, MongoDB, REST APIs, GraphQL
Testing & CI/CD: Jest, React Testing Library, Cypress, GitHub Actions

PROJECTS:
1. E-Commerce Storefront & Dashboard (Next.js 14, Tailwind, Stripe)
- Engineered a server-side rendered storefront achieving 98+ Lighthouse performance score.
- Integrated Stripe payment gateway with optimistic UI updates and resilient webhook handlers.

2. Interactive Kanban Task Board (React, Redux Toolkit, Drag and Drop)
- Created drag-and-drop workflow system with persistent offline state and real-time socket sync.`,
      detectedSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'GraphQL', 'Redux'],
      yearsExperience: '2 Years Project & Freelance Experience',
      topProjects: ['E-Commerce Storefront', 'Interactive Kanban Task Board'],
      education: 'B.S. Information Technology'
    }
  },

  data_analyst_grad: {
    label: 'Data Analyst Candidate',
    role: 'Data Analyst',
    resume: {
      fileName: 'Rohan_Sharma_DataAnalyst.pdf',
      candidateName: 'Rohan Sharma',
      rawText: `Rohan Sharma
Data Analyst & BI Enthusiast | rohan.analyst@gmail.com | LinkedIn: rohanshar ma-data

SKILLS:
Data Analysis: SQL (Window functions, CTEs, Aggregations), Python (Pandas, NumPy, Matplotlib, Seaborn)
BI & Visualization: Power BI, Tableau, Excel (VBA, Pivot Tables, Advanced Formulas)
Statistical Methods: A/B Testing, Regression Analysis, Hypothesis Testing, Cohort Analysis

PROJECTS:
1. E-Commerce Customer Churn & Cohort Analysis (Python, SQL, Power BI)
- Analyzed 500k+ customer transactions to identify top churn drivers, improving retention insights by 25%.
- Built an executive Power BI dashboard with dynamic filtering and automated refresh pipelines.

2. Supply Chain Optimization Dashboard (SQL, Tableau)
- Wrote complex SQL queries with CTEs and window functions to pinpoint logistics bottlenecks.`,
      detectedSkills: ['SQL', 'Python', 'Pandas', 'Power BI', 'Tableau', 'Excel', 'A/B Testing', 'Cohort Analysis', 'ETL'],
      yearsExperience: 'Final Year / Analyst Intern',
      topProjects: ['E-Commerce Customer Churn Analysis', 'Supply Chain Optimization Dashboard'],
      education: 'B.S. Statistics & Economics'
    }
  }
};

export const SAMPLE_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'sde_1',
    title: 'Two Sum - Optimal Hash Mapping',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description: 'Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]'
      }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`
    },
    testCases: [
      { id: 't1', input: '[[2, 7, 11, 15], 9]', expectedOutput: '[0, 1]' },
      { id: 't2', input: '[[3, 2, 4], 6]', expectedOutput: '[1, 2]' },
      { id: 't3', input: '[[3, 3], 6]', expectedOutput: '[0, 1]' }
    ]
  },
  {
    id: 'web_1',
    title: 'URL Query String Parser & Serializer',
    difficulty: 'Easy',
    category: 'Strings & Objects',
    description: 'Implement a function `parseQueryString(url)` that takes a full URL string and returns an object containing decoded key-value pairs from the query string parameters.',
    constraints: [
      'URL can have 0 or more query parameters.',
      'Keys and values should be URI decoded.',
      'Return an empty object if no query string exists.'
    ],
    examples: [
      {
        input: 'url = "https://app.com/search?role=SDE&page=2&q=react%20hooks"',
        output: '{"role": "SDE", "page": "2", "q": "react hooks"}'
      }
    ],
    starterCode: {
      javascript: `function parseQueryString(url) {
  // Your code here
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) return {};
  const queryString = url.substring(queryIndex + 1);
  const result = {};
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    if (!pair) continue;
    const [key, val] = pair.split('=');
    result[decodeURIComponent(key)] = val ? decodeURIComponent(val) : '';
  }
  return result;
}`,
      typescript: `function parseQueryString(url: string): Record<string, string> {
  const queryIndex = url.indexOf('?');
  if (queryIndex === -1) return {};
  const queryString = url.substring(queryIndex + 1);
  const result: Record<string, string> = {};
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    if (!pair) continue;
    const [key, val] = pair.split('=');
    result[decodeURIComponent(key)] = val ? decodeURIComponent(val) : '';
  }
  return result;
}`,
      python: `def parse_query_string(url):
    from urllib.parse import parse_qs, urlparse
    parsed = urlparse(url)
    params = parse_qs(parsed.query)
    return {k: v[0] for k, v in params.items()}`
    },
    testCases: [
      { id: 't1', input: '["https://api.com/v1/users?role=SDE&status=active"]', expectedOutput: '{"role":"SDE","status":"active"}' },
      { id: 't2', input: '["https://example.com/about"]', expectedOutput: '{}' }
    ]
  },
  {
    id: 'data_1',
    title: 'Calculate Moving Averages & Percentiles',
    difficulty: 'Medium',
    category: 'Data Analytics & Statistics',
    description: 'Given an array of daily transaction amounts `sales`, calculate the 3-day moving average for each day starting from day 3. Return an array rounded to 2 decimal places.',
    constraints: [
      'sales length >= 3',
      'Return empty array if length < 3'
    ],
    examples: [
      {
        input: 'sales = [100, 200, 300, 400, 500]',
        output: '[200, 300, 400]',
        explanation: 'Day 3 avg = (100+200+300)/3 = 200; Day 4 avg = (200+300+400)/3 = 300; Day 5 avg = (300+400+500)/3 = 400.'
      }
    ],
    starterCode: {
      javascript: `function calculate3DayMovingAvg(sales) {
  // Your code here
  if (!sales || sales.length < 3) return [];
  const result = [];
  for (let i = 2; i < sales.length; i++) {
    const sum = sales[i - 2] + sales[i - 1] + sales[i];
    result.push(Number((sum / 3).toFixed(2)));
  }
  return result;
}`,
      typescript: `function calculate3DayMovingAvg(sales: number[]): number[] {
  if (!sales || sales.length < 3) return [];
  const result: number[] = [];
  for (let i = 2; i < sales.length; i++) {
    const sum = sales[i - 2] + sales[i - 1] + sales[i];
    result.push(Number((sum / 3).toFixed(2)));
  }
  return result;
}`,
      python: `def calculate_3day_moving_avg(sales):
    if len(sales) < 3:
        return []
    res = []
    for i in range(2, len(sales)):
        avg = round((sales[i-2] + sales[i-1] + sales[i]) / 3.0, 2)
        res.append(avg)
    return res`
    },
    testCases: [
      { id: 't1', input: '[[100, 200, 300, 400, 500]]', expectedOutput: '[200,300,400]' },
      { id: 't2', input: '[[10, 20, 30]]', expectedOutput: '[20]' }
    ]
  }
];
