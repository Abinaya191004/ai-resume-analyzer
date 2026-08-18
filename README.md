# 🤖 AI Resume Analyzer with ATS & Job Matching

An AI-powered Resume Analyzer that evaluates resume quality, generates an **ATS score**, analyzes skills and experience, and compares a resume with a **Job Description** to identify missing skills and improvement areas.

The project combines **AI-powered analysis with structured ATS evaluation** to simulate how modern Applicant Tracking Systems can evaluate resumes.

## 🚀 Features

### 📄 Resume Analysis

* Upload a PDF resume or provide resume text
* Extracts resume content automatically
* Generates an ATS score from **0–100**
* Provides detailed score breakdown:

  * Skills Match
  * Experience
  * Formatting
  * Keywords

### 🧠 AI-Powered Analysis

* Detects technical skills
* Identifies job titles and experience
* Analyzes action verbs
* Identifies areas for improvement
* Generates personalized resume suggestions

### 💼 Job Description Matching

* Compare resume against a job description
* Identify relevant skills
* Detect missing skills
* Analyze alignment between resume and job requirements
* Helps users understand their skill gaps

### 📊 ATS Insights

* Overall Resume Score
* ATS Score Breakdown
* Skills Detected
* Areas for Improvement
* AI-generated Suggestions

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS
* Axios

### Backend

* Node.js
* Express.js
* Multer
* PDF Parse
* Axios

### AI Integration

* Groq API
* Large Language Model (LLM) based resume analysis

### Deployment

* Netlify – Frontend
* Render – Backend

## ⚙️ How It Works

```text
Upload Resume / Paste Resume
          ↓
   Extract Resume Text
          ↓
Enter Job Description
          ↓
   Send Data to Backend
          ↓
     Groq AI Analysis
          ↓
  ATS & Job Match Analysis
          ↓
      Display Results
```

## 📊 Analysis Output

The application provides:

```text
Overall Resume Score
        ↓
ATS Score Breakdown
├── Skills Match
├── Experience
├── Formatting
└── Keywords

Skills Detected
        ↓
Areas for Improvement
        ↓
AI-Powered Suggestions
```

## 📂 Project Structure

```text
AI_resume_analyzer/
│
├── Frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── Backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
└── README.md
```

## 🔐 Environment Variables

Create a `.env` file inside the **Backend** folder.

```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_model_name
AI_PROVIDER=groq
```

> ⚠️ Never upload your `.env` file or API key to GitHub.

Make sure `.env` is included in `.gitignore`:

```text
.env
node_modules/
```

For the deployed backend, configure these variables in the **Render Environment Variables** section.

## ▶️ Run Locally

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd AI_resume_analyzer
```

### 2. Start Backend

```bash
cd Backend
npm install
node server.js
```

The backend will run on:

```text
http://localhost:3000
```

### 3. Start Frontend

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

Vite will provide the local frontend URL, usually:

```text
http://localhost:5173
```

## 🌐 Deployment

### Frontend

The React frontend can be deployed using **Netlify**.

### Backend

The Node.js/Express backend can be deployed using **Render**.

Production architecture:

```text
User
 ↓
Netlify
(React Frontend)
 ↓
Render
(Node.js + Express Backend)
 ↓
Groq API
 ↓
AI Analysis
 ↓
Results
```

## 🔒 Security

* API keys are stored using environment variables
* `.env` is excluded from GitHub
* API requests are handled through the backend
* The Groq API key is not exposed directly in the frontend

## 🎯 Project Objective

The main objective of this project is to build an intelligent resume analysis system that helps job seekers understand how well their resumes align with ATS requirements and specific job descriptions.

It provides actionable feedback so users can improve their resumes and increase their chances of passing initial ATS screening.

## 🚀 Future Improvements

* Resume keyword highlighting
* Resume section completeness detection
* More detailed job matching
* Resume improvement recommendations
* Downloadable ATS analysis report
* Resume comparison with multiple job descriptions
* Advanced rule-based ATS scoring
* Authentication and user history
* Dashboard for tracking resume performance

---

### ⭐ If you find this project useful, consider giving the repository a star!


