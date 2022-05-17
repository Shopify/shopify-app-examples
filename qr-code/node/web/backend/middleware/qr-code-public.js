import path from "path";

import { QRCodesDB } from "../qr-codes-db.js";
import { getQrCodeOr404 } from "../helpers/qr-codes.js";

export default function applyQrCodePublicEndpoints(app) {
  app.get("/qrcode/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res, false);

    if (qrcode) {
      res.redirect(QRCodesDB.productUrlFromQrcode(qrcode));
    }
  });
}
