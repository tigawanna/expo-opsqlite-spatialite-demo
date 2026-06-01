import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";

type PillVariant = "primary" | "danger" | "neutral";

type PillButtonProps = PressableProps & {
  title: string;
  variant?: PillVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<
  PillVariant,
  { background: string; text: string; border: string }
> = {
  primary: { background: "#16a34a", text: "#ffffff", border: "#15803d" },
  danger: { background: "#dc2626", text: "#ffffff", border: "#b91c1c" },
  neutral: { background: "#334155", text: "#f8fafc", border: "#475569" },
};

export function PillButton({
  title,
  variant = "neutral",
  loading = false,
  disabled,
  style,
  ...rest
}: PillButtonProps) {
  const colors = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.background,
          borderColor: colors.border,
          opacity: isDisabled ? 0.55 : pressed ? 0.88 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <ThemedText style={[styles.label, { color: colors.text }]}>{title}</ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
