import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";

import { ListNotes } from "@/components/notes/ListBotes";
import { PillButton } from "@/components/notes/PillButton";
import { SqlPreview } from "@/components/notes/SqlPreview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  createNotesMutationOptions,
  deleteAllNotesMutationOptions,
} from "@/lib/data-access-layer/todos-query-optons";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function HomeScreen() {
  const deleteAllNotesMutation = useMutation(deleteAllNotesMutationOptions);
  const createNotesMutation = useMutation(createNotesMutationOptions);
  const muted = useThemeColor({ light: "#64748b", dark: "#8b949e" }, "icon");

  const mutationSql =
    createNotesMutation.data?.sql ?? deleteAllNotesMutation.data?.sql ?? undefined;
  const statusMessage = createNotesMutation.isPending
    ? "Seeding landmarks…"
    : deleteAllNotesMutation.isPending
      ? "Clearing all notes…"
      : null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ThemedView style={styles.root}>
        <View style={styles.toolbar}>
          <PillButton
            title="Create"
            variant="primary"
            loading={createNotesMutation.isPending}
            onPress={() => createNotesMutation.mutate()}
            disabled={deleteAllNotesMutation.isPending}
          />
          <PillButton
            title="Delete all"
            variant="danger"
            loading={deleteAllNotesMutation.isPending}
            onPress={() => deleteAllNotesMutation.mutate()}
            disabled={createNotesMutation.isPending}
          />
        </View>

        {statusMessage ? (
          <ThemedText style={[styles.status, { color: muted }]}>{statusMessage}</ThemedText>
        ) : null}

        {mutationSql ? <SqlPreview sql={mutationSql} label="Last mutation SQL" /> : null}

        <ListNotes />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  status: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 4,
  },
});
