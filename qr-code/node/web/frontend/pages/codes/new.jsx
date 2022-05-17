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
  Checkbox,
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
} from '@shopify/app-bridge-react'
import { ImageMajor } from '@shopify/polaris-icons'
import { useShopifyQuery } from 'hooks/useShopifyQuery'
import { gql } from 'graphql-request'

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
  const [title, setTitle] = useState('')
  const [selectedProduct, setSelectedProduct] = useState({})
  const [destination, setDestination] = useState(['product'])
  const [discount, setDiscount] = useState(false)
  const [selectedDiscount, setSelectedDiscount] = useState('')
  const [showResourcePicker, setShowResourcePicker] = useState(false)

  const handleProductChange = useCallback(({ id, selection }) => {
    const [{ title, images }] = selection
    setSelectedProduct({
      title,
      images,
    })
  }, [])

  const handleDestinationChange = useCallback(
    (newDestination) => setDestination(newDestination),
    []
  )
  const handleDiscountChange = useCallback((value) => setDiscount(value), [])
  const handleSelectedDiscount = useCallback(
    (value) => setSelectedDiscount(value),
    []
  )
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
    ? discounts.data.automaticDiscountNodes.edges.map(
        ({ node: { id, automaticDiscount } }) => ({
          id,
          key: id,
          label: `${automaticDiscount.title} (${automaticDiscount.status})`,
        })
      )
    : []

  return (
    <Page fullWidth>
      <ContextualSaveBar
        saveAction={{ label: 'Save', onAction: () => console.log('save') }}
        discardAction={{
          label: 'Discard',
          onAction: () => console.log('save'),
        }}
        visible={title}
        fullWidth
      />
      <TitleBar title="New code" primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Form onSubmit={() => console.log('hi')}>
            <FormLayout>
              <Card sectioned title="Title">
                <TextField
                  value={title}
                  onChange={(value) => setTitle(value)}
                  type="text"
                  label="Title"
                  labelHidden
                  helpText="Only store staff can see this title"
                />
              </Card>

              <Card
                title="Product"
                actions={[
                  {
                    content: selectedProduct.title
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
                  {selectedProduct.title ? (
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
                    <Button onClick={toggleResourcePicker}>
                      Select product
                    </Button>
                  )}
                </Card.Section>
                <Card.Section
                  title="Scan Destination"
                  actions={[
                    {
                      content: 'Preview',
                      onAction: () => console.log('scan destination'),
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
                    selected={destination}
                    onChange={handleDestinationChange}
                  />
                </Card.Section>
              </Card>
              <Card
                sectioned
                title="Discount"
                actions={[
                  {
                    content: 'Create discount',
                    onAction: () => console.log('discount'),
                  },
                ]}
              >
                <Checkbox
                  label="Apply a discount code"
                  checked={discount}
                  onChange={handleDiscountChange}
                />
                <Select
                  label="discount code"
                  options={discountOptions}
                  onChange={handleSelectedDiscount}
                  value={selectedDiscount}
                  placeholder="discount code name"
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
