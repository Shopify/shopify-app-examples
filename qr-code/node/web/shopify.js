import { LATEST_API_VERSION } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
let { restResources } = await import(
  `@shopify/shopify-api/rest/admin/${LATEST_API_VERSION}`
);
import sqlite3 from "sqlite3";
import { join } from "path";

import { QRCodesDB } from "./qr-codes-db.js";

const database = new sqlite3.Database(join(process.cwd(), "database.sqlite"));
const sessionDb = new SQLiteSessionStorage(database);
// Initialize SQLite DB
QRCodesDB.db = database;
QRCodesDB.init();

const shopify = shopifyApp({
  api: {
    restResources,
  },
  auth: {
    path: "/api/auth",
    callbackPath: "/api/auth/callback",
  },
  webhooks: {
    path: "/api/webhooks",
  },
  sessionStorage: sessionDb,
});

export default shopify;
