import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { createNotes, deleteAllNotes, deleteNote, getNotes } from "./todos";

export const getNotesQueryOptions = (sortByLocation: boolean) =>
  queryOptions({
    queryKey: ["notes", sortByLocation],
    queryFn: () => getNotes(sortByLocation),
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
