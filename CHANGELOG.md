# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-10-13

### Added
- **Precision Date Calculation Engine (`src/calculator.js`):**
  - Calendar-accurate calculation of Years, Months, and Days considering leap years and differing month lengths.
  - Safe local date parsing (`parseLocalDate`) preventing UTC midnight timezone skew.
  - Lifetime statistics calculation (total days, weeks, hours, minutes, heartbeats, and breaths).
  - Next birthday countdown with exact days remaining, weekday announcement, and annual progress bar.
  - Astrological Western Zodiac sign and Chinese Zodiac animal determination.
  - Day of week born resolution.
  - Optional target date calculation mode (calculate age as of any future or past date).
- **Automated Test Suite (`tests/calculator.test.js`):**
  - 34 comprehensive unit tests using Node.js built-in `node:test` covering leap years, month boundaries, same-day births, future date guards, and zodiac logic.
- **Modern Glassmorphic UI & Design System (`age-calculator.css`):**
  - Full design tokens with dark mode default and persistent light mode toggle.
  - Animated stat counter transitions and birthday celebration banner.
  - Responsive layouts optimized for mobile, tablet, and desktop viewports.
  - Accessible focus states, keyboard navigation (`Enter` key submission), and screen reader announcements (`role="alert"`).
  - One-click "Copy Life Summary" to clipboard.
- **Engineering Tooling & Infrastructure:**
  - `package.json` with test scripts and project metadata.
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`) matrix-testing across Node 18, 20, and 22.
  - `.gitignore` and `.editorconfig`.
  - Comprehensive documentation in `docs/` and updated `README.md`.
  - Authentic application screenshots in `docs/images/`.

### Fixed
- Fixed critical calculation bug where age was computed solely via `now_year - dob_year`, producing incorrect age values when birthday had not yet occurred in the current year.
- Fixed negative age output when future dates were entered.
- Fixed thread-blocking native `alert()` dialogs by replacing them with accessible inline notification banners.
- Fixed non-responsive fixed `width: 500px; height: 250px;` container that clipped content on smaller screens.

---

## [1.0.0] - 2023-07-25

### Added
- Initial proof-of-concept release with basic HTML structure, minimal CSS, and year difference subtraction logic.
