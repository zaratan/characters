/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/prop-types */
// import App from 'next/app'

// import '@fortawesome/fontawesome-svg-core/styles.css';
// import { library, config } from '@fortawesome/fontawesome-svg-core';
// import { faCircle } from '@fortawesome/free-regular-svg-icons';
import Head from 'next/head';
import GlobalStyle from '../styles/GlobalStyle';

// See https://github.com/FortAwesome/react-fontawesome#integrating-with-other-tools-and-frameworks
// config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
// library.add(faCircle);

const MyApp = ({ Component, pageProps }) => (
  <>
    <Head>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
    </Head>
    <GlobalStyle />
    <Component {...pageProps} />
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
