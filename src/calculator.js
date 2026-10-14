/**
 * Core Date and Chronological Age Calculation Engine
 * Pure functions, calendar-accurate, edge-case tested.
 */

/**
 * Parses an input into a local-midnight Date object.
 * Eliminates ISO 8601 UTC timezone shift bugs.
 * @param {string | Date} dateInput - 'YYYY-MM-DD' or Date instance
 * @returns {Date} Local midnight Date object
 */
export function parseLocalDate(dateInput) {
  if (dateInput instanceof Date) {
    if (Number.isNaN(dateInput.getTime())) {
      throw new Error("Invalid date: Date object is NaN.");
    }
    return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
  }

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    const parts = trimmed.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-indexed in JS
      const day = parseInt(parts[2], 10);

      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        const dateObj = new Date(year, month, day);
        // Ensure day didn't roll over (e.g. Feb 31)
        if (
          dateObj.getFullYear() === year &&
          dateObj.getMonth() === month &&
          dateObj.getDate() === day
        ) {
          return dateObj;
        }
      }
    }
  }

  throw new Error("Invalid date format. Expected 'YYYY-MM-DD' or valid Date.");
}

/**
 * Checks if a given year is a leap year in the Gregorian calendar.
 * @param {number} year
 * @returns {boolean}
 */
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Gets number of days in a specific month of a specific year.
 * @param {number} year
 * @param {number} monthIndex - 0 for Jan, 11 for Dec
 * @returns {number}
 */
export function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Formats a Date object to YYYY-MM-DD.
 * @param {Date} date
 * @returns {string}
 */
export function formatDateISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calculates calendar-accurate chronological age in Years, Months, and Days.
 * @param {string | Date} dobInput - Date of Birth
 * @param {string | Date} [targetInput] - Reference target date (defaults to today)
 * @returns {object} Age breakdown and status
 */
export function calculateAge(dobInput, targetInput = new Date()) {
  const birth = parseLocalDate(dobInput);
  const target = parseLocalDate(targetInput);

  if (target.getTime() < birth.getTime()) {
    return {
      isValid: false,
      error: "Date of birth cannot be later than the target date.",
      years: 0,
      months: 0,
      days: 0,
    };
  }

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    // Days in the month prior to the target date
    const prevMonthDays = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthDays;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    isValid: true,
    error: null,
    years,
    months,
    days,
    isTodayBirthday: months === 0 && days === 0 && years > 0,
  };
}

/**
 * Computes lifetime metrics including total days, weeks, hours, minutes, and physiological approximations.
 * @param {string | Date} dobInput
 * @param {string | Date} [targetInput]
 * @returns {object}
 */
export function calculateLifeStats(dobInput, targetInput = new Date()) {
  const birth = parseLocalDate(dobInput);
  const target = parseLocalDate(targetInput);

  if (target.getTime() < birth.getTime()) {
    return null;
  }

  const diffMs = target.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const totalSeconds = totalMinutes * 60;

  // Approximate resting statistics (72 bpm, 16 breaths/min)
  const estimatedHeartbeats = totalMinutes * 72;
  const estimatedBreaths = totalMinutes * 16;

  return {
    totalDays,
    totalWeeks,
    totalHours,
    totalMinutes,
    totalSeconds,
    estimatedHeartbeats,
    estimatedBreaths,
  };
}

/**
 * Computes countdown to the next birthday.
 * @param {string | Date} dobInput
 * @param {string | Date} [targetInput]
 * @returns {object}
 */
export function calculateNextBirthday(dobInput, targetInput = new Date()) {
  const birth = parseLocalDate(dobInput);
  const target = parseLocalDate(targetInput);

  if (target.getTime() < birth.getTime()) {
    return null;
  }

  const targetYear = target.getFullYear();
  let nextBday = new Date(targetYear, birth.getMonth(), birth.getDate());

  // Handle Feb 29 birth in non-leap year target: rolls to March 1
  if (birth.getMonth() === 1 && birth.getDate() === 29 && !isLeapYear(targetYear)) {
    nextBday = new Date(targetYear, 2, 1);
  }

  // If birthday already passed this year, check next year
  if (nextBday.getTime() < target.getTime()) {
    const nextYear = targetYear + 1;
    if (birth.getMonth() === 1 && birth.getDate() === 29 && !isLeapYear(nextYear)) {
      nextBday = new Date(nextYear, 2, 1);
    } else {
      nextBday = new Date(nextYear, birth.getMonth(), birth.getDate());
    }
  }

  const isToday = nextBday.getTime() === target.getTime();
  const diffDays = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate detailed months & days to next birthday
  const detailed = calculateAge(target, nextBday);

  const weekday = nextBday.toLocaleDateString("en-US", { weekday: "long" });

  return {
    isToday,
    daysRemaining: diffDays,
    monthsRemaining: detailed.months,
    detailedDaysRemaining: detailed.days,
    nextDate: formatDateISO(nextBday),
    weekday,
  };
}

