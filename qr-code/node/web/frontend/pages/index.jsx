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
  /*
    Add an App Bridge useNavigate hook to set up the navigate function.
    This function modifies the top-level browser URL so that you can
    navigate within the embedded app and keep the browser in sync on reload.
  */
  const navigate = useNavigate()

  const {
    data: QRCodes,
    isLoading,
    isRefetching,
  } = useAppQuery({
    url: '/api/qrcodes',
  })

  /* loadingMarkup using loading component from AppBridge and components from Polaris  */
  const loadingMarkup = isLoading ? (
    <Card sectioned>
      <Loading />
      <SkeletonBodyText />
    </Card>
  ) : null

  const qrCodesMarkup = QRCodes?.length ? (
    <QRCodeIndex QRCodes={QRCodes} loading={isRefetching} />
  ) : null

  /* Use Polaris Card and EmptyState components to define the contents of the empty state */
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

  /*
    Use Polaris Page and TitleBar components to create the page layout,
    and include empty state contents set above
  */
  return (
    <Page>
      <TitleBar
        title="QR codes"
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
