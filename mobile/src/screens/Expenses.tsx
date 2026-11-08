import React, { useMemo, useState } from "react";
import { Platform, Switch, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useApp } from "../state";
import {
  categoryFor,
  dateInput,
  expensesCsv,
  money,
  parseAmount,
} from "../lib/finance.mjs";
import {
  Button,
  Card,
  Choice,
  DeleteButton,
  Empty,
  ErrorMessage,
  Field,
  Label,
  layout,
  Screen,
  Sheet,
  useTask,
  useTheme,
} from "../ui";
import { ExpenseRow } from "./Home";
import type { Expense } from "../types";

export function ExpenseEditor({
  expense,
  onClose,
}: {
  expense: Expense | null;
  onClose: () => void;
}) {
  const { request, refresh, data, month } = useApp();
  const c = useTheme();
  const task = useTask();
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [category, setCategory] = useState(
    expense?.category ||
      data.categories.find((cat) => cat.isActive)?.slug ||
      "",
  );
  const [date, setDate] = useState(
    expense
      ? expense.date.slice(0, 10)
      : month === dateInput().slice(0, 7)
        ? dateInput()
        : `${month}-01`,
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [note, setNote] = useState(expense?.note || "");
  const [recurring, setRecurring] = useState(expense?.isRecurring || false);
  const [account, setAccount] = useState(
    expense
      ? expense.accountId || ""
      : data.accounts.find((a) => a.isDefault)?._id || "",
  );
  const options = data.categories
    .filter((cat) => cat.isActive || cat.slug === expense?.category)
    .map((cat) => ({ value: cat.slug, label: `${cat.icon}  ${cat.name}` }));
  const save = () =>
    task.run(async () => {
      const value = parseAmount(amount);
      if (!category)
        throw new Error("Create a category before adding an expense.");
      const d = new Date(`${date}T12:00:00`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(d.getTime()) ||
        dateInput(d) !== date
      )
        throw new Error("Enter a valid date in YYYY-MM-DD format.");
      await request(expense ? `/expenses/${expense._id}` : "/expenses", {
        method: expense ? "PUT" : "POST",
        body: {
          amount: value,
          category,
          date: `${date}T12:00:00`,
          note: note.trim(),
          isRecurring: recurring,
          accountId: account || null,
        },
      });
      onClose();
      await refresh();
    });
  return (
    <Sheet
      visible
      title={expense ? "Edit expense" : "A new expense"}
      onClose={onClose}
      busy={task.busy}
    >
      <Field
        label="Amount"
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        autoFocus
      />
      <Choice
        label="Category"
        value={category}
        onChange={setCategory}
        options={options}
      />
      {Platform.OS === "web" ? (
        <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
      ) : (
        <>
          <Label style={{ fontWeight: "600", fontSize: 13 }}>Date</Label>
          <Button
            title={new Date(`${date}T12:00:00`).toLocaleDateString("en", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            variant="secondary"
            icon="calendar-outline"
            onPress={() => setDateOpen(true)}
          />
          {dateOpen ? (
            <DateTimePicker
              value={new Date(`${date}T12:00:00`)}
              mode="date"
              onChange={(_, selected) => {
                setDateOpen(false);
                if (selected) setDate(dateInput(selected));
              }}
            />
          ) : null}
        </>
      )}
      <Choice
        label="Pay from"
        value={account}
        onChange={setAccount}
        options={[
          { value: "", label: "No linked account" },
          ...data.accounts.map((a) => ({
            value: a._id,
            label: `${a.icon}  ${a.name}`,
          })),
        ]}
      />
      <Field
        label="Note (optional)"
        placeholder="What was it for?"
        value={note}
        onChangeText={setNote}
        maxLength={200}
        multiline
      />
      <View style={layout.between}>
        <View style={{ flex: 1 }}>
          <Label style={{ fontWeight: "600" }}>Repeat every month</Label>
          <Label muted style={{ fontSize: 12 }}>
            Managed automatically by BudgetWise
          </Label>
        </View>
        <Switch
          accessibilityLabel="Repeat every month"
          value={recurring}
          onValueChange={setRecurring}
          trackColor={{ true: c.accent }}
        />
      </View>
      <ErrorMessage message={task.error} />
      <Button
        title={expense ? "Save changes" : "Add expense"}
        busy={task.busy}
        onPress={() => void save()}
      />
      {expense ? (
        <DeleteButton
          title="Delete expense"
          message="Delete this expense? Its amount will be returned to the linked account."
          busy={task.busy}
          onDelete={() =>
            void task.run(async () => {
              await request(`/expenses/${expense._id}`, { method: "DELETE" });
              onClose();
              await refresh();
            })
          }
        />
      ) : null}
    </Sheet>
  );
}
export function ExpensesScreen({ addExpense }: { addExpense: () => void }) {
  const { data, user, month, loading, dataError } = useApp();
  const c = useTheme();
  const task = useTask();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const filtered = useMemo(
    () =>
      data.expenses.filter(
        (e) =>
          (!category || e.category === category) &&
          `${e.note} ${categoryFor(data.categories, e.category).name}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [data.expenses, data.categories, search, category],
  );
  const exportCsv = () =>
    task.run(async () => {
      const csv = expensesCsv(filtered, data.categories, data.accounts);
      if (Platform.OS === "web") {
        const url = URL.createObjectURL(
          new Blob([csv], { type: "text/csv;charset=utf-8" }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = `budgetwise-${month}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        return;
      }
      if (!(await Sharing.isAvailableAsync()))
        throw new Error("Sharing is unavailable on this device.");
      const file = new File(Paths.cache, `budgetwise-${month}.csv`);
      file.create({ overwrite: true });
      file.write(csv);
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: "Export your expenses",
        UTI: "public.comma-separated-values-text",
      });
    });
  return (
    <>
      <Screen>
        <View style={layout.between}>
          <View>
            <Label style={layout.title}>Expenses</Label>
            <Label muted>Every little thing, accounted for.</Label>
          </View>
        </View>
        <Card style={{ backgroundColor: c.accentSoft }}>
          <Label muted>SPENT THIS MONTH</Label>
          <Label style={{ fontSize: 30, fontWeight: "700", color: c.accent }}>
            {money(
              data.expenses.reduce((sum, e) => sum + e.amount, 0),
              user?.currency,
            )}
          </Label>
          <Label muted>{data.expenses.length} transactions</Label>
        </Card>
        <Button
          title="Add expense"
          icon="add"
          onPress={addExpense}
          disabled={loading || !!dataError}
        />
        <Field
          label="Search expenses"
          placeholder="Search notes or categories"
          value={search}
          onChangeText={setSearch}
        />
        <Choice
          label="Filter by category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "", label: "All categories" },
            ...data.categories.map((cat) => ({
              value: cat.slug,
              label: `${cat.icon}  ${cat.name}`,
            })),
          ]}
        />
        <Card>
          <View style={layout.between}>
            <Label style={layout.heading}>Transactions</Label>
            <Label muted>{filtered.length} results</Label>
          </View>
          {filtered.length ? (
            filtered.map((e) => (
              <ExpenseRow
                key={e._id}
                expense={e}
                onPress={() => setEditing(e)}
              />
            ))
          ) : (
            <Empty
              title="No expenses found"
              message={
                search || category
                  ? "Try another search or category."
                  : "Your next expense starts here. Tap Add expense to get going."
              }
            />
          )}
        </Card>
        <ErrorMessage message={task.error} />
        <Button
          title="Export results as CSV"
          icon="share-outline"
          variant="secondary"
          disabled={!filtered.length}
          busy={task.busy}
          onPress={() => void exportCsv()}
        />
      </Screen>
      {editing ? (
        <ExpenseEditor expense={editing} onClose={() => setEditing(null)} />
      ) : null}
    </>
  );
}
