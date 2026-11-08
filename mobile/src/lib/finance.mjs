export const currentMonth = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
export const dateInput = (date = new Date()) =>
  `${currentMonth(date)}-${String(date.getDate()).padStart(2, "0")}`;
export const shiftMonth = (month, offset) => {
  const [y, m] = month.split("-").map(Number);
  return currentMonth(new Date(y, m - 1 + offset, 1));
};
export const monthLabel = (month) =>
  new Date(`${month}-01T12:00:00`).toLocaleDateString("en", {
    month: "long",
    year: "numeric",
  });
export const money = (amount, currency = "BDT") =>
  new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
export function parseAmount(
  value,
  { allowZero = false, allowNegative = false } = {},
) {
  const number = Number(value.trim());
  if (
    !value.trim() ||
    !Number.isFinite(number) ||
    (!allowNegative && number < 0) ||
    (!allowZero && number === 0)
  ) {
    throw new Error(
      allowZero
        ? "Enter a valid amount of zero or more."
        : "Enter an amount greater than zero.",
    );
  }
  const rounded = Math.round(number * 100) / 100;
  if (!allowZero && rounded === 0)
    throw new Error("Enter an amount of at least 0.01.");
  return rounded;
}
export const categoryFor = (categories, slug) =>
  categories.find((c) => c.slug === slug) || {
    slug,
    name: slug,
    icon: "📦",
    color: "#94a3b8",
  };
export const weeklySpending = (expenses) => {
  const weeks = [0, 0, 0, 0, 0];
  expenses.forEach((e) => {
    weeks[Math.min(4, Math.floor((new Date(e.date).getDate() - 1) / 7))] +=
      e.amount;
  });
  return weeks;
};
export function expensesCsv(expenses, categories, accounts) {
  const escape = (value) => {
    let text = String(value ?? "");
    // Prevent spreadsheet formula execution in user supplied notes and names.
    if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  };
  const rows = [
    ["Date", "Category", "Amount", "Note", "Recurring", "Account"],
    ...expenses.map((e) => [
      e.date.slice(0, 10),
      categoryFor(categories, e.category).name,
      e.amount,
      e.note || "",
      e.isRecurring ? "Yes" : "No",
      accounts.find((a) => a._id === e.accountId)?.name || "",
    ]),
  ];
  return "\ufeff" + rows.map((row) => row.map(escape).join(",")).join("\r\n");
}
