import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GitHubProvider from 'next-auth/providers/github';
import { Resend } from 'resend';

import { customPgAdapter } from './auth-adapter';

const isTestEnv =
  process.env.NODE_ENV === 'test' || Boolean(process.env.PLAYWRIGHT);

const providers: NextAuthOptions['providers'] = [];

if (process.env.EMAIL_FROM && process.env.RESEND_API_KEY) {
  const emailFrom = process.env.EMAIL_FROM;
  const resendApiKey = process.env.RESEND_API_KEY;
  providers.push(
    EmailProvider({
      from: emailFrom,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: emailFrom,
          to: email,
          subject: 'Connexion à Vampire Char',
          html: `<p>Clique sur ce lien pour te connecter :</p><p><a href="${url}">Se connecter</a></p>`,
        });
      },
    })
  );
} else if (!isTestEnv) {
  console.warn(
    'AuthOptions: EmailProvider disabled — EMAIL_FROM or RESEND_API_KEY is missing.'
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
} else if (!isTestEnv) {
  console.warn(
    'AuthOptions: GitHubProvider disabled — GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing.'
  );
}

export const authOptions: NextAuthOptions = {
  adapter: customPgAdapter(),
  providers,
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.isAdmin = user.isAdmin ?? false;
      session.user.hasOnboarded = user.hasOnboarded ?? false;
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);
