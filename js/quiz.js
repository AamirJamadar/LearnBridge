var quizData = {
    html: [
        {question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correct: 0},
        {question: "Which tag is used to create a hyperlink in HTML?", options: ["<link>", "<a>", "<href>", "<url>"], correct: 1},
        {question: "What is the correct HTML element for the largest heading?", options: ["<heading>", "<h6>", "<h1>", "<head>"], correct: 2},
        {question: "Which attribute specifies an alternate text for an image?", options: ["title", "alt", "src", "longdesc"], correct: 1},
        {question: "Which HTML element defines the title of a document?", options: ["<meta>", "<title>", "<head>", "<header>"], correct: 1},
        {question: "What is the correct HTML element for inserting a line break?", options: ["<break>", "<lb>", "<br>", "<newline>"], correct: 2},
        {question: "Which HTML attribute is used to define inline styles?", options: ["class", "styles", "style", "font"], correct: 2}
    ],
    css: [
        {question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct: 1},
        {question: "Which property is used to change the background color?", options: ["color", "bgcolor", "background-color", "background"], correct: 2},
        {question: "How do you select an element with id 'demo'?", options: ["#demo", ".demo", "demo", "*demo"], correct: 0},
        {question: "Which property is used to change the font of an element?", options: ["font-style", "font-family", "text-font", "font-weight"], correct: 1},
        {question: "How do you make each word in a text start with a capital letter?", options: ["text-transform: uppercase", "text-transform: capitalize", "text-style: capital", "font-caps: capital"], correct: 1},
        {question: "Which CSS property controls the text size?", options: ["text-size", "font-size", "text-style", "font-style"], correct: 1},
        {question: "What is the correct syntax for making a flex container?", options: ["display: flexbox", "display: flex", "display: box", "display: inline-flex"], correct: 1}
    ],
    javascript: [
        {question: "What is the correct way to declare a variable in JavaScript?", options: ["variable x = 5", "var x = 5", "v x = 5", "let = 5"], correct: 1},
        {question: "Which operator is used to assign a value to a variable?", options: ["=", "==", "===", ":"], correct: 0},
        {question: "How do you write a comment in JavaScript?", options: ["<!-- comment -->", "// comment", "** comment **", "## comment"], correct: 1},
        {question: "Which method is used to add an element to the end of an array?", options: ["append()", "push()", "addEnd()", "insert()"], correct: 1},
        {question: "What is the output of: typeof []?", options: ["array", "object", "list", "undefined"], correct: 1},
        {question: "Which keyword is used to define a function in JavaScript?", options: ["function", "def", "func", "method"], correct: 0},
        {question: "What does 'NaN' represent in JavaScript?", options: ["Not a Name", "Not a Number", "No Answer Needed", "New and Null"], correct: 1}
    ]
};

var quizState = {
    currentLanguage: 'html',
    currentQuestion: 0,
    score: 0,
    answers: [],
    isStarted: false,
    isCompleted: false
};

function initQuiz() {
    setupQuizTabs();
    setupStartButton();
    setupNavigationButtons();
    setupResultButtons();
    loadQuizProgress();
    updateHighScoresDisplay();
}

function setupQuizTabs() {
    var tabs = document.querySelectorAll('.quiz-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function() {
            changeLanguage(this.dataset.language);
        };
    }
}

function changeLanguage(lang) {
    quizState.currentLanguage = lang;
    var tabs = document.querySelectorAll('.quiz-tab');
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].dataset.language === lang) {
            tabs[i].classList.add('active');
        } else {
            tabs[i].classList.remove('active');
        }
    }
    quizState.currentQuestion = 0;
    quizState.score = 0;
    quizState.answers = [];
    quizState.isStarted = false;
    quizState.isCompleted = false;
    showQuizStart();
    updateQuestionCount();
}

function updateQuestionCount() {
    var countEls = document.querySelectorAll('#questionCount');
    var questions = quizData[quizState.currentLanguage];
    for (var i = 0; i < countEls.length; i++) {
        countEls[i].textContent = questions.length;
    }
    var totalEls = document.querySelectorAll('#totalQuestions, #totalQuestionsDisplay');
    for (var j = 0; j < totalEls.length; j++) {
        totalEls[j].textContent = questions.length;
    }
}

function setupStartButton() {
    var btn = document.getElementById('startQuizBtn');
    if (btn) btn.onclick = startQuiz;
}

function startQuiz() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        showToast('Please login to start the quiz', 'error');
        return;
    }
    quizState.isStarted = true;
    quizState.currentQuestion = 0;
    quizState.score = 0;
    quizState.answers = [];
    quizState.isCompleted = false;
    showQuizQuestions();
    displayQuestion();
    updateScoreDisplay();
    saveQuizProgress();
}

