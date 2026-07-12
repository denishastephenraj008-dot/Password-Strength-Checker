const passwordInput = document.getElementById('password');
const togglePasswordButton = document.getElementById('togglePassword');
const clearButton = document.getElementById('clearButton');
const checkButton = document.getElementById('checkButton');
const generateButton = document.getElementById('generateButton');
const copyButton = document.getElementById('copyButton');
const clearHistoryButton = document.getElementById('clearHistoryButton');
const themeToggle = document.getElementById('themeToggle');
const generatedPasswordInput = document.getElementById('generatedPassword');
const feedbackList = document.getElementById('feedbackList');
const suggestionsList = document.getElementById('suggestionsList');
const historyList = document.getElementById('historyList');
const strengthLabel = document.getElementById('strengthLabel');
const scoreValue = document.getElementById('scoreValue');
const strengthBar = document.getElementById('strengthBar');
const entropyValue = document.getElementById('entropyValue');
const crackTimeValue = document.getElementById('crackTimeValue');
const toast = document.getElementById('toast');
const liveHint = document.getElementById('liveHint');
const lengthRange = document.getElementById('lengthRange');
const lengthValue = document.getElementById('lengthValue');
const useUppercase = document.getElementById('useUppercase');
const useLowercase = document.getElementById('useLowercase');
const useNumbers = document.getElementById('useNumbers');
const useSymbols = document.getElementById('useSymbols');
const yearLabel = document.getElementById('year');

const commonWordPatterns = [
  'password',
  'admin',
  'qwerty',
  'welcome',
  'letmein',
  'secret',
  'login',
  'user',
  'pass',
  'hello',
  'world',
  'iloveyou',
  'monkey',
  'dragon',
  'football',
  'baseball',
  'summer',
  'winter',
  'master',
  'sunshine',
  'company',
  'service',
  'support',
  'ninja'
];

function init() {
  const storedTheme = localStorage.getItem('password-checker-theme') || 'dark';
  applyTheme(storedTheme);

  const storedHistory = JSON.parse(localStorage.getItem('password-checker-history') || '[]');
  renderHistory(storedHistory);

  lengthValue.textContent = lengthRange.value;
  yearLabel.textContent = new Date().getFullYear();

  passwordInput.addEventListener('input', () => evaluatePassword(passwordInput.value));
  clearButton.addEventListener('click', clearPassword);
  checkButton.addEventListener('click', () => evaluatePassword(passwordInput.value));
  togglePasswordButton.addEventListener('click', togglePasswordVisibility);
  generateButton.addEventListener('click', generatePassword);
  copyButton.addEventListener('click', copyGeneratedPassword);
  clearHistoryButton.addEventListener('click', clearHistory);
  themeToggle.addEventListener('click', toggleTheme);
  lengthRange.addEventListener('input', () => {
    lengthValue.textContent = lengthRange.value;
  });

  resetAnalysis();
}

function resetAnalysis() {
  updateScore(0, 'Very Weak');
  updateMetrics(0, 'Instantly');
  renderFeedback({});
  renderSuggestions({});
}

function evaluatePassword(password) {
  const trimmed = password.trim();

  if (!trimmed) {
    resetAnalysis();
    liveHint.textContent = 'Real-time analysis is running.';
    return;
  }

  const checks = {
    length: trimmed.length >= 8,
    length12: trimmed.length >= 12,
    length16: trimmed.length >= 16,
    uppercase: /[A-Z]/.test(trimmed),
    lowercase: /[a-z]/.test(trimmed),
    number: /\d/.test(trimmed),
    symbol: /[^A-Za-z0-9]/.test(trimmed),
    repeated: !hasRepeatedCharacters(trimmed),
    sequential: !hasSequentialCharacters(trimmed),
    keyboard: !hasKeyboardPattern(trimmed),
    dictionary: !containsDictionaryWord(trimmed),
    common: !isCommonPassword(trimmed)
  };

  let score = 0;
  if (checks.length) score += 15;
  if (checks.length12) score += 8;
  if (checks.length16) score += 7;
  if (checks.uppercase) score += 10;
  if (checks.lowercase) score += 10;
  if (checks.number) score += 10;
  if (checks.symbol) score += 10;
  if (checks.repeated) score += 8;
  if (checks.sequential) score += 7;
  if (checks.keyboard) score += 6;
  if (checks.dictionary) score += 6;
  if (checks.common) score += 8;

  score = Math.min(100, Math.max(0, score));
  const strength = getStrength(score);
  const entropy = estimateEntropy(trimmed);
  const crackTime = estimateCrackTime(entropy);

  updateScore(score, strength);
  updateMetrics(entropy, crackTime);
  renderFeedback(checks);
  renderSuggestions(checks, trimmed);
  liveHint.textContent = `Password score updated to ${score}%`;
}

