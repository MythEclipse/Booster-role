import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export function createDb(databaseUrl: string) {
  const sqlitePath = databaseUrl.replace(/^file:/, "");
  const sqlite = new Database(sqlitePath);
  return drizzle(sqlite, { schema });
}
