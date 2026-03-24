import type { ReactNode } from 'react';
import { Bilbo_Swash_Caps } from 'next/font/google';
import Providers from '../lib/providers';
import '../styles/globals.css';

const bilbo = Bilbo_Swash_Caps({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bilbo-face',
});

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
    <html lang="fr" className={bilbo.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
