import test from "node:test";
import assert from "node:assert/strict";
import {
  currentMonth,
  dateInput,
  shiftMonth,
  parseAmount,
  weeklySpending,
  expensesCsv,
} from "../src/lib/finance.mjs";

test("month navigation handles year boundaries and leap years", () => {
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2024-03", -1), "2024-02");
});
test("date defaults follow the device local date rather than UTC", () => {
  const local = new Date(2026, 0, 1, 0, 1);
  assert.equal(currentMonth(local), "2026-01");
  assert.equal(dateInput(local), "2026-01-01");
});
test("amount validation rejects blank, invalid, negative expense amounts and infinity", () => {
  for (const value of ["", " ", "abc", "Infinity", "-1", "0"])
    assert.throws(() => parseAmount(value));
  assert.equal(parseAmount(" 12.50 "), 12.5);
  assert.equal(parseAmount("0", { allowZero: true }), 0);
  assert.equal(parseAmount("-10", { allowNegative: true }), -10);
});
test("weekly spending includes days 29 through 31", () => {
  assert.deepEqual(
    weeklySpending([
      { date: "2026-01-01T12:00:00", amount: 2 },
      { date: "2026-01-31T12:00:00", amount: 7 },
    ]),
    [2, 0, 0, 0, 7],
  );
});
test("CSV exports escape quotes, newlines and spreadsheet formulas and resolve account names", () => {
  const csv = expensesCsv(
    [
      {
        date: "2026-11-08",
        category: "food",
        amount: 12.5,
        note: '=HYPERLINK("bad")\nnext',
        isRecurring: true,
        accountId: "a1",
      },
    ],
    [{ slug: "food", name: "Food" }],
    [{ _id: "a1", name: "Cash" }],
  );
  assert.ok(csv.startsWith('\ufeff"Date"'));
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")\nnext"'));
  assert.ok(csv.includes('"Food","12.5"'));
  assert.ok(csv.endsWith('"Yes","Cash"'));
});
