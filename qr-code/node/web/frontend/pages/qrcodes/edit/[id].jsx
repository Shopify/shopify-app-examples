import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Card,
  Layout,
  Page,
  SkeletonBodyText,
  SkeletonDisplayText,
  SkeletonPage,
  TextContainer,
} from '@shopify/polaris'

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
      <SkeletonPage>
        <Loading />
        <Layout>
          <Layout.Section>
            <Card sectioned>
              <SkeletonBodyText />
            </Card>
            <Card sectioned>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </Card>
            <Card sectioned>
              <TextContainer>
                <SkeletonDisplayText size="small" />
                <SkeletonBodyText />
              </TextContainer>
            </Card>
          </Layout.Section>
          <Layout.Section secondary>
            <Card>
              <Card.Section>
                <TextContainer>
                  <SkeletonBodyText lines={5} />
                  <SkeletonDisplayText size="small" />
                </TextContainer>
              </Card.Section>
            </Card>
          </Layout.Section>
        </Layout>
      </SkeletonPage>
    )
  }

  return (
    <Page>
      <TitleBar title="Edit QR code" primaryAction={null} />
      <QRCodeEditForm {...{ QRCode, setQRCode }} />
    </Page>
  )
}
