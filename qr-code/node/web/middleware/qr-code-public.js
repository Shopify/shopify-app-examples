/*
  Users need to be able to scan our QR Codes.
  This file provides the publicly avialble URL's to do that
*/
import QRCode from "qrcode";

import { QRCodesDB } from "../qr-codes-db.js";
import { getQrCodeOr404 } from "../helpers/qr-codes.js";

export default function applyQrCodePublicEndpoints(app) {
  /* The URL for a QR code image */
  app.get("/qrcodes/:id/image", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res, false);

    if (qrcode) {
      const destinationUrl = QRCodesDB.generateQrcodeDestinationUrl(qrcode);
      res
        .status(200)
        .set("Content-Type", "image/png")
        .set(
          "Content-Disposition",
          `inline; filename="qr_code_${qrcode.id}.png"`
        )
        .send(await QRCode.toBuffer(destinationUrl));
    }
  });

  /* The URL users are taken to when they scan the QR code */
  app.get("/qrcodes/:id/scan", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res, false);

    if (qrcode) {
      res.redirect(await QRCodesDB.handleCodeScan(qrcode));
    }
  });
}
