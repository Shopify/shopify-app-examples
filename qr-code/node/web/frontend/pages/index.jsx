import { useEffect, useState } from 'react'
import { useNavigate, TitleBar } from '@shopify/app-bridge-react'
import { Card, EmptyState, Layout, Page } from '@shopify/polaris'
import { useAuthenticatedFetch } from '../hooks'
import { CodeIndex } from '../components'

export default function HomePage() {
  const navigate = useNavigate()
  const fetch = useAuthenticatedFetch()
  const [QRCodes, setQRCodes] = useState([])

  useEffect(async () => {
    const codes = await fetch('/api/qrcodes').then((res) => res.json())
    setQRCodes(codes)
  }, [])

  return (
    <Page>
      <TitleBar
        primaryAction={{
          content: 'Create QR code',
          onAction: () => navigate('/codes'),
        }}
      />
      <Layout>
        <Layout.Section>
          {QRCodes.length ? (
            <CodeIndex QRCodes={QRCodes} />
          ) : (
            <Card sectioned>
              <EmptyState
                heading="Create unique QR codes for your product"
                action={{
                  content: 'Create QR code',
                  onAction: () => navigate('/codes'),
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  Allow customers to scan codes and buy products using their
                  phones.
                </p>
              </EmptyState>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  )
}
