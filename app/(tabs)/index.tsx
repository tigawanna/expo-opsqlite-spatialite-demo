import { Button, StyleSheet, Text } from "react-native";

import { ListBotes } from "@/components/notes/ListBotes";
import { createNotes, getNotes } from "@/lib/data-access-layer/todos";
import { Suspense, useState, useTransition } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
  const [pending, startTransition] = useTransition();
  const [notesPromise] = useState(getNotes());
  const [key, setKey] = useState(Math.random());
  return (
    <SafeAreaView style={{ flex: 1}}>
      <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Button
          color={"red"}
          title="Create todos"
          onPress={() =>
            startTransition(() => {
              createNotes();
              setKey(Math.random());
            })
          }
          disabled={pending}
        />

        <Suspense fallback={<ThemedText>Loading notes...</ThemedText>}>
          <ListBotes key={key} getNotesPromise={notesPromise} />
        </Suspense>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    padding: "5%",
  },
});
