import { useState } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
  Link,
} from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  Bleed,
  Button,
  ChoiceList,
  Divider,
  EmptyState,
  HorizontalStack,
  InlineError,
  Layout,
  Page,
  Text,
  TextField,
  Thumbnail,
  VerticalStack,
  PageActions,
} from "@shopify/polaris";
import { ImageMajor } from "@shopify/polaris-icons";

import db from "../db.server";
import { getQRCode, validateQRCode } from "../models/QRCode.server";

// [START loader]
export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);

  if (params.id === "new") {
    return json({
      destination: "product",
      title: "",
    });
  }

  return json(await getQRCode(Number(params.id), admin.graphql));
}
// [END loader]

// [START action]
export async function action({ request, params }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  if (request.method === "DELETE") {
    return redirect("/app");
  }

  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };

  const errors = validateQRCode(data);

  if (errors) {
    return json({ errors }, { status: 422 });
  }

  const QRCode =
    params.id === "new"
      ? await db.qRCode.create({ data })
      : await db.qRCode.update({ where: { id: Number(params.id) }, data });

  return redirect(`/app/qrcodes/${QRCode.id}`);
}
// [END action]

// [START state]
export default function QRCodeForm() {
  const errors = useActionData()?.errors || {};

  const QRCode = useLoaderData();
  const [formState, setFormState] = useState(QRCode);
  const [cleanFormState, setCleanFormState] = useState(QRCode);
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);

  const nav = useNavigation();
  const isSaving = nav.state === "submitting" && nav.formMethod === "POST";
  const isDeleting = nav.state === "submitting" && nav.formMethod === "DELETE";
  // [END state]

  // [START select-product]
  async function selectProduct() {
    const selected = await window.shopify.resourcePicker({
      type: "product",
      action: "Select", // customized action verb, either 'Select' or 'Add',
    });

    if (selected?.selection) {
      const { images, id, variants, title, handle } = selected.selection[0];

      setFormState({
        ...formState,
        productId: id,
        productVariantId: variants[0].id,
        productTitle: title,
        productHandle: handle,
        productAlt: images[0]?.altText,
        productImage: images[0]?.imageSrc || images[0]?.originalSrc,
      });
    }
  }
  // [END select-product]

  const submit = useSubmit();
  function handleSave() {
    const data = {
      title: formState.title,
      productId: formState.productId,
      productVariantId: formState.productVariantId,
      productHandle: formState.productHandle,
      destination: formState.destination,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      {/* [START breadcrumbs] */}
      <ui-title-bar title={QRCode ? "Edit QR code" : "Create new QR code"}>
        <Link variant="breadcrumb" to="/app/qrcodes">
          Qr Codes
        </Link>
      </ui-title-bar>
      {/* [END breadcrumbs] */}
      <Layout>
        <Layout.Section>
          <VerticalStack gap="5">
            {/* [START polaris] */}
            <Card>
              <VerticalStack gap="5">
                <Text as={"h2"} variant="headingLg">
                  Title
                </Text>
                <TextField
                  id="title"
                  helpText="Only store staff can see this title"
                  label="title"
                  labelHidden
                  autoComplete="off"
                  value={formState.title}
                  onChange={(title) =>
                    setFormState({ ...formState, title: title })
                  }
                  error={errors.title}
                />
              </VerticalStack>
            </Card>
            {/* [END polaris] */}
            <Card>
              <VerticalStack gap="5">
                <HorizontalStack align="space-between">
                  <Text as={"h2"} variant="headingLg">
                    Product
                  </Text>
                  {formState.productId ? (
                    <Button plain onClick={selectProduct}>
                      Change product
                    </Button>
                  ) : null}
                </HorizontalStack>
                {formState.productId ? (
                  <HorizontalStack blockAlign="center" gap={"5"}>
                    <Thumbnail
                      source={formState.productImage || ImageMajor}
                      alt={formState.productAlt}
                    />
                    <Text as="span" variant="headingMd" fontWeight="semibold">
                      {formState.productTitle}
                    </Text>
                  </HorizontalStack>
                ) : (
                  <VerticalStack gap="2">
                    <Button onClick={selectProduct} id="select-product">
                      Select product
                    </Button>
                    {errors.productId ? (
                      <InlineError
                        message={errors.productId}
                        fieldID="myFieldID"
                      />
                    ) : null}
                  </VerticalStack>
                )}
                <Bleed marginInline="20">
                  <Divider />
                </Bleed>
                <ChoiceList
                  title="Scan destination"
                  choices={[
                    { label: "Link to product page", value: "product" },
                    {
                      label: "Link to checkout page with product in the cart",
                      value: "cart",
                    },
                  ]}
                  selected={[formState.destination]}
                  onChange={(destination) =>
                    setFormState({ ...formState, destination: destination[0] })
                  }
                  error={errors.destination}
                />
              </VerticalStack>
            </Card>
          </VerticalStack>
        </Layout.Section>
        <Layout.Section secondary>
          <Card>
            <Text as={"h2"} variant="headingLg">
              QR code
            </Text>
            {QRCode ? (
              <EmptyState image={QRCode.image} imageContained={true} />
            ) : (
              <EmptyState image="">
                Your QR code will appear here after you save
              </EmptyState>
            )}
            <VerticalStack gap="5">
              <Button
                disabled={!QRCode?.image}
                url={QRCode?.image}
                download
                primary
              >
                Download
              </Button>
              <Button
                disabled={!QRCode.destinationUrl}
                url={QRCode?.destinationUrl}
                external
              >
                Go to destination
              </Button>
            </VerticalStack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <PageActions
            secondaryActions={[
              {
                content: "Delete",
                loading: isDeleting,
                disabled: !QRCode || isSaving || isDeleting,
                destructive: true,
                outline: true,
                onAction: () => submit({}, { method: "delete" }),
              },
            ]}
            primaryAction={{
              content: "Save",
              disabled: !isDirty || isSaving || isDeleting,
              onAction: handleSave,
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
