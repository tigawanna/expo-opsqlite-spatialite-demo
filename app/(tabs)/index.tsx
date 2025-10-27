import { Button, StyleSheet } from "react-native";

import { ListBotes } from "@/components/notes/ListBotes";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getNotes } from "@/lib/data-access-layer/todos";
import {
  createNotesMutationOptions,
  deleteAllNotesMutationOptions
} from "@/lib/data-access-layer/todos-query-optons";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {

  const [notesPromise] = useState(getNotes());
  const deleteAllNotesMutation = useMutation(deleteAllNotesMutationOptions);
  const createNoteeMutation = useMutation(createNotesMutationOptions);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button
          color={"green"}
          title="Create todos"
          onPress={() => createNoteeMutation.mutate()}
          disabled={createNoteeMutation.isPending}
        />
        <Button
          color={"red"}
          title="Delete todos"
          onPress={() => deleteAllNotesMutation.mutate()}
          disabled={deleteAllNotesMutation.isPending}
        />
        {createNoteeMutation.isPending && <ThemedText>creating notes...</ThemedText>}
        {deleteAllNotesMutation.isPending && <ThemedText>deleting notes...</ThemedText>}
        <ListBotes getNotesPromise={notesPromise} />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({});
