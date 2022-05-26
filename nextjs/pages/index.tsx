import gql from 'graphql-tag'
import Link from 'next/link'
import { useQuery } from '@apollo/client'
import { initializeApollo } from '../apollo/client'

const ViewerQuery = gql`
  query ViewerQuery {
    viewer {
      id
      name
      status
    }
  }
`

const Index = () => {
  const {
    data
  } = useQuery(ViewerQuery)

  return (
    <div>
      You're signed in as {data?.viewer.name} and you're {data?.viewer.status} goto{' '}
      <Link href="/about">
        <a>static</a>
      </Link>{' '}
      page.
    </div>
  )
}

export default Index
