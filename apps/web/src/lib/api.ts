import ky from 'ky';
import { authClient } from './auth-client';
import { router } from '../router';

export const api = ky.create({
  prefix: `${import.meta.env.VITE_API_URL}/api`,
  credentials: 'include',
  hooks: {
    afterResponse: [
      async ({ response }) => {
        if (response.status === 401) {
          await authClient.signOut();
          router.navigate('/login');
        }
      },
    ],
  },
});
