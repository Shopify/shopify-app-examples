import sqlite3 from "sqlite3";
import path from "path";
import { Shopify } from "@shopify/shopify-api";

const qrCodesDbFile = path.join(process.cwd(), "qr_codes_db.sqlite");

export const QRCodesDB = {
  qrCodesTableName: "qr_codes",
  db: new sqlite3.Database(qrCodesDbFile),
  ready: null,

  create: async function ({
    shopDomain,
    productHandle,
    goToCheckout = false,
    discountCode = "",
  }) {
    await this.ready;

    const query = `
      INSERT INTO ${this.qrCodesTableName}
      (shopDomain, productHandle, goToCheckout, discountCode, hits, conversions)
      VALUES (?, ?, ?, ?, 0, 0)
      RETURNING id;
    `;

    const rawResults = await this.__query(query, [
      shopDomain,
      productHandle,
      goToCheckout,
      discountCode || "",
    ]);

    return rawResults[0].id;
  },

  update: async function (
    id,
    { productHandle, goToCheckout = false, discountCode = "" }
  ) {
    await this.ready;

    const query = `
      UPDATE ${this.qrCodesTableName}
      SET
        productHandle = ?,
        goToCheckout = ?,
        discountCode = ?
      WHERE
        id = ?;
    `;

    await this.__query(query, [
      productHandle,
      goToCheckout,
      discountCode || "",
      id,
    ]);
    return true;
  },

  list: async function (shopDomain) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.qrCodesTableName}
      WHERE shopDomain = ?;
    `;

    const results = await this.__query(query, [shopDomain]);

    return results.map((qrcode) => this.__addImageUrl(qrcode));
  },

  read: async function (id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.qrCodesTableName}
      WHERE id = ?;
    `;
    const rows = await this.__query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;

    return this.__addImageUrl(rows[0]);
  },

  delete: async function (id) {
    await this.ready;
    const query = `
      DELETE FROM ${this.qrCodesTableName}
      WHERE id = ?;
    `;
    await this.__query(query, [id]);
    return true;
  },

  generateQrcodeDestinationUrl: function (qrcode) {
    return `${Shopify.Context.HOST_SCHEME}://${Shopify.Context.HOST_NAME}/qrcode/${qrcode.id}`;
  },

  productUrlFromQrcode: function (qrcode) {
    return `${qrcode.shopDomain}/products/${qrcode.productHandle}`;
  },

  // Private

  __hasQrCodesTable: async function () {
    const query = `
      SELECT name FROM sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;
    const rows = await this.__query(query, [this.qrCodesTableName]);
    return rows.length === 1;
  },

  __init: async function () {
    const hasQrCodesTable = await this.__hasQrCodesTable();
    if (hasQrCodesTable) {
      this.ready = Promise.resolve();
    } else {
      const query = `
        CREATE TABLE ${this.qrCodesTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          shopDomain VARCHAR(511) NOT NULL,
          productHandle VARCHAR(255) NOT NULL,
          goToCheckout TINYINT NOT NULL,
          discountCode VARCHAR(255) NOT NULL,
          hits INTEGER,
          conversions INTEGER
        )
      `;
      this.ready = this.__query(query);
    }
  },

  __query: function (sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  },

  __addImageUrl: function (qrcode) {
    try {
      qrcode.imageUrl = this.__generateQrcodeImageUrl(qrcode);
    } catch (err) {
      console.error(err);
    }

    return qrcode;
  },

  __generateQrcodeImageUrl: function (qrcode) {
    return `${Shopify.Context.HOST_SCHEME}://${Shopify.Context.HOST_NAME}/api/qrcode/${qrcode.id}/image`;
  },
};

QRCodesDB.__init();
