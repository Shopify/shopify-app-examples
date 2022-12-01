import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
let { restResources } = await import(
  `@shopify/shopify-api/rest/admin/${LATEST_API_VERSION}`
);

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
  },
  sessionStorage: sessionDb,
});

export default shopify;
