import path from "path";

import { QRCodesDB } from "../qr-codes-db.js";

const qrCodesDbFile = path.join(process.cwd(), "qr_codes_db.sqlite");
const qrCodesDB = new QRCodesDB(qrCodesDbFile);

export default function applyQrCodePublicEndpoints(app) {
  app.get("/qrcode/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      res.redirect(qrCodesDB.productUrlFromQrcode(qrcode));
    }
  });
}

async function getQrCodeOr404(req, res) {
  try {
    const response = await qrCodesDB.read(req.params.id);
    if (response === undefined) {
      res.status(404).send();
    } else {
      return response;
    }
  } catch (error) {
    res.status(500).send(error.message);
  }

  return undefined;
}
