import * as SQLite from "expo-sqlite";
import { EnvironmentRow } from "@box-controller/shared/interfaces/esp.interface";

// local copy of the ESP's SD-card log: the app only asks the ESP for rows
// newer than the newest one stored here. Mock data gets its own file so it
// never mixes with real readings.
const DB_NAME =
  process.env.EXPO_PUBLIC_OFFLINE_MODE === "true"
    ? "environment-mock.db"
    : "environment.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// notified after clearRows(), so a mounted chart drops what it shows
const clearListeners = new Set<() => void>();

export function onRowsCleared(listener: () => void) {
  clearListeners.add(listener);

  return () => {
    clearListeners.delete(listener);
  };
}

function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);

      // datetime is "YYYY-MM-DD HH:MM:SS", so text order = time order
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS environment (
          datetime TEXT PRIMARY KEY NOT NULL,
          day_night TEXT NOT NULL,
          temperature REAL NOT NULL,
          humidity REAL NOT NULL
        ) WITHOUT ROWID;
      `);

      return db;
    })().catch((error) => {
      // let the next call try again
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}

export async function getNewestDatetime() {
  const db = await getDb();
  const row = await db.getFirstAsync<{ datetime: string | null }>(
    "SELECT MAX(datetime) AS datetime FROM environment",
  );

  return row?.datetime ?? null;
}

// rows at or after `from`, oldest first
export async function getRowsSince(from: string) {
  const db = await getDb();

  return db.getAllAsync<EnvironmentRow>(
    "SELECT datetime, day_night, temperature, humidity FROM environment " +
      "WHERE datetime >= ? ORDER BY datetime",
    from,
  );
}

export async function insertRows(rows: EnvironmentRow[]) {
  if (!rows.length) return;

  const db = await getDb();

  await db.withExclusiveTransactionAsync(async (txn) => {
    const statement = await txn.prepareAsync(
      "INSERT OR IGNORE INTO environment " +
        "(datetime, day_night, temperature, humidity) VALUES (?, ?, ?, ?)",
    );

    try {
      for (const row of rows) {
        await statement.executeAsync(
          row.datetime,
          row.day_night,
          row.temperature,
          row.humidity,
        );
      }
    } finally {
      await statement.finalizeAsync();
    }
  });
}

// after the SD log is erased the local copy goes too
export async function clearRows() {
  const db = await getDb();

  await db.runAsync("DELETE FROM environment");

  clearListeners.forEach((listener) => listener());
}
