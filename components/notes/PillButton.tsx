import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

type PillVariant = "primary" | "danger" | "neutral";

type PillButtonProps = PressableProps & {
  title: string;
  variant?: PillVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PillButton({
  title,
  variant = "neutral",
  loading = false,
  disabled,
  style,
  ...rest
}: PillButtonProps) {
  const tint = useThemeColor({}, "tint");
  const onPrimary = useThemeColor({}, "onPrimary");
  const card = useThemeColor({}, "card");
  const cardBorder = useThemeColor({}, "cardBorder");
  const onSurfaceVariant = useThemeColor({}, "icon");

  const colors =
    variant === "primary"
      ? { background: tint, text: onPrimary, border: tint }
      : variant === "danger"
        ? { background: tint, text: onPrimary, border: tint }
        : { background: card, text: onSurfaceVariant, border: cardBorder };

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
