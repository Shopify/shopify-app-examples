import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Page, Layout, SkeletonBodyText } from '@shopify/polaris'

import { QRCodeEditForm } from '../../../components'
import { useAuthenticatedFetch, useLocation } from '../../../hooks'
import { Loading, TitleBar } from '@shopify/app-bridge-react'

export default function CodeEdit() {
  const { state } = useLocation()
  const [QRCode, setQRCode] = useState(state)
  const fetch = useAuthenticatedFetch()
  const { id } = useParams()

  useEffect(async () => {
    if (QRCode) return
    const response = await fetch(`/api/qrcodes/${id}`)

    if (response.ok) {
      const body = await response.json()
      setQRCode(body)
    }
  }, [id, QRCode])

  if (!QRCode) {
    return (
      <Page>
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
      <TitleBar title="Edit QR code" primaryAction={null} />
      <QRCodeEditForm {...{ QRCode, setQRCode }} />
    </Page>
  )
}
