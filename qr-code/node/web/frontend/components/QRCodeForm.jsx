import { useState, useCallback } from "react";
import {
  Banner,
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  ChoiceList,
  Select,
  Thumbnail,
  Icon,
  Stack,
  TextStyle,
  Layout,
  EmptyState,
} from "@shopify/polaris";
import {
  ContextualSaveBar,
  ResourcePicker,
  useAppBridge,
  useNavigate,
} from "@shopify/app-bridge-react";
import { ImageMajor, AlertMinor } from "@shopify/polaris-icons";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

const NO_DISCOUNT_OPTION = { label: "No discount", value: "" };

const DISCOUNT_CODES = {};

export function QRCodeForm({ QRCode: InitialQRCode }) {
  const [QRCode, setQRCode] = useState(InitialQRCode);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(QRCode?.product);
  const navigate = useNavigate();
  const appBridge = useAppBridge();
  const fetch = useAuthenticatedFetch();
  const deletedProduct = QRCode?.product?.title === "Deleted product";

  /*
    Keep the state of form fields as we change them
  */
  const initialFormValues = formValuesFromQRCode(QRCode, deletedProduct);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState({});
  const [dirty, setDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateFormValues = (newValues) => {
    const updatedValues = { ...formValues, ...newValues };

    // This object is flat, so we can just compare the first level
    const a = Object.entries(updatedValues).sort();
    const b = Object.entries(initialFormValues).sort();
    setDirty(JSON.stringify(a) != JSON.stringify(b));

    setFormValues(updatedValues);
  };

  const reset = () => {
    setFormValues(initialFormValues);
    setFormErrors({});
    setDirty(false);
    setSubmitting(false);
  };

  const validate = useCallback(
    (field) => {
      const data = field ? { [field]: formValues[field] } : formValues;
      const errors = validateFields(data);
      setFormErrors({ ...formErrors, ...errors });

      return errors;
    },
    [formErrors, formValues]
  );

  const submit = useCallback(() => {
    const errors = validate();
    if (Object.values(errors).filter((value) => !!value).length > 0) {
      return { status: "error" };
    }

    (async () => {
      const parsedBody = formValues;
      parsedBody.destination = parsedBody.destination[0];
      const QRCodeId = QRCode?.id;
      /* construct the appropriate URL to send the API request to based on whether the QR code is new or being updated */
      const url = QRCodeId ? `/api/qrcodes/${QRCodeId}` : "/api/qrcodes";
      /* a condition to select the appropriate HTTP method: PATCH to update a QR code or POST to create a new QR code */
      const method = QRCodeId ? "PATCH" : "POST";

      /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
      setSubmitting(true);
      const response = await fetch(url, {
        method,
        body: JSON.stringify(parsedBody),
        headers: { "Content-Type": "application/json" },
      });
      setSubmitting(false);

      if (response.ok) {
        setDirty(false);
        const QRCode = await response.json();
        /* if this is a new QR code, then save the QR code and navigate to the edit page; this behavior is the standard when saving resources in the Shopify admin */
        if (!QRCodeId) {
          navigate(`/qrcodes/${QRCode.id}`);
          /* if this is a QR code update, update the QR code state in this component */
        } else {
          setQRCode(QRCode);
          setFormValues(formValuesFromQRCode(QRCode, deletedProduct));
          setDirty(false);
        }
      }
    })();
    return { status: "success" };
  }, [QRCode, setQRCode, formValues]);

  /*
    This function is called with the selected product whenever the user clicks "Add" in the ResourcePicker.

    It takes the first item in the selection array and sets the selected product to an object with the properties from the "selection" argument.

    It updates the form state using the "onChange" methods attached to the form fields.

    Finally, closes the ResourcePicker.
  */
  const handleProductChange = useCallback(
    ({ selection }) => {
      setSelectedProduct({
        title: selection[0].title,
        images: selection[0].images,
        handle: selection[0].handle,
      });
      updateFormValues({
        productId: selection[0].id,
        variantId: selection[0].variants[0].id,
        handle: selection[0].handle,
      });
      validate("productId");
      setShowResourcePicker(false);
    },
    [formValues, formErrors]
  );

  /*
    This function updates the form state whenever a user selects a new discount option.
  */
  const handleDiscountChange = useCallback(
    (id) => {
      updateFormValues({
        discountId: id,
        discountCode: DISCOUNT_CODES[id] || "",
      });
    },
    [formValues]
  );

  /*
    This function is called when a user clicks "Select product" or cancels the ProductPicker.

    It switches between a show and hide state.
  */
  const toggleResourcePicker = useCallback(
    () => setShowResourcePicker(!showResourcePicker),
    [showResourcePicker]
  );

  const {
    data: discounts,
    isLoading: isLoadingDiscounts,
    isError: discountsError,
    /* useAppQuery makes a query to `/api/discounts`, which the backend authenticates before fetching the data from the Shopify GraphQL Admin API */
  } = useAppQuery({
    url: "/api/discounts",
  });

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteQRCode = useCallback(async () => {
    reset();
    /* The isDeleting state disables the download button and the delete QR code button to show the merchant that an action is in progress */
    setIsDeleting(true);
    const response = await fetch(`/api/qrcodes/${QRCode.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      navigate(`/`);
    }
  }, [QRCode]);

  /*
    This function runs when a user clicks the "Go to destination" button.

    It uses data from the App Bridge context as well as form state to construct destination URLs using the URL helpers you created.
  */
  const goToDestination = useCallback(() => {
    if (!selectedProduct) return;
    const data = {
      host: appBridge.hostOrigin,
      productHandle: formValues.handle || selectedProduct.handle,
      discountCode: formValues.discountCode || undefined,
      variantId: formValues.variantId,
    };

    const targetURL =
      deletedProduct || formValues.destination[0] === "product"
        ? productViewURL(data)
        : productCheckoutURL(data);

    window.open(targetURL, "_blank", "noreferrer,noopener");
  }, [QRCode, selectedProduct, formValues]);

  /*
    This array is used in a select field in the form to manage discount options
  */
  const discountOptions = discounts
    ? [
        NO_DISCOUNT_OPTION,
        ...discounts.codeDiscountNodes.edges.map(
          ({ node: { id, codeDiscount } }) => {
            DISCOUNT_CODES[id] = codeDiscount.codes.edges[0].node.code;

            return {
              label: codeDiscount.codes.edges[0].node.code,
              value: id,
            };
          }
        ),
      ]
    : [];

  const QRCodeURL = QRCode
    ? new URL(`/qrcodes/${QRCode.id}/image`, location.toString()).toString()
    : null;

  const imageSrc = selectedProduct?.images?.edges?.[0]?.node?.url;
  const originalImageSrc = selectedProduct?.images?.[0]?.originalSrc;
  const altText =
    selectedProduct?.images?.[0]?.altText || selectedProduct?.title;

  /* The form layout, created using Polaris and App Bridge components */
  return (
    <Stack vertical>
      {deletedProduct && (
        <Banner
          title="The product for this QR code no longer exists."
          status="critical"
        >
          <p>
            Scans will be directed to a 404 page, or you can choose another
            product for this QR code.
          </p>
        </Banner>
      )}
      <Layout>
        <Layout.Section>
          <Form>
            <ContextualSaveBar
              saveAction={{
                label: "Save",
                onAction: submit,
                loading: submitting,
                disabled: submitting,
              }}
              discardAction={{
                label: "Discard",
                onAction: reset,
                loading: submitting,
                disabled: submitting,
              }}
              visible={dirty}
              fullWidth
            />
            <FormLayout>
              <Card sectioned title="Title">
                <TextField
                  label="Title"
                  labelHidden
                  helpText="Only store staff can see this title"
                  value={formValues.title}
                  error={formErrors.title}
                  onChange={(value) => updateFormValues({ title: value })}
                  onBlur={(event) => validate("title")}
                />
              </Card>

              <Card
                title="Product"
                actions={[
                  {
                    content: formValues.productId
                      ? "Change product"
                      : "Select product",
                    onAction: toggleResourcePicker,
                  },
                ]}
              >
                <Card.Section>
                  {showResourcePicker && (
                    <ResourcePicker
                      resourceType="Product"
                      showVariants={false}
                      selectMultiple={false}
                      onCancel={toggleResourcePicker}
                      onSelection={handleProductChange}
                      open
                    />
                  )}
                  {formValues.productId ? (
                    <Stack alignment="center">
                      {imageSrc || originalImageSrc ? (
                        <Thumbnail
                          source={imageSrc || originalImageSrc}
                          alt={altText}
                        />
                      ) : (
                        <Thumbnail
                          source={ImageMajor}
                          color="base"
                          size="small"
                        />
                      )}
                      <TextStyle variation="strong">
                        {selectedProduct.title}
                      </TextStyle>
                    </Stack>
                  ) : (
                    <Stack vertical spacing="extraTight">
                      <Button onClick={toggleResourcePicker}>
                        Select product
                      </Button>
                      {formErrors.productId && (
                        <Stack spacing="tight">
                          <Icon source={AlertMinor} color="critical" />
                          <TextStyle variation="negative">
                            {formErrors.productId}
                          </TextStyle>
                        </Stack>
                      )}
                    </Stack>
                  )}
                </Card.Section>
                <Card.Section title="Scan Destination">
                  <ChoiceList
                    title="Scan destination"
                    titleHidden
                    choices={[
                      { label: "Link to product page", value: "product" },
                      {
                        label: "Link to checkout page with product in the cart",
                        value: "checkout",
                      },
                    ]}
                    selected={formValues.destination}
                    onChange={(value) =>
                      updateFormValues({ destination: value })
                    }
                  />
                </Card.Section>
              </Card>
              <Card
                sectioned
                title="Discount"
                actions={[
                  {
                    content: "Create discount",
                    onAction: () =>
                      navigate(
                        {
                          name: "Discount",
                          resource: {
                            create: true,
                          },
                        },
                        { target: "new" }
                      ),
                  },
                ]}
              >
                <Select
                  label="discount code"
                  options={discountOptions}
                  onChange={handleDiscountChange}
                  value={formValues.discountId}
                  disabled={isLoadingDiscounts || discountsError}
                  labelHidden
                />
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>
        <Layout.Section secondary>
          <Card sectioned title="QR code">
            {QRCode ? (
              <EmptyState imageContained={true} image={QRCodeURL} />
            ) : (
              <EmptyState>
                <p>Your QR code will appear here after you save.</p>
              </EmptyState>
            )}
            <Stack vertical>
              <Button
                fullWidth
                primary
                download
                url={QRCodeURL}
                disabled={!QRCode || isDeleting}
              >
                Download
              </Button>
              <Button
                fullWidth
                onClick={goToDestination}
                disabled={!selectedProduct}
              >
                Go to destination
              </Button>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          {QRCode?.id && (
            <Button
              outline
              destructive
              onClick={deleteQRCode}
              loading={isDeleting}
            >
              Delete QR code
            </Button>
          )}
        </Layout.Section>
      </Layout>
    </Stack>
  );
}

/* Builds a URL to the selected product */
function productViewURL({ host, productHandle, discountCode }) {
  const url = new URL(host);
  const productPath = `/products/${productHandle}`;

  /* If a discount is selected, then build a URL to the selected discount that redirects to the selected product: /discount/{code}?redirect=/products/{product} */
  if (discountCode) {
    url.pathname = `/discount/${discountCode}`;
    url.searchParams.append("redirect", productPath);
  } else {
    url.pathname = productPath;
  }

  return url.toString();
}

/* Builds a URL to a checkout that contains the selected product */
function productCheckoutURL({ host, variantId, quantity = 1, discountCode }) {
  const url = new URL(host);
  const id = variantId.replace(
    /gid:\/\/shopify\/ProductVariant\/([0-9]+)/,
    "$1"
  );

  url.pathname = `/cart/${id}:${quantity}`;

  /* Builds a URL to a checkout that contains the selected product with a discount code applied */
  if (discountCode) {
    url.searchParams.append("discount", discountCode);
  }

  return url.toString();
}

/* Sets the form state from a QRCode object */
function formValuesFromQRCode(QRCode, deletedProduct) {
  return {
    title: QRCode?.title || "",
    productId: deletedProduct ? "Deleted product" : QRCode?.product?.id || "",
    variantId: QRCode?.variantId || "",
    handle: QRCode?.handle || "",
    discountId: QRCode?.discountId || NO_DISCOUNT_OPTION.value,
    discountCode: QRCode?.discountCode || "",
    destination: QRCode?.destination ? [QRCode.destination] : ["product"],
  };
}

/* Validates the given data */
function validateFields(data) {
  let errors = {};

  Object.entries(data).forEach(([field, value]) => {
    let message = undefined;
    switch (field) {
      case "title":
        if (value.length === 0) {
          message = "Please name your QR code";
        }
        break;
      case "productId":
        if (value.length === 0) {
          message = "Please select a product";
        }
        break;
    }

    errors[field] = message;
  });

  return errors;
}
