import { Shopify } from "@shopify/shopify-api";

import { QRCodesDB } from "../qr-codes-db.js";

export async function getQrCodeOr404(req, res, checkDomain = true) {
  try {
    const response = await QRCodesDB.read(req.params.id);
    if (
      response === undefined ||
      (checkDomain &&
        (await getShopUrlFromSession(req, res)) !== response.shopDomain)
    ) {
      res.status(404).send();
    } else {
      return response;
    }
  } catch (error) {
    res.status(500).send(error.message);
  }

  return undefined;
}

export async function getShopUrlFromSession(req, res) {
  const session = Shopify.Utils.loadCurrentSession(req, res, true);
  return `https://${session.shop}`;
}

/**
 * Expect body to contain
 * {
 *   productId: number,
 *   goToCheckout: boolean,
 *   discountCodeId: number | null
 * }
 */
export async function parseQrCodeBody(req, res) {
  const session = await Shopify.Utils.loadCurrentSession(req, res, true);
  const { Product, DiscountCode } = await import(
    `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
  );

  const product = await Product.find({ session, id: req.body.productId });

  let discountCode = null;
  if (req.body.discountCodeId) {
    const discount = await DiscountCode.find({
      session,
      id: req.body.discountCodeId,
    });
    discountCode = discount.code;
  }

  return {
    productHandle: product.handle,
    variantId: product.variants[0].id,
    goToCheckout: !!req.body.goToCheckout,
    discountCode,
  };
}
