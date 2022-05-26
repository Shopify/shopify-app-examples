import { useMemo } from 'react';
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import {
  Provider as AppBridgeProvider,
  useAppBridge,
} from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import { AppProvider as PolarisProvider } from "@shopify/polaris";
import translations from "@shopify/polaris/locales/en.json";
import { useRouteChangeLoader } from "../hooks/useRouteChangeLoader";
import { fetch } from "../app-bridge/fetch";
import { Link } from '../components/Link';
import { RoutePropagator } from '../components/RoutePropagator';
import "@shopify/polaris/build/esm/styles.css";


// import { useApollo } from '../apollo/client'

/**
 * React Apollo Context Provider configuration
 * Done as a separate component so we could use App Bridge Context
 * App Bridge is configured and made available bellow in App component
 *
 * More on Apollo Context Provider:
 * https://www.apollographql.com/docs/react/api/react/hooks/#the-apolloprovider-component
 */
function ConfiguredApolloProvider({ children }) {
  const app = useAppBridge();

  const client = useMemo(
    () =>
      new ApolloClient({
        // configuring custom fetch so we could have reusable App Bridge logic on requests
        fetch: fetch(app),
        fetchOptions: {
          credentials: "include",
        },
        cache: new InMemoryCache(),
      } as any),
    [app]
  );

  useRouteChangeLoader();

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

function App({ Component, pageProps, host = 'localhost' }) {
  // const apolloClient = useApollo(pageProps.initialApolloState)
  console.warn('HOST', host, pageProps)

  return (
      <AppBridgeProvider
      config={
        {
          host,
          apiKey: process.env.SHOPIFY_API_KEY,
          forceRedirect: true,
        }
      }>

        <RoutePropagator />
        <PolarisProvider i18n={translations} linkComponent={Link}>
            <ConfiguredApolloProvider>
              <Component {...pageProps} />
            </ConfiguredApolloProvider >
        </PolarisProvider>
      </AppBridgeProvider>
  )
}

App.getInitialProps = async ({ ctx }) => {
  return {
    host: ctx.query.host,
  };
};

export default App;
