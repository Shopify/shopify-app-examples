import path from "path";

import { QRCodesDB } from "../qr-codes-db.js";

const qrCodesDbFile = path.join(process.cwd(), "qr_codes_db.sqlite");
const qrCodesDB = new QRCodesDB(qrCodesDbFile);

export default function applyQrCodeApiEndpoints(app) {
  app.post("/api/qrcode", async (req, res) => {
    try {
      await qrCodesDB.create(parseQrCodeBody(req));
      res.status(201).send();
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.put("/api/qrcode/:id", async (req, res) => {
    const qrCode = await getQrCodeOr404(req, res);

    if (qrCode) {
      try {
        await qrCodesDB.update(req.params.id, parseQrCodeBody(req));
        res.status(200).send();
      } catch (error) {
        res.status(500).send(error.message);
      }
    }
  });

  app.get("/api/qrcode", async (req, res) => {
    try {
      const response = await qrCodesDB.list();
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/qrcode/:id", async (req, res) => {
    const qrCode = await getQrCodeOr404(req, res);

    if (qrCode) {
      res.status(200).send(qrCode);
    }
  });

  app.delete("/api/qrcode/:id", async (req, res) => {
    const qrCode = await getQrCodeOr404(req, res);

    if (qrCode) {
      await qrCodesDB.delete(req.params.id);
      res.status(200).send();
    }
  });
}

/**
 * Expect body to contain
 * {
 *   productId: "<product id>",
 *   goToCheckout: "true" | "false",
 *   discountCode: "" | "<discount code id>"
 * }
 */
function parseQrCodeBody(req) {
  return {
    productId: req.body.productId,
    goToCheckout: !!req.body.goToCheckout,
    discountCode: req.body.discountCode,
  };
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
