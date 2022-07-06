import { Card, Page, EmptyState, List } from '@shopify/polaris';
import { ResourcePicker } from '@shopify/app-bridge-react';
import { useState } from 'react';

export function HomePage() {
  const [resourcePickerOpen, setResourcePickerOpen] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const emptyState = (
    <EmptyState
      heading="Create a Subscription box"
      action={{
        content: 'Select Products',
        onAction: () => setResourcePickerOpen(true),
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Select products to create a subscription plan</p>
    </EmptyState>
  );

  const productList = (
    <List>
      {selectedProducts.map(({ title }) => (
        <List.Item> {title}</List.Item>
      ))}
    </List>
  );

  return (
    <Page fullWidth>
      <Card sectioned>
        {selectedProducts.length ? productList : emptyState}
        <ResourcePicker
          resourceType="Product"
          open={resourcePickerOpen}
          onSelection={(selectPayload) => {
            console.log(selectPayload.selection);

            setResourcePickerOpen(false);
            setSelectedProducts(selectPayload.selection);
          }}
        />
      </Card>
    </Page>
  );
}
