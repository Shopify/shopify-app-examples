import path from "path";
import QRCode from "qrcode";
import { Shopify } from "@shopify/shopify-api";

import { QRCodesDB } from "../qr-codes-db.js";
import {
  getQrCodeOr404,
  getShopUrlFromSession,
  parseQrCodeBody,
} from "../helpers/qr-codes.js";

export default function applyQrCodeApiEndpoints(app) {
  app.post("/api/qrcode", async (req, res) => {
    try {
      const id = await QRCodesDB.create({
        ...(await parseQrCodeBody(req)),
        shopDomain: await getShopUrlFromSession(req, res),
      });
      res.status(201).send(await QRCodesDB.read(id));
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.put("/api/qrcode/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      try {
        await QRCodesDB.update(req.params.id, await parseQrCodeBody(req));
        res.status(200).send(await QRCodesDB.read(req.params.id));
      } catch (error) {
        res.status(500).send(error.message);
      }
    }
  });

  app.get("/api/qrcode", async (req, res) => {
    try {
      const response = await QRCodesDB.list(
        await getShopUrlFromSession(req, res)
      );
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
      await QRCodesDB.delete(req.params.id);
      res.status(200).send();
    }
  });

  app.get("/api/qrcode/:id/image", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      const destinationUrl = QRCodesDB.generateQrcodeDestinationUrl(qrcode);
      res
        .status(200)
        .set("Content-Type", "image/png")
        .send(await QRCode.toBuffer(destinationUrl));
    }
  });
}
