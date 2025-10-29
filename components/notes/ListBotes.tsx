import { deleteNote, getNotes } from "@/lib/data-access-layer/todos";
import {
  deleteNoteMutationOptions,
  getNotesQueryOptions,
} from "@/lib/data-access-layer/todos-query-optons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";
import { ThemedView } from "../themed-view";
import { useState } from "react";

interface ListNotesProps {
  getNotesPromise: ReturnType<typeof getNotes>;
}

export function ListNotes({ getNotesPromise }: ListNotesProps) {
  const [sortBy, setSortBY] = useState<"distance" | "title">("distance");
  const {
    data,
    isPending,
    error: queryError,
  } = useQuery(getNotesQueryOptions(sortBy === "distance"));
  const deleteNotesMutation = useMutation(deleteNoteMutationOptions);
  const notes = data?.result;
  const error = data?.error || queryError?.message;
  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={{ gap: 8, paddingTop: 28 }}>
      {isPending && <ThemedText>Loading...</ThemedText>}
      <ThemedView style={{ gap: 8, padding: 8, justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            gap: 8,
            padding: 8,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Button
            color={"red"}
            onPress={() => setSortBY("distance")}
            disabled={sortBy === "distance"}
            title="Sort by distance"
          />
          <Button
            color={"red"}
            onPress={() => setSortBY("title")}
            disabled={sortBy === "title"}
            title="Sort by title"
          />
        </View>
        <ThemedText
          style={{ textAlign: "center", fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
          Notes sorted by ones closest to nairobi (lat: -1.292066, lng: 36.821946)
        </ThemedText>
        {notes?.map((note) => (
          <TouchableOpacity
            key={note.id}
            disabled={deleteNotesMutation.isPending}
            onPress={() => {
              deleteNotesMutation.mutate(note.id);
            }}>
            <ThemedText key={note.id} className="text-lg">
              {note.id}: {note.title} : {note.latitude},{note.longitude}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ScrollView>
  );
}
const styles = StyleSheet.create({});
