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
      setError("Please enter resume text");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const response = await axios.post(
        "https://ai-resume-analyzer-3pys.onrender.com/analyze",
        {
          resumeText,
          jobDescription,
        }
      );

      setResults(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Server error. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 AI Resume Analyzer</h1>
        <p>Get instant ATS score & improvement suggestions</p>
      </div>

      {/* Resume Input */}
      <div className="upload-section">
        <h3>Paste Your Resume</h3>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here..."
          className="paste-area"
        />
      </div>

      {/* Job Description */}
      <div className="upload-section">
        <h3>Paste Job Description (Optional)</h3>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description to calculate match percentage..."
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

      {/* RESULTS SECTION */}
      {results && (
        <div className="results-section">
          
          {/* Overall Score */}
          <div className="score-card">
            <div className="score-circle">
              {results.overallScore ?? "--"}
            </div>
            <h2>Overall ATS Score</h2>
          </div>

          {/* Score Breakdown */}
          {results.scoreBreakdown && (
            <div className="analysis-card">
              <h3>ATS Score Breakdown</h3>

              {["skillsMatch", "experience", "formatting", "keywords"].map(
                (key) => (
                  <div className="bar-item" key={key}>
                    <span>{key}</span>
                    <div className="bar">
                      <div
                        className="bar-fill"
                        style={{
                          width: `${
                            (results.scoreBreakdown[key] / 25) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span>{results.scoreBreakdown[key]}</span>
                  </div>
                )
              )}
            </div>
          )}

          {/* Skills Detected */}
          {results.skillsDetected?.length > 0 && (
            <div className="analysis-card">
              <h3>Skills Detected</h3>
              <ul className="skill-list">
                {results.skillsDetected.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {/* JD Match */}
          {results.jdMatch && (
            <div className="analysis-card">
              <h3>Job Match: {results.jdMatch.percentage}%</h3>

              {results.jdMatch.missingSkills?.length > 0 && (
                <>
                  <h4>Missing Skills</h4>
                  <ul className="missing-skills">
                    {results.jdMatch.missingSkills.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Experience */}
          {results.experienceAnalysis && (
            <div className="analysis-card">
              <h3>Experience Analysis</h3>
              <p>
                Years of Experience:{" "}
                {results.experienceAnalysis.yearsOfExperience || "Not found"}
              </p>
              <p>
                Job Titles:{" "}
                {results.experienceAnalysis.jobTitles?.join(", ") ||
                  "Not detected"}
              </p>
              <p>
                Action Verbs Used:{" "}
                {results.experienceAnalysis.actionVerbsUsed || 0}
              </p>
            </div>
          )}

          {/* Improvements */}
          {results.areasForImprovement?.length > 0 && (
            <div className="analysis-card">
              <h3>Areas For Improvement</h3>
              <ul>
                {results.areasForImprovement.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {results.personalizedSuggestions?.length > 0 && (
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
