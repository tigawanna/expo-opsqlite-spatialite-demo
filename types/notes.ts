export type NoteRow = {
  id: number;
  title: string;
  latitude: string;
  longitude: string;
  distance?: unknown;
};

export type DataLayerResult<T> = {
  result: T | null;
  error: string | null;
  sql: string;
};
