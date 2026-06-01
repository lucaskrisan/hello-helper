import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <span className="text-5xl">🧠</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6 tracking-tight">
        Desafio da Mente
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
        O treino diário que mantém sua memória jovem e sua mente afiada. Feito com carinho para quem tem 50+.
      </p>
      
      <div className="space-y-4 w-full max-w-xs">
        <Button 
          onClick={() => navigate({ to: "/login" })}
          className="w-full bg-primary hover:bg-primary/90 text-white text-xl py-8 px-12 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          COMEÇAR AGORA
        </Button>
        <p className="text-sm text-gray-400">Gratuito para começar • Sem anúncios</p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-4 w-full max-w-sm">
        {[
          "✨ Exercícios que nunca se repetem",
          "🎯 Treino personalizado para você",
          "📈 Acompanhe sua evolução real",
        ].map((benefit) => (
          <div key={benefit} className="p-4 bg-white/50 rounded-2xl text-left border border-white/20">
            <span className="text-gray-700 font-medium">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


