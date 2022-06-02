import { useState } from 'react'
import { Card, Page, Layout, Button, EmptyState } from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'

import { QRCodeEditForm } from '../../components'

export default function ManageCode() {
  const [QRCode, setQRCode] = useState()

  return (
    <Page>
      <TitleBar title="Create new QR code" primaryAction={null} />
      <QRCodeEditForm QRCode={QRCode} setQRCode={setQRCode} />
    </Page>
  )
}
