import sqlite3 from 'sqlite3';

export class QRCodesDB {
  qrTableName = "qr_codes";
  db = null;
  ready = null;

  constructor(filename) {
    this.db = new sqlite3.Database(filename);
    this.ready = this.init();
  }

  async hasQrCodesTable() {
    const query = `
      SELECT name FROM sqlite_schema
      WHERE
        type = 'table' AND
        name = ?;
    `;
    const rows = await this.query(query, [this.qrTableName]);
    return rows.length === 1;
  }

  async init() {
    const hasQrCodesTable = await this.hasQrCodesTable();
    if (!hasQrCodesTable) {
      const query = `
        CREATE TABLE ${this.qrTableName} (
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
