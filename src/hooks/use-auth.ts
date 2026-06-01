import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  setAuthenticated: (value: boolean) => void;
  setInitializing: (value: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isInitializing: true,
  setAuthenticated: (value) => set({ isAuthenticated: value, isInitializing: false }),
  setInitializing: (value) => set({ isInitializing: value }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, isInitializing: false });
  },
}));

// Inicializar o listener do Supabase
supabase.auth.onAuthStateChange((event, session) => {
  const store = useAuthStore.getState();
  if (session) {
    store.setAuthenticated(true);
  } else {
    store.setAuthenticated(false);
  }
});

// Verificar sessão inicial
supabase.auth.getSession().then(({ data: { session } }) => {
  const store = useAuthStore.getState();
  if (session) {
    store.setAuthenticated(true);
  } else {
    store.setInitializing(false);
  }
});


