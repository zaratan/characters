import useSWR from 'swr';
import { MeType } from '../pages/api/types/MeType';

// This is to return a better type out of auth0-next me call.
export const useMe: () => MeType = () => {
  const { data } = useSWR('/api/me', {
    errorRetryCount: 0, // If it fails, it's probably because the user isn't logged-in
  });
  if (!data) return undefined;

  if (data.error !== undefined) {
    return { ...data, auth: false };
  }
  return { ...data, auth: true };
};
