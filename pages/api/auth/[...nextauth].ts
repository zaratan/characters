import NextAuth, { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import GitHubProvider from 'next-auth/providers/github';
import { Resend } from 'resend';

import { customPgAdapter } from '../../../lib/auth-adapter';

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: customPgAdapter(),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier: email, url }) => {
        await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: 'Connexion à Vampire Char',
          html: `<p>Clique sur ce lien pour te connecter :</p><p><a href="${url}">Se connecter</a></p>`,
        });
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.isAdmin = user.isAdmin ?? false;
      return session;
    },
  },
};

export default NextAuth(authOptions);
