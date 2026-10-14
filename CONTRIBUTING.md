# Contributing to Precision Age Calculator

Thank you for your interest in contributing to **Precision Age Calculator**! We welcome contributions to enhance calculation accuracy, user experience, accessibility, and documentation.

---

## Code of Conduct

This project is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## Development Workflow

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Git

### 2. Getting Started
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Age-Calculator.git
   cd Age-Calculator
   ```
3. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/my-new-feature
   ```

### 3. Running the Test Suite
The project utilizes Node.js's native test runner (`node:test`) for zero-dependency, ultra-fast test execution.
```bash
npm test
```
To run tests continuously in watch mode:
```bash
npm run test:watch
```

### 4. Running the Local Application
Serve the files via any static web server:
```bash
# Using Node / npx:
npm start

# Or using Python:
python3 -m http.server 3000
```
Open `http://localhost:3000` in your web browser.

---

## Code Style & Architectural Guidelines

- **Zero Runtime Dependencies:** Keep client-side delivery pure vanilla HTML5, CSS3, and ES6+ modules.
- **Pure Functional Logic:** Core date mathematics must remain isolated inside `src/calculator.js` as pure functions without DOM side effects.
- **Test-Driven:** Any new date calculations, astronomical formulas, or edge cases must be accompanied by unit tests in `tests/calculator.test.js`.
- **Accessibility:** All UI controls must preserve WCAG 2.1 AA accessibility standards (valid labels, ARIA landmarks, keyboard navigation).

---

## Submitting a Pull Request

1. Ensure all unit tests pass:
   ```bash
   npm test
   ```
2. Commit your changes with a clear, conventional commit message:
   ```bash
   git commit -m "feat: add milestone progress indicator"
   ```
3. Push to your fork:
   ```bash
   git push origin feature/my-new-feature
   ```
4. Open a Pull Request against the `main` branch with a clear description of the problem solved.
