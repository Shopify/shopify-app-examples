import { useNavigate } from '@shopify/app-bridge-react'
import { Button, Card, IndexTable, Thumbnail } from '@shopify/polaris'
import dayjs from 'dayjs'


export function CodeIndex({QRCodes}) {
  const navigate = useNavigate();
  const resourceName = {
    singular: 'code',
    plural: 'codes',
  }

  const rowMarkup = QRCodes.map(
    (
      {
        id,
        title,
        product,
        discountId,
        discountCode,
        scans,
        conversions,
        createdAt,
      },
      index
    ) => (
      <IndexTable.Row id={id} key={id} position={index}>
        <IndexTable.Cell>
          <Thumbnail
            source={product?.images?.edges[0]?.node?.url || undefined}
            alt="placeholder"
            size="small"
          />
        </IndexTable.Cell>
        <IndexTable.Cell>{title}</IndexTable.Cell>
        <IndexTable.Cell>{product.title}</IndexTable.Cell>
        <IndexTable.Cell>{discountCode}</IndexTable.Cell>
        <IndexTable.Cell>
          {dayjs(createdAt).format('MMMM D, YYYY')}
        </IndexTable.Cell>
        <IndexTable.Cell>{scans}</IndexTable.Cell>
        <IndexTable.Cell>{conversions}</IndexTable.Cell>
        <IndexTable.Cell>
          <Button onClick={() => navigate(`/codes/edit/${id}`)}>Edit</Button>
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  )

  return (
    <Card>
      <IndexTable
        resourceName={resourceName}
        itemCount={QRCodes.length}
        headings={[
          { title: 'Thumbnail', hidden: true },
          { title: 'Title' },
          { title: 'Product' },
          { title: 'Discount' },
          { title: 'Date created' },
          { title: 'Scans' },
          { title: 'Conversions' },
        ]}
        selectable={false}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  )
}
