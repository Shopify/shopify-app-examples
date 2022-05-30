import { useState, useCallback } from 'react'
import {
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
} from '@shopify/app-bridge-react'
import { ImageMajor, AlertMinor } from '@shopify/polaris-icons'
import { useShopifyQuery } from '../hooks/useShopifyQuery'
import { gql } from 'graphql-request'
import { useForm, useField, notEmptyString } from '@shopify/react-form'

import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch'
import { productCheckoutURL, productViewURL } from '../../common/product-urls'
import { useNavigate } from '../hooks/location-with-state.js'

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

export function CodeEditForm({ QRCode, setQRCode }) {
  const [showResourcePicker, setShowResourcePicker] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(QRCode?.product)
  const navigate = useNavigate()
  const appBridge = useAppBridge()
  const fetch = useAuthenticatedFetch()

  const onSubmit = useCallback(
    (body) => {
      ;(async () => {
        const parsedBody = body
        parsedBody.destination = parsedBody.destination[0]

        const codeId = QRCode?.id
        const url = codeId ? `/api/qrcodes/${codeId}` : '/api/qrcodes'
        const method = codeId ? 'PATCH' : 'POST'

        const response = await fetch(url, {
          method,
          body: JSON.stringify(parsedBody),
          headers: { 'Content-Type': 'application/json' },
        })

        if (response.ok) {
          const QRCode = await response.json()
          // If there is no codeId, this is a new QR Code being saved.
          if (!codeId) {
            navigate(`/codes/edit/${QRCode.id}`, { state: QRCode })
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
  } = useForm({
    fields: {
      title: useField({
        value: QRCode?.title || '',
        validates: [notEmptyString('Please name your QR code')],
      }),
      productId: useField({
        value: QRCode?.product?.id || '',
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

  const deleteQRCode = useCallback(async () => {
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
      productHandle: handle.value,
      discountCount: discountCode.value || undefined,
      variantId: variantId.value,
    }
    const targetURL =
      destination.value[0] === 'product'
        ? productViewURL(data)
        : productCheckoutURL(data)

    window.open(targetURL, '_blank', 'noreferrer,noopener')
  }, [QRCode, selectedProduct, destination])

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

  return (
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
                    {selectedProduct.images[0] ? (
                      <Thumbnail
                        source={selectedProduct.images[0].originalSrc}
                        alt={selectedProduct.images[0].altText}
                      />
                    ) : (
                      <Icon source={ImageMajor} color="base" />
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
            {QRCode?.id && (
              <Button outline destructive onClick={deleteQRCode}>
                Delete QR code
              </Button>
            )}
          </FormLayout>
        </Form>
      </Layout.Section>
      <Layout.Section secondary>
        <Card sectioned title="QR Code">
          {QRCode?.id ? (
            <EmptyState
              imageContained={true}
              largeImage={new URL(
                `/qrcodes/${QRCode.id}/image`,
                location.toString()
              ).toString()}
            />
          ) : (
            <EmptyState>
              <p>Your QR code will appear here after you save.</p>
            </EmptyState>
          )}
          <Stack vertical>
            <Button fullWidth primary>
              Download
            </Button>
            <Button
              fullWidth
              onClick={goToDestination}
              disabled={!handle.value}
            >
              Go To Destination
            </Button>
          </Stack>
        </Card>
      </Layout.Section>
    </Layout>
  )
}
