import type { LoginResponseData } from '../types';
import { useAuthStore } from './use-auth-store';
import { syncProfileToStores } from './sync-profile-to-stores';

export function setLoginSession({ storeAdmin, token }: LoginResponseData) {
  useAuthStore.getState().setToken(token);
  syncProfileToStores(storeAdmin);
}
