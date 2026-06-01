import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false });
  },
}));

// Inicializar o listener do Supabase
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    useAuthStore.getState().setAuthenticated(true);
  } else {
    useAuthStore.getState().setAuthenticated(false);
  }
});

// Verificar sessão inicial
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    useAuthStore.getState().setAuthenticated(true);
  }
});

