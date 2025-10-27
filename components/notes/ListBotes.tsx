import { deleteNote, getNotes } from "@/lib/data-access-layer/todos";
import { deleteNoteMutationOptions, getNotesQueryOptions } from "@/lib/data-access-layer/todos-query-optons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../themed-text";

interface ListBotesProps {
  getNotesPromise: ReturnType<typeof getNotes>;
}

export function ListBotes({ getNotesPromise }: ListBotesProps) {
  const { data, isPending, error: queryError } = useQuery(getNotesQueryOptions);
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
      {notes?.map((note) => (
        <TouchableOpacity
          key={note.id}
          disabled={deleteNotesMutation.isPending}
          onPress={() => {
            deleteNotesMutation.mutate(note.id);
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
