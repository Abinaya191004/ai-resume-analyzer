const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const axios = require("axios");
require("dotenv").config();

const app = express();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.send("AI Resume Analyzer Backend Running");
});

app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    let resumeText = req.body.resumeText || "";
    const jobDescription = req.body.jobDescription || "";

    // If PDF uploaded
    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "Resume content not readable. Upload proper PDF or paste text."
      });
    }

    // 🚀 OPTIMIZATION: Trim long resumes to avoid token overflow
    if (resumeText.length > 8000) {
      resumeText = resumeText.substring(0, 8000);
    }

    const prompt = `
You are a professional ATS Resume Analyzer.

Return ONLY valid JSON.

Required JSON format:

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
  "personalizedSuggestions": array,
  "jdMatch": {
    "percentage": number,
    "missingSkills": array
  }
}

Rules:
- Do not add explanation.
- Do not add markdown.
- Do not add text outside JSON.

Resume:
${resumeText}

Job Description:
${jobDescription}
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

    let aiRaw = aiResponse.data.choices[0].message.content;

    // 🔥 Clean Markdown Fences
    aiRaw = aiRaw.replace(/```json/g, "").replace(/```/g, "").trim();

    const firstBrace = aiRaw.indexOf("{");
    const lastBrace = aiRaw.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    const cleaned = aiRaw.substring(firstBrace, lastBrace + 1);

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    // 🔥 Safety fallback values
    parsed.overallScore = parsed.overallScore || 0;
    parsed.scoreBreakdown = parsed.scoreBreakdown || {
      skillsMatch: 0,
      experience: 0,
      formatting: 0,
      keywords: 0
    };
    parsed.skillsDetected = parsed.skillsDetected || [];
    parsed.areasForImprovement = parsed.areasForImprovement || [];
    parsed.personalizedSuggestions = parsed.personalizedSuggestions || [];
    parsed.jdMatch = parsed.jdMatch || {
      percentage: 0,
      missingSkills: []
    };

    res.json(parsed);

  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));
