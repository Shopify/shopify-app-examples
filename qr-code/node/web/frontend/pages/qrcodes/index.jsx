import { Page } from '@shopify/polaris'
import { TitleBar } from '@shopify/app-bridge-react'

import { QRCodeEditForm } from '../../components'

export default function ManageCode() {
  return (
    <Page>
      <TitleBar title="Create new QR code" primaryAction={null} />
      <QRCodeEditForm />
    </Page>
  )
}
