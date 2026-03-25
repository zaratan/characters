'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import Footer from './Footer';
import Nav from './Nav';

export const LoginRedirectLSKey = 'Characters:PostLogin:Redirect';

const ErrorPage = () => {
  const [returnUrl, setReturnUrl] = useState('/');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync browser-only value at mount
    setReturnUrl(window.location.pathname);
  }, []);

  return (
    <main className="flex justify-between flex-col h-full">
      <Nav returnTo={returnUrl} />
      <div className="text-center">
        Vous n&apos;êtes pas autorisé à voir cette page.
        <button
          className="ml-1 underline bg-transparent cursor-pointer text-inherit"
          onClick={() => signIn(undefined, { callbackUrl: returnUrl })}
        >
          Connectez-vous s&apos;il vous plaît.
        </button>
      </div>
      <Footer withoutEmptyLines />
    </main>
  );
};

export default ErrorPage;
