

let resumeText = "";

/* FILE UPLOAD HANDLING */
document.getElementById("fileInput").addEventListener("change", handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        resumeText = e.target.result;
        document.getElementById("analyzeBtn").disabled = false;
        document.querySelector(".upload-section p").textContent =
            `File loaded: ${file.name}`;
    };
    reader.readAsText(file);
}

/* DRAG & DROP */
const uploadSection = document.getElementById("uploadSection");

uploadSection.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadSection.classList.add("dragover");
});

uploadSection.addEventListener("dragleave", () => {
    uploadSection.classList.remove("dragover");
});

uploadSection.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadSection.classList.remove("dragover");
    const file = e.dataTransfer.files[0];
    if (file) handleDroppedFile(file);
});

function handleDroppedFile(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        resumeText = e.target.result;
        document.getElementById("analyzeBtn").disabled = false;
        document.querySelector(".upload-section p").textContent =
            `File loaded: ${file.name}`;
    };
    reader.readAsText(file);
}

/* PASTE TEXT */
document.getElementById("pasteArea").addEventListener("input", function () {
    resumeText = this.value;
    document.getElementById("analyzeBtn").disabled = !resumeText.trim();
});

function togglePasteArea() {
    const pasteArea = document.getElementById("pasteArea");
    pasteArea.style.display =
        pasteArea.style.display === "none" ? "block" : "none";
    if (pasteArea.style.display === "block") pasteArea.focus();
}

/* ANALYZE RESUME */
async function analyzeResume() {

    const jobDescription = document.getElementById("jobDescription")?.value || "";

    if (!resumeText.trim()) return;

    document.getElementById("loadingSection").style.display = "block";
    document.getElementById("resultsSection").style.display = "none";

    try {
        const response = await fetch("https://ai-resume-analyzer-3pys.onrender.com/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resumeText, jobDescription }),
        });

        if (!response.ok) throw new Error("Backend error");

        const data = await response.json();

        document.getElementById("loadingSection").style.display = "none";
        document.getElementById("resultsSection").style.display = "block";

        displayAIResults(data);

    } catch (error) {
        document.getElementById("loadingSection").style.display = "none";
        alert("AI temporarily unavailable. Please try again.");
        console.error(error);
    }
}

/* DISPLAY AI RESULTS */
function displayAIResults(data) {

    /* OVERALL SCORE */
    const score = data.overallScore ?? 0;

    document.getElementById("overallScore").textContent = score;

    let label = "";
    let color = "";

    if (score >= 85) {
        label = "Excellent ATS Optimized Resume";
        color = "#22c55e"; // green
    } else if (score >= 70) {
        label = "Good Resume – Minor Improvements Needed";
        color = "#4ade80";
    } else if (score >= 50) {
        label = "Average Resume – Needs Optimization";
        color = "#facc15"; // yellow
    } else {
        label = "Poor ATS Score – Major Improvements Needed";
        color = "#ef4444"; // red
    }

    document.getElementById("scoreDescription").textContent = label;
    document.getElementById("overallScore").style.backgroundColor = color;

    /* ATS SCORE BREAKDOWN */
        document.getElementById("skillsBar").style.width =
        (data.scoreBreakdown.skillsMatch / 25) * 100 + "%";

        document.getElementById("experienceBar").style.width =
        (data.scoreBreakdown.experience / 25) * 100 + "%";

        document.getElementById("formatBar").style.width =
        (data.scoreBreakdown.formatting / 25) * 100 + "%";

        document.getElementById("keywordBar").style.width =
        (data.scoreBreakdown.keywords / 25) * 100 + "%";


    /* CONTENT ANALYSIS */
    document.getElementById("wordCount").textContent =
        data.contentAnalysis?.wordCount ?? "--";

    document.getElementById("sectionsFound").textContent =
        data.contentAnalysis?.sectionsFound?.join(", ") ?? "--";

    document.getElementById("contactInfo").textContent =
        data.contentAnalysis?.contactInfo ?? "--";

    /* SKILLS */
    const skillsList = document.getElementById("skillsList");
    skillsList.innerHTML = "";

    if (data.skillsDetected?.length) {
        data.skillsDetected.forEach(skill => {
            const li = document.createElement("li");
            li.textContent = skill;
            skillsList.appendChild(li);
        });
    } else {
        skillsList.innerHTML = "<li>No skills detected</li>";
    }

    /* FORMAT & STRUCTURE */
    document.getElementById("headerQuality").textContent =
        data.formatStructure?.headerQuality ?? "--";

    document.getElementById("sectionOrg").textContent =
        data.formatStructure?.sectionOrganization ?? "--";

    document.getElementById("bulletPoints").textContent =
        data.formatStructure?.bulletUsage ?? "--";

    /* KEYWORDS */
    document.getElementById("keywordsFound").textContent =
        data.keywordOptimization?.keywordsFound ?? "--";

    const keywordsList = document.getElementById("keywordsList");
    keywordsList.innerHTML = "";

    data.keywordOptimization?.keywords?.forEach(k => {
        const span = document.createElement("span");
        span.className = "keyword-match";
        span.textContent = k;
        keywordsList.appendChild(span);
    });

    /* EXPERIENCE */
    document.getElementById("yearsExp").textContent =
        data.experienceAnalysis?.yearsOfExperience ?? "--";

    document.getElementById("jobTitles").textContent =
        data.experienceAnalysis?.jobTitles?.join(", ") ?? "--";

    document.getElementById("actionVerbs").textContent =
        data.experienceAnalysis?.actionVerbsUsed ?? "--";

    /* IMPROVEMENTS */
    const improvementsList = document.getElementById("improvementsList");
    improvementsList.innerHTML = "";

    data.areasForImprovement?.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        improvementsList.appendChild(li);
    });

    /* SUGGESTIONS */
    const suggestionsDiv = document.getElementById("suggestions");
    suggestionsDiv.innerHTML = "";

    data.personalizedSuggestions?.forEach(s => {
        suggestionsDiv.innerHTML += `<p>• ${s}</p>`;
    });

    /* JOB DESCRIPTION MATCH */

    document.getElementById("jdMatchScore").textContent =
    data.jdMatch?.percentage + "%" || "0%";

    const missingContainer = document.getElementById("missingSkills");
    missingContainer.innerHTML = "";

    if (data.jdMatch?.missingSkills?.length > 0) {
    data.jdMatch.missingSkills.forEach(skill => {
        const span = document.createElement("span");
        span.textContent = skill;
        missingContainer.appendChild(span);
    });
    } else {
    missingContainer.textContent = "No missing skills 🎉";
    }

}
