import 'next-auth';

declare module 'next-auth' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
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
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface User {
    isAdmin: boolean;
    hasOnboarded: boolean;
  }
}
