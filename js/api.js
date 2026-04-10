// LearnBridge API Utils
const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options
  };

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth APIs
export async function register(username, email, password) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
}

export async function login(username, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

// Quiz APIs
export async function getQuizQuestions(language) {
  return apiRequest(`/quizzes/${language}/questions`);
}

export async function submitQuiz(language, answers) {
  return apiRequest(`/quizzes/${language}/submit`, {
    method: 'POST',
    body: JSON.stringify({ answers })
  });
}

// Leaderboard APIs
export async function getLeaderboard() {
  return apiRequest('/leaderboard');
}

export async function getMyRanking() {
  return apiRequest('/leaderboard/me');
}

