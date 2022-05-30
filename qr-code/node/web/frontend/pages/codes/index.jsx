import { useState } from 'react'
import { Card, Page, Layout, Button, EmptyState } from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'

import { CodeEditForm } from '../../components/CodeEditForm'

export default function ManageCode() {
  const [QRCode, setQRCode] = useState()

  return (
    <Page>
      <TitleBar title="Create new QR code" primaryAction={null} />
      <CodeEditForm QRCode={QRCode} setQRCode={setQRCode} />
    </Page>
  )
}
