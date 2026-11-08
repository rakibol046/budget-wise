import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useApp } from "../state";
import { money, parseAmount, shiftMonth } from "../lib/finance.mjs";
import {
  Button,
  Card,
  Empty,
  ErrorMessage,
  Field,
  Label,
  layout,
  Progress,
  Screen,
  Sheet,
  useTask,
  useTheme,
} from "../ui";

function BudgetEditor({ onClose }: { onClose: () => void }) {
  const { data, month, request, refresh, user } = useApp();
  const task = useTask();
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      data.categories.map((cat) => [
        cat.slug,
        String(data.budget?.categories[cat.slug] || 0),
      ]),
    ),
  );
  const save = () =>
    task.run(async () => {
      const categories: Record<string, number> = {};
      for (const cat of data.categories)
        categories[cat.slug] = parseAmount(values[cat.slug] || "0", {
          allowZero: true,
        });
      await request("/budget/set", {
        method: "POST",
        body: { month, categories },
      });
      onClose();
      await refresh();
    });
  return (
    <Sheet
      visible
      title="Plan your monthly budget"
      onClose={onClose}
      busy={task.busy}
    >
      <Label muted>
        Give each category a little room. Amounts are in {user?.currency}.
      </Label>
      {data.categories.map((cat) => (
        <Field
          key={cat.slug}
          label={`${cat.icon}  ${cat.name}${cat.isActive ? "" : " (inactive)"}`}
          value={values[cat.slug] || ""}
          keyboardType="decimal-pad"
          onChangeText={(v) => setValues((old) => ({ ...old, [cat.slug]: v }))}
        />
      ))}
      <ErrorMessage message={task.error} />
      <Button
        title="Save budget"
        onPress={() => void save()}
        busy={task.busy}
      />
    </Sheet>
  );
}
export function BudgetScreen() {
  const { data, user, request, refresh, month, loading, dataError } = useApp();
  const c = useTheme();
  const task = useTask();
  const [editing, setEditing] = useState(false);
  const insights = data.insights;
  const format = (n: number) => money(n, user?.currency);
  return (
    <>
      <Screen>
        <View>
          <Label style={layout.title}>Room for what matters</Label>
          <Label muted>Give every category a plan.</Label>
        </View>
        <Card>
          <Label muted>MONTHLY ALLOCATION</Label>
          <Label style={{ fontSize: 32, fontWeight: "700" }}>
            {format(insights?.totalBudget || 0)}
          </Label>
          <Progress
            value={insights?.percentage || 0}
            color={(insights?.percentage || 0) >= 80 ? c.danger : c.accent}
          />
          <View style={layout.between}>
            <Label muted>{format(insights?.totalSpent || 0)} spent</Label>
            <Label
              style={{
                color: (insights?.remaining || 0) < 0 ? c.danger : c.accent,
              }}
            >
              {format(insights?.remaining || 0)} left
            </Label>
          </View>
        </Card>
        <Button
          title={data.budget ? "Edit monthly budget" : "Set monthly budget"}
          icon="create-outline"
          onPress={() => setEditing(true)}
          disabled={!data.categories.length || loading || !!dataError}
        />
        <Button
          title="Copy previous month’s budget"
          variant="secondary"
          disabled={!data.categories.length || loading || !!dataError}
          busy={task.busy}
          onPress={() =>
            void task.run(async () => {
              const previous = await request(
                `/budget/${shiftMonth(month, -1)}`,
              );
              if (!previous.budget)
                throw new Error("There is no budget for the previous month.");
              const valid = new Set(data.categories.map((cat) => cat.slug));
              const categories = Object.fromEntries(
                Object.entries(previous.budget.categories).filter(([slug]) =>
                  valid.has(slug),
                ),
              );
              await request("/budget/set", {
                method: "POST",
                body: { month, categories },
              });
              await refresh();
            })
          }
        />
        <ErrorMessage message={task.error} />
        <Label style={layout.heading}>Category budgets</Label>
        {!data.categories.length ? (
          <Card>
            <Empty
              title="Start with a category"
              message="Create your spending categories in Settings to plan your budget."
            />
          </Card>
        ) : (
          data.categories.map((cat) => {
            const allocated = data.budget?.categories[cat.slug] || 0;
            const spent = insights?.byCat[cat.slug] || 0;
            const pct = allocated ? (spent / allocated) * 100 : 0;
            return (
              <Card key={cat._id}>
                <View style={layout.between}>
                  <Label style={{ fontWeight: "600" }}>
                    {cat.icon} {cat.name}
                  </Label>
                  <Label muted>
                    {allocated ? `${Math.round(pct)}% used` : "No limit set"}
                  </Label>
                </View>
                <Progress
                  value={pct}
                  color={pct >= 80 ? c.danger : cat.color}
                />
                <View style={layout.between}>
                  <Label muted>{format(spent)} spent</Label>
                  <Label>{format(allocated)} budget</Label>
                </View>
              </Card>
            );
          })
        )}
      </Screen>
      {editing ? <BudgetEditor onClose={() => setEditing(false)} /> : null}
    </>
  );
}
