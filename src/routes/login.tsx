import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate({ to: "/dashboard" });
    } else {
      setError("Credenciais inválidas");
    }
  };

  return (
    <div className="min-h-screen bg-[#2D3A2F] flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 bg-white/5 backdrop-blur-md border-0 shadow-2xl rounded-3xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Desafio da Mente</h1>
          <p className="text-white/60">Entre para continuar seu treino</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-0 text-white placeholder:text-white/40 h-14 rounded-2xl px-6 focus-visible:ring-1 focus-visible:ring-[#4CAF50]"
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-0 text-white placeholder:text-white/40 h-14 rounded-2xl px-6 focus-visible:ring-1 focus-visible:ring-[#4CAF50]"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <Button 
            type="submit"
            className="w-full h-14 text-lg font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-2xl transition-all shadow-lg"
          >
            ENTRAR
          </Button>
        </form>
      </Card>
    </div>
  );
}
