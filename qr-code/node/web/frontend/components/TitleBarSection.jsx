import { TitleBar, useNavigate } from '@shopify/app-bridge-react'

export function TitleBarSection() {
  const navigate = useNavigate();

  return (
    <>
      <TitleBar
        title="QR Code App"
        primaryAction={{
          content: 'Create QR code',
          onAction: () => navigate('/tab2'),
        }}
      />
    </>
  )
}
