import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      setError('Please enter resume text');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post('/api/analyze', {
        resumeText,
        jobDescription
      });

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>🤖 AI Resume Analyzer</h1>
        <p>Get instant insights and improvements for your resume</p>
      </div>

      <div className="upload-section">
        <h3>Paste Your Resume</h3>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your resume text here..."
          className="paste-area"
        />
      </div>

      <div className="upload-section">
        <h3>Paste Job Description (Optional)</h3>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to calculate match percentage..."
          className="paste-area"
        />
      </div>

      <button
        onClick={analyzeResume}
        disabled={loading}
        className="analyze-button"
      >
        {loading ? 'Analyzing...' : '🔍 Analyze Resume'}
      </button>

      {error && <div className="error">{error}</div>}

      {results && (
        <div className="results-section">
          <div className="score-card">
            <div className="score-circle">{results.overallScore || '--'}</div>
            <h2>Overall Resume Score</h2>
            <p>ATS Compatibility Score (0-100)</p>
          </div>

          {results.scoreBreakdown && (
            <div className="analysis-card">
              <h3>ATS Score Breakdown</h3>
              <div className="bar-item">
                <span>Skills Match</span>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(results.scoreBreakdown.skillsMatch / 25) * 100}%`
                    }}
                  ></div>
                </div>
                <span>{results.scoreBreakdown.skillsMatch}</span>
              </div>
              <div className="bar-item">
                <span>Experience</span>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(results.scoreBreakdown.experience / 25) * 100}%`
                    }}
                  ></div>
                </div>
                <span>{results.scoreBreakdown.experience}</span>
              </div>
              <div className="bar-item">
                <span>Formatting</span>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(results.scoreBreakdown.formatting / 25) * 100}%`
                    }}
                  ></div>
                </div>
                <span>{results.scoreBreakdown.formatting}</span>
              </div>
              <div className="bar-item">
                <span>Keywords</span>
                <div className="bar">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(results.scoreBreakdown.keywords / 25) * 100}%`
                    }}
                  ></div>
                </div>
                <span>{results.scoreBreakdown.keywords}</span>
              </div>
            </div>
          )}

          {results.skillsDetected && (
            <div className="analysis-card">
              <h3>Skills Detected</h3>
              <ul className="skill-list">
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
                  <ul className="missing-skills">
                    {results.jdMatch.missingSkills.map((skill, i) => (
                      <li key={i}>{skill}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
