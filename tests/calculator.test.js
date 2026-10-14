import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseLocalDate,
  isLeapYear,
  getDaysInMonth,
  formatDateISO,
  calculateAge,
  calculateLifeStats,
  calculateNextBirthday,
  getWesternZodiac,
  getChineseZodiac,
  getDayOfWeekBorn,
  calculateCompleteDossier,
} from "../src/calculator.js";

describe("parseLocalDate", () => {
  it("parses valid YYYY-MM-DD strings without UTC timezone drift", () => {
    const d = parseLocalDate("2000-05-15");
    assert.equal(d.getFullYear(), 2000);
    assert.equal(d.getMonth(), 4); // 0-indexed May
    assert.equal(d.getDate(), 15);
  });

  it("normalizes Date object instances with arbitrary times to local midnight", () => {
    const eveningDate = new Date(1995, 11, 25, 23, 59, 59);
    const d = parseLocalDate(eveningDate);
    assert.equal(d.getFullYear(), 1995);
    assert.equal(d.getMonth(), 11);
    assert.equal(d.getDate(), 25);
    assert.equal(d.getHours(), 0);
    assert.equal(d.getMinutes(), 0);
    assert.equal(d.getSeconds(), 0);
  });

  it("rejects non-existent calendar dates like February 31", () => {
    assert.throws(() => parseLocalDate("2023-02-31"), /Invalid date/);
  });

  it("rejects February 29 in non-leap years", () => {
    assert.throws(() => parseLocalDate("2023-02-29"), /Invalid date/);
    assert.throws(() => parseLocalDate("2021-02-29"), /Invalid date/);
  });

  it("accepts February 29 in valid leap years", () => {
    const leapDate = parseLocalDate("2024-02-29");
    assert.equal(leapDate.getFullYear(), 2024);
    assert.equal(leapDate.getMonth(), 1);
    assert.equal(leapDate.getDate(), 29);
  });

  it("rejects 31st day on 30-day months (April, June, September, November)", () => {
    assert.throws(() => parseLocalDate("2023-04-31"), /Invalid date/);
    assert.throws(() => parseLocalDate("2023-06-31"), /Invalid date/);
    assert.throws(() => parseLocalDate("2023-09-31"), /Invalid date/);
    assert.throws(() => parseLocalDate("2023-11-31"), /Invalid date/);
  });

  it("rejects invalid input types and formats", () => {
    assert.throws(() => parseLocalDate("not-a-date"), /Invalid date/i);
    assert.throws(() => parseLocalDate(""), /Invalid date/i);
    assert.throws(() => parseLocalDate("   "), /Invalid date/i);
    assert.throws(() => parseLocalDate(null), /Invalid date/i);
    assert.throws(() => parseLocalDate(undefined), /Invalid date/i);
    assert.throws(() => parseLocalDate(new Date(NaN)), /Invalid date/i);
  });
});

describe("isLeapYear", () => {
  it("identifies standard leap years divisible by 4", () => {
    assert.equal(isLeapYear(2024), true);
    assert.equal(isLeapYear(2020), true);
    assert.equal(isLeapYear(2016), true);
  });

  it("identifies century non-leap years", () => {
    assert.equal(isLeapYear(1900), false);
    assert.equal(isLeapYear(2100), false);
  });

  it("identifies 400-year century leap years", () => {
    assert.equal(isLeapYear(2000), true);
    assert.equal(isLeapYear(2400), true);
  });

  it("identifies standard non-leap years", () => {
    assert.equal(isLeapYear(2023), false);
    assert.equal(isLeapYear(2025), false);
    assert.equal(isLeapYear(2026), false);
  });
});

