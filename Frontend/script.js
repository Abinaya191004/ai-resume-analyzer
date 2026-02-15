let resumeText = "";
let jobDescription = "";

const fileInput = document.getElementById("fileInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const pasteArea = document.getElementById("pasteArea");

fileInput.addEventListener("change", handleFileUpload);
pasteArea.addEventListener("input", function () {
  resumeText = this.value;
  analyzeBtn.disabled = !resumeText.trim();
});

function togglePasteArea() {
  pasteArea.style.display =
    pasteArea.style.display === "none" ? "block" : "none";
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    resumeText = e.target.result;
    analyzeBtn.disabled = false;
  };
  reader.readAsText(file);
}

async function analyzeResume() {
  if (!resumeText.trim()) return;

  document.getElementById("loadingSection").style.display = "block";
  document.getElementById("resultsSection").style.display = "none";

  try {
    const response = await fetch(
      "https://ai-resume-analyzer-3pys.onrender.com/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          jobDescription: "",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Backend error");
    }

    displayResults(data);
  } catch (error) {
    alert("AI temporarily unavailable. Please try again.");
    console.error(error);
  }

  document.getElementById("loadingSection").style.display = "none";
  document.getElementById("resultsSection").style.display = "block";
}

function displayResults(data) {
  document.getElementById("overallScore").textContent =
    data.overallScore || "--";

  document.getElementById("wordCount").textContent =
    data.contentAnalysis?.wordCount || "--";

  document.getElementById("sectionsFound").textContent =
    data.contentAnalysis?.sectionsFound?.join(", ") || "--";

  document.getElementById("contactInfo").textContent =
    data.contentAnalysis?.contactInfo || "--";

  document.getElementById("headerQuality").textContent =
    data.formatStructure?.headerQuality || "--";

  document.getElementById("sectionOrg").textContent =
    data.formatStructure?.sectionOrganization || "--";

  document.getElementById("bulletPoints").textContent =
    data.formatStructure?.bulletUsage || "--";

  document.getElementById("keywordsFound").textContent =
    data.keywordOptimization?.keywordsFound || "--";

  document.getElementById("yearsExp").textContent =
    data.experienceAnalysis?.yearsOfExperience || "--";

  document.getElementById("jobTitles").textContent =
    data.experienceAnalysis?.jobTitles?.join(", ") || "--";

  document.getElementById("actionVerbs").textContent =
    data.experienceAnalysis?.actionVerbsUsed || "--";

  const skillsList = document.getElementById("skillsList");
  skillsList.innerHTML = "";

  (data.skillsDetected || []).forEach((skill) => {
    const li = document.createElement("li");
    li.textContent = skill;
    skillsList.appendChild(li);
  });

  const improvementsList = document.getElementById("improvementsList");
  improvementsList.innerHTML = "";

  (data.areasForImprovement || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    improvementsList.appendChild(li);
  });

  const suggestions = document.getElementById("suggestions");
  suggestions.innerHTML = "";

  (data.personalizedSuggestions || []).forEach((item) => {
    const p = document.createElement("p");
    p.textContent = "• " + item;
    suggestions.appendChild(p);
  });
}
