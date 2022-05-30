import { useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Provider } from '@shopify/app-bridge-react'

const APPBRIDGE_HOST = new URLSearchParams(location.search).get('host')

export function AppBridgeProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const history = useMemo(
    () => ({
      replace: (path) => {
        navigate(path, { replace: true })
      },
    }),
    [navigate]
  )

  const routerConfig = useMemo(
    () => ({ history, location }),
    [history, location]
  )

  return (
    <Provider
      config={{
        apiKey: process.env.SHOPIFY_API_KEY,
        host: APPBRIDGE_HOST,
        forceRedirect: true,
      }}
      router={routerConfig}
    >
      {children}
    </Provider>
  )
}
