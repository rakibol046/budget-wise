import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../state";
import { categoryFor, money, weeklySpending } from "../lib/finance.mjs";
import {
  Button,
  Card,
  Empty,
  Icon,
  Label,
  layout,
  Progress,
  Screen,
  useTheme,
} from "../ui";
import type { Expense, Tab } from "../types";

export function ExpenseRow({
  expense,
  onPress,
}: {
  expense: Expense;
  onPress?: () => void;
}) {
  const { data, user } = useApp();
  const c = useTheme();
  const category = categoryFor(data.categories, expense.category);
  const account = data.accounts.find((a) => a._id === expense.accountId);
  const content = (
    <View style={[layout.row, { paddingVertical: 10 }]}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: category.color + "20",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Label style={{ fontSize: 22 }}>{category.icon}</Label>
      </View>
      <View style={layout.grow}>
        <Label style={{ fontWeight: "600" }} numberOfLines={undefined}>
          {expense.note || category.name}
        </Label>
        <Label muted style={{ fontSize: 12 }}>
          {new Date(expense.date).toLocaleDateString("en", {
            month: "short",
            day: "numeric",
          })}
          {account ? ` · ${account.name}` : ""}
          {expense.isRecurring ? " · Recurring" : ""}
        </Label>
      </View>
      <Label
        style={{
          fontWeight: "700",
          color: c.text,
          fontVariant: ["tabular-nums"],
        }}
      >
        −{money(expense.amount, user?.currency)}
      </Label>
    </View>
  );
  return onPress ? <RowPress onPress={onPress}>{content}</RowPress> : content;
}
import { Pressable } from "react-native";
function RowPress({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Edit expense"
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}
export function HomeScreen({
  navigate,
  addExpense,
}: {
  navigate: (tab: Tab) => void;
  addExpense: () => void;
}) {
  const { user, data, loading, dataError } = useApp();
  const c = useTheme();
  const insights = data.insights;
  const format = (n: number) => money(n, user?.currency);
  const weeks = weeklySpending(data.expenses);
  const peak = Math.max(...weeks, 1);
  const total = insights?.totalSpent || 0;
  const breakdown = Object.entries(insights?.byCat || {})
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1]);
  const netWorth = data.accounts.reduce(
    (sum, account) => sum + account.balance,
    0,
  );
  return (
    <Screen>
      <View style={{ gap: 4 }}>
        <Label muted>YOUR MONEY AT A GLANCE</Label>
        <Label style={layout.title}>
          Hello, {user?.name.split(" ")[0]}{" "}
          <Label style={{ fontSize: 26 }}>☀</Label>
        </Label>
        <Label muted>Small steps. A healthier financial future.</Label>
      </View>
      <LinearGradient
        colors={["#164f53", "#0b333b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 24, borderRadius: 26, gap: 18, overflow: "hidden" }}
      >
        <View style={layout.between}>
          <Label style={{ color: "#b7d8d5" }}>Monthly budget remaining</Label>
          <Icon name="wallet-outline" color="#80ddc2" />
        </View>
        <Label
          style={{
            fontSize: 36,
            fontWeight: "700",
            color: "#ffffff",
            letterSpacing: -1.2,
            fontVariant: ["tabular-nums"],
          }}
        >
          {loading && !insights ? "•••" : format(insights?.remaining || 0)}
        </Label>
        <View
          style={{ height: 6, backgroundColor: "#ffffff20", borderRadius: 3 }}
        >
          <View
            style={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "#88e7c4",
              width: `${Math.min(100, insights?.percentage || 0)}%`,
            }}
          />
        </View>
        <View style={layout.between}>
          <View>
            <Label style={{ color: "#9fc2c4", fontSize: 12 }}>
              Spent this month
            </Label>
            <Label
              style={{ color: "#ffffff", fontWeight: "600", fontSize: 17 }}
            >
              {format(total)}
            </Label>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Label style={{ color: "#9fc2c4", fontSize: 12 }}>
              Monthly budget
            </Label>
            <Label
              style={{ color: "#ffffff", fontWeight: "600", fontSize: 17 }}
            >
              {format(insights?.totalBudget || 0)}
            </Label>
          </View>
        </View>
      </LinearGradient>
      {insights && insights.totalBudget > 0 && insights.percentage >= 60 ? (
        <Card style={{ backgroundColor: c.accentSoft }}>
          <Label
            style={{
              color: insights.percentage >= 80 ? c.danger : c.accent,
              fontWeight: "600",
            }}
          >
            {insights.percentage.toFixed(1)}% of your budget used.{" "}
            {insights.remaining < 0
              ? "You are over your monthly budget."
              : "Keep an eye on your spending."}
          </Label>
        </Card>
      ) : null}
      <View style={layout.row}>
        <View style={layout.grow}>
          <Button
            title="Add expense"
            icon="add"
            onPress={addExpense}
            disabled={loading || !!dataError}
          />
        </View>
        <View style={layout.grow}>
          <Button
            title="Plan budget"
            icon="pie-chart-outline"
            variant="secondary"
            onPress={() => navigate("Budget")}
          />
        </View>
      </View>
      <View style={layout.row}>
        <Card style={{ flex: 1, padding: 16 }}>
          <Icon name="trending-up-outline" color={c.accent} />
          <Label muted style={{ fontSize: 12 }}>
            Account balances
          </Label>
          <Label style={{ fontSize: 19, fontWeight: "700" }}>
            {format(netWorth)}
          </Label>
        </Card>
        <Card style={{ flex: 1, padding: 16 }}>
          <Icon name="calendar-outline" color={c.accent} />
          <Label muted style={{ fontSize: 12 }}>
            Daily average
          </Label>
          <Label style={{ fontSize: 19, fontWeight: "700" }}>
            {format(insights?.dailyAvg || 0)}
          </Label>
        </Card>
      </View>
      <Card>
        <View style={layout.between}>
          <Label style={layout.heading}>Spending rhythm</Label>
          <Label muted style={{ fontSize: 12 }}>
            This month
          </Label>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 13,
            height: 135,
          }}
        >
          {weeks.map((amount, index) => (
            <View key={index} style={{ flex: 1, alignItems: "center", gap: 7 }}>
              <Label muted style={{ fontSize: 9 }}>
                {format(amount)}
              </Label>
              <View
                style={{
                  width: "70%",
                  minWidth: 18,
                  height: Math.max(5, (amount / peak) * 85),
                  backgroundColor: amount === peak ? c.accent : c.accent + "60",
                  borderRadius: 7,
                }}
              />
              <Label muted style={{ fontSize: 11 }}>
                W{index + 1}
              </Label>
            </View>
          ))}
        </View>
        <Label muted style={{ fontSize: 12 }}>
          Projected month-end spending: {format(insights?.predicted || 0)}
        </Label>
      </Card>
      <Card>
        <Label style={layout.heading}>Where it goes</Label>
        {!breakdown.length ? (
          <Empty
            title="A fresh start"
            message="Add your first expense to see your spending by category."
          />
        ) : (
          breakdown.map(([slug, amount]) => {
            const cat = categoryFor(data.categories, slug);
            return (
              <View key={slug} style={{ gap: 8 }}>
                <View style={layout.between}>
                  <Label>
                    {cat.icon} {cat.name}
                  </Label>
                  <Label style={{ fontWeight: "600" }}>{format(amount)}</Label>
                </View>
                <Progress
                  value={total ? (amount / total) * 100 : 0}
                  color={cat.color}
                />
              </View>
            );
          })
        )}
      </Card>
      <Card>
        <View style={layout.between}>
          <Label style={layout.heading}>Recent expenses</Label>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigate("Expenses")}
            style={{ padding: 8 }}
          >
            <Label style={{ color: c.accent }}>See all →</Label>
          </Pressable>
        </View>
        {data.expenses.length ? (
          data.expenses
            .slice(0, 5)
            .map((e) => <ExpenseRow key={e._id} expense={e} />)
        ) : (
          <Label muted>
            No expenses this month. Start whenever you’re ready.
          </Label>
        )}
      </Card>
    </Screen>
  );
}
