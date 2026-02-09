import { create } from 'zustand';

interface EncryptionStore {
  sessionKey: CryptoKey | null;
  setSessionKey: (key: CryptoKey) => void;
  clearSessionKey: () => void;
}

export const useEncryptionStore = create<EncryptionStore>((set) => ({
  sessionKey: null,
  setSessionKey: (key) => set({ sessionKey: key }),
  clearSessionKey: () => set({ sessionKey: null }),
}));
