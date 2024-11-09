import { create } from 'zustand';
import { 
  signInWithPopup,
  type User,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../lib/firebase';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Enable persistent auth state
  setPersistence(auth, browserLocalPersistence).catch(console.error);

  // Set up auth state listener
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    set({ user, loading: false, initialized: true });
  });

  return {
    user: null,
    loading: true,
    error: null,
    initialized: false,

    setUser: (user) => set({ user }),
    setLoading: (loading) => set({ loading }),

    signInWithGoogle: async () => {
      try {
        set({ loading: true, error: null });
        const result = await signInWithPopup(auth, googleProvider);
        set({ user: result.user });
        toast.success('Successfully signed in!');
      } catch (error: any) {
        console.error('Google sign-in error:', error);
        set({ error: error.message });
        toast.error('Unable to sign in with Google');
      } finally {
        set({ loading: false });
      }
    },

    signInWithGithub: async () => {
      try {
        set({ loading: true, error: null });
        const result = await signInWithPopup(auth, githubProvider);
        set({ user: result.user });
        toast.success('Successfully signed in!');
      } catch (error: any) {
        console.error('GitHub sign-in error:', error);
        set({ error: error.message });
        toast.error('Unable to sign in with GitHub');
      } finally {
        set({ loading: false });
      }
    },

    signOut: async () => {
      try {
        set({ loading: true });
        await auth.signOut();
        set({ user: null });
        toast.success('Successfully signed out!');
      } catch (error: any) {
        console.error('Sign out error:', error);
        set({ error: error.message });
        toast.error('Unable to sign out');
      } finally {
        set({ loading: false });
      }
    },

    clearError: () => set({ error: null })
  };
});