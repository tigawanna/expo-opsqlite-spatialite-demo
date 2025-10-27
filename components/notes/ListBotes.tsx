import { deleteNote, getNotes } from "@/lib/data-access-layer/todos";
import { use, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { ThemedText } from "../themed-text";

interface ListBotesProps {
  getNotesPromise: ReturnType<typeof getNotes>;
}
type Note = {
  id: number;
  title: string;
  timestamp: string | null;
};
export function ListBotes({ getNotesPromise }: ListBotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [key, setKey] = useState(Math.random());
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    setPending(true);
    getNotesPromise
      .then((data) => {
        if (data.error) setError(data.error);
        const res = data?.result;
        if (!res || res?.length === 0) {
          setError("No notes found");
          return;
        }
        setNotes(res);
      })
      .finally(() => setPending(false));
  }, [getNotesPromise, key]);
  if (error) {
    return (
      <View>
        <Text>Error: {error}</Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={{ gap: 8, paddingTop: 28 }}>
        {pending && <ThemedText>Loading...</ThemedText>}
      {notes?.map((note) => (
        <TouchableOpacity
          key={note.id}
          onPress={() => {
            deleteNote(note.id);
            setKey(Math.random()+1);
          }}>
          <ThemedText key={note.id} className="text-lg">
            {note.title}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({});
