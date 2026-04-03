const mongoose = require('mongoose');

const quizScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  language: {
    type: String,
    enum: ['html', 'css', 'javascript'],
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedOption: Number,
    correct: Boolean
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QuizScore', quizScoreSchema);

