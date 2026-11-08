import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Platform, useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, type RequestOptions } from "./lib/api.mjs";
import { currentMonth } from "./lib/finance.mjs";
import type { FinanceData, User } from "./types";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://budget-wise-six.vercel.app/_/backend/api";
const TOKEN_KEY = "budgetwise-token";
// Web is a development preview. Android uses the operating system's secure store.
const tokenStorage = {
  get: () =>
    Platform.OS === "web"
      ? Promise.resolve(sessionStorage.getItem(TOKEN_KEY))
      : SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string) =>
    Platform.OS === "web"
      ? Promise.resolve(sessionStorage.setItem(TOKEN_KEY, token))
      : SecureStore.setItemAsync(TOKEN_KEY, token),
  remove: () =>
    Platform.OS === "web"
      ? Promise.resolve(sessionStorage.removeItem(TOKEN_KEY))
      : SecureStore.deleteItemAsync(TOKEN_KEY),
};
const emptyData: FinanceData = {
  expenses: [],
  categories: [],
  accounts: [],
  budget: null,
  insights: null,
};
type ThemeMode = "system" | "light" | "dark";
type Store = {
  user: User | null;
  booting: boolean;
  bootError: string;
  bootstrap: () => Promise<void>;
  request: <T = any>(path: string, options?: RequestOptions) => Promise<T>;
  authenticate: (result: { token: string; user: User }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  month: string;
  setMonth: (month: string) => void;
  data: FinanceData;
  loading: boolean;
  dataError: string;
  refresh: () => Promise<void>;
  dark: boolean;
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => Promise<void>;
};
const Context = createContext<Store | null>(null);
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const token = useRef<string | null>(null);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState("");
  const [month, setMonth] = useState(currentMonth);
  const [data, setData] = useState<FinanceData>(emptyData);
  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const systemTheme = useColorScheme();
  const generation = useRef(0);
  const clearSession = useCallback(() => {
    token.current = null;
    generation.current++;
    setUser(null);
    setData(emptyData);
    setDataError("");
    setBootError("");
    setMonth(currentMonth());
  }, []);
  const logout = useCallback(async () => {
    await tokenStorage.remove();
    clearSession();
  }, [clearSession]);
  const request = useMemo(
    () =>
      createApi({
        baseUrl: API_URL,
        getToken: () => token.current,
        onUnauthorized: (rejectedToken) => {
          if (token.current !== rejectedToken) return;
          clearSession();
          void tokenStorage.remove().catch(() => {});
        },
      }),
    [clearSession],
  );
  const bootstrap = useCallback(async () => {
    setBooting(true);
    setBootError("");
    try {
      const saved = await tokenStorage.get();
      if (saved) {
        token.current = saved;
        const response = await request<{ user: User }>("/auth/me");
        if (token.current === saved) setUser(response.user);
      }
    } catch (error) {
      if (token.current) setBootError((error as Error).message);
    } finally {
      setBooting(false);
    }
  }, [request]);
  useEffect(() => {
    void bootstrap();
    void AsyncStorage.getItem("budgetwise-theme")
      .then((value) => {
        if (value === "light" || value === "dark" || value === "system")
          setThemeMode(value);
      })
      .catch(() => {});
  }, [bootstrap]);
  const authenticate = async (result: { token: string; user: User }) => {
    await tokenStorage.set(result.token);
    token.current = result.token;
    setBootError("");
    setMonth(currentMonth());
    setData(emptyData);
    setUser(result.user);
  };
  const refresh = useCallback(async () => {
    if (!user) return;
    const run = ++generation.current;
    setLoading(true);
    setDataError("");
    try {
      const [expenses, categories, accounts, summary] = await Promise.all([
        request(`/expenses?month=${month}`),
        request("/categories"),
        request("/accounts"),
        request(`/budget/insights/${month}`),
      ]);
      if (generation.current === run)
        setData({
          expenses: expenses.expenses,
          categories: categories.categories,
          accounts: accounts.accounts,
          budget: summary.budget,
          insights: summary.insights,
        });
    } catch (error) {
      if (generation.current === run) setDataError((error as Error).message);
    } finally {
      if (generation.current === run) setLoading(false);
    }
  }, [user?.id, month, request]);
  useEffect(() => {
    setData(emptyData);
    void refresh();
    return () => {
      generation.current++;
    };
  }, [refresh]);
  const setTheme = async (mode: ThemeMode) => {
    await AsyncStorage.setItem("budgetwise-theme", mode);
    setThemeMode(mode);
  };
  return (
    <Context.Provider
      value={{
        user,
        booting,
        bootError,
        bootstrap,
        request,
        authenticate,
        logout,
        setUser,
        month,
        setMonth,
        data,
        loading,
        dataError,
        refresh,
        dark:
          themeMode === "dark" ||
          (themeMode === "system" && systemTheme === "dark"),
        themeMode,
        setTheme,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("AppProvider is required");
  return value;
}
