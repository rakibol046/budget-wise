import React, { useState } from "react";
import { Linking, View } from "react-native";
import { useApp } from "../state";
import {
  Button,
  Card,
  Choice,
  ErrorMessage,
  Field,
  Label,
  layout,
  Screen,
  useTask,
  useTheme,
} from "../ui";
import { currencies } from "./Auth";
import type { Tab } from "../types";

export function SettingsScreen({ navigate }: { navigate: (tab: Tab) => void }) {
  const { user, setUser, request, themeMode, setTheme, logout } = useApp();
  const c = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [currency, setCurrency] = useState(user?.currency || "BDT");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [signingOut, setSigningOut] = useState(false);
  const profile = useTask();
  const password = useTask();
  const preferences = useTask();
  const session = useTask();
  return (
    <Screen refresh={false}>
      <View>
        <Label style={layout.title}>Make yourself at home</Label>
        <Label muted>Preferences, profile, and the little details.</Label>
      </View>
      <Card>
        <View style={layout.row}>
          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              backgroundColor: c.accentSoft,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Label style={{ fontSize: 24, fontWeight: "700", color: c.accent }}>
              {user?.name.slice(0, 1).toUpperCase()}
            </Label>
          </View>
          <View style={layout.grow}>
            <Label style={{ fontSize: 18, fontWeight: "700" }}>
              {user?.name}
            </Label>
            <Label muted>{user?.email}</Label>
          </View>
        </View>
      </Card>
      {notice ? (
        <Card style={{ backgroundColor: c.accentSoft }}>
          <Label style={{ color: c.accent }}>{notice}</Label>
        </Card>
      ) : null}
      <Card>
        <Label style={layout.heading}>Your profile</Label>
        <Field
          label="Name"
          value={name}
          onChangeText={setName}
          maxLength={50}
        />
        <ErrorMessage message={profile.error} />
        <Button
          title="Save profile"
          busy={profile.busy}
          onPress={() =>
            void profile.run(async () => {
              if (!name.trim()) throw new Error("Enter your name.");
              const result = await request("/auth/profile", {
                method: "PUT",
                body: { name: name.trim() },
              });
              setUser(result.user);
              setNotice("Your profile has been updated.");
            })
          }
        />
      </Card>
      <Card>
        <Label style={layout.heading}>Preferences</Label>
        <Choice
          label="Appearance"
          value={themeMode}
          options={[
            { value: "system", label: "Follow device" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
          onChange={(value) =>
            void preferences.run(async () => {
              await setTheme(value as "system" | "light" | "dark");
            })
          }
        />
        <Choice
          label="Display currency"
          value={currency}
          onChange={setCurrency}
          options={currencies}
        />
        <Label muted style={{ fontSize: 12 }}>
          Changing currency updates labels. Existing amounts are not converted.
        </Label>
        <ErrorMessage message={preferences.error} />
        <Button
          title="Save currency"
          busy={preferences.busy}
          onPress={() =>
            void preferences.run(async () => {
              const result = await request("/auth/settings", {
                method: "PUT",
                body: { currency },
              });
              setUser(result.user);
              setNotice("Your display currency has been updated.");
            })
          }
        />
      </Card>
      <Card>
        <Label style={layout.heading}>Your organization</Label>
        <Button
          title="Manage categories"
          icon="pricetags-outline"
          variant="secondary"
          onPress={() => navigate("Categories")}
        />
        <Button
          title="Manage accounts"
          icon="wallet-outline"
          variant="secondary"
          onPress={() => navigate("Accounts")}
        />
      </Card>
      <Card>
        <Label style={layout.heading}>Change password</Label>
        <Field
          label="Current password"
          secureTextEntry
          autoComplete="current-password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <Field
          label="New password"
          secureTextEntry
          autoComplete="new-password"
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Field
          label="Confirm new password"
          secureTextEntry
          autoComplete="new-password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <ErrorMessage message={password.error} />
        <Button
          title="Update password"
          busy={password.busy}
          onPress={() =>
            void password.run(async () => {
              if (!currentPassword)
                throw new Error("Enter your current password.");
              if (newPassword.length < 6)
                throw new Error(
                  "Use at least 6 characters for your new password.",
                );
              if (newPassword !== confirmPassword)
                throw new Error("The new passwords do not match.");
              await request("/auth/password", {
                method: "PUT",
                body: { currentPassword, newPassword },
              });
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setNotice("Your password has been updated.");
            })
          }
        />
      </Card>
      <Button
        title="Open BudgetWise on the web"
        icon="open-outline"
        variant="secondary"
        onPress={() =>
          void session.run(async () => {
            await Linking.openURL("https://budget-wise-six.vercel.app/");
          })
        }
      />
      <ErrorMessage message={session.error} />
      {signingOut ? (
        <Card>
          <Label>Sign out of BudgetWise on this device?</Label>
          <Button
            title="Sign out"
            variant="danger"
            busy={session.busy}
            onPress={() => void session.run(logout)}
          />
          <Button
            title="Stay signed in"
            variant="secondary"
            disabled={session.busy}
            onPress={() => setSigningOut(false)}
          />
        </Card>
      ) : (
        <Button
          title="Sign out"
          variant="danger"
          icon="log-out-outline"
          onPress={() => setSigningOut(true)}
        />
      )}
      <Label muted style={{ textAlign: "center", fontSize: 12 }}>
        BudgetWise for Android · Version 1.0.0
      </Label>
    </Screen>
  );
}
