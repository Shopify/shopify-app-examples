import sqlite3 from 'sqlite3';

export class QRCodesDB {
  qrCodesTableName = "qr_codes";
  db = null;
  ready = null;

  constructor(filename) {
    this.db = new sqlite3.Database(filename);
    this.ready = this.init();
  }

  async create(
    productId,
    goToCheckout = false,
    discountCode = ''
  ) {
    await this.ready;

    const query = `
      INSERT INTO ${this.qrCodesTableName}
      (productId, goToCheckout, discountCode, hits, conversions)
      VALUES (?, ?, ?, 0, 0);
    `;

    await this.query(
      query,
      [productId, goToCheckout, discountCode],
    );
    return true;
  }

  async read(id) {
    await this.ready;
    const query = `
      SELECT * FROM ${this.qrCodesTableName}
      WHERE id = ?;
    `;
    const rows = await this.query(query, [id]);
    if (!Array.isArray(rows) || rows?.length !== 1) return undefined;
    const rawResult = rows[0];

    return rawResult;
  }

  async delete(id) {
    await this.ready;
    const query = `
      DELETE FROM ${this.qrCodesTableName}
      WHERE id = ?;
    `;
    await this.query(query, [id]);
    return true;
  }

  async hasQrCodesTable() {
    const query = `
      SELECT name FROM sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;
    const rows = await this.query(query, [this.qrCodesTableName]);
    return rows.length === 1;
  }

  async init() {
    const hasQrCodesTable = await this.hasQrCodesTable();
    if (!hasQrCodesTable) {
      const query = `
        CREATE TABLE ${this.qrCodesTableName} (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          productId VARCHAR(255) NOT NULL,
          goToCheckout TINYINT NOT NULL,
          discountCode VARCHAR(255) NOT NULL,
          hits INTEGER,
          conversions INTEGER
        )
      `;
      await this.query(query);
    }
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
}
