import QRCode from "qrcode";

import { QRCodesDB } from "../qr-codes-db.js";
import {
  getQrCodeOr404,
  getShopUrlFromSession,
  parseQrCodeBody,
  formatQrCodeResponse,
} from "../helpers/qr-codes.js";

export default function applyQrCodeApiEndpoints(app) {
  app.post("/api/qrcodes", async (req, res) => {
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

  app.put("/api/qrcodes/:id", async (req, res) => {
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

  app.get("/api/qrcodes", async (req, res) => {
    try {
      const rawCodeData = await QRCodesDB.list(
        await getShopUrlFromSession(req, res)
      );

      const response = await formatQrCodeResponse(req, res, rawCodeData);
      console.log("response in API", response);
      res.status(200).send(response);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

  app.get("/api/qrcodes/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      res.status(200).send(qrcode);
    }
  });

  app.delete("/api/qrcodes/:id", async (req, res) => {
    const qrcode = await getQrCodeOr404(req, res);

    if (qrcode) {
      await QRCodesDB.delete(req.params.id);
      res.status(200).send();
    }
  });

  app.get("/api/qrcodes/:id/image", async (req, res) => {
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
