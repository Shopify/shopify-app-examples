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

import { CodeEditForm } from 'components/CodeEditForm'
import { useAuthenticatedFetch } from 'hooks/useAuthenticatedFetch'
import { TitleBar } from '@shopify/app-bridge-react'
import { useLocation } from 'hooks/location-with-state'

export default function CodeEdit() {
  const {state} = useLocation();
  const [QRCode, setQRCode] = useState(state);
  const fetch = useAuthenticatedFetch()
  const { id } = useParams()

  console.log({QRCode});

  useEffect(async () => {
    if(QRCode) return;
    const response = await fetch(`/api/qrcodes/${id}`, { method: 'GET' })

    if (response.ok) {
      const body = await response.json()
      setQRCode(body)
    }
  }, [])

  if (QRCode === null) {
    return (
      <SkeletonPage>
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

  return <Page>
      <TitleBar title="Edit QR code" primaryAction={null} />
    <CodeEditForm {...{QRCode, setQRCode}} />
    </Page>
}
