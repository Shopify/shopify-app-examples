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

const NO_DISCOUNT_OPTION = { label: 'No discount', value: 'no-discount' }

const DISCOUNTS_QUERY = gql`
  query discounts($first: Int!) {
    automaticDiscountNodes(first: $first) {
      edges {
        node {
          id
          automaticDiscount {
            __typename
            ... on DiscountAutomaticBxgy {
              status
              title
            }
            ... on DiscountAutomaticBasic {
              status
              title
            }
          }
        }
      }
    }
  }
`

export default function NewCode() {
  const [showResourcePicker, setShowResourcePicker] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState({})

  const {
    fields: { title, selectedProductId, destination, discount },
    dirty,
    reset,
    submitting,
    submit,
  } = useForm({
    fields: {
      title: useField({
        value: '',
        validates: [notEmptyString('Please name your QR code')],
      }),
      selectedProductId: useField({
        value: '',
        validates: [notEmptyString('Please select a product')],
      }),
      destination: useField(['product']),
      discount: useField(NO_DISCOUNT_OPTION.value),
    },
    onSubmit: async () => {
      // TODO: Mocking the submit request for now
      return new Promise((resolve) => setTimeout(resolve, 4000))
    },
  })

  const navigate = useNavigate()
  const app = useAppBridge()

  const handleProductChange = useCallback(({ id, selection }) => {
    // TODO: Storing product details, and product ID seperately is a hack
    // This will be fixed when this form queries the product data
    setSelectedProduct({
      title: selection[0].title,
      images: selection[0].images,
      handle: selection[0].handle,
    })
    selectedProductId.onChange(id)
    setShowResourcePicker(false)
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
        ...discounts.data.automaticDiscountNodes.edges.map(
          ({ node: { id, automaticDiscount } }) => ({
            label: `${automaticDiscount.title} (${automaticDiscount.status})`,
            value: id,
          })
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
                    content: selectedProductId.value
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
                  {selectedProductId.value ? (
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
                      {selectedProductId.error && (
                        <Stack spacing="tight">
                          <Icon source={AlertMinor} color="critical" />
                          <TextStyle variation="negative">
                            {selectedProductId.error}
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
                title="Discount code"
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
                  onChange={discount.onChange}
                  value={discount.value}
                  disabled={isLoadingDiscounts || discountsError}
                  labelHidden
                />
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>
        <Layout.Section secondary>
          <Card sectioned title="QR Code">
            <EmptyState>
              <p>A preview of your Shopcode will show here after you save.</p>
            </EmptyState>
            <Button fullWidth primary disabled>
              Download
            </Button>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  )
}
