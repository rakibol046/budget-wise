import React, { useState } from "react";
import { Switch, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../state";
import { money, parseAmount } from "../lib/finance.mjs";
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
import type { Account } from "../types";
export const colors = [
  "#087f75",
  "#4f7ac7",
  "#9166b7",
  "#b87244",
  "#d05c72",
  "#667b8f",
].map((value, index) => ({
  value,
  label: ["Teal", "Blue", "Violet", "Amber", "Rose", "Slate"][index],
}));
function AccountEditor({
  account,
  onClose,
}: {
  account: Account | null;
  onClose: () => void;
}) {
  const { request, refresh } = useApp();
  const c = useTheme();
  const task = useTask();
  const [name, setName] = useState(account?.name || "");
  const [bank, setBank] = useState(account?.bankName || "");
  const [type, setType] = useState(account?.accountType || "savings");
  const [balance, setBalance] = useState("0");
  const [color, setColor] = useState(account?.color || "#087f75");
  const [isDefault, setDefault] = useState(account?.isDefault || false);
  const save = () =>
    task.run(async () => {
      if (!name.trim()) throw new Error("Enter an account name.");
      const body = {
        name: name.trim(),
        bankName: bank.trim(),
        accountType: type,
        color,
        icon: type === "cash" ? "💵" : "🏦",
        isDefault,
        ...(!account
          ? {
              balance: parseAmount(balance, {
                allowZero: true,
                allowNegative: true,
              }),
            }
          : {}),
      };
      await request(account ? `/accounts/${account._id}` : "/accounts", {
        method: account ? "PUT" : "POST",
        body,
      });
      onClose();
      await refresh();
    });
  return (
    <Sheet
      visible
      title={account ? "Edit account" : "Add an account"}
      onClose={onClose}
      busy={task.busy}
    >
      <Field
        label="Account name"
        placeholder="Everyday savings"
        value={name}
        onChangeText={setName}
        maxLength={60}
      />
      <Field
        label="Bank name (optional)"
        value={bank}
        onChangeText={setBank}
        maxLength={80}
      />
      <Choice
        label="Account type"
        value={type}
        onChange={setType}
        options={[
          ...(account?.accountType === "Debit"
            ? [{ value: "Debit", label: "Debit" }]
            : []),
          { value: "savings", label: "Savings" },
          { value: "cash", label: "Cash" },
          { value: "credit", label: "Credit" },
        ]}
      />
      {!account ? (
        <Field
          label="Opening balance"
          value={balance}
          onChangeText={setBalance}
          keyboardType="numbers-and-punctuation"
        />
      ) : (
        <Label muted>Use Adjust balance to add or subtract money.</Label>
      )}
      <Choice
        label="Account color"
        value={color}
        onChange={setColor}
        options={
          colors.some((option) => option.value === color)
            ? colors
            : [{ value: color, label: "Current color" }, ...colors]
        }
      />
      <View style={layout.between}>
        <Label>Default account for expenses</Label>
        <Switch
          accessibilityLabel="Default account"
          value={isDefault}
          onValueChange={setDefault}
          trackColor={{ true: c.accent }}
        />
      </View>
      <ErrorMessage message={task.error} />
      <Button
        title="Save account"
        busy={task.busy}
        onPress={() => void save()}
      />
      {account ? (
        <DeleteButton
          title="Delete account"
          message="Delete this account? Accounts with linked expenses cannot be deleted."
          busy={task.busy}
          onDelete={() =>
            void task.run(async () => {
              await request(`/accounts/${account._id}`, { method: "DELETE" });
              onClose();
              await refresh();
            })
          }
        />
      ) : null}
    </Sheet>
  );
}
function BalanceEditor({
  account,
  onClose,
}: {
  account: Account;
  onClose: () => void;
}) {
  const { request, refresh, user } = useApp();
  const task = useTask();
  const [type, setType] = useState("add");
  const [amount, setAmount] = useState("");
  return (
    <Sheet
      visible
      title={`Adjust ${account.name}`}
      onClose={onClose}
      busy={task.busy}
    >
      <Label muted>
        Current balance: {money(account.balance, user?.currency)}
      </Label>
      <Choice
        label="Adjustment"
        value={type}
        onChange={setType}
        options={[
          { value: "add", label: "Add money" },
          { value: "subtract", label: "Subtract money" },
        ]}
      />
      <Field
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />
      <Label muted>
        This changes the account balance. It does not create an expense.
      </Label>
      <ErrorMessage message={task.error} />
      <Button
        title="Update balance"
        busy={task.busy}
        onPress={() =>
          void task.run(async () => {
            await request(`/accounts/${account._id}/adjust`, {
              method: "POST",
              body: { type, amount: parseAmount(amount) },
            });
            onClose();
            await refresh();
          })
        }
      />
    </Sheet>
  );
}
export function AccountsScreen() {
  const { data, user, loading, dataError } = useApp();
  const c = useTheme();
  const [editor, setEditor] = useState<{ account: Account | null } | null>(
    null,
  );
  const [adjusting, setAdjusting] = useState<Account | null>(null);
  return (
    <>
      <Screen>
        <View>
          <Label style={layout.title}>Your accounts</Label>
          <Label muted>A home for every part of your money.</Label>
        </View>
        <Card>
          <Label muted>TOTAL ACCOUNT BALANCES</Label>
          <Label style={{ fontSize: 32, fontWeight: "700", color: c.accent }}>
            {money(
              data.accounts.reduce((sum, a) => sum + a.balance, 0),
              user?.currency,
            )}
          </Label>
          <Label muted>
            {data.accounts.length} accounts · {user?.currency}
          </Label>
        </Card>
        <Button
          title="Add account"
          icon="add"
          onPress={() => setEditor({ account: null })}
          disabled={loading || !!dataError}
        />
        {!data.accounts.length ? (
          <Card>
            <Empty
              title="Bring it all together"
              message="Add a savings account, cash wallet, or credit account to keep track of your balances."
            />
          </Card>
        ) : (
          data.accounts.map((account) => (
            <Card key={account._id}>
              <LinearGradient
                colors={[account.color, "#163d48"]}
                style={{ padding: 21, borderRadius: 18, gap: 18 }}
              >
                <View style={layout.between}>
                  <Label style={{ fontSize: 24 }}>{account.icon}</Label>
                  <Label style={{ color: "#ffffffcc", fontSize: 12 }}>
                    {account.isDefault ? "DEFAULT · " : ""}
                    {account.accountType.toUpperCase()}
                  </Label>
                </View>
                <View>
                  <Label style={{ color: "#ffffffdd" }}>{account.name}</Label>
                  <Label
                    style={{
                      color: "#ffffff",
                      fontSize: 29,
                      fontWeight: "700",
                      marginTop: 5,
                    }}
                  >
                    {money(account.balance, user?.currency)}
                  </Label>
                </View>
                <Label style={{ color: "#ffffffbb", fontSize: 12 }}>
                  {account.bankName || "Personal account"}
                </Label>
              </LinearGradient>
              <View style={layout.row}>
                <View style={layout.grow}>
                  <Button
                    title="Adjust balance"
                    variant="secondary"
                    onPress={() => setAdjusting(account)}
                  />
                </View>
                <Button
                  title="Edit"
                  variant="secondary"
                  onPress={() => setEditor({ account })}
                />
              </View>
            </Card>
          ))
        )}
      </Screen>
      {editor ? (
        <AccountEditor
          account={editor.account}
          onClose={() => setEditor(null)}
        />
      ) : null}
      {adjusting ? (
        <BalanceEditor account={adjusting} onClose={() => setAdjusting(null)} />
      ) : null}
    </>
  );
}
