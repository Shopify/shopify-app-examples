import { useState, useCallback } from 'react'
import {
  Card,
  Form,
  FormLayout,
  Page,
  Layout,
  TextField,
  Button,
  ChoiceList,
  Select,
  EmptyState,
  Thumbnail,
  Icon,
  Stack,
  TextStyle,
  Image,
} from '@shopify/polaris'
import {
  ContextualSaveBar,
  TitleBar,
  ResourcePicker,
  useNavigate,
  useAppBridge,
} from '@shopify/app-bridge-react'
import { ImageMajor, AlertMinor } from '@shopify/polaris-icons'
import { useShopifyQuery } from 'hooks/useShopifyQuery'
import { gql } from 'graphql-request'
import { useForm, useField, notEmptyString } from '@shopify/react-form'

import { useAuthenticatedFetch } from 'hooks/useAuthenticatedFetch'

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

export function CodeEditForm({ id, initialValues }) {
  const [showResourcePicker, setShowResourcePicker] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(initialValues.product)
  const navigate = useNavigate()
  const fetch = useAuthenticatedFetch()

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
        value: initialValues.title || '',
        validates: [notEmptyString('Please name your QR code')],
      }),
      productId: useField({
        value: initialValues.product.id || '',
        validates: [notEmptyString('Please select a product')],
      }),
      variantId: useField(initialValues.variantId || ''),
      handle: useField(initialValues.handle || ''),
      destination: useField([initialValues.destination] || ['product']),
      discountId: useField(
        initialValues.discountId || NO_DISCOUNT_OPTION.value
      ),
      discountCode: useField(initialValues.discountCode || ''),
    },
    onSubmit: async (body) => {
      const parsedBody = body
      parsedBody.destination = parsedBody.destination[0]

      const response = await fetch(`/api/qrcodes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(parsedBody),
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        // What to do, what to do?
      }
    },
  })

  const app = useAppBridge()

  const handleProductChange = useCallback(({ id, selection }) => {
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
    discountCode.onChange(DISCOUNT_CODES[id])
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
    <Page fullWidth>
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
      <TitleBar title="New code" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Form onSubmit={() => console.log('hi')}>
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
                <Card.Section
                  title="Scan Destination"
                  actions={[
                    {
                      content: 'Preview',
                      onAction: () => console.log('preview'),
                    },
                  ]}
                >
                  <ChoiceList
                    title="Scan destination"
                    titleHidden
                    choices={[
                      { label: 'Link to product page', value: 'product' },
                      {
                        label: 'Link to checkout page with product in the card',
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
                      navigate(`${app.hostOrigin}/admin/discounts`),
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
            <EmptyState
              imageContained={true}
              largeImage={initialValues.imageUrl}
            />
            <Button fullWidth primary disabled>
              Download
            </Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