function showQuizStart() {
    var startEl = document.getElementById('quizStart');
    var questionsEl = document.getElementById('quizQuestions');
    var resultsEl = document.getElementById('quizResults');
    if (startEl) startEl.style.display = 'block';
    if (questionsEl) questionsEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'none';
    updateQuestionCount();
}

function showQuizQuestions() {
    var startEl = document.getElementById('quizStart');
    var questionsEl = document.getElementById('quizQuestions');
    var resultsEl = document.getElementById('quizResults');
    if (startEl) startEl.style.display = 'none';
    if (questionsEl) questionsEl.style.display = 'block';
    if (resultsEl) resultsEl.style.display = 'none';
}

function showQuizResults() {
    var startEl = document.getElementById('quizStart');
    var questionsEl = document.getElementById('quizQuestions');
    var resultsEl = document.getElementById('quizResults');
    if (startEl) startEl.style.display = 'none';
    if (questionsEl) questionsEl.style.display = 'none';
    if (resultsEl) resultsEl.style.display = 'block';
    displayResults();
}

function displayQuestion() {
    var questions = quizData[quizState.currentLanguage];
    var question = questions[quizState.currentQuestion];
    var qNumEl = document.getElementById('questionNumber');
    var totalEl = document.getElementById('totalQuestionsDisplay');
    if (qNumEl) qNumEl.textContent = quizState.currentQuestion + 1;
    if (totalEl) totalEl.textContent = questions.length;
    updateProgressBar();
    var badgeEl = document.getElementById('questionBadge');
    if (badgeEl) badgeEl.textContent = quizState.currentLanguage.toUpperCase();
    var qTextEl = document.getElementById('questionText');
    if (qTextEl) qTextEl.textContent = question.question;
    var optsEl = document.getElementById('answerOptions');
    if (optsEl) {
        var letters = ['A', 'B', 'C', 'D'];
        var html = '';
        for (var i = 0; i < question.options.length; i++) {
            var isSelected = quizState.answers[quizState.currentQuestion] === i;
            html += '<button class="answer-option ' + (isSelected ? 'selected' : '') + '" data-option="' + i + '">';
            html += '<span class="option-letter">' + letters[i] + '</span>';
            html += '<span class="option-text">' + question.options[i] + '</span>';
            html += '</button>';
        }
        optsEl.innerHTML = html;
        var opts = optsEl.querySelectorAll('.answer-option');
        for (var j = 0; j < opts.length; j++) {
            opts[j].onclick = (function(idx) {
                return function() { handleAnswer(idx); };
            })(j);
        }
    }
    updateNavigationButtons();
}

function handleAnswer(selectedOption) {
    var questions = quizData[quizState.currentLanguage];
    var question = questions[quizState.currentQuestion];
    var opts = document.querySelectorAll('.answer-option');
    var feedback = document.getElementById('answerFeedback');
    
    // Prevent double clicking during auto-advance
    if (quizState.answers[quizState.currentQuestion] !== undefined) return;
    
    quizState.answers[quizState.currentQuestion] = selectedOption;
    if (feedback) {
        feedback.style.display = 'none';
        feedback.className = 'answer-feedback';
    }
    for (var i = 0; i < opts.length; i++) {
        opts[i].classList.remove('selected', 'correct', 'incorrect');
        if (i === selectedOption) opts[i].classList.add('selected');
        if (i === question.correct) opts[i].classList.add('correct');
        if (i === selectedOption && selectedOption !== question.correct) opts[i].classList.add('incorrect');
    }
    if (feedback) {
        feedback.style.display = 'block';
        if (selectedOption === question.correct) {
            feedback.classList.add('correct');
            feedback.innerHTML = '<div class="feedback-content"><i class="fas fa-check-circle"></i><span class="feedback-text">Correct!</span></div>';
            quizState.score++;
        } else {
            feedback.classList.add('incorrect');
            feedback.innerHTML = '<div class="feedback-content"><i class="fas fa-times-circle"></i><span class="feedback-text">Incorrect! The correct answer is: ' + question.options[question.correct] + '</span></div>';
        }
    }
    updateScoreDisplay();
    saveQuizProgress();
    for (var j = 0; j < opts.length; j++) {
        opts[j].style.pointerEvents = 'none';
        if (j !== selectedOption && j !== question.correct) {
            opts[j].style.opacity = '0.5';
        }
    }
    
    // Auto advance to next question
    setTimeout(function() {
        if (quizState.currentQuestion === questions.length - 1) {
            finishQuiz();
        } else {
            navigateQuestions('next');
        }
    }, 1500);
}

