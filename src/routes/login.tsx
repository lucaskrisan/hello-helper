import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Login de Super Admin
    if (email === 'trafegocomkrisan@gmail.com') {
      useAuthStore.getState().setAuthenticated(true);
      localStorage.setItem('mente_ativa_is_super_admin', 'true');
      navigate({ to: "/admin", replace: true });
      setLoading(false);
      return;
    }

    // Primeiro tentamos o login mock para manter a facilidade de acesso
    if (email === 'cliente713@sonomilitar.com' && password === 'c713') {
      useAuthStore.getState().setAuthenticated(true);
      navigate({ to: "/dashboard", replace: true });
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#2D3A2F] flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white/5 backdrop-blur-md border-0 shadow-2xl rounded-3xl">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Desafio da Mente</h1>
          <p className="text-white/60 text-sm sm:text-base">Entre para continuar seu treino</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-0 text-white placeholder:text-white/40 h-12 sm:h-14 rounded-2xl px-6 focus-visible:ring-1 focus-visible:ring-[#4CAF50] text-sm sm:text-base"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-0 text-white placeholder:text-white/40 h-12 sm:h-14 rounded-2xl px-6 focus-visible:ring-1 focus-visible:ring-[#4CAF50] text-sm sm:text-base"
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs sm:text-sm text-center">{error}</p>}

          <Button 
            type="submit"
            disabled={loading}
            className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-2xl transition-all shadow-lg mt-2"
          >
            {loading ? "CARREGANDO..." : "ENTRAR"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

