import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  address: string;
  codename: string;
  avatarSeed: string;
  birthday?: string; // ISO Date string
  createdAt: number;
  constructId?: string; // Added constructId
}

interface UserStore {
  users: Record<string, UserProfile>;
  currentUser: UserProfile | null;
  // Actions
  login: (address: string) => boolean;
  register: (address: string, codename: string, constructId?: string) => void;
  updateAvatar: (address: string, newSeed: string) => void;
  updateBirthday: (address: string, birthday: string) => void; // New Action
  logout: () => void;
}

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

      register: (address, codename, constructId) => {
        // Mock Construct ID generation if not provided
        const finalConstructId =
          constructId ||
          `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;

        const newUser: UserProfile = {
          address,
          codename,
          avatarSeed: address,
          createdAt: Date.now(),
          constructId: finalConstructId,
        };

        set((state) => ({
          users: { ...state.users, [address]: newUser },
          currentUser: newUser,
        }));
      },

      updateAvatar: (address, newSeed) => {
        set((state) => {
          const updatedUser = { ...state.users[address], avatarSeed: newSeed };
          const newCurrentUser =
            state.currentUser?.address === address
              ? updatedUser
              : state.currentUser;

          return {
            users: { ...state.users, [address]: updatedUser },
            currentUser: newCurrentUser,
          };
        });
      },

      updateBirthday: (address, birthday) => {
        set((state) => {
          const updatedUser = { ...state.users[address], birthday };
          const newCurrentUser =
            state.currentUser?.address === address
              ? updatedUser
              : state.currentUser;

          return {
            users: { ...state.users, [address]: updatedUser },
            currentUser: newCurrentUser,
          };
        });
      },

      logout: () => set({ currentUser: null }),
    }),
    {
      name: "engram_users_storage_v3", // Bump version to invalidate old users without constructId
    },
  ),
);
