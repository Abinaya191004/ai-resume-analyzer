const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

/* ========================
   MIDDLEWARE
======================== */
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

/* ========================
   TEST ROUTE
======================== */
app.get("/", (req, res) => {
  res.send("AI Resume Analyzer Backend is running");
});

/* ========================
   ANALYZE RESUME
======================== */
app.post("/analyze", async (req, res) => {
  const { resumeText, jobDescription = "" } = req.body;

  if (!resumeText || resumeText.trim().length === 0) {
    return res.status(400).json({ error: "Resume text is required" });
  }

  /* 🔒 PREVENT TOKEN OVERFLOW */
  const MAX_CHARS = 8000;
  // LIMIT INPUT SIZE
  const safeResume = resumeText.slice(0, 6000);
  const safeJD = jobDescription ? jobDescription.slice(0, 4000) : "";

  // SHORTER CLEAN PROMPT
  const prompt = `
  You are an ATS resume analyzer.

  Return ONLY valid JSON.

  Required format:
  {
    "skillsDetected": [],
    "jdSkills": [],
    "experienceAnalysis": {
      "yearsOfExperience": "",
      "jobTitles": [],
      "actionVerbsUsed": 0
    },
    "formatStructure": {
      "headerQuality": "",
      "sectionOrganization": "",
      "bulletUsage": ""
    },
    "keywordOptimization": {
      "keywordsFound": 0,
      "keywords": []
    }
  }

  RESUME:
  ${safeResume}

  JOB DESCRIPTION:
  ${safeJD}
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

    /* 🔒 CLEAN AI RESPONSE */
    let cleaned = aiRaw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({ error: "AI did not return valid JSON" });
    }

    cleaned = cleaned.substring(firstBrace, lastBrace + 1);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    /* ========================
       JOB DESCRIPTION MATCH
    ======================== */

    const resumeSkills = (parsed.skillsDetected || []).map(s => s.toLowerCase());
    const jdSkills = (parsed.jdSkills || []).map(s => s.toLowerCase());

    if (jdSkills.length === 0) {
      parsed.jdMatch = {
        percentage: 0,
        missingSkills: ["Unable to extract job description skills"],
      };
    } else {
      const resumeSet = new Set(resumeSkills);
      const jdSet = new Set(jdSkills);

      const matched = [...jdSet].filter(skill => resumeSet.has(skill));
      const missing = [...jdSet].filter(skill => !resumeSet.has(skill));

      parsed.jdMatch = {
        percentage: Math.round((matched.length / jdSet.size) * 100),
        missingSkills: missing,
      };
    }

    /* ========================
       ATS SCORE CALCULATION
    ======================== */

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

    /* REMOVE DUPLICATE JOB TITLES */
    if (Array.isArray(parsed.experienceAnalysis?.jobTitles)) {
      parsed.experienceAnalysis.jobTitles = [
        ...new Set(parsed.experienceAnalysis.jobTitles),
      ];
    }

    res.json(parsed);
  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "AI temporarily unavailable" });
  }
});

/* ========================
   START SERVER
======================== */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
