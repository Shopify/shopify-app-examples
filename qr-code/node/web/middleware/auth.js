import { Shopify } from "@shopify/shopify-api";
import { gdprTopics } from "@shopify/shopify-api/dist/webhooks/registry.js";

import topLevelAuthRedirect from "../helpers/top-level-auth-redirect.js";

export default function applyAuthMiddleware(app) {
  app.get("/api/auth", async (req, res) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (!shop) {
      res.status(500);
      return res.send("No shop provided");
    }

    if (!req.signedCookies[app.get("top-level-oauth-cookie")]) {
      return res.redirect(
        `/api/auth/toplevel?shop=${encodeURIComponent(shop)}`
      );
    }

    const redirectUrl = await Shopify.Auth.beginAuth(
      req,
      res,
      shop,
      "/api/auth/callback",
      app.get("use-online-tokens")
    );

    res.redirect(redirectUrl);
  });

  app.get("/api/auth/toplevel", (req, res) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (!shop) {
      res.status(500);
      return res.send("No shop provided");
    }

    res.cookie(app.get("top-level-oauth-cookie"), "1", {
      signed: true,
      httpOnly: true,
      sameSite: "strict",
    });

    res.set("Content-Type", "text/html");

    res.send(
      topLevelAuthRedirect({
        apiKey: Shopify.Context.API_KEY,
        hostName: Shopify.Context.HOST_NAME,
        shop,
      })
    );
  });

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const session = await Shopify.Auth.validateAuthCallback(
        req,
        res,
        req.query
      );

      const host = Shopify.Utils.sanitizeHost(req.query.host, true);

      app.set(
        "active-shopify-shops",
        Object.assign(app.get("active-shopify-shops"), {
          [session.shop]: session.scope,
        })
      );

      const responses = await Shopify.Webhooks.Registry.registerAll({
        shop: session.shop,
        accessToken: session.accessToken,
      });

      Object.entries(responses).map(([topic, response]) => {
        if (!response.success && !gdprTopics.includes(topic)) {
          console.log(
            `Failed to register ${topic} webhook: ${response.result.errors[0].message}`
          );
        }
      });

      // Redirect to app with shop parameter upon auth
      res.redirect(
        `/?shop=${encodeURIComponent(session.shop)}&host=${encodeURIComponent(
          host
        )}`
      );
    } catch (e) {
      console.warn(e);
      switch (true) {
        case e instanceof Shopify.Errors.InvalidOAuthError:
          res.status(400);
          res.send(e.message);
          break;
        case e instanceof Shopify.Errors.CookieNotFound:
        case e instanceof Shopify.Errors.SessionNotFound:
          // This is likely because the OAuth session cookie expired before the merchant approved the request
          const shop = Shopify.Utils.sanitizeShop(req.query.shop);
          if (!shop) {
            res.status(500);
            return res.send("No shop provided");
          }

          res.redirect(`/api/auth?shop=${encodeURIComponent(shop)}`);
          break;
        default:
          res.status(500);
          res.send(e.message);
          break;
      }
    }
  });
}
