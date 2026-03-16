import '../styles/globals.css';

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */

import Head from 'next/head';
import { SWRConfig } from 'swr';
import { SessionProvider } from 'next-auth/react';
import GlobalStyle from '../styles/GlobalStyle';
import { fetcher } from '../helpers/fetcher';
import { SystemProvider } from '../contexts/SystemContext';
import { MeProvider } from '../contexts/MeContext';
import { ThemeContextProvider } from '../contexts/ThemeContext';
import ThemeProvider from '../styles/Theme';

export function reportWebVitals(metric) {
  // These metrics can be sent to any analytics service
  console.log(metric);
}

const MyApp = ({ Component, pageProps }) => (
  <ThemeContextProvider>
    <ThemeProvider>
      <SessionProvider session={pageProps.session}>
        <SWRConfig
          value={{
            fetcher,
          }}
        >
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
          </Head>
          <GlobalStyle />
          <SystemProvider>
            <MeProvider>
              <Component {...pageProps} />
            </MeProvider>
          </SystemProvider>
        </SWRConfig>
      </SessionProvider>
    </ThemeProvider>
  </ThemeContextProvider>
);

export default MyApp;
