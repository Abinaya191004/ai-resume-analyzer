import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      setError("Please paste your resume text");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const formData = new FormData();
      formData.append("resumeText", resumeText);
      formData.append("jobDescription", jobDescription);

      const response = await axios.post(
        "https://ai-resume-analyzer-3pys.onrender.com/analyze",
        formData
      );

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 AI Resume Analyzer</h1>
        <p>Get instant AI-powered resume feedback</p>
      </div>

      <div className="upload-section">
        <h3>Paste Resume</h3>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume here..."
          className="paste-area"
        />
      </div>

      <div className="upload-section">
        <h3>Paste Job Description (Optional)</h3>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description for match analysis..."
          className="paste-area"
        />
      </div>

      <button
        onClick={analyzeResume}
        disabled={loading}
        className="analyze-button"
      >
        {loading ? "Analyzing..." : "🔍 Analyze Resume"}
      </button>

      {error && <div className="error">{error}</div>}

      {results && (
        <div className="results-section">
          <div className="score-card">
            <div className="score-circle">
              {results.overallScore ?? "--"}
            </div>
            <h2>Overall Resume Score</h2>
            <p>ATS Compatibility (0-100)</p>
          </div>

          {results.scoreBreakdown && (
            <div className="analysis-card">
              <h3>ATS Score Breakdown</h3>

              {["skillsMatch", "experience", "formatting", "keywords"].map(
                (key) => (
                  <div key={key} className="bar-item">
                    <span>{key}</span>
                    <div className="bar">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${
                            (results.scoreBreakdown[key] / 25) * 100
                          }%`
                        }}
                      ></div>
                    </div>
                    <span>{results.scoreBreakdown[key]}</span>
                  </div>
                )
              )}
            </div>
          )}

          {results.skillsDetected && (
            <div className="analysis-card">
              <h3>Skills Detected</h3>
              <ul>
                {results.skillsDetected.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {results.jdMatch && (
            <div className="analysis-card">
              <h3>Job Match: {results.jdMatch.percentage}%</h3>

              {results.jdMatch.missingSkills?.length > 0 && (
                <>
                  <h4>Missing Skills</h4>
                  <ul>
                    {results.jdMatch.missingSkills.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {results.areasForImprovement && (
            <div className="analysis-card">
              <h3>Areas for Improvement</h3>
              <ul>
                {results.areasForImprovement.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {results.personalizedSuggestions && (
            <div className="analysis-card">
              <h3>Personalized Suggestions</h3>
              <ul>
                {results.personalizedSuggestions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
