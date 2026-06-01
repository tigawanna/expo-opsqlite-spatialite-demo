import { useMutation, useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, View } from "react-native";

import { NoteCard } from "@/components/notes/NoteCard";
import { PillButton } from "@/components/notes/PillButton";
import { SqlPreview } from "@/components/notes/SqlPreview";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getNotesSqlPreview } from "@/lib/data-access-layer/todos";
import {
  deleteNoteMutationOptions,
  getNotesQueryOptions,
} from "@/lib/data-access-layer/todos-query-optons";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";

const NAIROBI_LABEL = "Nairobi (−1.2921, 36.8219)";

export function ListNotes() {
  const [sortBy, setSortBy] = useState<"distance" | "title">("distance");
  const sortByDistance = sortBy === "distance";
  const {
    data,
    isPending,
    error: queryError,
  } = useQuery(getNotesQueryOptions(sortByDistance));
  const deleteNotesMutation = useMutation(deleteNoteMutationOptions);
  const notes = data?.result;
  const error = data?.error || queryError?.message;
  const displaySql = data?.sql ?? getNotesSqlPreview(sortByDistance);
  const muted = useThemeColor({ light: "#64748b", dark: "#8b949e" }, "icon");
  const deleteSql = deleteNotesMutation.data?.sql;

  if (error) {
    return (
      <ThemedView style={styles.errorBox}>
        <ThemedText type="defaultSemiBold">Query failed</ThemedText>
        <ThemedText style={{ color: muted }}>{error}</ThemedText>
        <SqlPreview sql={displaySql} label="SQL (attempted)" />
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.heading}>
          SpatiaLite notes
        </ThemedText>
        <ThemedText style={[styles.subheading, { color: muted }]}>
          {sortByDistance
            ? `Sorted by distance from ${NAIROBI_LABEL}`
            : "Sorted alphabetically by title"}
        </ThemedText>
      </ThemedView>

      <View style={styles.sortRow}>
        <PillButton
          title="By distance"
          variant={sortByDistance ? "primary" : "neutral"}
          onPress={() => setSortBy("distance")}
          disabled={sortByDistance}
        />
        <PillButton
          title="By title"
          variant={!sortByDistance ? "primary" : "neutral"}
          onPress={() => setSortBy("title")}
          disabled={!sortByDistance}
        />
      </View>

      <SqlPreview sql={displaySql} label="SELECT query" />
      {deleteSql ? <SqlPreview sql={deleteSql} label="DELETE query" /> : null}

      {isPending && (
        <ThemedText style={[styles.loading, { color: muted }]}>Loading notes…</ThemedText>
      )}

      <View style={styles.list}>
        {notes?.map((note, index) => (
          <NoteCard
            key={note.id}
            note={note}
            rank={index + 1}
            showDistance
            deleting={deleteNotesMutation.isPending}
            onDelete={() => deleteNotesMutation.mutate(note.id)}
          />
        ))}
        {!isPending && notes?.length === 0 && (
          <ThemedView style={styles.empty}>
            <ThemedText type="defaultSemiBold">No notes yet</ThemedText>
            <ThemedText style={{ color: muted, textAlign: "center" }}>
              Tap Create to seed landmarks, then sort by distance from Nairobi.
            </ThemedText>
          </ThemedView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 32,
    gap: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 6,
  },
  heading: {
    fontSize: 22,
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
  },
  sortRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
    marginTop: 8,
  },
  loading: {
    textAlign: "center",
    paddingVertical: 16,
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  errorBox: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
});
