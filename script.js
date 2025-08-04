        let resumeText = '';
        
        // File upload handling
        document.getElementById('fileInput').addEventListener('change', handleFileUpload);
        
        // Drag and drop functionality
        const uploadSection = document.getElementById('uploadSection');
        
        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.classList.add('dragover');
        });
        
        uploadSection.addEventListener('dragleave', () => {
            uploadSection.classList.remove('dragover');
        });
        
        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });

        // Paste area handling
        document.getElementById('pasteArea').addEventListener('input', function() {
            resumeText = this.value;
            document.getElementById('analyzeBtn').disabled = !resumeText.trim();
        });

        function togglePasteArea() {
            const pasteArea = document.getElementById('pasteArea');
            pasteArea.style.display = pasteArea.style.display === 'none' ? 'block' : 'none';
            if (pasteArea.style.display === 'block') {
                pasteArea.focus();
            }
        }

        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                handleFile(file);
            }
        }

        function handleFile(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                resumeText = e.target.result;
                document.getElementById('analyzeBtn').disabled = false;
                
                // Show file name
                const fileName = file.name;
                document.querySelector('.upload-section p').textContent = `File loaded: ${fileName}`;
            };
            reader.readAsText(file);
        }

        function analyzeResume() {
            if (!resumeText.trim()) return;
            
            // Show loading
            document.getElementById('loadingSection').style.display = 'block';
            document.getElementById('resultsSection').style.display = 'none';
            
            // Simulate analysis delay
            setTimeout(() => {
                performAnalysis();
                document.getElementById('loadingSection').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';
            }, 2000);
        }

        function performAnalysis() {
            const analysis = analyzeResumeContent(resumeText);
            displayResults(analysis);
        }

        function analyzeResumeContent(text) {
            const lowerText = text.toLowerCase();
            
            // Word count and basic metrics
            const wordCount = text.split(/\s+/).length;
            const lineCount = text.split('\n').length;
            
            // Skills detection
            const technicalSkills = [
                'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css',
                'angular', 'vue', 'php', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
                'typescript', 'jquery', 'bootstrap', 'sass', 'less', 'webpack', 'git',
                'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'mongodb', 'postgresql',
                'mysql', 'redis', 'elasticsearch', 'firebase', 'graphql', 'rest api',
                'microservices', 'agile', 'scrum', 'jira', 'confluence', 'jenkins',
                'ci/cd', 'devops', 'linux', 'unix', 'bash', 'powershell', 'tensorflow',
                'pytorch', 'machine learning', 'ai', 'data science', 'analytics'
            ];
            
            const softSkills = [
                'leadership', 'communication', 'teamwork', 'problem solving',
                'critical thinking', 'creativity', 'adaptability', 'time management',
                'project management', 'collaboration', 'presentation', 'negotiation'
            ];
            
            const foundTechSkills = technicalSkills.filter(skill => 
                lowerText.includes(skill.toLowerCase())
            );
            
            const foundSoftSkills = softSkills.filter(skill => 
                lowerText.includes(skill.toLowerCase())
            );
            
            // Contact information detection
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
            const phoneRegex = /(\+\d{1,3}[- ]?)?\d{10}|\(\d{3}\)\s*\d{3}[- ]?\d{4}/;
            const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;
            
            const hasEmail = emailRegex.test(text);
            const hasPhone = phoneRegex.test(text);
            const hasLinkedIn = linkedinRegex.test(text);
            
            // Section detection
            const sections = [
                'experience', 'education', 'skills', 'projects', 'certifications',
                'summary', 'objective', 'achievements', 'awards', 'publications'
            ];
            
            const foundSections = sections.filter(section => 
                lowerText.includes(section)
            );
            
            // Action verbs detection
            const actionVerbs = [
                'achieved', 'managed', 'led', 'developed', 'created', 'implemented',
                'improved', 'increased', 'reduced', 'optimized', 'designed',
                'coordinated', 'supervised', 'trained', 'mentored', 'collaborated'
            ];
            
            const foundActionVerbs = actionVerbs.filter(verb => 
                lowerText.includes(verb)
            );
            
            // Years of experience estimation
            const yearMatches = text.match(/\b(19|20)\d{2}\b/g) || [];
            const years = yearMatches.map(y => parseInt(y)).filter(y => y >= 1990);
            const estimatedYears = years.length > 1 ? 
                Math.max(...years) - Math.min(...years) : 0;
            
            // Job titles detection
            const commonTitles = [
                'developer', 'engineer', 'manager', 'analyst', 'designer',
                'consultant', 'specialist', 'coordinator', 'director', 'lead',
                'senior', 'junior', 'intern', 'associate', 'principal'
            ];
            
            const foundTitles = commonTitles.filter(title => 
                lowerText.includes(title)
            );
            
            // Bullet point detection
            const bulletPoints = (text.match(/^[\s]*[•\-\*]/gm) || []).length;
            
            // Calculate overall score
            let score = 0;
            
            // Content scoring
            if (wordCount >= 200) score += 15;
            else if (wordCount >= 100) score += 10;
            else score += 5;
            
            // Contact info scoring
            if (hasEmail) score += 10;
            if (hasPhone) score += 10;
            if (hasLinkedIn) score += 5;
            
            // Skills scoring
            score += Math.min(foundTechSkills.length * 2, 20);
            score += Math.min(foundSoftSkills.length * 1, 10);
            
            // Structure scoring
            score += Math.min(foundSections.length * 3, 15);
            score += Math.min(foundActionVerbs.length * 1, 10);
            
            // Format scoring
            if (bulletPoints > 5) score += 5;
            if (estimatedYears > 0) score += 5;
            
            const overallScore = Math.min(score, 100);
            
            return {
                overallScore,
                wordCount,
                foundSections,
                hasEmail,
                hasPhone,
                hasLinkedIn,
                foundTechSkills,
                foundSoftSkills,
                foundActionVerbs,
                estimatedYears,
                foundTitles,
                bulletPoints,
                improvements: generateImprovements(overallScore, {
                    wordCount, hasEmail, hasPhone, hasLinkedIn,
                    foundTechSkills, foundSoftSkills, foundSections,
                    bulletPoints, foundActionVerbs
                })
            };
        }

        function generateImprovements(score, metrics) {
            const improvements = [];
            
            if (!metrics.hasEmail) {
                improvements.push('Add a professional email address');
            }
            if (!metrics.hasPhone) {
                improvements.push('Include your phone number');
            }
            if (!metrics.hasLinkedIn) {
                improvements.push('Add your LinkedIn profile URL');
            }
            if (metrics.wordCount < 200) {
                improvements.push('Expand content - aim for 200-400 words');
            }
            if (metrics.foundTechSkills.length < 5) {
                improvements.push('Add more relevant technical skills');
            }
            if (metrics.foundSoftSkills.length < 3) {
                improvements.push('Include more soft skills');
            }
            if (!metrics.foundSections.includes('experience')) {
                improvements.push('Add an experience/work history section');
            }
            if (!metrics.foundSections.includes('education')) {
                improvements.push('Include your education background');
            }
            if (metrics.bulletPoints < 5) {
                improvements.push('Use more bullet points for better readability');
            }
            if (metrics.foundActionVerbs.length < 5) {
                improvements.push('Use more action verbs to describe achievements');
            }
            
            return improvements;
        }

        function displayResults(analysis) {
            // Overall score
            document.getElementById('overallScore').textContent = analysis.overallScore;
            
            let scoreDescription = '';
            if (analysis.overallScore >= 80) {
                scoreDescription = 'Excellent! Your resume is well-optimized.';
            } else if (analysis.overallScore >= 60) {
                scoreDescription = 'Good resume with room for improvement.';
            } else if (analysis.overallScore >= 40) {
                scoreDescription = 'Fair resume that needs some work.';
            } else {
                scoreDescription = 'Needs significant improvement.';
            }
            document.getElementById('scoreDescription').textContent = scoreDescription;
            
            // Content analysis
            document.getElementById('wordCount').textContent = analysis.wordCount;
            document.getElementById('sectionsFound').textContent = analysis.foundSections.join(', ') || 'None detected';
            
            const contactStatus = [];
            if (analysis.hasEmail) contactStatus.push('Email ✓');
            if (analysis.hasPhone) contactStatus.push('Phone ✓');
            if (analysis.hasLinkedIn) contactStatus.push('LinkedIn ✓');
            document.getElementById('contactInfo').innerHTML = contactStatus.join(', ') || '<span class="status-error">Missing contact info</span>';
            
            // Skills list
            const skillsList = document.getElementById('skillsList');
            skillsList.innerHTML = '';
            
            const allSkills = [...analysis.foundTechSkills, ...analysis.foundSoftSkills];
            if (allSkills.length > 0) {
                allSkills.forEach(skill => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span>${skill}</span>
                        <div class="skill-level">
                            <div class="skill-bar">
                                <div class="skill-fill" style="width: ${Math.random() * 40 + 60}%"></div>
                            </div>
                        </div>
                    `;
                    skillsList.appendChild(li);
                });
            } else {
                skillsList.innerHTML = '<li>No skills detected. Add relevant skills to improve your score.</li>';
            }
            
            // Format analysis
            document.getElementById('headerQuality').innerHTML = 
                (analysis.hasEmail && analysis.hasPhone) ? 
                '<span class="status-good">Good</span>' : 
                '<span class="status-warning">Needs improvement</span>';
            
            document.getElementById('sectionOrg').innerHTML = 
                analysis.foundSections.length >= 3 ? 
                '<span class="status-good">Well organized</span>' : 
                '<span class="status-warning">Could be better</span>';
            
            document.getElementById('bulletPoints').innerHTML = 
                analysis.bulletPoints >= 5 ? 
                '<span class="status-good">Good use of bullets</span>' : 
                '<span class="status-warning">Use more bullet points</span>';
            
            // Keyword analysis
            document.getElementById('keywordsFound').textContent = 
                analysis.foundTechSkills.length + analysis.foundSoftSkills.length;
            
            const keywordsList = document.getElementById('keywordsList');
            const allKeywords = [...analysis.foundTechSkills, ...analysis.foundSoftSkills];
            keywordsList.innerHTML = allKeywords.map(keyword => 
                `<span class="keyword-match">${keyword}</span>`
            ).join('');
            
            // Experience analysis
            document.getElementById('yearsExp').textContent = 
                analysis.estimatedYears > 0 ? `~${analysis.estimatedYears} years` : 'Not specified';
            document.getElementById('jobTitles').textContent = 
                analysis.foundTitles.length || 'None detected';
            document.getElementById('actionVerbs').textContent = 
                analysis.foundActionVerbs.length;
            
            // Improvements list
            const improvementsList = document.getElementById('improvementsList');
            improvementsList.innerHTML = '';
            
            if (analysis.improvements.length > 0) {
                analysis.improvements.forEach(improvement => {
                    const li = document.createElement('li');
                    li.textContent = improvement;
                    improvementsList.appendChild(li);
                });
            } else {
                improvementsList.innerHTML = '<li class="status-good">Great job! No major improvements needed.</li>';
            }
            
            // Suggestions
            const suggestions = document.getElementById('suggestions');
            const suggestionTexts = [
                'Consider quantifying your achievements with specific numbers and percentages.',
                'Tailor your resume keywords to match the job description you\'re applying for.',
                'Keep your resume to 1-2 pages for optimal readability.',
                'Use consistent formatting and professional fonts throughout.',
                'Include relevant certifications and continuous learning experiences.'
            ];
            
            suggestions.innerHTML = suggestionTexts.map(text => 
                `<p>• ${text}</p>`
            ).join('');
        }