function updateProgressBar() {
    var questions = quizData[quizState.currentLanguage];
    var progress = ((quizState.currentQuestion + 1) / questions.length) * 100;
    var barFill = document.getElementById('progressBarFill');
    var percentEl = document.getElementById('progressPercent');
    if (barFill) barFill.style.width = progress + '%';
    if (percentEl) percentEl.textContent = Math.round(progress) + '%';
}

function updateNavigationButtons() {
    var navContainer = document.querySelector('.quiz-navigation');
    if (navContainer) {
        navContainer.style.display = 'none'; // Hide manual navigation, we use auto-advance now
    }
}

function setupNavigationButtons() {
    var prevBtn = document.getElementById('prevBtn');
    var nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.onclick = function() { navigateQuestions('prev'); };
    if (nextBtn) nextBtn.onclick = function() { navigateQuestions('next'); };
}

function navigateQuestions(direction) {
    var questions = quizData[quizState.currentLanguage];
    var quizQuestionsEl = document.getElementById('quizQuestions');

    if (direction === 'prev' && quizState.currentQuestion > 0) {
        quizState.currentQuestion--;
        displayQuestion();
    } else if (direction === 'next') {
        if (quizState.currentQuestion === questions.length - 1) {
            finishQuiz();
        } else {
            if (quizQuestionsEl) {
                quizQuestionsEl.classList.add('slide-out-left');
                setTimeout(function() {
                    quizState.currentQuestion++;
                    displayQuestion();
                    quizQuestionsEl.classList.remove('slide-out-left');
                }, 400); // wait for slide out animation
            } else {
                quizState.currentQuestion++;
                displayQuestion();
            }
        }
    }
    saveQuizProgress();
}

function finishQuiz() {
    quizState.isCompleted = true;
    calculateScore();
    showQuizResults();
    saveHighScore();
    clearQuizProgress();
}

function calculateScore() {
    var questions = quizData[quizState.currentLanguage];
    var correct = 0;
    var incorrect = 0;
    for (var i = 0; i < quizState.answers.length; i++) {
        if (quizState.answers[i] === questions[i].correct) {
            correct++;
        } else {
            incorrect++;
        }
    }
    quizState.score = correct;
    return { correct: correct, incorrect: incorrect, total: questions.length };
}

function displayResults() {
    var result = calculateScore();
    var percentage = Math.round((result.correct / result.total) * 100);
    var finalScoreEl = document.getElementById('finalScore');
    var finalTotalEl = document.getElementById('finalTotal');
    var correctCountEl = document.getElementById('correctCount');
    var incorrectCountEl = document.getElementById('incorrectCount');
    var msgEl = document.getElementById('resultsMessage');
    if (finalScoreEl) finalScoreEl.textContent = result.correct;
    if (finalTotalEl) finalTotalEl.textContent = result.total;
    if (correctCountEl) correctCountEl.textContent = result.correct;
    if (incorrectCountEl) incorrectCountEl.textContent = result.incorrect;
    if (msgEl) {
        if (percentage >= 80) msgEl.textContent = 'Excellent! You\'re a master!';
        else if (percentage >= 60) msgEl.textContent = 'Great job! Keep learning!';
        else if (percentage >= 40) msgEl.textContent = 'Good effort! Practice more!';
        else msgEl.textContent = 'Keep practicing! You\'ll get better!';
    }
    updateScoreDisplay();
}

function updateScoreDisplay() {
    var scoreEl = document.getElementById('currentScore');
    var percentEl = document.getElementById('scorePercentage');
    var questions = quizData[quizState.currentLanguage];
    var answered = 0;
    for (var i = 0; i < quizState.answers.length; i++) {
        if (quizState.answers[i] !== undefined) answered++;
    }
    var percentage = answered > 0 ? Math.round((quizState.score / answered) * 100) : 0;
    if (scoreEl) scoreEl.textContent = quizState.score;
    if (percentEl) percentEl.textContent = percentage + '%';
}

function setupResultButtons() {
    var retryBtn = document.getElementById('retryBtn');
    var changeBtn = document.getElementById('changeLanguageBtn');
    if (retryBtn) retryBtn.onclick = resetQuiz;
    if (changeBtn) changeBtn.onclick = showQuizStart;
}

function resetQuiz() {
    quizState.currentQuestion = 0;
    quizState.score = 0;
    quizState.answers = [];
    quizState.isStarted = false;
    quizState.isCompleted = false;
    showQuizStart();
    clearQuizProgress();
    updateScoreDisplay();
}

function saveQuizProgress() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    var user = JSON.parse(currentUser);
    var key = 'quizProgress_' + user.username + '_' + quizState.currentLanguage;
    localStorage.setItem(key, JSON.stringify({
        currentQuestion: quizState.currentQuestion,
        score: quizState.score,
        answers: quizState.answers,
        isStarted: quizState.isStarted,
        isCompleted: quizState.isCompleted,
        timestamp: Date.now()
    }));
}

