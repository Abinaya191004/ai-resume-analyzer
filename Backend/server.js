const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


app.get("/", (req, res) => {
  res.send("✅ Backend Running with Groq AI");
});


app.post("/analyze", upload.single("resumeFile"), async (req, res) => {
  try {
    let resumeText = "";
    const jobDescription = req.body.jobDescription;

    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({
        error: "Please provide job description for accurate ATS score"
      });
    }

    
    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      resumeText = pdfData.text;
    }

    
    if (!resumeText && req.body.resumeText) {
      resumeText = req.body.resumeText;
    }

    
    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({
        error: "Resume not readable. Upload proper PDF or paste text."
      });
    }

    
    if (resumeText.length > 10000) {
      resumeText = resumeText.substring(0, 10000);
    }

    let penalty = 0;

    const lowerText = resumeText.toLowerCase();

    if (!lowerText.includes("project")) penalty += 10;
    if (!lowerText.includes("experience")) penalty += 10;
    if (resumeText.length < 1000) penalty += 10;

    const prompt = `
  You are a strict ATS Resume Evaluator.

  IMPORTANT RULES:
  - DO NOT give default high scores.
  - Scores must vary realistically (0–100).
  - Penalize missing skills, poor formatting, and lack of experience.
  - If resume is weak → score below 60.
  - If average → 60–75.
  - If strong → 75–90.
  - Only exceptional → above 90.

  SCORING LOGIC:
  - Skills Match (0–25): based on match with job description
  - Experience (0–25): internships/projects quality
  - Formatting (0–25): structure, clarity
  - Keywords (0–25): ATS keywords present

  Return ONLY JSON:

  {
    "overallScore": number,
    "scoreBreakdown": {
      "skillsMatch": number,
      "experience": number,
      "formatting": number,
      "keywords": number
    },
    "skillsDetected": array,
    "areasForImprovement": array,
    "personalizedSuggestions": array
  }

  Resume:
  ${resumeText}

  Job Description:
  ${jobDescription || "Not provided"}
`;

    
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
      // Apply penalty
      parsed.overallScore = Math.max(0, parsed.overallScore - penalty);
      if (parsed.overallScore > 90) {
        parsed.overallScore = Math.floor(Math.random() * 10) + 80;
      }
    } catch (err) {
      console.error("Parse Error:", err.message);

      
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


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});