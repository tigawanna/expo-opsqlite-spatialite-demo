import { sql } from "drizzle-orm";
import { db } from "../drizzle/client";
import { notes } from "../drizzle/schema/tables";

export async function createNotes() {
  const dummynotes = [
    { title: "Note 1" },
    { title: "Note 2" },
    { title: "Note 3" },
    { title: "Note 4" },
    { title: "Note 5" },
  ];
  try {
    const res = await db.insert(notes).values(dummynotes);
  } catch (error) {
    console.error("Error creating notes:", error);
  }
}

export async function getNotes() {
  try {
    const res = await db.select().from(notes);
    // console.log("Fetched notes:", res);
    return {
      result: res,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
    };
  }
}

export async function deleteAllNotes() {
  try {
    const res = await db.delete(notes);
    console.log("Deleted all notes:", res);
  } catch (error) {
    console.error("Error deleting all notes:", error);
  }
}

export async function deleteNote(id: number) {
  try {
    const res = await db.delete(notes).where(sql`id = ${id}`);
    console.log("Deleted note with id:", id);
  } catch (error) {
    console.error("Error deleting note with id:", id, error);
  }
}
