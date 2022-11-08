import { LogSeverity } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2022-10";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-express/dist/src/session-storage/sqlite.js";

import { join } from "path";
import { QRCodesDB } from "./qr-codes-db.js";

const dbFile = join(process.cwd(), "database.sqlite");
const sessionDb = new SQLiteSessionStorage(dbFile);
// Initialize SQLite DB
QRCodesDB.db = sessionDb.db;
QRCodesDB.init();

const shopify = shopifyApp({
  api: {
    restResources,
    logger: {
      level: LogSeverity.Warning,
    },
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: sessionDb,
});

export default shopify;
