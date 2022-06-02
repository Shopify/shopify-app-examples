import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Page, Layout, SkeletonBodyText } from '@shopify/polaris'

import { QRCodeForm } from '../../components'
import { useAuthenticatedFetch } from '../../hooks'
import { Loading, TitleBar } from '@shopify/app-bridge-react'

export default function QRCodeEdit() {
  const [QRCode, setQRCode] = useState()
  const fetch = useAuthenticatedFetch()
  const { id } = useParams()

  useEffect(async () => {
    const response = await fetch(`/api/qrcodes/${id}`)

    if (response.ok) {
      const body = await response.json()
      setQRCode(body)
    }
  }, [id, setQRCode])

  const titleBarMarkup = <TitleBar title="Edit QR code" primaryAction={null} />

  if (!QRCode) {
    return (
      <Page>
        {titleBarMarkup}
        <Loading />
        <Layout>
          <Layout.Section>
            <Card sectioned title="Title">
              <SkeletonBodyText />
            </Card>
            <Card title="Product">
              <Card.Section>
                <SkeletonBodyText lines={1} />
              </Card.Section>
              <Card.Section>
                <SkeletonBodyText lines={3} />
              </Card.Section>
            </Card>
            <Card sectioned title="Discount">
              <SkeletonBodyText lines={2} />
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card sectioned title="QR Code" />
          </Layout.Section>
        </Layout>
      </Page>
    )
  }

  return (
    <Page>
      {titleBarMarkup}
      <QRCodeForm QRCode={QRCode} setQRCode={setQRCode} />
    </Page>
  )
}
