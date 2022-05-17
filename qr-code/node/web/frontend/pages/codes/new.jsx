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
  Thumbnail
} from '@shopify/polaris'
import {
  ContextualSaveBar,
  TitleBar,
  ResourcePicker,
} from '@shopify/app-bridge-react'

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

  console.log({ selectedProduct })

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
                    content: 'Select product',
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
                    <>
                    <Thumbnail 
                      source={selectedProduct.images[0].originalSrc}
                      alt={selectedProduct.images[0].alt}
                    />
                    <div>{selectedProduct.title}</div>
                    </>
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
                  options={[{ label: 'sample', value: 'sample' }]}
                  onChange={handleSelectedDiscount}
                  value={selectedDiscount}
                  placeholder="discount code name"
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
