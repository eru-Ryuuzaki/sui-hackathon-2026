import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  address: string;
  codename: string;
  avatarId: number;
  createdAt: number;
}

interface UserStore {
  users: Record<string, UserProfile>;
  currentUser: UserProfile | null;
  // Actions
  login: (address: string) => boolean; // Returns true if user exists, false if new
  register: (address: string, codename: string) => void;
  logout: () => void;
}

const AVATAR_COUNT = 10;

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      users: {},
      currentUser: null,

      login: (address) => {
        const user = get().users[address];
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      register: (address, codename) => {
        // Deterministic avatar based on address hash
        const hash = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const avatarId = hash % AVATAR_COUNT;

        const newUser: UserProfile = {
          address,
          codename,
          avatarId,
          createdAt: Date.now(),
        };

        set((state) => ({
          users: { ...state.users, [address]: newUser },
          currentUser: newUser,
        }));
      },

      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'engram_users_storage',
    }
  )
);
