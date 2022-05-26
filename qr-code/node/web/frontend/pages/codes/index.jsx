import { useState } from 'react';
import {
  Card,
  Page,
  Layout,
  Button,
  EmptyState,
} from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'

import { CodeEditForm } from 'components/CodeEditForm';

export default function ManageCode () {
  const [QRCode, setQRCode] = useState();

  return (
    <Page>
      <TitleBar title="Edit QR code" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <CodeEditForm QRCode={QRCode} setQRCode={setQRCode} />
        </Layout.Section>
        <Layout.Section secondary>
          <Card sectioned title="QR Code">
            <EmptyState
              imageContained={true}
              largeImage={QRCode?.imageUrl}
            >
              {!QRCode?.imageUrl && <p>Your QR code will appear here after you save.</p>}
            </EmptyState>
            <Button fullWidth primary download url={QRCode?.imageUrl}>
              Download
            </Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