function getStrength(score) {
  if (score < 21) return 'Very Weak';
  if (score < 41) return 'Weak';
  if (score < 61) return 'Medium';
  if (score < 81) return 'Strong';
  return 'Very Strong';
}

function updateScore(score, strength) {
  strengthLabel.textContent = strength;
  scoreValue.textContent = `${score}%`;
  strengthBar.style.width = `${score}%`;
  strengthBar.style.background = getBarColor(score);
  const progress = document.querySelector('.progress-track');
  if (progress) {
    progress.setAttribute('aria-valuenow', String(score));
  }
  strengthLabel.style.color = getBarColor(score);
  scoreValue.style.color = getBarColor(score);
}

function getBarColor(score) {
  if (score < 21) return 'var(--danger)';
  if (score < 41) return '#ff8c42';
  if (score < 61) return '#f7d354';
  if (score < 81) return '#8de892';
  return 'var(--success)';
}

function updateMetrics(entropy, crackTime) {
  entropyValue.textContent = `${entropy} bits`;
  crackTimeValue.textContent = crackTime;
}

function renderFeedback(checks) {
  const items = [
    { label: 'Length', passed: checks.length || false },
    { label: 'Uppercase', passed: checks.uppercase || false },
    { label: 'Lowercase', passed: checks.lowercase || false },
    { label: 'Number', passed: checks.number || false },
    { label: 'Symbol', passed: checks.symbol || false },
    { label: 'Common Password', passed: checks.common || false },
    { label: 'Repeated Characters', passed: checks.repeated || false },
    { label: 'Sequential Characters', passed: checks.sequential || false }
  ];

  feedbackList.innerHTML = items.map((item) => {
    const icon = item.passed ? '✓' : '✗';
    const className = item.passed ? 'pass' : 'fail';
    return `<li class="${className}"><span class="item-icon">${icon}</span><span>${item.label}</span></li>`;
  }).join('');
}

function renderSuggestions(checks, password = '') {
  const suggestions = [];
  const safeChecks = checks || {};

  if (!safeChecks.length) suggestions.push('Increase the password length to at least 8 characters.');
  if (!safeChecks.uppercase) suggestions.push('Add at least one uppercase letter.');
  if (!safeChecks.lowercase) suggestions.push('Add at least one lowercase letter.');
  if (!safeChecks.number) suggestions.push('Add at least one number.');
  if (!safeChecks.symbol) suggestions.push('Add at least one symbol such as !, @, #, or $.');
  if (!safeChecks.common) suggestions.push('Avoid common passwords and predictable patterns.');
  if (!safeChecks.repeated) suggestions.push('Reduce repeated characters or letter clusters.');
  if (!safeChecks.sequential) suggestions.push('Avoid sequential values such as 12345 or abcde.');
  if (!safeChecks.keyboard) suggestions.push('Avoid keyboard patterns such as qwerty or asdf.');
  if (!safeChecks.dictionary) suggestions.push('Avoid dictionary words and obvious personal terms.');
  if (password.length < 16) suggestions.push('Aim for a longer password with a mix of character types.');

  if (!suggestions.length) {
    suggestionsList.innerHTML = '<li>Excellent work. This password is strong and difficult to guess.</li>';
    return;
  }

  suggestionsList.innerHTML = suggestions.slice(0, 5).map((item) => `<li>${item}</li>`).join('');
}

function isCommonPassword(password) {
  const normalized = password.toLowerCase();
  return window.commonPasswords.some((entry) => normalized.includes(entry.toLowerCase()));
}

function hasRepeatedCharacters(password) {
  const counts = {};
  for (const character of password) {
    counts[character] = (counts[character] || 0) + 1;
    if (counts[character] > 3) {
      return true;
    }
  }
  return false;
}

function hasSequentialCharacters(password) {
  const normalized = password.toLowerCase();
  for (let index = 0; index < normalized.length - 2; index += 1) {
    const first = normalized.charCodeAt(index);
    const second = normalized.charCodeAt(index + 1);
    const third = normalized.charCodeAt(index + 2);
    if (second === first + 1 && third === first + 2) {
      return true;
    }
  }
  return false;
}

function hasKeyboardPattern(password) {
  const normalized = password.toLowerCase();
  const patterns = ['qwerty', 'asdf', 'zxcvbn', '12345', 'password'];
  return patterns.some((pattern) => normalized.includes(pattern));
}

