import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
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
        Vous n'êtes pas autorisé à voir cette page.
        <a href={`/api/auth/login?return=${returnUrl}`}>
          Connectez-vous s'il vous plaît.
        </a>
      </ErrorMessage>
      <Footer withoutEmptyLines />
    </MainContainer>
  );
};

export default ErrorPage;