describe("calculateAge — Core & Leap Day Rules", () => {
  it("calculates exact age when birthday has not occurred yet this year", () => {
    // Born Dec 31, 2000. Target Jan 1, 2026.
    // Real age: 25 years, 0 months, 1 day.
    const result = calculateAge("2000-12-31", "2026-01-01");
    assert.equal(result.isValid, true);
    assert.equal(result.years, 25);
    assert.equal(result.months, 0);
    assert.equal(result.days, 1);
    assert.equal(result.isTodayBirthday, false);
  });

  it("calculates exact age when birthday is today", () => {
    const result = calculateAge("2000-10-13", "2026-10-13");
    assert.equal(result.isValid, true);
    assert.equal(result.years, 26);
    assert.equal(result.months, 0);
    assert.equal(result.days, 0);
    assert.equal(result.isTodayBirthday, true);
  });

  it("handles February 29 birthday on non-leap year Feb 28 (364 days lived)", () => {
    // Born Feb 29, 2000. On Feb 28, 2001, exactly 364 days have elapsed.
    // They have not yet attained 1 complete year.
    const result = calculateAge("2000-02-29", "2001-02-28");
    assert.equal(result.isValid, true);
    assert.equal(result.years, 0);
    assert.equal(result.months, 11);
    assert.equal(result.days, 30);
    assert.equal(result.isTodayBirthday, false);
  });

  it("handles February 29 birthday on non-leap year March 1 (365 days lived)", () => {
    // Under common legal rules, Feb 29 birth completes full year on March 1 in non-leap years.
    const result = calculateAge("2000-02-29", "2001-03-01");
    assert.equal(result.isValid, true);
    assert.equal(result.years, 1);
    assert.equal(result.months, 0);
    assert.equal(result.days, 0);
  });

  it("handles February 29 birthday on subsequent leap year anniversary (Feb 29, 2004)", () => {
    const result = calculateAge("2000-02-29", "2004-02-29");
    assert.equal(result.isValid, true);
    assert.equal(result.years, 4);
    assert.equal(result.months, 0);
    assert.equal(result.days, 0);
    assert.equal(result.isTodayBirthday, true);
  });

  it("handles month-end boundaries: Jan 31 to Feb 28 in common year (2023)", () => {
    const result = calculateAge("2023-01-31", "2023-02-28");
    assert.equal(result.isValid, true);
    assert.equal(result.years, 0);
    assert.equal(result.months, 0);
    assert.equal(result.days, 28);
  });

  it("handles month-end boundaries: Jan 31 to Feb 29 in leap year (2024)", () => {
    const result = calculateAge("2024-01-31", "2024-02-29");
    assert.equal(result.isValid, true);
    assert.equal(result.years, 0);
    assert.equal(result.months, 0);
    assert.equal(result.days, 29);
  });

  it("handles month-end boundaries: March 31 to April 30", () => {
    const result = calculateAge("2023-03-31", "2023-04-30");
    assert.equal(result.isValid, true);
    assert.equal(result.years, 0);
    assert.equal(result.months, 0);
    assert.equal(result.days, 30);
  });

  it("handles month-end boundaries: May 31 to November 30", () => {
    const result = calculateAge("2023-05-31", "2023-11-30");
    assert.equal(result.isValid, true);
    assert.equal(result.years, 0);
    assert.equal(result.months, 5);
    assert.equal(result.days, 30);
  });

  it("handles same-day birth (0 days old)", () => {
    const result = calculateAge("2026-05-10", "2026-05-10");
    assert.equal(result.isValid, true);
    assert.equal(result.years, 0);
    assert.equal(result.months, 0);
    assert.equal(result.days, 0);
    assert.equal(result.isTodayBirthday, false);
  });

  it("rejects future dates with an informative error", () => {
    const result = calculateAge("2030-01-01", "2026-01-01");
    assert.equal(result.isValid, false);
    assert.match(result.error, /cannot be later/);
  });
});

describe("calculateLifeStats", () => {
  it("calculates exact days and time breakdown for 1 common year", () => {
    const stats = calculateLifeStats("2022-01-01", "2023-01-01");
    assert.equal(stats.totalDays, 365);
    assert.equal(stats.totalWeeks, 52);
    assert.equal(stats.totalHours, 365 * 24);
    assert.equal(stats.totalMinutes, 365 * 24 * 60);
    assert.equal(stats.estimatedHeartbeats, 365 * 24 * 60 * 72);
  });

  it("accurately includes 366 days across a leap year", () => {
    const stats = calculateLifeStats("2024-01-01", "2025-01-01");
    assert.equal(stats.totalDays, 366);
  });

  it("returns null for future dates", () => {
    const stats = calculateLifeStats("2030-01-01", "2026-01-01");
    assert.equal(stats, null);
  });
});

