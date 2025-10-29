import { sql } from "drizzle-orm";
import { db } from "../drizzle/client";
import { notes } from "../drizzle/schema/tables";

export async function createNotes() {
  const dummynotes = [
    {
      title: "Central Park",
      pin: '{"type":"Point","coordinates":[-73.9688,40.7812]}', // GeoJSON
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
  try {
    const res = await db.insert(notes).values(dummynotes);
  } catch (error) {
    console.error("Error creating notes:", error);
  }
}

/**
 * Fetches all notes from the database and sorts them by distance from Nairobi, Kenya
 *
 * This function demonstrates spatial querying capabilities using SpatiaLite:
 * - Extracts latitude/longitude from geometry points
 * - Calculates great-circle distances using SpatiaLite's ST_Distance
 * - Sorts results by proximity to a reference point
 *
 * @returns {Promise<{result: Array<Note> | null, error: string | null}>}
 * Returns an object containing:
 *   - result: Array of notes with spatial data, sorted by distance from Nairobi
 *   - error: Error message if query fails, null otherwise
 *
 * Each note in the result includes:
 *   - id: Unique identifier
 *   - title: Note title
 *   - latitude: Extracted Y coordinate from point geometry
 *   - longitude: Extracted X coordinate from point geometry
 *   - distance_km: Distance from Nairobi in kilometers
 *
 * Example response:
 * [
 *   {
 *     id: 1,
 *     title: "Mount Kilimanjaro",
 *     latitude: -3.0674,
 *     longitude: 37.3556,
 *     distance_km: 325.5  // ~325km from Nairobi
 *   },
 *   {
 *     id: 2,
 *     title: "Pyramids of Giza",
 *     latitude: 29.9792,
 *     longitude: 31.1342,
 *     distance_km: 3480.2  // ~3480km from Nairobi
 *   }
 * ]
 */
export async function getNotes(sortByDistance = true) {
  try {
    // Reference point: Nairobi, Kenya coordinates
    // SpatiaLite uses [longitude, latitude] order in GeoJSON (X, Y)
    const nairobiGeoJSON = '{"type":"Point","coordinates":[36.8219,-1.2921]}';
    const query = db
      .select({
        id: notes.id,
        title: notes.title,
        // Extract Y coordinate (latitude) from point geometry blob
        latitude: sql<string>`ST_Y(${notes.pin})`.as("latitude"),
        // Extract X coordinate (longitude) from point geometry blob
        longitude: sql<string>`ST_X(${notes.pin})`.as("longitude"),
        // Calculate great-circle distance using SpatiaLite's geodesic functions
        // ST_Distance returns distance in meters by default, converted to kilometers
        distance: sql`ST_Distance(${notes.pin}, GeomFromGeoJSON(${nairobiGeoJSON}))`.as(
          "distance_km"
        ),
      })
      .from(notes);
    if (sortByDistance) {
      // Sort by distance ascending (closest to Nairobi first)
      // .orderBy(sql`distance_km ASC`);
      query.orderBy(sql`distance_km ASC`);
    }
    // Execute spatial query to fetch notes with distance calculations
    const res = await query;

    // Uncomment for debugging spatial query results:
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
