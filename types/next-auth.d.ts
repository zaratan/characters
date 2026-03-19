import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isAdmin: boolean;
      hasOnboarded: boolean;
    };
  }
  interface User {
    isAdmin: boolean;
    hasOnboarded: boolean;
  }
}
