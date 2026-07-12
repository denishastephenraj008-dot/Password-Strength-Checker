# Password Strength Checker

## Project Overview
Password Strength Checker is a modern, beginner-friendly cybersecurity mini project built with plain HTML, CSS, and Vanilla JavaScript. It evaluates the strength of a password in real time and provides actionable feedback, entropy estimates, crack-time estimates, and password generation tools.

## Features
- Responsive cybersecurity-themed interface with glassmorphism styling
- Real-time password analysis and scoring from 0–100
- Strength levels: Very Weak, Weak, Medium, Strong, Very Strong
- Feedback for length, uppercase, lowercase, number, symbol, repeated characters, sequential characters, keyboard patterns, dictionary words, and common passwords
- Password generator with configurable length and character types
- Copy-to-clipboard support
- Entropy and crack-time estimation
- Dark/light theme toggle
- Local storage support for the last 5 generated passwords and theme preference
- Keyboard-friendly and accessible interactions

## Technologies Used
- HTML5
- CSS3
- Vanilla JavaScript
- Local Storage API

## Folder Structure
```text
password-strength-checker/
│── index.html
│── style.css
│── script.js
│── common-passwords.js
│── README.md
```

## Installation and Usage
No installation is required. Open the project directly in a browser:

1. Open the folder containing the project.
2. Double-click index.html, or open it from your browser.
3. Start testing passwords immediately.

If you prefer a local server, you can run:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Screenshots
Placeholder for screenshots:
- Main analyzer dashboard
- Password generator panel
- Feedback and suggestions view

## Future Improvements
- Connect to a breach-check API for password exposure detection
- Add a password policy builder
- Support password export and import
- Add more advanced entropy modeling

## License
This project is open-source and can be used for educational purposes.
