import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../state";
import {
  Button,
  Card,
  ErrorMessage,
  Field,
  Icon,
  Label,
  layout,
  useTask,
  useTheme,
  Choice,
} from "../ui";

export const currencies = [
  { value: "BDT", label: "৳  BDT · Bangladeshi Taka" },
  { value: "USD", label: "$  USD · US Dollar" },
  { value: "INR", label: "₹  INR · Indian Rupee" },
  { value: "EUR", label: "€  EUR · Euro" },
  { value: "GBP", label: "£  GBP · British Pound" },
  { value: "CAD", label: "C$  CAD · Canadian Dollar" },
  { value: "AUD", label: "A$  AUD · Australian Dollar" },
  { value: "JPY", label: "¥  JPY · Japanese Yen" },
];
type Mode = "login" | "register" | "verify" | "currency";
export function AuthScreen({
  onDone,
  onCurrencyRequired,
}: {
  onDone: () => void;
  onCurrencyRequired: () => void;
}) {
  const { request, authenticate, user, setUser } = useApp();
  const c = useTheme();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [currency, setCurrency] = useState("BDT");
  const [notice, setNotice] = useState("");
  const task = useTask();
  const changeMode = (next: Mode) => {
    setMode(next);
    task.setError("");
    setNotice("");
  };
  const submit = () =>
    task.run(async () => {
      const normalizedEmail = email.trim().toLowerCase();
      if (mode !== "currency" && !/^\S+@\S+\.\S+$/.test(normalizedEmail))
        throw new Error("Enter a valid email address.");
      if ((mode === "login" || mode === "register") && !password)
        throw new Error("Enter your password.");
      if (mode === "register") {
        if (!name.trim()) throw new Error("Enter your name.");
        if (password.length < 6)
          throw new Error("Your password must be at least 6 characters.");
        await request("/auth/register", {
          method: "POST",
          body: { name: name.trim(), email: normalizedEmail, password },
          authenticated: false,
        });
        setEmail(normalizedEmail);
        setPassword("");
        changeMode("verify");
        setNotice("Check your email for your six digit verification code.");
      } else if (mode === "verify") {
        if (!/^\d{6}$/.test(otp))
          throw new Error("Enter the six digit code from your email.");
        const result = await request("/auth/verify-email", {
          method: "POST",
          body: { email: normalizedEmail, otp },
          authenticated: false,
        });
        onCurrencyRequired();
        await authenticate(result);
        setCurrency(result.user.currency || "BDT");
        changeMode("currency");
      } else if (mode === "currency") {
        const result = await request("/auth/settings", {
          method: "PUT",
          body: { currency },
        });
        setUser(result.user);
        onDone();
      } else {
        const result = await request("/auth/login", {
          method: "POST",
          body: { email: normalizedEmail, password },
          authenticated: false,
        });
        await authenticate(result);
        setPassword("");
        onDone();
      }
    });
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
          gap: 28,
          width: "100%",
          maxWidth: 500,
          alignSelf: "center",
        }}
      >
        <View style={{ gap: 18 }}>
          <View style={layout.row}>
            <LinearGradient
              colors={["#167c71", "#104a50"]}
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="wallet-outline" size={28} color="#d8fff0" />
            </LinearGradient>
            <Label
              style={{ fontWeight: "800", fontSize: 24, letterSpacing: -0.8 }}
            >
              BudgetWise<Label style={{ color: c.accent }}>.</Label>
            </Label>
          </View>
          <View>
            <Label style={[layout.title, { fontSize: 34 }]}>
              {mode === "register"
                ? "A little more clarity.\nA lot more control."
                : mode === "verify"
                  ? "Check your inbox."
                  : mode === "currency"
                    ? "Make it yours."
                    : "Your money,\na little more mindful."}
            </Label>
            <Label muted style={{ marginTop: 10 }}>
              Expenses, budgets, and everyday peace of mind.
            </Label>
          </View>
        </View>
        <Card style={{ padding: 22, gap: 18 }}>
          <Label style={layout.heading}>
            {mode === "register"
              ? "Create your account"
              : mode === "verify"
                ? "Verify your email"
                : mode === "currency"
                  ? `Welcome, ${user?.name.split(" ")[0] || "there"}`
                  : "Welcome back"}
          </Label>
          {notice ? <Label style={{ color: c.accent }}>{notice}</Label> : null}
          {mode === "register" ? (
            <Field
              label="Your name"
              value={name}
              onChangeText={setName}
              maxLength={50}
              autoComplete="name"
            />
          ) : null}
          {mode !== "currency" ? (
            <Field
              label="Email address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!task.busy}
              placeholder="you@example.com"
            />
          ) : null}
          {mode === "login" || mode === "register" ? (
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              placeholder={
                mode === "register"
                  ? "At least 6 characters"
                  : "Enter your password"
              }
            />
          ) : null}
          {mode === "verify" ? (
            <Field
              label="Verification code"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="000000"
            />
          ) : null}
          {mode === "currency" ? (
            <Choice
              label="Your currency"
              value={currency}
              options={currencies}
              onChange={setCurrency}
            />
          ) : null}
          <ErrorMessage message={task.error} />
          <Button
            title={
              mode === "register"
                ? "Create account"
                : mode === "verify"
                  ? "Verify email"
                  : mode === "currency"
                    ? "Start using BudgetWise"
                    : "Sign in"
            }
            onPress={() => void submit()}
            busy={task.busy}
            icon="arrow-forward"
          />
          {mode === "verify" ? (
            <Button
              title="Resend verification code"
              variant="secondary"
              disabled={task.busy}
              onPress={() =>
                void task.run(async () => {
                  await request("/auth/resend-otp", {
                    method: "POST",
                    body: { email: email.trim().toLowerCase() },
                    authenticated: false,
                  });
                  setNotice(
                    "A new code has been sent. Wait 60 seconds before requesting another.",
                  );
                })
              }
            />
          ) : null}
          {mode === "login" ? (
            <Button
              title="Need to verify your email?"
              variant="secondary"
              disabled={task.busy}
              onPress={() => changeMode("verify")}
            />
          ) : null}
        </Card>
        {mode !== "currency" ? (
          <View style={{ gap: 8 }}>
            <Label muted style={{ textAlign: "center" }}>
              {mode === "login"
                ? "New to BudgetWise?"
                : "Already have an account?"}
            </Label>
            <Button
              title={mode === "login" ? "Create an account" : "Back to sign in"}
              variant="secondary"
              disabled={task.busy}
              onPress={() =>
                changeMode(mode === "login" ? "register" : "login")
              }
            />
          </View>
        ) : null}
        <Label muted style={{ textAlign: "center", fontSize: 12 }}>
          One account. Your finances, wherever you are.
        </Label>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
