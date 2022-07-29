/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
// import App from 'next/app'

// import '@fortawesome/fontawesome-svg-core/styles.css';
// import { library, config } from '@fortawesome/fontawesome-svg-core';
// import { faTimes } from '@fortawesome/free-solid-svg-icons';
// import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import { UserProvider } from '@auth0/nextjs-auth0';
import GlobalStyle from '../styles/GlobalStyle';
import { fetcher } from '../helpers/fetcher';
import { SystemProvider } from '../contexts/SystemContext';
import { MeProvider } from '../contexts/MeContext';
import { ThemeContextProvider } from '../contexts/ThemeContext';
import ThemeProvider from '../styles/Theme';

// See https://github.com/FortAwesome/react-fontawesome#integrating-with-other-tools-and-frameworks
// config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
// library.add(faCircle, faSquare, faTimes);

export function reportWebVitals(metric) {
  // These metrics can be sent to any analytics service
  console.log(metric);
}

const MyApp = ({ Component, pageProps }) => (
  <ThemeContextProvider>
    <ThemeProvider>
      <UserProvider>
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
      </UserProvider>
    </ThemeProvider>
  </ThemeContextProvider>
);

export default MyApp;
