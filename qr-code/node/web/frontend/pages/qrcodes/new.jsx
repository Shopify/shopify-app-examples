import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { QRCodeForm } from "../../components";

export default function ManageCode() {
  const breadcrumbs = [{ content: "QR codes", url: "/" }];

  return (
    <Page>
      <TitleBar
        title="Create new QR code"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <QRCodeForm />
    </Page>
  );
}
