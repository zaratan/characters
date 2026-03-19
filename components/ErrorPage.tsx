'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { signIn } from 'next-auth/react';
import Footer from './Footer';
import Nav from './Nav';

const MainContainer = styled.main`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  height: 100%;
`;

const ErrorMessage = styled.div`
  text-align: center;

  a {
    margin-left: 0.25rem;
    text-decoration: underline;
  }
`;

export const LoginRedirectLSKey = 'Characters:PostLogin:Redirect';

const ErrorPage = () => {
  const [returnUrl, setReturnUrl] = useState('/');

  useEffect(() => {
    setReturnUrl(window.location.pathname);
  }, []);

  return (
    <MainContainer>
      <Nav returnTo={returnUrl} />
      <ErrorMessage>
        Vous n&apos;êtes pas autorisé à voir cette page.
        <a
          onClick={() => signIn(undefined, { callbackUrl: returnUrl })}
          style={{ cursor: 'pointer' }}
        >
          Connectez-vous s&apos;il vous plaît.
        </a>
      </ErrorMessage>
      <Footer withoutEmptyLines />
    </MainContainer>
  );
};

export default ErrorPage;
