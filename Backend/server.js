const express = require("express");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const pdfParse = require("pdf-parse");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Multer Setup (Memory Storage) */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

/* Test Route */
app.get("/", (req, res) => {
  res.send("AI Resume Analyzer Backend Running");
});

/* Analyze Route */
app.post("/analyze", upload.single("resumeFile"), async (req, res) => {
  try {
    let resumeText = "";
    const jobDescription = req.body.jobDescription || "";

    /* If PDF uploaded */
    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    }

    /* If pasted text */
    if (!resumeText && req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "Resume content not readable. Please upload proper PDF or paste text."
      });
    }

    /* Shorten very long resumes */
    if (resumeText.length > 12000) {
      resumeText = resumeText.substring(0, 12000);
    }

    const prompt = `
You are a professional ATS Resume Analyzer.

Analyze the following resume and return ONLY valid JSON.

{
  "overallScore": number (0-100),
  "scoreBreakdown": {
    "skillsMatch": number (0-25),
    "experience": number (0-25),
    "formatting": number (0-25),
    "keywords": number (0-25)
  },
  "skillsDetected": array,
  "experienceAnalysis": {
    "yearsOfExperience": string,
    "jobTitles": array,
    "actionVerbsUsed": number
  },
  "areasForImprovement": array,
  "personalizedSuggestions": array
}

Resume:
"""${resumeText}"""

Job Description:
"""${jobDescription}"""
`;

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    let aiText = aiResponse.data.choices[0].message.content;

    /* Clean markdown if AI adds */
    aiText = aiText.replace(/```json|```/g, "").trim();

    const firstBrace = aiText.indexOf("{");
    const lastBrace = aiText.lastIndexOf("}");

    const jsonString = aiText.substring(firstBrace, lastBrace + 1);

    const parsed = JSON.parse(jsonString);

    res.json(parsed);

  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);

    res.status(500).json({
      error: "AI analysis failed. Check API key or PDF format."
    });
  }
});

/* Start Server */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
