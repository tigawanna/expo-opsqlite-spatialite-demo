import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";

import { ListNotes } from "@/components/notes/ListBotes";
import { NotesActionsMenuButton, NotesActionsSheet } from "@/components/notes/NotesActionsSheet";
import { SqlPreview } from "@/components/notes/SqlPreview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  createNotesMutationOptions,
  deleteAllNotesMutationOptions,
} from "@/lib/data-access-layer/todos-query-optons";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function HomeScreen() {
  const [actionsOpen, setActionsOpen] = useState(false);
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
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            SpatiaLite notes
          </ThemedText>
          <NotesActionsMenuButton onPress={() => setActionsOpen(true)} />
        </View>

        <NotesActionsSheet
          isPresented={actionsOpen}
          onDismiss={() => setActionsOpen(false)}
          createPending={createNotesMutation.isPending}
          deleteAllPending={deleteAllNotesMutation.isPending}
          onCreate={() => createNotesMutation.mutate()}
          onDeleteAll={() => deleteAllNotesMutation.mutate()}
        />

        {statusMessage ? (
          <ThemedText style={[styles.status, { color: muted }]}>{statusMessage}</ThemedText>
        ) : null}

        {mutationSql ? <SqlPreview sql={mutationSql} label="Last mutation SQL" /> : null}

        <ListNotes
          onSeed={() => createNotesMutation.mutate()}
          seedPending={createNotesMutation.isPending}
          actionsDisabled={createNotesMutation.isPending || deleteAllNotesMutation.isPending}
        />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 4,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
  },
  status: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 4,
  },
});
