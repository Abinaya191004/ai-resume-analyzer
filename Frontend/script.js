document.addEventListener("DOMContentLoaded", function () {

let resumeText = "";
let jobDescription = "";

/* -----------------------
   FILE UPLOAD
------------------------*/
document.getElementById("fileInput").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        resumeText = event.target.result;
        document.getElementById("analyzeBtn").disabled = false;
        document.querySelector(".upload-section p").textContent =
            "File loaded: " + file.name;
    };
    reader.readAsText(file);
});

/* -----------------------
   PASTE TEXT
------------------------*/
document.getElementById("pasteArea").addEventListener("input", function () {
    resumeText = this.value;
    document.getElementById("analyzeBtn").disabled = !resumeText.trim();
});

window.togglePasteArea = function () {
    const pasteArea = document.getElementById("pasteArea");
    pasteArea.style.display =
        pasteArea.style.display === "none" ? "block" : "none";
};

/* -----------------------
   JOB DESCRIPTION INPUT
------------------------*/
const jdInput = document.getElementById("jobDescription");

if (jdInput) {
    jdInput.addEventListener("input", function () {
        jobDescription = this.value;
    });
}

/* -----------------------
   ANALYZE (AI CALL)
------------------------*/
window.analyzeResume = async function () {

    if (!resumeText.trim()) {
        alert("Please upload or paste resume text");
        return;
    }

    document.getElementById("loadingSection").style.display = "block";
    document.getElementById("resultsSection").style.display = "none";

    try {

        const response = await fetch("https://ai-resume-analyzer-3pys.onrender.com/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                resumeText,
                jobDescription
            })
        });

        if (!response.ok) {
            throw new Error("Backend error");
        }

        const data = await response.json();

        displayResults(data);

        document.getElementById("loadingSection").style.display = "none";
        document.getElementById("resultsSection").style.display = "block";

    } catch (error) {
        document.getElementById("loadingSection").style.display = "none";
        alert("AI analysis failed. Check backend.");
        console.error(error);
    }
};

/* -----------------------
   DISPLAY RESULTS
------------------------*/
function displayResults(data) {

    // Overall Score
    document.getElementById("overallScore").textContent = data.overallScore;

    if (data.overallScore >= 85) {
        document.getElementById("scoreDescription").textContent =
            "Excellent ATS Optimized Resume";
    } else if (data.overallScore >= 60) {
        document.getElementById("scoreDescription").textContent =
            "Good Resume - Needs Minor Improvements";
    } else {
        document.getElementById("scoreDescription").textContent =
            "Resume Needs Optimization";
    }

    // Word count
    document.getElementById("wordCount").textContent =
        data.contentAnalysis?.wordCount || "--";

    document.getElementById("sectionsFound").textContent =
        data.contentAnalysis?.sectionsFound?.join(", ") || "--";

    document.getElementById("contactInfo").textContent =
        data.contentAnalysis?.contactInfo || "--";

    // Skills
    const skillsList = document.getElementById("skillsList");
    skillsList.innerHTML = "";

    if (data.skillsDetected && data.skillsDetected.length > 0) {
        data.skillsDetected.forEach(skill => {
            skillsList.innerHTML += `<li>${skill}</li>`;
        });
    } else {
        skillsList.innerHTML = "<li>No skills detected</li>";
    }

    // Experience
    document.getElementById("yearsExp").textContent =
        data.experienceAnalysis?.yearsOfExperience || "--";

    document.getElementById("jobTitles").textContent =
        data.experienceAnalysis?.jobTitles?.join(", ") || "--";

    document.getElementById("actionVerbs").textContent =
        data.experienceAnalysis?.actionVerbsUsed || "--";

    // Improvements
    const improvements = document.getElementById("improvementsList");
    improvements.innerHTML = "";

    if (data.areasForImprovement) {
        data.areasForImprovement.forEach(item => {
            improvements.innerHTML += `<li>${item}</li>`;
        });
    }

    // Suggestions
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";

    if (data.personalizedSuggestions) {
        data.personalizedSuggestions.forEach(item => {
            suggestions.innerHTML += `<p>• ${item}</p>`;
        });
    }
}

});
