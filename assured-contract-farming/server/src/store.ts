import fs from "fs";
import path from "path";
import { Database } from "./types";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "database.json");
const empty: Database = { users:[], products:[], contracts:[], contractRequests:[], marketPrices:[], transactions:[], ratings:[] };

export function readDb(): Database {
  fs.mkdirSync(dataDir, { recursive:true });
  if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify(empty, null, 2));
  try { return { ...empty, ...JSON.parse(fs.readFileSync(dbPath, "utf8")) }; }
  catch { throw new Error("Database JSON is invalid. Back up and repair server/data/database.json."); }
}
export function writeDb(db: Database): void {
  fs.mkdirSync(dataDir, { recursive:true });
  const temp = dbPath + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(db, null, 2));
  fs.renameSync(temp, dbPath);
}
export const id = (): string => crypto.randomUUID();
