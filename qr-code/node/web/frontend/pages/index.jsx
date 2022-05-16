import { useNavigate, TitleBar } from '@shopify/app-bridge-react'

import { Card, Page, Layout, EmptyState } from '@shopify/polaris'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <Page fullWidth>
      <TitleBar
        title="QR Code App"
        primaryAction={{
          content: 'Create QR code',
          onAction: () => navigate('/codes/new'),
        }}
      />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <EmptyState
              heading="Create unique QR codes for your product"
              action={{
                content: 'Create QR code',
                onAction: () => navigate('/codes/new'),
              }}
              image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
              <p>
                Allow customers to scan codes and buy products using their
                phones.
              </p>
            </EmptyState>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
