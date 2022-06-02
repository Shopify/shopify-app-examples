import { useEffect, useState } from 'react'
import { useNavigate, TitleBar, Loading } from '@shopify/app-bridge-react'
import {
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from '@shopify/polaris'
import { useAuthenticatedFetch } from '../hooks'
import { QRCodeIndex } from '../components'

export default function HomePage() {
  const navigate = useNavigate()
  const fetch = useAuthenticatedFetch()
  const [{ loading, QRCodes }, setData] = useState({
    loading: true,
    QRCodes: [],
  })

  useEffect(async () => {
    const QRCodes = await fetch('/api/qrcodes').then((res) => res.json())
    setData({ loading: false, QRCodes })
  }, [])

  const loadingMarkup = loading ? (
    <Card sectioned>
      <Loading />
      <SkeletonBodyText />
    </Card>
  ) : null

  const qrCodesMarkup =
    QRCodes.length && !loading ? <QRCodeIndex QRCodes={QRCodes} /> : null

  const emptyStateMarkup =
    !loading && !QRCodes.length ? (
      <Card sectioned>
        <EmptyState
          heading="Create unique QR codes for your product"
          action={{
            content: 'Create QR code',
            onAction: () => navigate('/qrcodes'),
          }}
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>
            Allow customers to scan codes and buy products using their phones.
          </p>
        </EmptyState>
      </Card>
    ) : null

  return (
    <Page>
      <TitleBar
        primaryAction={{
          content: 'Create QR code',
          onAction: () => navigate('/qrcodes'),
        }}
      />
      <Layout>
        <Layout.Section>
          {loadingMarkup}
          {qrCodesMarkup}
          {emptyStateMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  )
}
