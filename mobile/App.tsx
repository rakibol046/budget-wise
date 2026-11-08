import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Pressable, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppProvider, useApp } from "./src/state";
import {
  Button,
  ErrorMessage,
  Icon,
  IconButton,
  Label,
  layout,
  useTheme,
} from "./src/ui";
import { monthLabel, shiftMonth } from "./src/lib/finance.mjs";
import { AuthScreen } from "./src/screens/Auth";
import { HomeScreen } from "./src/screens/Home";
import { ExpenseEditor, ExpensesScreen } from "./src/screens/Expenses";
import { BudgetScreen } from "./src/screens/Budget";
import { AccountsScreen } from "./src/screens/Accounts";
import { CategoriesScreen } from "./src/screens/Categories";
import { SettingsScreen } from "./src/screens/Settings";
import type { Tab } from "./src/types";

const tabs: { name: Tab; icon: React.ComponentProps<typeof Icon>["name"] }[] = [
  { name: "Home", icon: "grid-outline" },
  { name: "Expenses", icon: "receipt-outline" },
  { name: "Budget", icon: "pie-chart-outline" },
  { name: "Accounts", icon: "wallet-outline" },
  { name: "Settings", icon: "options-outline" },
];
function Shell() {
  const { user, booting, bootError, bootstrap, logout, month, setMonth, dark } =
    useApp();
  const c = useTheme();
  const [tab, setTab] = useState<Tab>("Home");
  const [onboarding, setOnboarding] = useState(false);
  const [adding, setAdding] = useState(false);
  const previousUser = useRef<string | null>(null);
  useEffect(() => {
    if (previousUser.current !== (user?.id || null)) {
      setTab("Home");
      setAdding(false);
    }
    if (!user) setOnboarding(false);
    previousUser.current = user?.id || null;
  }, [user?.id]);
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (tab === "Categories") {
          setTab("Settings");
          return true;
        }
        if (tab !== "Home") {
          setTab("Home");
          return true;
        }
        return false;
      },
    );
    return () => subscription.remove();
  }, [tab]);
  let content;
  if (booting)
    content = (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <Icon name="wallet-outline" size={44} color={c.accent} />
        <Label style={layout.title}>BudgetWise.</Label>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  else if (bootError)
    content = (
      <View style={{ flex: 1, justifyContent: "center", padding: 28, gap: 20 }}>
        <Label style={layout.title}>Let’s reconnect</Label>
        <ErrorMessage message={bootError} />
        <Button title="Try again" onPress={() => void bootstrap()} />
        <Button
          title="Return to sign in"
          variant="secondary"
          onPress={() => void logout().catch(() => {})}
        />
      </View>
    );
  else if (!user || onboarding)
    content = (
      <AuthScreen
        onCurrencyRequired={() => setOnboarding(true)}
        onDone={() => setOnboarding(false)}
      />
    );
  else
    content = (
      <>
        <View
          style={[
            layout.between,
            {
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderColor: c.border,
            },
          ]}
        >
          <View style={layout.row}>
            {tab === "Categories" ? (
              <IconButton
                name="arrow-back"
                label="Back to settings"
                onPress={() => setTab("Settings")}
              />
            ) : (
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: c.accentSoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="wallet-outline" color={c.accent} size={20} />
              </View>
            )}
            <Label
              style={{ fontWeight: "800", fontSize: 20, letterSpacing: -0.8 }}
            >
              BudgetWise<Label style={{ color: c.accent }}>.</Label>
            </Label>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            onPress={() => setTab("Settings")}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: c.inset,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Label style={{ color: c.accent, fontWeight: "700" }}>
              {user.name.slice(0, 1).toUpperCase()}
            </Label>
          </Pressable>
        </View>
        {tab === "Home" || tab === "Expenses" || tab === "Budget" ? (
          <View
            style={[
              layout.between,
              { paddingHorizontal: 20, paddingVertical: 9 },
            ]}
          >
            <IconButton
              name="chevron-back"
              label="Previous month"
              onPress={() => setMonth(shiftMonth(month, -1))}
            />
            <Label style={{ fontWeight: "600" }}>{monthLabel(month)}</Label>
            <IconButton
              name="chevron-forward"
              label="Next month"
              onPress={() => setMonth(shiftMonth(month, 1))}
            />
          </View>
        ) : null}
        <View style={{ flex: 1 }} key={tab}>
          {tab === "Home" ? (
            <HomeScreen navigate={setTab} addExpense={() => setAdding(true)} />
          ) : tab === "Expenses" ? (
            <ExpensesScreen addExpense={() => setAdding(true)} />
          ) : tab === "Budget" ? (
            <BudgetScreen />
          ) : tab === "Accounts" ? (
            <AccountsScreen />
          ) : tab === "Categories" ? (
            <CategoriesScreen />
          ) : (
            <SettingsScreen navigate={setTab} />
          )}
        </View>
        <View
          style={{
            flexDirection: "row",
            borderTopWidth: 1,
            borderColor: c.border,
            backgroundColor: c.surface,
            paddingTop: 9,
            paddingBottom: 8,
          }}
        >
          {tabs.map((item) => {
            const selected =
              tab === item.name ||
              (tab === "Categories" && item.name === "Settings");
            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                aria-selected={selected}
                accessibilityLabel={item.name}
                key={item.name}
                onPress={() => setTab(item.name)}
                style={{
                  flex: 1,
                  minHeight: 52,
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <View
                  style={{
                    backgroundColor: selected ? c.accentSoft : "transparent",
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 5,
                  }}
                >
                  <Icon
                    name={item.icon}
                    size={21}
                    color={selected ? c.accent : c.muted}
                  />
                </View>
                <Label
                  style={{
                    fontSize: 10,
                    fontWeight: selected ? "700" : "500",
                    color: selected ? c.accent : c.muted,
                  }}
                >
                  {item.name}
                </Label>
              </Pressable>
            );
          })}
        </View>
        {adding ? (
          <ExpenseEditor expense={null} onClose={() => setAdding(false)} />
        ) : null}
      </>
    );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <StatusBar style={dark ? "light" : "dark"} />
      {content}
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}
