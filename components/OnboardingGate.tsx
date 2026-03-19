'use client';

import { useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import MeContext from '../contexts/MeContext';

const EXEMPT_PATHS = ['/profile'];

const OnboardingGate = ({ children }: { children: React.ReactNode }) => {
  const { me, connected, loading } = useContext(MeContext);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      !loading &&
      connected &&
      me &&
      !me.hasOnboarded &&
      !EXEMPT_PATHS.includes(pathname)
    ) {
      router.replace('/profile');
    }
  }, [loading, connected, me, pathname, router]);

  return <>{children}</>;
};

export default OnboardingGate;