function containsDictionaryWord(password) {
  const normalized = password.toLowerCase().replace(/[^a-z]/g, '');
  return commonWordPatterns.some((word) => normalized.includes(word));
}

function estimateEntropy(password) {
  if (!password) return 0;
  const charsetSize = estimateCharsetSize(password);
  return Math.round(Math.log2(Math.pow(charsetSize, password.length)));
}

function estimateCharsetSize(password) {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/\d/.test(password)) size += 10;
  if (/[^A-Za-z0-9]/.test(password)) size += 33;
  return size || 1;
}

function estimateCrackTime(entropy) {
  const seconds = Math.pow(2, entropy) / 1e9;
  if (seconds < 60) return 'Instantly';
  if (seconds < 3600) return 'Few minutes';
  if (seconds < 86400) return 'Few hours';
  if (seconds < 31536000) return 'Few days';
  if (seconds < 3.15e9) return 'Several years';
  return 'Millions of years';
}

function clearPassword() {
  passwordInput.value = '';
  generatedPasswordInput.value = '';
  liveHint.textContent = 'Password cleared.';
  resetAnalysis();
}

function togglePasswordVisibility() {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  togglePasswordButton.textContent = isHidden ? '🙈' : '👁️';
  togglePasswordButton.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
}

function generatePassword() {
  const length = Number(lengthRange.value);
  const sets = [];

  if (useUppercase.checked) sets.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  if (useLowercase.checked) sets.push('abcdefghijklmnopqrstuvwxyz');
  if (useNumbers.checked) sets.push('0123456789');
  if (useSymbols.checked) sets.push('!@#$%^&*()-_=+[]{};:,.<>?');

  if (!sets.length) {
    showToast('Select at least one character type.');
    return;
  }

  let generated = '';
  sets.forEach((set) => {
    generated += pickRandom(set);
  });

  while (generated.length < length) {
    const set = sets[Math.floor(Math.random() * sets.length)];
    generated += pickRandom(set);
  }

  generated = shuffleString(generated).slice(0, length);
  generatedPasswordInput.value = generated;
  passwordInput.value = generated;
  evaluatePassword(generated);
  saveToHistory(generated);
  showToast('Password generated successfully.');
}

function pickRandom(input) {
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return input[values[0] % input.length];
  }
  return input[Math.floor(Math.random() * input.length)];
}

function shuffleString(value) {
  const characters = value.split('');
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [characters[index], characters[randomIndex]] = [characters[randomIndex], characters[index]];
  }
  return characters.join('');
}

function copyGeneratedPassword() {
  const password = generatedPasswordInput.value || passwordInput.value;
  if (!password) {
    showToast('Generate a password first.');
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(password).then(() => {
      showToast('Password copied to clipboard.');
    }).catch(() => fallbackCopy(password));
  } else {
    fallbackCopy(password);
  }
}

function fallbackCopy(password) {
  const helper = document.createElement('textarea');
  helper.value = password;
  document.body.appendChild(helper);
  helper.select();
  document.execCommand('copy');
  document.body.removeChild(helper);
  showToast('Password copied to clipboard.');
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('theme-light');
  const themeName = isLight ? 'light' : 'dark';
  localStorage.setItem('password-checker-theme', themeName);
  themeToggle.textContent = isLight ? '🌙' : '☀️';
  themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('theme-light');
    themeToggle.textContent = '🌙';
    themeToggle.setAttribute('aria-label', 'Switch to dark theme');
  } else {
    document.body.classList.remove('theme-light');
    themeToggle.textContent = '☀️';
    themeToggle.setAttribute('aria-label', 'Switch to light theme');
  }
}

function saveToHistory(password) {
  const history = JSON.parse(localStorage.getItem('password-checker-history') || '[]');
  const updated = [password, ...history.filter((entry) => entry !== password)].slice(0, 5);
  localStorage.setItem('password-checker-history', JSON.stringify(updated));
  renderHistory(updated);
}

function renderHistory(history) {
  if (!history.length) {
    historyList.innerHTML = '<li>No generated passwords yet.</li>';
    return;
  }

  historyList.innerHTML = history.map((entry) => `
    <li>
      <span>${entry}</span>
      <button type="button" data-password="${entry}">Use</button>
    </li>
  `).join('');

  historyList.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.getAttribute('data-password');
      passwordInput.value = value;
      generatedPasswordInput.value = value;
      evaluatePassword(value);
      showToast('Password loaded from history.');
    });
  });
}

function clearHistory() {
  localStorage.removeItem('password-checker-history');
  renderHistory([]);
  showToast('Password history cleared.');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove('show');
  }, 1800);
}

init();
