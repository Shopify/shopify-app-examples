import { useNavigate } from '@shopify/app-bridge-react'
import { Card, Icon, IndexTable, Stack, TextStyle, Thumbnail, UnstyledLink } from '@shopify/polaris'
import { DiamondAlertMajor, ImageMajor } from '@shopify/polaris-icons'
import dayjs from 'dayjs'

export function QRCodeIndex({ QRCodes, loading }) {
  const navigate = useNavigate()
  const resourceName = {
    singular: 'QR code',
    plural: 'QR codes',
  }

  const rowMarkup = QRCodes.map(
    ({ id, title, product, discountCode, scans, createdAt }, index) => {
      const deletedProduct = product.title.includes('Deleted product')

      return (
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
              source={product?.images?.edges[0]?.node?.url || ImageMajor}
              alt="placeholder"
              color="base"
              size="small"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <UnstyledLink data-primary-link url={`/qrcodes/${id}`}>
              {title}
            </UnstyledLink>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Stack>
              {deletedProduct && <Icon source={DiamondAlertMajor} color="critical" />}
              <TextStyle variation={deletedProduct ? "negative" : null}>
                {product.title}
              </TextStyle>
            </Stack>
          </IndexTable.Cell>
          <IndexTable.Cell>{discountCode}</IndexTable.Cell>
          <IndexTable.Cell>
            {dayjs(createdAt).format('MMMM D, YYYY')}
          </IndexTable.Cell>
          <IndexTable.Cell>{scans}</IndexTable.Cell>
        </IndexTable.Row>
      )
    }
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
