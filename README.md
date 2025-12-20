🤖 AI Resume Analyzer with ATS & Job Matching

1.An AI-powered Resume Analyzer that evaluates resume quality, calculates ATS scores, and compares resumes against job descriptions to identify missing skills.

2.This project simulates how modern Applicant Tracking Systems (ATS) work using AI and rule-based scoring.



🚀 Features:

✅ Resume Quality Analysis
- Calculates ATS score (0–100)
- Provides ATS score breakdown:
  - Skills Coverage
  - Experience
  - Formatting
  - Keywords
- Detects:
  - Technical skills
  - Resume sections
  - Experience and action verbs

✅ Job Description Matching
- Compares Resume vs Job Description
- Calculates Job Match Percentage
- Lists Missing Skills required for the job
- Helps users understand skill gaps clearly

✅ AI-Powered Insights
- Uses AI to extract skills from resume and job description
- Provides personalized improvement suggestions


🛠️ Tech Stack:

Frontend
- HTML
- CSS
- JavaScript

Backend
- Node.js
- Express.js

AI Integration
- OpenRouter AI (LLM-based analysis)


📂 Project Structure:

AI_resume_analyzer/
├── Frontend/
│ ├── index.html
│ ├── style.css
│ └── script.js
├── Backend/
│ ├── node_modules/
│ ├── server.js
│ ├── package.json
│ ├── package-lock.json
│ └── .gitignore


⚙️ How It Works:

1. User uploads or pastes a resume
2. User pastes a job description
3. Backend sends both inputs to AI for analysis
4. AI extracts resume skills and job requirements
5. Backend calculates:
   - ATS Resume Score
   - Job Description Match Percentage
   - Missing skills
6. Results are displayed in a clean and user-friendly UI


🔐 Environment Setup:

> Create a `.env` file inside the `Backend` folder:
> The `.env` file is ignored using `.gitignore` for security reasons.



▶️ Run the Project Locally:

Backend
```bash
cd Backend
npm install
node server.js
```

Frontend
Open Frontend/index.html using Live Server in VS Code


