/**
 * Application Controller & UI Logic
 * Connects the DOM, user interactions, accessibility, and calculation engine.
 */

import {
  parseLocalDate,
  formatDateISO,
  calculateCompleteDossier,
} from "./calculator.js";

// DOM Elements
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeIcon = document.getElementById("theme-icon");

const dobInput = document.getElementById("dob-input");
const targetDateInput = document.getElementById("target-date-input");
const targetToggle = document.getElementById("target-toggle");
const targetGroup = document.getElementById("target-date-group");
const calculateBtn = document.getElementById("calculate-btn");
const resetBtn = document.getElementById("reset-btn");
const notificationBanner = document.getElementById("notification-banner");
const notificationText = document.getElementById("notification-text");

// Results Elements
const resultsSection = document.getElementById("results-section");
const yearsVal = document.getElementById("years-val");
const monthsVal = document.getElementById("months-val");
const daysVal = document.getElementById("days-val");
const birthdayBanner = document.getElementById("birthday-banner");

const nextBdayDays = document.getElementById("next-bday-days");
const nextBdayDetail = document.getElementById("next-bday-detail");
const nextBdayWeekday = document.getElementById("next-bday-weekday");
const bdayProgressBar = document.getElementById("bday-progress-bar");

const totalDaysVal = document.getElementById("total-days-val");
const totalWeeksVal = document.getElementById("total-weeks-val");
const totalHoursVal = document.getElementById("total-hours-val");
const totalMinutesVal = document.getElementById("total-minutes-val");

const heartbeatsVal = document.getElementById("heartbeats-val");
const breathsVal = document.getElementById("breaths-val");

const dayBornVal = document.getElementById("day-born-val");
const westernZodiacVal = document.getElementById("western-zodiac-val");
const chineseZodiacVal = document.getElementById("chinese-zodiac-val");

const copySummaryBtn = document.getElementById("copy-summary-btn");

// Global state for copying
let lastDossier = null;

/* --------------------------------------------------------------------------
   Theme Management
   -------------------------------------------------------------------------- */

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const initialTheme = savedTheme || "dark";

  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const nextTheme = current === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem("theme", nextTheme);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (themeIcon) {
    // Show sun in dark mode to switch to light, moon in light mode to switch to dark
    themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  }
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
  }
}

/* --------------------------------------------------------------------------
   Notification Banner
   -------------------------------------------------------------------------- */

