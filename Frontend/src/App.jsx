import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle PDF Upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setResumeText(""); // Clear pasted text if file selected
    } else {
      setSelectedFile(null);
      setFileName("");
    }
  };

  // Analyze Resume
  const analyzeResume = async () => {
    if (!resumeText.trim() && !selectedFile) {
      setError("Please paste resume text or upload a PDF file.");
      return;
    }

    setLoading(true);
    setError("");
    setResults(null);

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("resumeFile", selectedFile);
      } else {
        formData.append("resumeText", resumeText);
      }

      formData.append("jobDescription", jobDescription);

      const response = await axios.post(
        "https://ai-resume-analyzer-3pys.onrender.com/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResults(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Failed to analyze resume. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 AI Resume Analyzer</h1>
        <p>Upload or paste your resume to get AI-powered ATS feedback</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h3>Upload Resume (PDF)</h3>

        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />

        {fileName && (
          <p className="file-name">
            📄 Selected File: <strong>{fileName}</strong>
          </p>
        )}
      </div>

      {/* Paste Resume Section */}
      <div className="upload-section">
        <h3>Or Paste Resume Text</h3>
        <textarea
          value={resumeText}
          onChange={(e) => {
            setResumeText(e.target.value);
            setSelectedFile(null);
            setFileName("");
          }}
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

      {/* Analyze Button */}
      <button
        onClick={analyzeResume}
        disabled={loading}
        className="analyze-button"
      >
        {loading ? "Analyzing..." : "🔍 Analyze Resume"}
      </button>

      {/* Error */}
      {error && <div className="error">{error}</div>}

      {/* Results */}
      {results && (
        <div className="results-section">
          <div className="score-card">
            <div className="score-circle">
              {results.overallScore || 0}
            </div>
            <h2>Overall Resume Score</h2>
          </div>

          {/* Score Breakdown */}
          {results.scoreBreakdown && (
            <div className="analysis-card">
              <h3>ATS Score Breakdown</h3>
              <p>Skills Match: {results.scoreBreakdown.skillsMatch}/25</p>
              <p>Experience: {results.scoreBreakdown.experience}/25</p>
              <p>Formatting: {results.scoreBreakdown.formatting}/25</p>
              <p>Keywords: {results.scoreBreakdown.keywords}/25</p>
            </div>
          )}

          {/* Skills */}
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

          {/* JD Match */}
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

          {/* Improvements */}
          {results.areasForImprovement && (
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
          {results.personalizedSuggestions && (
            <div className="analysis-card">
              <h3>AI Suggestions</h3>
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
