import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useApp } from "./state";

const light = {
  bg: "#f4f7f8",
  surface: "#ffffff",
  inset: "#edf3f4",
  text: "#152c35",
  muted: "#697d85",
  border: "#dfe8eb",
  accent: "#087f75",
  accentSoft: "#dff4ed",
  danger: "#c44351",
  hero: "#123e43",
};
const dark = {
  bg: "#0b171e",
  surface: "#12252e",
  inset: "#1b303a",
  text: "#e9f2f4",
  muted: "#95acb5",
  border: "#263e48",
  accent: "#6cdec3",
  accentSoft: "#173f3d",
  danger: "#ff9097",
  hero: "#123e43",
};
export const useTheme = () => (useApp().dark ? dark : light);
export const layout = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  grow: { flex: 1 },
  stack: { gap: 16 },
  title: { fontSize: 28, fontWeight: "700", letterSpacing: -0.7 },
  subtitle: { fontSize: 14, lineHeight: 22 },
  heading: { fontSize: 18, fontWeight: "700", letterSpacing: -0.3 },
});
export function Label({
  children,
  muted = false,
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  muted?: boolean;
  style?: any;
  numberOfLines?: number;
}) {
  const c = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ color: muted ? c.muted : c.text, fontSize: 14 }, style]}
    >
      {children}
    </Text>
  );
}
export function Icon({
  name,
  size = 22,
  color,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
}) {
  const c = useTheme();
  return <Ionicons name={name} size={size} color={color || c.text} />;
}
export function Button({
  title,
  onPress,
  busy,
  disabled,
  variant = "primary",
  icon,
}: {
  title: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}) {
  const c = useTheme();
  const darkMode = useApp().dark;
  const primary = variant === "primary";
  const fg = primary
    ? darkMode
      ? "#0b2927"
      : "#ffffff"
    : variant === "danger"
      ? c.danger
      : c.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={busy || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          backgroundColor: primary ? c.accent : c.inset,
          opacity: busy || disabled ? 0.5 : pressed ? 0.75 : 1,
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={fg} />
      ) : icon ? (
        <Icon name={icon} size={18} color={fg} />
      ) : null}
      <Text style={{ color: fg, fontWeight: "700", fontSize: 14 }}>
        {title}
      </Text>
    </Pressable>
  );
}
export function IconButton({
  name,
  label,
  onPress,
}: {
  name: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.inset,
      }}
    >
      <Icon name={name} />
    </Pressable>
  );
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const c = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: c.surface,
          borderRadius: 22,
          padding: 20,
          borderWidth: 1,
          borderColor: c.border,
          gap: 14,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  const c = useTheme();
  return (
    <View style={{ gap: 7 }}>
      <Label style={{ fontWeight: "600", fontSize: 13 }}>{label}</Label>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={c.muted}
        {...props}
        style={[
          {
            backgroundColor: c.inset,
            color: c.text,
            minHeight: 50,
            paddingHorizontal: 15,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: error ? c.danger : c.border,
            borderRadius: 13,
            fontSize: 16,
          },
          props.style,
        ]}
      />
      {error ? <Label style={{ color: c.danger }}>{error}</Label> : null}
    </View>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  const c = useTheme();
  return message ? (
    <View
      accessibilityRole="alert"
      style={{
        backgroundColor: c.danger + "15",
        padding: 14,
        borderRadius: 12,
      }}
    >
      <Label style={{ color: c.danger }}>{message}</Label>
    </View>
  ) : null;
}
export function Empty({ title, message }: { title: string; message: string }) {
  const c = useTheme();
  return (
    <View style={{ paddingVertical: 30, alignItems: "center", gap: 9 }}>
      <View
        style={{ backgroundColor: c.accentSoft, padding: 16, borderRadius: 22 }}
      >
        <Icon name="leaf-outline" color={c.accent} size={28} />
      </View>
      <Label style={{ fontSize: 17, fontWeight: "700", marginTop: 5 }}>
        {title}
      </Label>
      <Label muted style={{ textAlign: "center", maxWidth: 290 }}>
        {message}
      </Label>
    </View>
  );
}
export function Screen({
  children,
  refresh = true,
}: {
  children: React.ReactNode;
  refresh?: boolean;
}) {
  const { loading, dataError, refresh: reload } = useApp();
  const c = useTheme();
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        padding: 20,
        paddingBottom: 34,
        gap: 20,
        width: "100%",
        maxWidth: 650,
        alignSelf: "center",
      }}
      refreshControl={
        refresh ? (
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void reload()}
            tintColor={c.accent}
            colors={[c.accent]}
          />
        ) : undefined
      }
    >
      {refresh && dataError ? (
        <View style={{ gap: 10 }}>
          <ErrorMessage message={dataError} />
          <Button
            title="Try again"
            variant="secondary"
            onPress={() => void reload()}
          />
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}
export function Progress({ value, color }: { value: number; color?: string }) {
  const c = useTheme();
  return (
    <View
      style={{
        height: 7,
        borderRadius: 4,
        backgroundColor: c.inset,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          borderRadius: 4,
          width: `${Math.max(0, Math.min(100, value))}%`,
          backgroundColor: color || c.accent,
        }}
      />
    </View>
  );
}
export function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const c = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 7 }}>
      <Label style={{ fontSize: 13, fontWeight: "600" }}>{label}</Label>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${options.find((o) => o.value === value)?.label || "Select"}`}
        onPress={() => setOpen(true)}
        style={[
          layout.between,
          {
            backgroundColor: c.inset,
            borderWidth: 1,
            borderColor: c.border,
            padding: 15,
            borderRadius: 13,
            minHeight: 50,
          },
        ]}
      >
        <Label style={{ flex: 1 }}>
          {options.find((o) => o.value === value)?.label || "Select"}
        </Label>
        <Icon name="chevron-down" size={18} />
      </Pressable>
      <Sheet visible={open} title={label} onClose={() => setOpen(false)}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: value === option.value }}
            onPress={() => {
              onChange(option.value);
              setOpen(false);
            }}
            style={[
              layout.between,
              {
                padding: 15,
                borderRadius: 12,
                backgroundColor:
                  value === option.value ? c.accentSoft : c.inset,
              },
            ]}
          >
            <Label style={{ flex: 1 }}>{option.label}</Label>
            {value === option.value ? (
              <Icon name="checkmark" color={c.accent} />
            ) : null}
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}
export function Sheet({
  visible,
  title,
  onClose,
  children,
  busy = false,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  busy?: boolean;
}) {
  const c = useTheme();
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        if (!busy) onClose();
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "#00000077",
          justifyContent: "flex-end",
        }}
      >
        <Pressable
          accessibilityLabel="Close dialog"
          disabled={busy}
          onPress={onClose}
          style={{ flex: 1, minHeight: 20 }}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            maxHeight: "92%",
            flexShrink: 1,
            width: "100%",
            maxWidth: 650,
            alignSelf: "center",
            backgroundColor: c.surface,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
          }}
        >
          <SafeAreaView edges={["bottom"]} style={{ flexShrink: 1 }}>
            <View
              style={[
                layout.between,
                { padding: 20, borderBottomWidth: 1, borderColor: c.border },
              ]}
            >
              <Label style={layout.heading}>{title}</Label>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
                disabled={busy}
                onPress={onClose}
                style={{ padding: 10 }}
              >
                <Icon name="close" />
              </Pressable>
            </View>
            <ScrollView
              style={{ flexShrink: 1 }}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 32,
                gap: 17,
              }}
            >
              {children}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
export function useTask() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = React.useRef(false);
  const run = async (task: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await task();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return { busy, error, setError, run };
}
export function DeleteButton({
  title,
  message,
  onDelete,
  busy,
}: {
  title: string;
  message: string;
  onDelete: () => void;
  busy?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  return confirming ? (
    <View style={{ gap: 12 }}>
      <Label>{message}</Label>
      <View style={layout.row}>
        <View style={layout.grow}>
          <Button
            title="Cancel"
            variant="secondary"
            disabled={busy}
            onPress={() => setConfirming(false)}
          />
        </View>
        <View style={layout.grow}>
          <Button
            title="Confirm delete"
            variant="danger"
            busy={busy}
            onPress={onDelete}
          />
        </View>
      </View>
    </View>
  ) : (
    <Button
      title={title}
      variant="danger"
      disabled={busy}
      icon="trash-outline"
      onPress={() => setConfirming(true)}
    />
  );
}
