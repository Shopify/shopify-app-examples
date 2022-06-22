import Shopify from "@shopify/shopify-api";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { QRCodesDB, QRCodeValidationError } from "./qr-codes-db";

describe("QR code database", async () => {
  describe("create", async () => {
    const VALID_CREATE_DATA = {
      shopDomain: "https://test-domain",
      title: "dummy title",
      productId: "gid://shopify/Product/123",
      variantId: "gid://shopify/ProductVariant/456",
      handle: "dummy_handle",
      discountId: "gid://shopify/DiscountCodeNode/789",
      discountCode: "dummy_discount",
      destination: "product",
    };

    test("returns saved data", async () => {
      QRCodesDB.__query.mockImplementation(() =>
        Promise.resolve([{ id: 1234 }])
      );

      const id = await QRCodesDB.create(VALID_CREATE_DATA);

      expect(QRCodesDB.__query).toHaveBeenCalledOnce();
      expect(id).toEqual(1234);
    });

    test.each([
      ["missing domain", { ...VALID_CREATE_DATA, shopDomain: undefined }],
      ["missing title", { ...VALID_CREATE_DATA, title: undefined }],
      ["missing productId", { ...VALID_CREATE_DATA, productId: undefined }],
      ["missing variantId", { ...VALID_CREATE_DATA, variantId: undefined }],
      ["missing handle", { ...VALID_CREATE_DATA, handle: undefined }],
      ["missing destination", { ...VALID_CREATE_DATA, destination: undefined }],
      ["invalid domain", { ...VALID_CREATE_DATA, shopDomain: "Not a domain" }],
      ["invalid productId", { ...VALID_CREATE_DATA, productId: "Not an id" }],
      ["invalid variantId", { ...VALID_CREATE_DATA, variantId: "Not an id" }],
      ["invalid discountId", { ...VALID_CREATE_DATA, discountId: "Not an id" }],
      ["invalid destination", { ...VALID_CREATE_DATA, destination: "Invalid" }],
    ])("fails when %s", async (_scenario, data) => {
      await expect(QRCodesDB.create(data)).rejects.toThrowError(
        QRCodeValidationError
      );
      expect(QRCodesDB.__query).not.toHaveBeenCalled();
    });
  });

  describe("update", async () => {
    const VALID_UPDATE_DATA = {
      id: 1234,
      title: "dummy title",
      productId: "gid://shopify/Product/123",
      variantId: "gid://shopify/ProductVariant/456",
      handle: "dummy_handle",
      discountId: "gid://shopify/DiscountCodeNode/789",
      discountCode: "dummy_discount",
      destination: "checkout",
    };

    test("returns saved data", async () => {
      QRCodesDB.__query.mockImplementation(() =>
        Promise.resolve([{ id: 1234 }])
      );

      const id = await QRCodesDB.update(1234, VALID_UPDATE_DATA);

      expect(QRCodesDB.__query).toHaveBeenCalledOnce();
      expect(id).toBeTruthy();
    });

    test.each([
      ["missing title", { ...VALID_UPDATE_DATA, title: undefined }],
      ["missing productId", { ...VALID_UPDATE_DATA, productId: undefined }],
      ["missing variantId", { ...VALID_UPDATE_DATA, variantId: undefined }],
      ["missing handle", { ...VALID_UPDATE_DATA, handle: undefined }],
      ["missing destination", { ...VALID_UPDATE_DATA, destination: undefined }],
      ["invalid productId", { ...VALID_UPDATE_DATA, productId: "Not an id" }],
      ["invalid variantId", { ...VALID_UPDATE_DATA, variantId: "Not an id" }],
      ["invalid discountId", { ...VALID_UPDATE_DATA, discountId: "Not an id" }],
      ["invalid destination", { ...VALID_UPDATE_DATA, destination: "Invalid" }],
    ])("fails when %s", async (_scenario, data) => {
      await expect(QRCodesDB.update(1234, data)).rejects.toThrowError(
        QRCodeValidationError
      );
      expect(QRCodesDB.__query).not.toHaveBeenCalled();
    });
  });

  test("list", async () => {
    const codeResponse = [{ id: 1234 }, { id: 4321 }];
    QRCodesDB.__query.mockImplementation(() => Promise.resolve(codeResponse));

    const codes = await QRCodesDB.list("test-domain");

    expect(QRCodesDB.__query).toHaveBeenCalledOnce();
    expect(QRCodesDB.__query).toHaveBeenCalledWith(
      expect.stringMatching(/WHERE shopDomain =/),
      ["test-domain"]
    );
    expect(codes).toEqual(codeResponse);
  });

  describe("read", () => {
    test("finds a result", async () => {
      const codeResponse = [{ id: 1234 }];
      QRCodesDB.__query.mockImplementation(() => Promise.resolve(codeResponse));

      const code = await QRCodesDB.read(1234);

      expect(QRCodesDB.__query).toHaveBeenCalledOnce();
      expect(QRCodesDB.__query).toHaveBeenCalledWith(
        expect.stringMatching(/WHERE id =/),
        [1234]
      );
      expect(code).toEqual(codeResponse[0]);
    });

    test("handles result not found", async () => {
      const codeResponse = [];
      QRCodesDB.__query.mockImplementation(() => Promise.resolve(codeResponse));

      const code = await QRCodesDB.read(1234);

      expect(QRCodesDB.__query).toHaveBeenCalledOnce();
      expect(QRCodesDB.__query).toHaveBeenCalledWith(
        expect.stringMatching(/WHERE id =/),
        [1234]
      );
      expect(code).toBeUndefined();
    });
  });

  test("delete", async () => {
    QRCodesDB.__query.mockImplementation(() => Promise.resolve());

    const result = await QRCodesDB.delete(1234);

    expect(QRCodesDB.__query).toHaveBeenCalledOnce();
    expect(QRCodesDB.__query).toHaveBeenCalledWith(
      expect.stringMatching(/DELETE FROM qr_codes\s+WHERE id =/),
      [1234]
    );
    expect(result).toBeTruthy();
  });

  describe("scan functions", () => {
    const qrCode = {
      id: 1234,
      shopDomain: "https://test-domain",
      title: "dummy title",
      productId: "gid://shopify/Product/123",
      variantId: "gid://shopify/ProductVariant/456",
      handle: "dummy_handle",
      discountId: "gid://shopify/DiscountCodeNode/789",
      discountCode: "dummy_discount",
      destination: "product",
    };

    test("generateQrcodeDestinationUrl", async () => {
      Shopify.Context.HOST_NAME = "test-host";

      const result = await QRCodesDB.generateQrcodeDestinationUrl(qrCode);

      expect(result).toMatch("https://test-host/qrcodes/1234/scan");
    });

    test("handleCodeScan with product destination", async () => {
      Shopify.Context.HOST_NAME = "test-host";
      QRCodesDB.__query.mockImplementation(() => Promise.resolve());

      const result = await QRCodesDB.handleCodeScan({
        ...qrCode,
        destination: "product",
      });

      expect(QRCodesDB.__query).toHaveBeenCalledOnce();
      expect(result).toMatch(
        "https://test-domain/discount/dummy_discount?redirect=%2Fproducts%2Fdummy_handle"
      );
    });

    test("handleCodeScan with checkout destination", async () => {
      Shopify.Context.HOST_NAME = "test-host";
      QRCodesDB.__query.mockImplementation(() => Promise.resolve());

      const result = await QRCodesDB.handleCodeScan({
        ...qrCode,
        destination: "checkout",
      });

      expect(QRCodesDB.__query).toHaveBeenCalledOnce();
      expect(result).toMatch(
        "https://test-domain/cart/456:1?discount=dummy_discount"
      );
    });
  });
});
