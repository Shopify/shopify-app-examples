import { useNavigate, TitleBar, Loading } from '@shopify/app-bridge-react'
import {
  Card,
  EmptyState,
  Layout,
  Page,
  SkeletonBodyText,
} from '@shopify/polaris'
import { useAppQuery } from '../hooks'
import { QRCodeIndex } from '../components'

export default function HomePage() {
  const navigate = useNavigate()
  const {
    data: QRCodes,
    isLoading,
    isRefetching,
  } = useAppQuery({
    url: '/api/qrcodes',
  })

  const loadingMarkup = isLoading ? (
    <Card sectioned>
      <Loading />
      <SkeletonBodyText />
    </Card>
  ) : null

  const qrCodesMarkup = QRCodes?.length ? (
    <QRCodeIndex QRCodes={QRCodes} loading={isRefetching} />
  ) : null

  const emptyStateMarkup =
    !isLoading && !QRCodes?.length ? (
      <Card sectioned>
        <EmptyState
          heading="Create unique QR codes for your product"
          action={{
            content: 'Create QR code',
            onAction: () => navigate('/qrcodes/new'),
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
        title='QR codes'
        primaryAction={{
          content: 'Create QR code',
          onAction: () => navigate('/qrcodes/new'),
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
