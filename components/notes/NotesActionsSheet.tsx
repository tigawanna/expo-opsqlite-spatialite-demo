import { BottomSheet, Button, Column, Host, Icon, Row, Text } from "@expo/ui";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { Pressable, StyleSheet } from "react-native";

import { ADD_ICON, DELETE_ICON, MENU_ICON } from "@/components/notes/action-icons";
import {
  CLEAR_ALL_ACCESSIBILITY_LABEL,
  CLEAR_ALL_LABEL,
  CLEAR_ALL_PENDING_LABEL,
  SEED_LABEL,
  SEED_PENDING_LABEL,
} from "@/components/notes/notes-action-labels";
import { useThemeColor } from "@/hooks/use-theme-color";

type NotesActionsSheetProps = {
  isPresented: boolean;
  onDismiss: () => void;
  createPending: boolean;
  deleteAllPending: boolean;
  onCreate: () => void;
  onDeleteAll: () => void;
};

type NotesActionsMenuButtonProps = {
  onPress: () => void;
};

export function NotesActionsMenuButton({ onPress }: NotesActionsMenuButtonProps) {
  const iconColor = useThemeColor({}, "text");

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open actions menu"
      onPress={onPress}
      style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}>
      <Host matchContents>
        <Icon name={MENU_ICON} size={26} color={String(iconColor)} />
      </Host>
    </Pressable>
  );
}

export function NotesActionsSheet({
  isPresented,
  onDismiss,
  createPending,
  deleteAllPending,
  onCreate,
  onDeleteAll,
}: NotesActionsSheetProps) {
  const tint = useThemeColor({}, "tint");
  const onPrimary = useThemeColor({}, "onPrimary");
  const text = useThemeColor({}, "text");
  const actionsDisabled = createPending || deleteAllPending;

  const handleSeed = () => {
    onCreate();
    onDismiss();
  };

  const handleDeleteAll = () => {
    onDeleteAll();
    onDismiss();
  };

  return (
    <BottomSheet isPresented={isPresented} onDismiss={onDismiss}>
      <Column alignment="center" modifiers={[fillMaxWidth()]}>
        <Row spacing={12} alignment="center">
          <Button
            variant="filled"
            disabled={actionsDisabled}
            onPress={handleSeed}
            style={styles.sheetButton}>
            <Row spacing={6} alignment="center">
              <Icon name={ADD_ICON} size={20} color={String(onPrimary)} />
              <Text
                numberOfLines={1}
                textStyle={{ ...styles.sheetLabel, color: String(onPrimary) }}>
                {createPending ? SEED_PENDING_LABEL : SEED_LABEL}
              </Text>
            </Row>
          </Button>
          <Button
            variant="outlined"
            disabled={actionsDisabled}
            onPress={handleDeleteAll}
            style={styles.sheetButton}
            testID="delete-all-notes">
            <Row spacing={6} alignment="center">
              <Icon
                name={DELETE_ICON}
                size={20}
                color={String(tint)}
                accessibilityLabel={CLEAR_ALL_ACCESSIBILITY_LABEL}
              />
              <Text numberOfLines={1} textStyle={{ ...styles.sheetLabel, color: String(text) }}>
                {deleteAllPending ? CLEAR_ALL_PENDING_LABEL : CLEAR_ALL_LABEL}
              </Text>
            </Row>
          </Button>
        </Row>
      </Column>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  menuButtonPressed: {
    opacity: 0.7,
  },
  sheetButton: {
    minWidth: 132,
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sheetLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
});
