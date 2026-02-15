const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

/* MIDDLEWARE */
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* TEST ROUTE */
app.get("/", (req, res) => {
  res.send("AI Resume Analyzer Backend is running");
});

/* ANALYZE RESUME (AI) */
app.post("/analyze", async (req, res) => {
  const { resumeText, jobDescription = "" } = req.body;

  if (!resumeText || resumeText.trim().length === 0) {
    return res.status(400).json({ error: "Resume text is required" });
  }

  // LIMIT INPUT SIZE to protect tokens
  const safeResume = resumeText.slice(0, 3000);
  const safeJD = jobDescription ? jobDescription.slice(0, 2000) : "";

  // Strict prompt expecting only JSON
  const prompt = `
  You are an ATS resume analyzer.

  Your task:
  1. Extract technical skills from the RESUME
  2. Extract required technical skills from the JOB DESCRIPTION

  Analyze the resume below and return ONLY valid JSON.
  You MUST include the "scoreBreakdown" object and "overallScore".
  Do not add explanations, markdown, or extra text.

  Resume:
  """${safeResume}"""

  Job Description:
  """${safeJD}"""
  `;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiRaw = response.data.choices[0].message.content;

    // Clean response (remove fences and surrounding text)
    let cleaned = aiRaw.replace(/```json/gi, "").replace(/```/g, "").trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      console.error("No JSON found in AI response:", aiRaw);
      return res.status(500).json({ error: "AI did not return valid JSON" });
    }

    cleaned = cleaned.substring(firstBrace, lastBrace + 1);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON parse error:", cleaned);
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    /* JOB DESCRIPTION MATCH */
    const resumeSkills = (parsed.skillsDetected || []).map((s) =>
      String(s).toLowerCase()
    );

    const jdSkills = (parsed.jdSkills || []).map((s) => String(s).toLowerCase());

    if (jdSkills.length === 0) {
      parsed.jdMatch = {
        percentage: 0,
        missingSkills: ["Unable to extract job description skills"],
      };
    } else {
      const resumeSet = new Set(resumeSkills);
      const jdSet = new Set(jdSkills);

      const matched = [...jdSet].filter((skill) => resumeSet.has(skill));
      const missing = [...jdSet].filter((skill) => !resumeSet.has(skill));

      parsed.jdMatch = {
        percentage: Math.round((matched.length / jdSet.size) * 100),
        missingSkills: missing,
      };
    }

    /* ATS SCORE CALCULATION */
    const skillsScore = Math.min((parsed.skillsDetected?.length || 0) * 1.5, 25);

    const experienceScore =
      parsed.experienceAnalysis?.yearsOfExperience &&
      parsed.experienceAnalysis.yearsOfExperience !== "0"
        ? 20
        : 10;

    const formattingScore =
      parsed.formatStructure?.headerQuality === "Excellent" ? 25 : 18;

    const keywordScore = Math.min(
      (parsed.keywordOptimization?.keywordsFound || 0) * 1.5,
      25
    );

    const overallScore = Math.round(
      skillsScore + experienceScore + formattingScore + keywordScore
    );

    parsed.scoreBreakdown = {
      skillsMatch: Math.round(skillsScore),
      experience: Math.round(experienceScore),
      formatting: Math.round(formattingScore),
      keywords: Math.round(keywordScore),
    };

    parsed.overallScore = overallScore;

    // Remove duplicate job titles if present
    if (Array.isArray(parsed.experienceAnalysis?.jobTitles)) {
      parsed.experienceAnalysis.jobTitles = [
        ...new Set(parsed.experienceAnalysis.jobTitles),
      ];
    }

    res.json(parsed);
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

/* START SERVER */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