describe("calculateNextBirthday", () => {
  it("correctly identifies when birthday is today", () => {
    const next = calculateNextBirthday("1995-10-13", "2026-10-13");
    assert.equal(next.isToday, true);
    assert.equal(next.daysRemaining, 0);
  });

  it("calculates days remaining when birthday is later this year", () => {
    const next = calculateNextBirthday("1995-12-25", "2026-10-13");
    assert.equal(next.isToday, false);
    assert.ok(next.daysRemaining > 0);
    assert.equal(next.nextDate, "2026-12-25");
    assert.equal(next.weekday, "Friday");
  });

  it("rolls over to next calendar year when birthday has already passed", () => {
    const next = calculateNextBirthday("1995-01-01", "2026-10-13");
    assert.equal(next.isToday, false);
    assert.equal(next.nextDate, "2027-01-01");
    assert.equal(next.weekday, "Friday");
  });

  it("handles leap year Feb 29 birth in non-leap reference year (schedules for March 1)", () => {
    const next = calculateNextBirthday("2000-02-29", "2025-01-01");
    // 2025 is not leap year, so next birthday is 2025-03-01
    assert.equal(next.nextDate, "2025-03-01");
  });

  it("handles leap year Feb 29 birth in a leap reference year (schedules for Feb 29)", () => {
    const next = calculateNextBirthday("2000-02-29", "2028-01-01");
    // 2028 is a leap year, so next birthday is 2028-02-29
    assert.equal(next.nextDate, "2028-02-29");
  });
});

describe("getWesternZodiac", () => {
  it("determines correct zodiac signs across boundaries", () => {
    assert.equal(getWesternZodiac(3, 21).name, "Aries");
    assert.equal(getWesternZodiac(3, 20).name, "Pisces");
    assert.equal(getWesternZodiac(7, 4).name, "Cancer");
    assert.equal(getWesternZodiac(10, 13).name, "Libra");
    assert.equal(getWesternZodiac(1, 1).name, "Capricorn");
    assert.equal(getWesternZodiac(12, 25).name, "Capricorn");
    assert.equal(getWesternZodiac(2, 19).name, "Pisces");
    assert.equal(getWesternZodiac(2, 18).name, "Aquarius");
  });
});

describe("getChineseZodiac", () => {
  it("determines correct Chinese zodiac animal", () => {
    assert.equal(getChineseZodiac(1984).name, "Rat");
    assert.equal(getChineseZodiac(2000).name, "Dragon");
    assert.equal(getChineseZodiac(2024).name, "Dragon");
    assert.equal(getChineseZodiac(1995).name, "Pig");
    assert.equal(getChineseZodiac(2023).name, "Rabbit");
    assert.equal(getChineseZodiac(1985).name, "Ox");
  });
});

describe("getDayOfWeekBorn", () => {
  it("returns correct weekday name", () => {
    // 2000-01-01 was a Saturday
    const d = parseLocalDate("2000-01-01");
    assert.equal(getDayOfWeekBorn(d), "Saturday");
  });
});

describe("calculateCompleteDossier", () => {
  it("assembles complete data structure seamlessly", () => {
    const dossier = calculateCompleteDossier("2000-01-01", "2026-10-13");
    assert.equal(dossier.isValid, true);
    assert.equal(dossier.age.years, 26);
    assert.equal(dossier.age.months, 9);
    assert.equal(dossier.age.days, 12);
    assert.equal(dossier.westernZodiac.name, "Capricorn");
    assert.equal(dossier.chineseZodiac.name, "Dragon");
    assert.equal(dossier.dayOfWeekBorn, "Saturday");
    assert.ok(dossier.lifeStats.totalDays > 9000);
  });
});
