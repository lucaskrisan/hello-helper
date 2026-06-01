import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";

export const Route = createFileRoute("/welcome")({
  component: Welcome,
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: search.session_id as string | undefined,
  }),
});

function Welcome() {
  const { session_id } = useSearch({ from: "/welcome" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const setAuthenticated = useAuthStore(state => state.setAuthenticated);

  useEffect(() => {
    async function handleAcesso() {
      // 1. Tentar recuperar a sessão
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, is_premium")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        setUserName(profile?.name || "");
        setAuthenticated(true);
        setLoading(false);
      } else if (session_id) {
        // Se houver session_id mas não houver login, o webhook pode estar processando
        // Vamos aguardar um pouco e tentar verificar se o perfil já foi marcado como premium
        // ou se o usuário foi criado. No MVP, tentamos o login automático se o Stripe
        // suportasse passar o e-mail de volta, mas aqui dependemos do Magic Link enviado por e-mail.
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
    handleAcesso();
  }, [session_id, setAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">Liberando seu acesso premium...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md p-8 bg-white rounded-[2.5rem] shadow-2xl text-center border-none relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          🎉 Bem-vinda{userName ? `, ${userName}` : ""}!
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </h1>
        
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          Seu acesso já está liberado. <br />
          Seu primeiro desafio está pronto para começar.
        </p>

        <div className="bg-[#F7F3EA] p-6 rounded-2xl mb-8 text-left border-l-4 border-primary">
          <p className="text-sm font-bold text-primary uppercase mb-1">Dica de hoje</p>
          <p className="text-gray-700 italic">"O segredo para uma mente afiada é a consistência. 5 minutos por dia mudam tudo."</p>
        </div>

        <Button 
          onClick={() => navigate({ to: "/game", search: { mode: 'daily' } })}
          className="w-full py-10 text-2xl font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95 uppercase tracking-wide"
        >
          COMEÇAR AGORA
        </Button>
      </Card>
      
      <p className="mt-8 text-gray-400 text-sm italic">
        A Dona Maria está orgulhosa de você. 🧠
      </p>
    </div>
  );
}
