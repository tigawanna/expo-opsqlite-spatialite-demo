import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createNotes, deleteAllNotes, deleteNote, getNotes } from "./todos";

export const getNotesQueryOptions = queryOptions({
  queryKey: ["notes"],
  queryFn: getNotes,
});

export const createNotesMutationOptions = mutationOptions({
  mutationFn: createNotes,
  meta: {
    invalidates: [["notes"]],
  },
});

export const deleteAllNotesMutationOptions = mutationOptions({
  mutationFn: deleteAllNotes,
  meta: {
    invalidates: [["notes"]],
  },
});

export const deleteNoteMutationOptions = mutationOptions({
  mutationFn: (id: number) => deleteNote(id),
  meta: {
    invalidates: [["notes"]],
  },
});
