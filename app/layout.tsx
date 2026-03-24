/* eslint-disable @next/next/no-page-custom-font */
import type { ReactNode } from 'react';
import Providers from '../lib/providers';
import '../styles/globals.css';

export const metadata = {
  title: 'Char - Feuilles de perso',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  shrinkToFit: false,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bilbo+Swash+Caps&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
