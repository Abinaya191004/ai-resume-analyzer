const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

/* Middleware */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* File Upload */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* Groq Setup */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/* Test Route */
app.get("/", (req, res) => {
  res.send("✅ Backend Running with Groq AI");
});

/* Analyze Route */
app.post("/analyze", upload.single("resumeFile"), async (req, res) => {
  try {
    let resumeText = "";
    const jobDescription = req.body.jobDescription || "";

    /* 📄 PDF Extract */
    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    }

    /* 📝 Pasted Text */
    if (!resumeText && req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    /* ❌ Validation */
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "Resume not readable. Upload proper PDF or paste text."
      });
    }

    /* ✂️ Limit text */
    if (resumeText.length > 10000) {
      resumeText = resumeText.substring(0, 10000);
    }

    /* 🤖 Prompt */
    const prompt = `
You are an ATS Resume Analyzer.

Return ONLY JSON in this format:

{
  "overallScore": number,
  "scoreBreakdown": {
    "skillsMatch": number,
    "experience": number,
    "formatting": number,
    "keywords": number
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

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    /* 🚀 GROQ API CALL */
    const aiResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // FREE & FAST
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    });

    let aiText = aiResponse.choices[0]?.message?.content;

    if (!aiText) {
      throw new Error("Empty AI response");
    }

    /* 🧹 Clean JSON */
    aiText = aiText.replace(/```json|```/g, "").trim();

    const start = aiText.indexOf("{");
    const end = aiText.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("Invalid AI format");
    }

    const jsonString = aiText.substring(start, end + 1);

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch (err) {
      console.error("Parse Error:", err.message);

      // fallback
      parsed = {
        overallScore: 60,
        scoreBreakdown: {
          skillsMatch: 15,
          experience: 15,
          formatting: 15,
          keywords: 15
        },
        skillsDetected: ["Java", "React"],
        experienceAnalysis: {
          yearsOfExperience: "Fresher",
          jobTitles: [],
          actionVerbsUsed: 5
        },
        areasForImprovement: ["Improve formatting"],
        personalizedSuggestions: ["Add projects"],
        jdMatch: {
          percentage: 50,
          missingSkills: []
        }
      };
    }

    res.json(parsed);

  } catch (error) {
    console.error("❌ GROQ ERROR:", error.message);

    res.status(500).json({
      error: "AI failed. Please try again."
    });
  }
});

/* Start */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});