import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
  Icon,
  HorizontalStack,
  Tooltip,
} from "@shopify/polaris";

import { getQRCodes } from "../models/QRCode.server";
import { DiamondAlertMajor, ImageMajor } from "@shopify/polaris-icons";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const QRCodes = await getQRCodes(session.shop, admin.graphql);

  return json({
    QRCodes,
  });
}

export default function Index() {
  const { QRCodes } = useLoaderData();
  const navigate = useNavigate();

  function truncate(str) {
    const n = 25;
    return str.length > n ? str.substr(0, n - 1) + "…" : str;
  }

  const emptyMarkup = QRCodes.length ? null : (
    <EmptyState
      heading="Create unique QR codes for your product"
      action={{
        content: "Create QR code",
        onAction: () => navigate("qrcodes/new"),
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Allow customers to scan codes and buy products using their phones.</p>
    </EmptyState>
  );

  const qrCodesMarkup = QRCodes.length ? (
    <IndexTable
      resourceName={{
        singular: "QR code",
        plural: "QR codes",
      }}
      itemCount={QRCodes.length}
      headings={[
        { title: "Thumbnail", hidden: true },
        { title: "Title" },
        { title: "Product" },
        { title: "Date created" },
        { title: "Scans" },
      ]}
      selectable={false}
    >
      {QRCodes.map(
        ({
          id,
          title,
          productImage,
          productTitle,
          productDeleted,
          createdAt,
          scans,
        }) => {
          return (
            <IndexTable.Row id={id} key={id} position={id}>
              <IndexTable.Cell>
                <Thumbnail
                  source={productImage || ImageMajor}
                  alt={"product image or placeholder"}
                  size="small"
                />
              </IndexTable.Cell>
              <IndexTable.Cell>
                <Link to={`qrcodes/${id}`}>{truncate(title)}</Link>
              </IndexTable.Cell>
              <IndexTable.Cell>
                {productDeleted ? (
                  <HorizontalStack align="start" gap={"2"}>
                    <Tooltip content="product has been deleted">
                      <span style={{ width: "20px" }}>
                        <Icon source={DiamondAlertMajor} color="critical" />
                      </span>
                    </Tooltip>
                    <Text color={productDeleted && "critical"} as="span">
                      {truncate(productTitle)}
                    </Text>
                  </HorizontalStack>
                ) : (
                  truncate(productTitle)
                )}
              </IndexTable.Cell>
              <IndexTable.Cell>
                {new Date(createdAt).toDateString()}
              </IndexTable.Cell>
              <IndexTable.Cell>{scans}</IndexTable.Cell>
            </IndexTable.Row>
          );
        }
      )}
    </IndexTable>
  ) : null;

  return (
    <Page>
      {/* [START ui-title-bar] */}
      <ui-title-bar title="Products">
        <Link variant="primary" to="/app/qrcodes/new">
          Create QR code
        </Link>
      </ui-title-bar>
      {/* [END ui-title-bar] */}
      <Layout>
        <Layout.Section>
          <Card padding={"0"}>
            {emptyMarkup}
            {qrCodesMarkup}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
