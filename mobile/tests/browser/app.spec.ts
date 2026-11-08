import { test, expect, type Page } from "@playwright/test";

const user = {
  id: "user-1",
  name: "Swarna Ahmed",
  email: "swarna@example.test",
  currency: "BDT",
};
const categories = [
  {
    _id: "cat-1",
    name: "Groceries",
    slug: "groceries",
    icon: "🛒",
    color: "#087f75",
    isActive: true,
    isDefault: true,
  },
];
const initialExpenses = [
  {
    _id: "expense-1",
    amount: 450,
    category: "groceries",
    date: "2026-11-08T12:00:00.000Z",
    note: "Weekend groceries",
    isRecurring: false,
    accountId: null,
  },
];

async function mockApi(page: Page) {
  let expenses = [...initialExpenses];
  let profile = { ...user };
  let categoryList = categories.map((c) => ({ ...c }));
  let allocations: Record<string, number> = { groceries: 5000 };
  let accounts = [
    {
      _id: "acc-1",
      name: "Everyday savings",
      bankName: "My bank",
      accountType: "savings",
      balance: 24000,
      icon: "🏦",
      color: "#087f75",
      isDefault: true,
    },
  ];
  await page.route(
    "https://budget-wise-six.vercel.app/_/backend/api/**",
    async (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname.replace(
        "/_/backend/api",
        "",
      );
      const method = request.method();
      const body = request.postDataJSON();
      let response: unknown = { success: true };
      let status = 200;
      if (path === "/auth/login" || path === "/auth/verify-email")
        response = { token: "test-token", user: profile };
      else if (path === "/auth/me") response = { user: profile };
      else if (path === "/auth/profile" || path === "/auth/settings") {
        profile = { ...profile, ...body };
        response = { user: profile };
      } else if (path === "/auth/password") {
        status = 401;
        response = { message: "Current password is incorrect" };
      } else if (path === "/categories" && method === "POST") {
        categoryList = [
          ...categoryList,
          {
            ...body,
            _id: "cat-new",
            slug: body.name.toLowerCase(),
            isActive: true,
            isDefault: false,
          },
        ];
      } else if (path.endsWith("/toggle") && method === "PATCH") {
        categoryList = categoryList.map((c) =>
          c._id === path.split("/")[2] ? { ...c, isActive: !c.isActive } : c,
        );
      } else if (path === "/categories")
        response = { categories: categoryList };
      else if (path === "/accounts" && method === "POST") {
        accounts = [...accounts, { ...body, _id: "acc-new" }];
      } else if (path.endsWith("/adjust") && method === "POST") {
        accounts = accounts.map((a) =>
          a._id === path.split("/")[2]
            ? {
                ...a,
                balance:
                  a.balance +
                  (body.type === "add" ? body.amount : -body.amount),
              }
            : a,
        );
      } else if (path === "/accounts") response = { accounts };
      else if (path === "/budget/set") allocations = body.categories;
      else if (path.startsWith("/budget/insights/")) {
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const totalBudget = Object.values(allocations).reduce(
          (sum, value) => sum + value,
          0,
        );
        response = {
          budget: {
            month: "2026-11",
            categories: allocations,
            total: totalBudget,
          },
          insights: {
            totalBudget,
            totalSpent,
            remaining: totalBudget - totalSpent,
            percentage: totalBudget ? (totalSpent / totalBudget) * 100 : 0,
            dailyAvg: totalSpent / 8,
            predicted: (totalSpent / 8) * 30,
            byCat: { groceries: totalSpent },
            daysPassed: 8,
            totalDays: 30,
          },
        };
      } else if (path === "/expenses" && method === "POST") {
        expenses = [{ ...body, _id: "expense-new" }, ...expenses];
        response = { expense: expenses[0] };
      } else if (path.startsWith("/expenses/") && method === "PUT") {
        expenses = expenses.map((e) =>
          e._id === path.split("/").pop() ? { ...e, ...body } : e,
        );
      } else if (path.startsWith("/expenses/") && method === "DELETE") {
        expenses = expenses.filter((e) => e._id !== path.split("/").pop());
      } else if (path === "/expenses") response = { expenses };
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(response),
      });
    },
  );
}
async function signIn(page: Page) {
  await page.goto("/");
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "Home", exact: true }),
  ).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("sign in, navigate and restore a session after reloading", async ({
  page,
}) => {
  await signIn(page);
  await expect(page.getByText("Hello, Swarna", { exact: false })).toBeVisible();
  await expect(
    page.getByText("Weekend groceries", { exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/home-preview.png", fullPage: true });
  await page.reload();
  await expect(
    page.getByRole("tab", { name: "Home", exact: true }),
  ).toBeVisible();
  for (const tab of ["Expenses", "Budget", "Accounts", "Settings"]) {
    await page.getByRole("tab", { name: tab, exact: true }).click();
    await expect(
      page.getByRole("tab", { name: tab, exact: true }),
    ).toHaveAttribute("aria-selected", "true");
  }
});
test("create, edit and delete an expense through native form components", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("tab", { name: "Expenses", exact: true }).click();
  await page.getByRole("button", { name: "Add expense", exact: true }).click();
  await page.getByLabel("Amount", { exact: true }).fill("125.50");
  await page
    .getByLabel("Note (optional)", { exact: true })
    .fill("Coffee with a friend");
  await page
    .getByRole("button", { name: "Add expense", exact: true })
    .last()
    .click();
  await expect(
    page.getByText("Coffee with a friend", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Edit expense", exact: true })
    .first()
    .click();
  await page.getByLabel("Amount", { exact: true }).fill("130");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit expense", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Delete expense", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(
    page.getByText("Coffee with a friend", { exact: true }),
  ).toHaveCount(0);
});
test("registration continues through email verification and currency selection", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.getByLabel("Your name", { exact: true }).fill(user.name);
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await page.getByLabel("Verification code", { exact: true }).fill("123456");
  await page.getByRole("button", { name: "Verify email", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Start using BudgetWise", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start using BudgetWise", exact: true })
    .click();
  await expect(
    page.getByRole("tab", { name: "Home", exact: true }),
  ).toBeVisible();
});
test("a wrong current password keeps the user signed in", async ({ page }) => {
  await signIn(page);
  await page.getByRole("tab", { name: "Settings", exact: true }).click();
  await page
    .getByLabel("Current password", { exact: true })
    .fill("wrong-password");
  await page.getByLabel("New password", { exact: true }).fill("new-password");
  await page
    .getByLabel("Confirm new password", { exact: true })
    .fill("new-password");
  await page
    .getByRole("button", { name: "Update password", exact: true })
    .click();
  await expect(
    page.getByText("Current password is incorrect", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("tab", { name: "Home", exact: true }),
  ).toBeVisible();
});
test("offline session restoration can return to sign in", async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem("budgetwise-token", "saved-token"),
  );
  await page.route("**/_/backend/api/auth/me", (route) =>
    route.abort("internetdisconnected"),
  );
  await page.goto("/");
  await expect(
    page.getByText("Let’s reconnect", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Return to sign in", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
});

test("save a category budget and reload the updated allocation", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("tab", { name: "Budget", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit monthly budget", exact: true })
    .click();
  await page.getByLabel("🛒  Groceries", { exact: true }).fill("8000");
  await page.getByRole("button", { name: "Save budget", exact: true }).click();
  await expect(page.getByText("৳8,000.00", { exact: true })).toBeVisible();
});

test("create an account and adjust its balance", async ({ page }) => {
  await signIn(page);
  await page.getByRole("tab", { name: "Accounts", exact: true }).click();
  await page.getByRole("button", { name: "Add account", exact: true }).click();
  await page.getByLabel("Account name", { exact: true }).fill("Travel fund");
  await page.getByLabel("Opening balance", { exact: true }).fill("500");
  await page.getByRole("button", { name: "Save account", exact: true }).click();
  await expect(page.getByText("Travel fund", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Adjust balance", exact: true })
    .last()
    .click();
  await page.getByLabel("Amount", { exact: true }).fill("250");
  await page
    .getByRole("button", { name: "Update balance", exact: true })
    .click();
  await expect(page.getByText("৳750.00", { exact: true })).toBeVisible();
});

test("create a category and disable it for future expenses", async ({
  page,
}) => {
  await signIn(page);
  await page.getByRole("tab", { name: "Settings", exact: true }).click();
  await page
    .getByRole("button", { name: "Manage categories", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Create category", exact: true })
    .click();
  await page.getByLabel("Category name", { exact: true }).fill("Books");
  await page
    .getByRole("button", { name: "Save category", exact: true })
    .click();
  await expect(page.getByText("Books", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).last().click();
  await page
    .getByRole("switch", { name: "Category active", exact: true })
    .click();
  await expect(page.getByText("Inactive", { exact: true })).toBeVisible();
});
