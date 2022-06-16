import { useState, useCallback } from 'react'
import {
  Banner,
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  ChoiceList,
  Select,
  Thumbnail,
  Icon,
  Stack,
  TextStyle,
  Layout,
  EmptyState,
} from '@shopify/polaris'
import {
  ContextualSaveBar,
  ResourcePicker,
  useAppBridge,
  useNavigate,
} from '@shopify/app-bridge-react'
import { ImageMajor, AlertMinor } from '@shopify/polaris-icons'
import { useShopifyQuery, useAuthenticatedFetch } from '../hooks'
import { gql } from 'graphql-request'
import { useForm, useField, notEmptyString } from '@shopify/react-form'

import { productCheckoutURL, productViewURL } from '../helpers'

const NO_DISCOUNT_OPTION = { label: 'No discount', value: '' }

const DISCOUNTS_QUERY = gql`
  query discounts($first: Int!) {
    codeDiscountNodes(first: $first) {
      edges {
        node {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
            ... on DiscountCodeBxgy {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
            ... on DiscountCodeFreeShipping {
              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const DISCOUNT_CODES = {}

export function QRCodeForm({ QRCode: InitialQRCode }) {
  const [QRCode, setQRCode] = useState(InitialQRCode)
  const [showResourcePicker, setShowResourcePicker] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(QRCode?.product)
  const navigate = useNavigate()
  const appBridge = useAppBridge()
  const fetch = useAuthenticatedFetch()
  const deletedProduct = QRCode?.product?.title === 'Deleted product'

  const onSubmit = useCallback(
    (body) => {
      (async () => {
        const parsedBody = body
        parsedBody.destination = parsedBody.destination[0]

        const QRCodeId = QRCode?.id
        const url = QRCodeId ? `/api/qrcodes/${QRCodeId}` : '/api/qrcodes'
        const method = QRCodeId ? 'PATCH' : 'POST'

        const response = await fetch(url, {
          method,
          body: JSON.stringify(parsedBody),
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          makeClean()

          const QRCode = await response.json()

          // If there is no QRCodeId, this is a new QR Code being saved.
          if (!QRCodeId) {
            navigate(`/qrcodes/${QRCode.id}`)
          } else {
            setQRCode(QRCode)
          }
        }
      })()

      return { status: 'success' }
    },
    [QRCode, setQRCode]
  )

  const {
    fields: {
      title,
      productId,
      variantId,
      handle,
      discountId,
      discountCode,
      destination,
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      title: useField({
        value: QRCode?.title || '',
        validates: [notEmptyString('Please name your QR code')],
      }),
      productId: useField({
        value: deletedProduct ? 'Deleted product' : (QRCode?.product?.id || ''),
        validates: [notEmptyString('Please select a product')],
      }),
      variantId: useField(QRCode?.variantId || ''),
      handle: useField(QRCode?.handle || ''),
      destination: useField(
        QRCode?.destination ? [QRCode.destination] : ['product']
      ),
      discountId: useField(QRCode?.discountId || NO_DISCOUNT_OPTION.value),
      discountCode: useField(QRCode?.discountCode || ''),
    },
    onSubmit,
  })

  const handleProductChange = useCallback(({ selection }) => {
    // TODO: Storing product details, and product ID seperately is a hack
    // This will be fixed when this form queries the product data
    setSelectedProduct({
      title: selection[0].title,
      images: selection[0].images,
      handle: selection[0].handle,
    })
    productId.onChange(selection[0].id)
    variantId.onChange(selection[0].variants[0].id)
    handle.onChange(selection[0].handle)
    setShowResourcePicker(false)
  }, [])

  const handleDiscountChange = useCallback((id) => {
    discountId.onChange(id)
    discountCode.onChange(DISCOUNT_CODES[id] || '')
  }, [])

  const toggleResourcePicker = useCallback(
    () => setShowResourcePicker(!showResourcePicker),
    [showResourcePicker]
  )

  const {
    data: discounts,
    isLoading: isLoadingDiscounts,
    isError: discountsError,
  } = useShopifyQuery({
    key: 'discounts',
    query: DISCOUNTS_QUERY,
    variables: {
      first: 25,
    },
  })

  const [isDeleting, setIsDeleting] = useState(false)
  const deleteQRCode = useCallback(async () => {
    reset()
    setIsDeleting(true)
    const response = await fetch(`/api/qrcodes/${QRCode.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      navigate(`/`)
    }
  }, [QRCode])

  const goToDestination = useCallback(() => {
    if (!selectedProduct) return
    const data = {
      host: appBridge.hostOrigin,
      productHandle: handle.value || selectedProduct.handle,
      discountCode: discountCode.value || undefined,
      variantId: variantId.value,
    }

    const targetURL = deletedProduct || destination.value[0] === 'product'
        ? productViewURL(data)
        : productCheckoutURL(data)

    window.open(targetURL, '_blank', 'noreferrer,noopener')
  }, [QRCode, selectedProduct, destination, discountCode, handle, variantId])

  const discountOptions = discounts
    ? [
        NO_DISCOUNT_OPTION,
        ...discounts.data.codeDiscountNodes.edges.map(
          ({ node: { id, codeDiscount } }) => {
            DISCOUNT_CODES[id] = codeDiscount.codes.edges[0].node.code

            return {
              label: codeDiscount.codes.edges[0].node.code,
              value: id,
            }
          }
        ),
      ]
    : []

  const QRCodeURL = QRCode ? new URL(
    `/qrcodes/${QRCode.id}/image`,
    location.toString()
    ).toString()
    : null

  const imageSrc = selectedProduct?.images?.edges?.[0]?.node?.url
  const originalImageSrc = selectedProduct?.images?.[0]?.originalSrc
  const altText = selectedProduct?.images?.[0]?.altText || selectedProduct?.title

  return (
    <Stack vertical>
      {deletedProduct && (
        <Banner
          title="The product for this QR code no longer exists."
          status="critical"
        >
          <p>
            Scans will be directed to a 404 page, or you can choose another
            product for this QR code.
          </p>
        </Banner>
      )}
      <Layout>
        <Layout.Section>
          <Form>
            <ContextualSaveBar
              saveAction={{
                label: 'Save',
                onAction: submit,
                loading: submitting,
                disabled: submitting,
              }}
              discardAction={{
                label: 'Discard',
                onAction: reset,
                loading: submitting,
                disabled: submitting,
              }}
              visible={dirty}
              fullWidth
            />
            <FormLayout>
              <Card sectioned title="Title">
                <TextField
                  {...title}
                  label="Title"
                  labelHidden
                  helpText="Only store staff can see this title"
                />
              </Card>
              <Card
                title="Product"
                actions={[
                  {
                    content: productId.value
                      ? 'Change product'
                      : 'Select product',
                    onAction: toggleResourcePicker,
                  },
                ]}
              >
                <Card.Section>
                  {showResourcePicker && (
                    <ResourcePicker
                      resourceType="Product"
                      showVariants={false}
                      selectMultiple={false}
                      onCancel={toggleResourcePicker}
                      onSelection={handleProductChange}
                      open
                    />
                  )}
                  {productId.value ? (
                    <Stack alignment="center">
                      {imageSrc || originalImageSrc ? (
                        <Thumbnail
                          source={imageSrc || originalImageSrc}
                          alt={altText}
                        />
                      ) : (
                        <Thumbnail
                          source={ImageMajor}
                          color="base"
                          size="small"
                        />
                      )}
                      <TextStyle variation="strong">
                        {selectedProduct.title}
                      </TextStyle>
                    </Stack>
                  ) : (
                    <Stack vertical spacing="extraTight">
                      <Button onClick={toggleResourcePicker}>
                        Select product
                      </Button>
                      {productId.error && (
                        <Stack spacing="tight">
                          <Icon source={AlertMinor} color="critical" />
                          <TextStyle variation="negative">
                            {productId.error}
                          </TextStyle>
                        </Stack>
                      )}
                    </Stack>
                  )}
                </Card.Section>
                <Card.Section title="Scan Destination">
                  <ChoiceList
                    title="Scan destination"
                    titleHidden
                    choices={[
                      { label: 'Link to product page', value: 'product' },
                      {
                        label: 'Link to checkout page with product in the cart',
                        value: 'checkout',
                      },
                    ]}
                    selected={destination.value}
                    onChange={destination.onChange}
                  />
                </Card.Section>
              </Card>
              <Card
                sectioned
                title="Discount"
                actions={[
                  {
                    content: 'Create discount',
                    onAction: () =>
                      navigate(
                        {
                          name: 'Discount',
                          resource: {
                            create: true,
                          },
                        },
                        { target: 'new' }
                      ),
                  },
                ]}
              >
                <Select
                  label="discount code"
                  options={discountOptions}
                  onChange={handleDiscountChange}
                  value={discountId.value}
                  disabled={isLoadingDiscounts || discountsError}
                  labelHidden
                />
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>
        <Layout.Section secondary>
          <Card sectioned title="QR Code">
            {QRCode ? (
              <EmptyState 
                imageContained={true} 
                image={QRCodeURL} 
              />
            ) : (
              <EmptyState>
                <p>Your QR code will appear here after you save.</p>
              </EmptyState>
            )}
            <Stack vertical>
              <Button
                fullWidth primary download url={QRCodeURL} disabled={!QRCode || isDeleting}>
                Download
              </Button>
              <Button
                fullWidth
                onClick={goToDestination}
                disabled={!selectedProduct}
              >
                Go to destination
              </Button>
            </Stack>
          </Card>
        </Layout.Section>
        <Layout.Section>
          {QRCode?.id && (
            <Button
              outline
              destructive
              onClick={deleteQRCode}
              loading={isDeleting}
            >
              Delete QR code
            </Button>
          )}
        </Layout.Section>
      </Layout>
    </Stack>
  )
}