/**
 * Determines Western Zodiac Sign.
 * @param {number} month - 1 to 12
 * @param {number} day - 1 to 31
 * @returns {{ name: string, symbol: string, dates: string }}
 */
export function getWesternZodiac(month, day) {
  const signs = [
    { name: "Capricorn", symbol: "♑", cutoff: [1, 19], dates: "Dec 22 – Jan 19" },
    { name: "Aquarius", symbol: "♒", cutoff: [2, 18], dates: "Jan 20 – Feb 18" },
    { name: "Pisces", symbol: "♓", cutoff: [3, 20], dates: "Feb 19 – Mar 20" },
    { name: "Aries", symbol: "♈", cutoff: [4, 19], dates: "Mar 21 – Apr 19" },
    { name: "Taurus", symbol: "♉", cutoff: [5, 20], dates: "Apr 20 – May 20" },
    { name: "Gemini", symbol: "♊", cutoff: [6, 20], dates: "May 21 – Jun 20" },
    { name: "Cancer", symbol: "♋", cutoff: [7, 22], dates: "Jun 21 – Jul 22" },
    { name: "Leo", symbol: "♌", cutoff: [8, 22], dates: "Jul 23 – Aug 22" },
    { name: "Virgo", symbol: "♍", cutoff: [9, 22], dates: "Aug 23 – Sep 22" },
    { name: "Libra", symbol: "♎", cutoff: [10, 22], dates: "Sep 23 – Oct 22" },
    { name: "Scorpio", symbol: "♏", cutoff: [11, 21], dates: "Oct 23 – Nov 21" },
    { name: "Sagittarius", symbol: "♐", cutoff: [12, 21], dates: "Nov 22 – Dec 21" },
    { name: "Capricorn", symbol: "♑", cutoff: [12, 31], dates: "Dec 22 – Jan 19" },
  ];

  for (const sign of signs) {
    const [cMonth, cDay] = sign.cutoff;
    if (month < cMonth || (month === cMonth && day <= cDay)) {
      return { name: sign.name, symbol: sign.symbol, dates: sign.dates };
    }
  }

  return { name: "Capricorn", symbol: "♑", dates: "Dec 22 – Jan 19" };
}

/**
 * Determines Chinese Zodiac Animal.
 * @param {number} year
 * @returns {{ name: string, emoji: string }}
 */
export function getChineseZodiac(year) {
  const animals = [
    { name: "Rat", emoji: "🐀" },
    { name: "Ox", emoji: "🐂" },
    { name: "Tiger", emoji: "🐅" },
    { name: "Rabbit", emoji: "🐇" },
    { name: "Dragon", emoji: "🐉" },
    { name: "Snake", emoji: "🐍" },
    { name: "Horse", emoji: "🐎" },
    { name: "Goat", emoji: "🐐" },
    { name: "Monkey", emoji: "🐒" },
    { name: "Rooster", emoji: "🐓" },
    { name: "Dog", emoji: "🐕" },
    { name: "Pig", emoji: "🐖" },
  ];

  // 1984 was the year of the Rat
  const baseYear = 1984;
  let offset = (year - baseYear) % 12;
  if (offset < 0) offset += 12;

  return animals[offset];
}

/**
 * Formats day of week born.
 * @param {Date} date
 * @returns {string} e.g. "Tuesday"
 */
export function getDayOfWeekBorn(date) {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

/**
 * Performs a complete age and life dossier calculation.
 * @param {string | Date} dobInput
 * @param {string | Date} [targetInput]
 * @returns {object} Comprehensive dossier
 */
export function calculateCompleteDossier(dobInput, targetInput = new Date()) {
  const birth = parseLocalDate(dobInput);
  const target = parseLocalDate(targetInput);

  const age = calculateAge(birth, target);
  if (!age.isValid) {
    return { isValid: false, error: age.error };
  }

  const lifeStats = calculateLifeStats(birth, target);
  const nextBirthday = calculateNextBirthday(birth, target);
  const westernZodiac = getWesternZodiac(birth.getMonth() + 1, birth.getDate());
  const chineseZodiac = getChineseZodiac(birth.getFullYear());
  const dayOfWeekBorn = getDayOfWeekBorn(birth);

  return {
    isValid: true,
    error: null,
    birthDateFormatted: formatDateISO(birth),
    targetDateFormatted: formatDateISO(target),
    age,
    lifeStats,
    nextBirthday,
    westernZodiac,
    chineseZodiac,
    dayOfWeekBorn,
  };
}
