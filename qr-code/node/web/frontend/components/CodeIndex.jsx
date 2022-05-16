import { Card, IndexTable, Thumbnail } from "@shopify/polaris";

export function CodeIndex() {
  const thumbnail = <Thumbnail
    source="https://burst.shopifycdn.com/photos/black-leather-choker-necklace_373x@2x.jpg"
    alt="Black choker necklace"
    size="small"
  />
  const codes = [
    {
      id: '3411',
      thumbnail,
      title: 'Aeropress',
      product: 'Aeropress Brewer',
      discount: '-',
      dateCreated: Date.now(),
      scans: '10,019',
      conversions: '4,930',
    },
    {
      id: '3412',
      thumbnail,
      title: 'Aeropress sale',
      product: 'Aeropress Go Brewer',
      discount: 'spring15',
      dateCreated: Date.now(),
      scans: '874',
      conversions: '547',
    },
  ];

  const resourceName = {
    singular: 'code',
    plural: 'codes',
  };

  const rowMarkup = codes.map(
    ({id, thumbnail, title, product, discount, dateCreated, scans, conversions}, index) => (
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell>{thumbnail}</IndexTable.Cell>
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell>{product}</IndexTable.Cell>
        <IndexTable.Cell>{discount}</IndexTable.Cell>
        <IndexTable.Cell>{dateCreated}</IndexTable.Cell>
        <IndexTable.Cell>{scans}</IndexTable.Cell>
        <IndexTable.Cell>{conversions}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Card>
      <IndexTable
        resourceName={resourceName}
        itemCount={codes.length}
        headings={[
          {title: 'Thumbnail', hidden: true},
          {title: 'Title'},
          {title: 'Product'},
          {title: 'Discount'},
          {title: 'Date created'},
          {title: 'Scans'},
          {title: 'Conversions'},
        ]}
        selectable={false}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}
