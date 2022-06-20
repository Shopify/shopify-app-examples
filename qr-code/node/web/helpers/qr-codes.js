import { Shopify } from "@shopify/shopify-api";

import { QRCodesDB } from "../qr-codes-db.js";

/*
  The apps database stores the productId and the discountId.
  This query is used to get the fields the frontend needs for those IDs.
  By querying the Shopify Admin GraphQL API at runtime data cannot become stale.
*/
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
      ... on DiscountCodeNode {
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
 *   title: string
 *   productId: string
 *   variantId: string
 *   handle: string
 *   discountId: string
 *   discountCode: string
 *   destination: string
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

/*
  Replaces productId with product data queried from the Shopify Admin GraphQL API
*/
export async function formatQrCodeResponse(req, res, rawCodeData) {
  const ids = [];

  /* Get every product, variant and discountID that was queried from the database */
  rawCodeData.forEach(({ productId, discountId, variantId }) => {
    ids.push(productId);
    ids.push(variantId);

    if (discountId) {
      ids.push(discountId);
    }
  });

  /* Instantiate a new GraphQL client so we can query the Shopify Admin GraphQL API */
  const session = await Shopify.Utils.loadCurrentSession(req, res, true);
  const client = new Shopify.Clients.Graphql(session.shop, session.accessToken);

  /* Query the Shopify Admin GraphQL API */
  const adminData = await client.query({
    data: {
      query: QR_CODE_ADMIN_QUERY,

      /* The Id's we pulled from our own database are used to query product, variant and discount information */
      variables: { ids },
    },
  });

  /*
    We have the data from the Shopify Admin GraphQL API.
    Now we need to replace the product, discount and variant IDs with that data
  */
  const formattedData = rawCodeData.map((qrCode) => {
    const product = adminData.body.data.nodes.find(
      (node) => qrCode.productId === node?.id
    ) || {
      title: "Deleted product",
    };

    const discountDeleted =
      qrCode.discountId &&
      !adminData.body.data.nodes.find((node) => qrCode.discountId === node?.id);

    /*
      A user may create a QR code with a discount code and then later delete that QR Code.
      For optimal UX it's important to handle that edge case.
      Here we use mocks data so that the frontend knows how to interprit this QR Code.
    */
    if (discountDeleted) {
      QRCodesDB.update(qrCode.id, {
        ...qrCode,
        discountId: "",
        discountCode: "",
      });
    }

    /*
      Merge the data from our application database with the data we just queried from Shopify Admin GraphQL API.
    */
    const formattedQRCode = {
      ...qrCode,
      product,
      discountCode: discountDeleted ? "" : qrCode.discountCode,
    };

    /* Since product.id already exists, we no longer need productId */
    delete formattedQRCode.productId;

    return formattedQRCode;
  });

  return formattedData;
}