function showNotification(message, type = "error") {
  if (!notificationBanner || !notificationText) return;
  notificationText.textContent = message;
  notificationBanner.className = `notification-banner active ${type}`;
  notificationBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideNotification() {
  if (!notificationBanner) return;
  notificationBanner.className = "notification-banner";
  notificationBanner.style.display = "none";
}

/* --------------------------------------------------------------------------
   Number Animation Helper
   -------------------------------------------------------------------------- */

function animateNumber(element, target, duration = 800) {
  if (!element) return;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out quart
    const ease = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(start + (target - start) * ease);
    element.textContent = current.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}

/* --------------------------------------------------------------------------
   Calculation Handler
   -------------------------------------------------------------------------- */

export function handleCalculate() {
  hideNotification();

  const dobVal = dobInput.value;
  if (!dobVal) {
    showNotification("Please select your Date of Birth to calculate.", "error");
    dobInput.focus();
    return;
  }

  let targetVal = new Date();
  if (targetToggle && targetToggle.checked && targetDateInput.value) {
    targetVal = targetDateInput.value;
  }

  let dossier;
  try {
    dossier = calculateCompleteDossier(dobVal, targetVal);
  } catch (err) {
    showNotification(err.message || "An error occurred with the input dates.", "error");
    return;
  }

  if (!dossier.isValid) {
    showNotification(dossier.error, "error");
    return;
  }

  lastDossier = dossier;
  renderDossier(dossier);
}

function renderDossier(dossier) {
  const { age, lifeStats, nextBirthday, westernZodiac, chineseZodiac, dayOfWeekBorn } = dossier;

  // Reveal results container
  resultsSection.classList.add("active");

  // Animate main stat cards
  animateNumber(yearsVal, age.years);
  animateNumber(monthsVal, age.months);
  animateNumber(daysVal, age.days);

  // Birthday banner
  if (age.isTodayBirthday) {
    birthdayBanner.classList.add("active");
  } else {
    birthdayBanner.classList.remove("active");
  }

  // Next Birthday Countdown
  if (nextBirthday) {
    if (nextBirthday.isToday) {
      nextBdayDays.textContent = "Today! 🎂";
      nextBdayDetail.textContent = "Celebration time! Have a great one!";
      nextBdayWeekday.textContent = nextBirthday.weekday;
      bdayProgressBar.style.width = "100%";
    } else {
      nextBdayDays.textContent = `${nextBirthday.daysRemaining} days`;
      nextBdayDetail.textContent = `${nextBirthday.monthsRemaining} months, ${nextBirthday.detailedDaysRemaining} days away`;
      nextBdayWeekday.textContent = `${nextBirthday.weekday} (${nextBirthday.nextDate})`;
      // Progress across 365 days
      const pct = Math.max(0, Math.min(100, Math.round(((365 - nextBirthday.daysRemaining) / 365) * 100)));
      bdayProgressBar.style.width = `${pct}%`;
    }
  }

  // Lifetime Milestones
  if (lifeStats) {
    animateNumber(totalDaysVal, lifeStats.totalDays);
    animateNumber(totalWeeksVal, lifeStats.totalWeeks);
    animateNumber(totalHoursVal, lifeStats.totalHours);
    animateNumber(totalMinutesVal, lifeStats.totalMinutes);

    animateNumber(heartbeatsVal, lifeStats.estimatedHeartbeats);
    animateNumber(breathsVal, lifeStats.estimatedBreaths);
  }

  // Astrological & Cultural
  dayBornVal.textContent = dayOfWeekBorn;
  westernZodiacVal.textContent = `${westernZodiac.symbol} ${westernZodiac.name} (${westernZodiac.dates})`;
  chineseZodiacVal.textContent = `${chineseZodiac.emoji} Year of the ${chineseZodiac.name}`;

  // Smooth scroll down to results on mobile
  if (window.innerWidth < 768) {
    resultsSection.scrollIntoView({ behavior: "smooth" });
  }
}

/* --------------------------------------------------------------------------
   Reset Form
   -------------------------------------------------------------------------- */

function handleReset() {
  dobInput.value = "";
  if (targetDateInput) {
    targetDateInput.value = formatDateISO(new Date());
  }
  if (targetToggle) {
    targetToggle.checked = false;
    targetGroup.style.display = "none";
  }
  hideNotification();
  resultsSection.classList.remove("active");
  lastDossier = null;
  dobInput.focus();
}

/**
 * Copies text to clipboard using modern Clipboard API with fallback.
 * @param {string} text
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text) {
  if (navigator?.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for non-secure contexts, iframes, or restricted browser permissions
  return new Promise((resolve, reject) => {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      textarea.style.opacity = "0";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (success) {
        resolve();
      } else {
        reject(new Error("Clipboard copy command was unsuccessful."));
      }
    } catch (err) {
      reject(err);
    }
  });
}

function handleCopySummary() {
  if (!lastDossier) return;

  const { age, nextBirthday, westernZodiac, chineseZodiac, dayOfWeekBorn } = lastDossier;
  const summaryText = [
    `✨ Chronological Age: ${age.years} Years, ${age.months} Months, ${age.days} Days`,
    `🎂 Next Birthday: ${nextBirthday.daysRemaining} days away (${nextBirthday.weekday})`,
    `📅 Born on: ${dayOfWeekBorn}`,
    `♈ Western Zodiac: ${westernZodiac.symbol} ${westernZodiac.name}`,
    `🐉 Chinese Zodiac: ${chineseZodiac.emoji} ${chineseZodiac.name}`,
    `Calculated via Precision Age Calculator: https://github.com/vanimendiratta/Age-Calculator`,
  ].join("\n");

  copyToClipboard(summaryText)
    .then(() => {
      const originalText = copySummaryBtn.innerHTML;
      copySummaryBtn.innerHTML = `✓ Copied!`;
      setTimeout(() => {
        copySummaryBtn.innerHTML = originalText;
      }, 2000);
    })
    .catch(() => {
      showNotification("Clipboard access unavailable. Please copy manually.", "error");
    });
}

/* --------------------------------------------------------------------------
   Initialization
   -------------------------------------------------------------------------- */

export function initApp() {
  initTheme();

  const todayStr = formatDateISO(new Date());

  // Set default max date to today
  if (dobInput) {
    dobInput.max = todayStr;
    dobInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCalculate();
      }
    });
  }

  if (targetDateInput) {
    targetDateInput.value = todayStr;
    targetDateInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCalculate();
      }
    });
  }

  // Target date toggle checkbox
  if (targetToggle && targetGroup) {
    targetToggle.addEventListener("change", () => {
      if (targetToggle.checked) {
        targetGroup.style.display = "flex";
      } else {
        targetGroup.style.display = "none";
        targetDateInput.value = todayStr;
      }
    });
  }

  // Presets
  document.querySelectorAll("[data-preset]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const preset = chip.getAttribute("data-preset");
      if (preset === "today") {
        dobInput.value = todayStr;
        handleCalculate();
      } else if (preset === "2000") {
        dobInput.value = "2000-01-01";
        handleCalculate();
      } else if (preset === "clear") {
        handleReset();
      }
    });
  });

  if (calculateBtn) {
    calculateBtn.addEventListener("click", handleCalculate);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", handleReset);
  }

  if (copySummaryBtn) {
    copySummaryBtn.addEventListener("click", handleCopySummary);
  }
}

// Auto-run if executed in browser
if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
}
