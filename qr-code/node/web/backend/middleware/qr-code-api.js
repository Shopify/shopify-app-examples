import path from "path";
import QRCode from "qrcode";

import { QRCodesDB } from "../qr-codes-db.js";

const qrCodesDbFile = path.join(process.cwd(), "qr_codes_db.sqlite");
const qrCodesDB = new QRCodesDB(qrCodesDbFile);

export default function applyQrCodeApiEndpoints(app) {
  app.post("/api/qrcode", async (req, res) => {
    try {
      const id = await qrCodesDB.create(parseQrCodeBody(req));
      res.status(201).send(await qrCodesDB.read(id));
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.put("/api/qrcode/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      try {
        await qrCodesDB.update(req.params.id, parseQrCodeBody(req));
        res.status(200).send(await qrCodesDB.read(req.params.id));
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
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      res.status(200).send(qrcode);
    }
  });

  app.delete("/api/qrcode/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      await qrCodesDB.delete(req.params.id);
      res.status(200).send();
    }
  });

  app.get("/api/qrcode/:id/image", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      const destinationUrl = qrCodesDB.generateQrcodeDestinationUrl(qrcode);
      res
        .status(200)
        .set("Content-Type", "image/png")
        .send(await QRCode.toBuffer(destinationUrl));
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