function loadQuizProgress() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    var user = JSON.parse(currentUser);
    var key = 'quizProgress_' + user.username + '_' + quizState.currentLanguage;
    var saved = localStorage.getItem(key);
    if (saved) {
        var progress = JSON.parse(saved);
        if (Date.now() - progress.timestamp < 24 * 60 * 60 * 1000) {
            quizState.currentQuestion = progress.currentQuestion || 0;
            quizState.score = progress.score || 0;
            quizState.answers = progress.answers || [];
            quizState.isStarted = progress.isStarted || false;
            quizState.isCompleted = progress.isCompleted || false;
            if (quizState.isStarted && !quizState.isCompleted) {
                showQuizQuestions();
                displayQuestion();
            } else if (quizState.isCompleted) {
                showQuizResults();
            } else {
                showQuizStart();
            }
            updateQuestionCount();
            updateScoreDisplay();
        } else {
            clearQuizProgress();
        }
    }
}

function clearQuizProgress() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    var user = JSON.parse(currentUser);
    var key = 'quizProgress_' + user.username + '_' + quizState.currentLanguage;
    localStorage.removeItem(key);
}

function saveHighScore() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    var user = JSON.parse(currentUser);
    var key = 'highScore_' + user.username;
    var result = calculateScore();
    var percentage = Math.round((result.correct / result.total) * 100);
    var newScore = {
        language: quizState.currentLanguage,
        score: result.correct,
        total: result.total,
        percentage: percentage,
        date: Date.now()
    };
    var existing = localStorage.getItem(key);
    if (existing) {
        var scores = JSON.parse(existing);
        scores[quizState.currentLanguage] = newScore;
        localStorage.setItem(key, JSON.stringify(scores));
    } else {
        var scores = { html: null, css: null, javascript: null };
        scores[quizState.currentLanguage] = newScore;
        localStorage.setItem(key, JSON.stringify(scores));
    }
    
    // Submit score to backend
    fetch('http://127.0.0.1:5000/api/quiz_results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            score: result.correct,
            quiz_name: quizState.currentLanguage
        })
    }).then(res => res.json()).then(data => {
        if(data.xp_gained > 0) {
            console.log(`Earned ${data.xp_gained} XP! Level: ${data.new_level}`);
            
            // Pop the XP indicator
            showXPPopup(`+${data.xp_gained} XP`);
            
            // If they leveled up!
            if(data.level_up) {
                setTimeout(() => showToast(`Congratulations! You reached Level ${data.new_level}!`, 'success'), 1500);
            }
            
            // If they unlocked a new badge!
            if(data.new_badge) {
                setTimeout(() => showBadgePopup(data.new_badge.name, data.new_badge.icon, data.xp_gained), 3000);
            }
            
            // Update global active user state
            var storedUser = JSON.parse(localStorage.getItem('currentUser'));
            if(storedUser) {
                storedUser.xp = data.new_xp;
                storedUser.level = data.new_level;
                localStorage.setItem('currentUser', JSON.stringify(storedUser));
                // If updateDashboardUI is accessible
                if(typeof updateDashboardUI === 'function') {
                    updateDashboardUI(storedUser);
                }
            }
        }
    }).catch(err => console.error('Failed to submit score:', err));

    updateHighScoresDisplay();
}

function showXPPopup(text) {
    var xpPopup = document.getElementById('xpPopup');
    if (!xpPopup) return;
    
    var textEl = xpPopup.querySelector('.xp-popup-text');
    if (textEl) textEl.textContent = text;
    
    xpPopup.classList.add('active');
    setTimeout(() => {
        xpPopup.classList.remove('active');
    }, 2000);
}

function showBadgePopup(name, iconClass, xpGained) {
    var badgePopup = document.getElementById('badgePopup');
    var closeBtn = document.getElementById('badgePopupClose');
    if (!badgePopup) return;
    
    var iconEl = document.getElementById('badgePopupIcon');
    if(iconEl) iconEl.innerHTML = `<i class="${iconClass}"></i>`;
    
    var nameEl = document.getElementById('badgePopupName');
    if(nameEl) nameEl.textContent = name;
    
    var xpEl = document.getElementById('badgePopupXP');
    if(xpEl) xpEl.textContent = `+${xpGained} XP`;
    
    badgePopup.classList.add('active');
    
    if (closeBtn) {
        closeBtn.onclick = () => badgePopup.classList.remove('active');
    }
    
    // Auto close after 5 seconds
    setTimeout(() => badgePopup.classList.remove('active'), 5000);
}

function updateHighScoresDisplay() {
    var currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return;
    var user = JSON.parse(currentUser);
    var key = 'highScore_' + user.username;
    var scores = JSON.parse(localStorage.getItem(key) || '{}');
    window.userHighScores = scores;
}
