/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
// import App from 'next/app'

// import '@fortawesome/fontawesome-svg-core/styles.css';
// import { library, config } from '@fortawesome/fontawesome-svg-core';
// import { faTimes } from '@fortawesome/free-solid-svg-icons';
// import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';
import Head from 'next/head';
import { SWRConfig } from 'swr';
import GlobalStyle from '../styles/GlobalStyle';
import { fetcher } from '../helpers/fetcher';
import { SystemProvider } from '../contexts/SystemContext';
import { MeProvider } from '../contexts/MeContext';

// See https://github.com/FortAwesome/react-fontawesome#integrating-with-other-tools-and-frameworks
// config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
// library.add(faCircle, faSquare, faTimes);

export function reportWebVitals(metric) {
  // These metrics can be sent to any analytics service
  console.log(metric);
}

const MyApp = ({ Component, pageProps }) => (
  <>
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
        <link
          href="https://fonts.googleapis.com/css2?family=Bilbo+Swash+Caps&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com/css2?family=Bilbo+Swash+Caps&display=swap"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/bilboswashcaps/v12/zrf-0GXbz-H3Wb4XBsGrTgq2PVmdmAripwZcOp4_mA.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/bilboswashcaps/v12/zrf-0GXbz-H3Wb4XBsGrTgq2PVmdmATipwZcOp4.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/CloisterBlack.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </Head>
      <GlobalStyle />
      <SystemProvider>
        <MeProvider>
          <Component {...pageProps} />
        </MeProvider>
      </SystemProvider>
    </SWRConfig>
  </>
);

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp;
