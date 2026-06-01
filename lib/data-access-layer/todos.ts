import { asc, sql } from "drizzle-orm";
import { db, ensureSpatialMetadata } from "../drizzle/client";
import { notes } from "../drizzle/schema/tables";
import { formatExecutableSql } from "./sql-format";
import { distanceFromNairobiMeters } from "./spatial-distance";
import type { DataLayerResult, NoteRow } from "@/types/notes";

const seedNotes = [
  {
    title: "Central Park",
    pin: '{"type":"Point","coordinates":[-73.9688,40.7812]}',
  },
  {
    title: "Golden Gate Bridge",
    pin: '{"type":"Point","coordinates":[-122.4783,37.8199]}',
  },
  {
    title: "Eiffel Tower",
    pin: '{"type":"Point","coordinates":[2.2945,48.8584]}',
  },
  {
    title: "Sydney Opera",
    pin: '{"type":"Point","coordinates":[151.2153,-33.8568]}',
  },
  {
    title: "Tokyo Tower",
    pin: '{"type":"Point","coordinates":[139.7454,35.6586]}',
  },
  {
    title: "London Eye",
    pin: '{"type":"Point","coordinates":[-0.1195,51.5033]}',
  },
  {
    title: "Pyramids",
    pin: '{"type":"Point","coordinates":[31.1342,29.9792]}',
  },
];

export function buildGetNotesQuery(sortByDistance: boolean) {
  const query = db
    .select({
      id: notes.id,
      title: notes.title,
      latitude: sql<string>`ST_Y(${notes.pin})`.as("latitude"),
      longitude: sql<string>`ST_X(${notes.pin})`.as("longitude"),
      distance: distanceFromNairobiMeters.as("distance"),
    })
    .from(notes);

  if (sortByDistance) {
    return query.orderBy(sql`distance ASC`);
  }

  return query.orderBy(asc(notes.title));
}

export function getNotesSqlPreview(sortByDistance: boolean): string {
  return formatExecutableSql(buildGetNotesQuery(sortByDistance));
}

export async function createNotes(): Promise<DataLayerResult<null>> {
  const insertQuery = db.insert(notes).values(seedNotes);
  const sqlPreview = formatExecutableSql(insertQuery);

  try {
    await insertQuery;
    return { result: null, error: null, sql: sqlPreview };
  } catch (error) {
    console.error("Error creating notes:", error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
      sql: sqlPreview,
    };
  }
}

export async function getNotes(sortByDistance = true): Promise<DataLayerResult<NoteRow[]>> {
  await ensureSpatialMetadata();
  const query = buildGetNotesQuery(sortByDistance);
  const sqlPreview = formatExecutableSql(query);

  try {
    const res = await query;
    return {
      result: res,
      error: null,
      sql: sqlPreview,
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
      sql: sqlPreview,
    };
  }
}

export async function deleteAllNotes(): Promise<DataLayerResult<null>> {
  const deleteQuery = db.delete(notes);
  const sqlPreview = formatExecutableSql(deleteQuery);

  try {
    await deleteQuery;
    return { result: null, error: null, sql: sqlPreview };
  } catch (error) {
    console.error("Error deleting all notes:", error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
      sql: sqlPreview,
    };
  }
}

export async function deleteNote(id: number): Promise<DataLayerResult<null>> {
  const deleteQuery = db.delete(notes).where(sql`id = ${id}`);
  const sqlPreview = formatExecutableSql(deleteQuery);

  try {
    await deleteQuery;
    return { result: null, error: null, sql: sqlPreview };
  } catch (error) {
    console.error("Error deleting note with id:", id, error);
    return {
      result: null,
      error: error instanceof Error ? error.message : JSON.stringify(error),
      sql: sqlPreview,
    };
  }
}
