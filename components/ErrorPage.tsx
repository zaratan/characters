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
`;

const LinkButton = styled.button`
  margin-left: 0.25rem;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font: inherit;
  padding: 0;
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
        <LinkButton
          onClick={() => signIn(undefined, { callbackUrl: returnUrl })}
        >
          Connectez-vous s&apos;il vous plaît.
        </LinkButton>
      </ErrorMessage>
      <Footer withoutEmptyLines />
    </MainContainer>
  );
};

export default ErrorPage;
