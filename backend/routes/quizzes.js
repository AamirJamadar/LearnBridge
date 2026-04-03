const express = require('express');
const auth = require('../middleware/auth');
const QuizScore = require('../models/QuizScore');
const User = require('../models/User');
const router = express.Router();

// Sample quiz data (in prod, own collection)
const quizQuestions = {
  html: [
    {question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correct: 0},
    {question: "Which tag is used to create a hyperlink in HTML?", options: ["<link>", "<a>", "<href>", "<url>"], correct: 1},
    {question: "What is the correct HTML element for the largest heading?", options: ["<heading>", "<h6>", "<h1>", "<head>"], correct: 2},
    // Add all frontend questions...
  ],
  css: [
    {question: "What does CSS stand for?", options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"], correct: 1},
    // ...
  ],
  javascript: [
    {question: "What is the correct way to declare a variable in JavaScript?", options: ["variable x = 5", "var x = 5", "v x = 5", "let = 5"], correct: 1},
    // ...
  ]
};

// @route   GET api/quizzes/:language/questions
// @desc    Get quiz questions for language
router.get('/:language/questions', auth, async (req, res) => {
  const { language } = req.params;
  const questions = quizQuestions[language] || [];
  res.json({ questions });
});

// @route   POST api/quizzes/:language/submit
// @desc    Submit quiz answers
router.post('/:language/submit', auth, async (req, res) => {
  try {
    const { language } = req.params;
    const { answers } = req.body; // array of {questionIndex, selectedOption}

    const questions = quizQuestions[language] || [];
    let score = 0;
    const detailedAnswers = [];

    answers.forEach(ans => {
      const q = questions[ans.questionIndex];
      if (q && ans.selectedOption === q.correct) {
        score++;
      }
      detailedAnswers.push({
        questionIndex: ans.questionIndex,
        selectedOption: ans.selectedOption,
        correct: q ? ans.selectedOption === q.correct : false
      });
    });

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    // Save score
    const quizScore = new QuizScore({
      userId: req.user._id,
      language,
      score,
      totalQuestions: total,
      percentage,
      answers: detailedAnswers
    });
    await quizScore.save();

    // Update user high score
    await User.findByIdAndUpdate(req.user._id, {
      $max: { [`highScores.${language}`]: score },
      $inc: { totalScore: score }
    });

    res.json({ score, total, percentage, message: 'Quiz submitted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

