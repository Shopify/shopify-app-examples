import { useNavigate } from '@shopify/app-bridge-react'
import { Card, Icon, IndexTable, Stack, TextStyle, Thumbnail, UnstyledLink } from '@shopify/polaris'
import { DiamondAlertMajor, ImageMajor } from '@shopify/polaris-icons'
import { useMedia } from '@shopify/react-hooks'
import dayjs from 'dayjs'

import {truncate} from '../helpers'

function SmallScreenCard({ id, title, product, discountCode, scans, createdAt, navigate }) {
  return (
    <UnstyledLink onClick={() => navigate(`/qrcodes/${id}`)}>
      <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E1E3E5' }}>
        <Stack>
          <Stack.Item>
            <Thumbnail
              source={product?.images?.edges[0]?.node?.url || ImageMajor}
              alt="placeholder"
              color="base"
              size="small"
            />
          </Stack.Item>
          <Stack.Item fill>
            <Stack vertical={true}>
              <Stack.Item>
              <p>
                <TextStyle variation="strong">{truncate(title, 35)}</TextStyle>
              </p>
              <p>{truncate(product?.title, 35)}</p>
              <p>{dayjs(createdAt).format('MMMM D, YYYY')}</p>
              </Stack.Item>
              <div style={{display: 'flex'}}>
                <div style={{flex: '3'}}>
                  <TextStyle variation="subdued">Discount</TextStyle>
                  <p>{discountCode || '-'}</p>
                </div>
                <div style={{flex: '2'}}>
                  <TextStyle variation="subdued">Scans</TextStyle>
                  <p>{scans}</p>
                </div>
              </div>
            </Stack>
          </Stack.Item>
        </Stack>
      </div>
    </UnstyledLink>
  )
}

export function QRCodeIndex({ QRCodes, loading }) {
  const navigate = useNavigate()
  const isSmallScreen = useMedia('(max-width: 640px)')

  const smallScreenMarkup = QRCodes.map((QRCode) => (
    <SmallScreenCard key={QRCode.id} navigate={navigate} {...QRCode}/>
  ))

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
              {truncate(title, 25)}
            </UnstyledLink>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Stack>
              {deletedProduct && <Icon source={DiamondAlertMajor} color="critical" />}
              <TextStyle variation={deletedProduct ? "negative" : null}>
              {truncate(product?.title, 25)}
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
      {isSmallScreen ? smallScreenMarkup : (
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
      )}
    </Card>
  )
}
