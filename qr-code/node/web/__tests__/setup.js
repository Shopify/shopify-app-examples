import { beforeEach, vi } from "vitest";
import { QRCodesDB } from "../qr-codes-db";

beforeEach(async () => {
  // Mock the database module so we don't end up creating / altering the real database
  vi.mock(`${process.cwd()}/qr-codes-db.js`, async () => {
    const actualModule = await vi.importActual(
      `${process.cwd()}/qr-codes-db.js`
    );

    return {
      QRCodesDB: {
        ...actualModule.QRCodesDB,
        init: () => Promise.resolve(),
        __query: vi.fn(),
      },
    };
  });

  QRCodesDB.__query.mockReset();
});
