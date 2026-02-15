const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.send("AI Resume Analyzer Backend Running");
});

app.post("/analyze", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || resumeText.trim().length === 0) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    // 🔥 Prevent token overflow
    const trimmedResume = resumeText.slice(0, 8000);
    const trimmedJD = jobDescription ? jobDescription.slice(0, 4000) : "";

    const prompt = `
You are an advanced ATS Resume Analyzer.

Return ONLY valid JSON.

Required JSON format:

{
  "overallScore": number,
  "scoreBreakdown": {
    "skillsMatch": number,
    "experience": number,
    "formatting": number,
    "keywords": number
  },
  "skillsDetected": array,
  "jdSkills": array,
  "experienceAnalysis": {
    "yearsOfExperience": string,
    "jobTitles": array,
    "actionVerbsUsed": number
  },
  "areasForImprovement": array,
  "personalizedSuggestions": array
}

Rules:
- skillsDetected must come only from Resume
- jdSkills must come only from Job Description
- Do NOT add explanation text
- Return pure JSON only

Resume:
${trimmedResume}

Job Description:
${trimmedJD}
`;

    const response = await axios.post(
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

    let aiRaw = response.data.choices[0].message.content;

    // Remove markdown fences if any
    aiRaw = aiRaw.replace(/```json/gi, "").replace(/```/g, "").trim();

    const firstBrace = aiRaw.indexOf("{");
    const lastBrace = aiRaw.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    const cleaned = aiRaw.substring(firstBrace, lastBrace + 1);

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON Parse Error:", cleaned);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    // ✅ Remove duplicate job titles
    if (parsed.experienceAnalysis?.jobTitles) {
      parsed.experienceAnalysis.jobTitles = [
        ...new Set(parsed.experienceAnalysis.jobTitles)
      ];
    }

    // ✅ Calculate JD Match
    const resumeSkills = (parsed.skillsDetected || []).map(s =>
      s.toLowerCase()
    );

    const jdSkills = (parsed.jdSkills || []).map(s =>
      s.toLowerCase()
    );

    if (jdSkills.length > 0) {
      const resumeSet = new Set(resumeSkills);
      const jdSet = new Set(jdSkills);

      const matched = [...jdSet].filter(skill =>
        resumeSet.has(skill)
      );

      const missing = [...jdSet].filter(skill =>
        !resumeSet.has(skill)
      );

      const percentage = Math.round(
        (matched.length / jdSet.size) * 100
      );

      parsed.jdMatch = {
        percentage,
        missingSkills: missing
      };
    } else {
      parsed.jdMatch = {
        percentage: 0,
        missingSkills: []
      };
    }

    res.json(parsed);

  } catch (error) {
    console.error("AI ERROR:", error.response?.data || error.message);
    res.status(500).json({ error: "AI temporarily unavailable" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
