import { useNavigate } from '@shopify/app-bridge-react'
import { Card, IndexTable, Thumbnail, UnstyledLink } from '@shopify/polaris'
import { ShopcodesMajor } from '@shopify/polaris-icons'
import dayjs from 'dayjs'

export function QRCodeIndex({ QRCodes, loading }) {
  const navigate = useNavigate()
  const resourceName = {
    singular: 'QR code',
    plural: 'QR codes',
  }

  const rowMarkup = QRCodes.map(
    ({ id, title, product, discountCode, scans, createdAt }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        position={index}
        onClick={() => {
          navigate(`/qrcodes/${id}`)
        }}
      >
        <IndexTable.Cell>
          <Thumbnail
            source={product?.images?.edges[0]?.node?.url || ShopcodesMajor}
            alt="placeholder"
            size="small"
          />
        </IndexTable.Cell>
        <IndexTable.Cell>
          <UnstyledLink data-primary-link url={`/qrcodes/${id}`}>
            {title}
          </UnstyledLink>
        </IndexTable.Cell>
        <IndexTable.Cell>{product.title}</IndexTable.Cell>
        <IndexTable.Cell>{discountCode}</IndexTable.Cell>
        <IndexTable.Cell>
          {dayjs(createdAt).format('MMMM D, YYYY')}
        </IndexTable.Cell>
        <IndexTable.Cell>{scans}</IndexTable.Cell>
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
        ]}
        selectable={false}
        loading={loading}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  )
}
