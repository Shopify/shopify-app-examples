import { Shopify } from "@shopify/shopify-api";

import { QRCodesDB } from "../qr-codes-db.js";

const QR_CODE_ADMIN_QUERY = `
  query nodes($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        title
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
      }
      ... on ProductVariant {
        id
      }
    }
  }
`;

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
  const session = await Shopify.Utils.loadCurrentSession(req, res, true);
  return `https://${session.shop}`;
}

/**
 * Expect body to contain
 * {
 *   title: string
 *   productId: string
 *   variantId: string
 *   handle: string
 *   discountId: string
 *   discountCode: string
 *   destination: string
 * }
 */
export async function parseQrCodeBody(req, res) {
  return {
    title: req.body.title,
    productId: req.body.productId,
    variantId: req.body.variantId,
    handle: req.body.handle,
    discountId: req.body.discountId,
    discountCode: req.body.discountCode,
    destination: req.body.destination,
  };
}

export async function formatQrCodeResponse(req, res, rawCodeData) {
  const ids = [];

  rawCodeData.forEach(({ productId, discountId, variantId }) => {
    ids.push(productId);
    ids.push(variantId);

    if (discountId) {
      ids.push(discountId);
    }
  });

  const session = await Shopify.Utils.loadCurrentSession(req, res, true);
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

  const adminData = await client.query({
    data: {
      query: QR_CODE_ADMIN_QUERY,
      variables: { ids },
    },
  });

  const formattedData = rawCodeData.map((qrCode) => {
    const product = adminData.body.data.nodes.find(
      (node) => qrCode.productId == node.id
    );

    const formattedQRCode = { ...qrCode, product };

    delete formattedQRCode.productId;

    return formattedQRCode;
  });

  return formattedData;
}
