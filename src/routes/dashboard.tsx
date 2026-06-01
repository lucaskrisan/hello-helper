import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Brain, Eye, Puzzle, Search } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ streak: 0, total: 0, evolution: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && mounted) {
        const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
        
        if (!prof && mounted) {
          navigate({ to: "/onboarding", replace: true });
          return;
        } 
        
        if (prof && mounted) {
          setProfile(prof);
          const { data: streak } = await supabase.from("streaks").select("*").eq("user_id", user.id).maybeSingle();
          const { data: challenges, count } = await supabase.from("daily_challenges").select("*", { count: 'exact' }).eq("user_id", user.id);
          
          const avgScore = count ? Math.round(challenges?.reduce((acc: number, curr: any) => acc + (curr.score || 0), 0) / count) : 0;
          
          if (mounted) {
            setStats({ 
              streak: streak?.current_streak || 0, 
              total: count || 0,
              evolution: avgScore
            });
          }
        }
      }
    }
    loadData();
    return () => { mounted = false; };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 max-w-lg mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bom dia{profile?.name ? `, ${profile.name}` : ""}</h1>
        <Link to="/settings" className="p-2 bg-white rounded-full shadow-sm text-primary">
          <Settings className="w-6 h-6" />
        </Link>
      </header>

      <Card className="p-8 bg-white mb-8 text-center rounded-3xl shadow-sm border-0">
        <p className="text-xl mb-6 font-medium text-[#4A7C59]">Hoje é um ótimo dia para treinar!</p>
        <Button 
          onClick={() => navigate({ to: "/game" })}
          className="w-full py-12 text-2xl font-bold bg-[#4A7C59] hover:bg-[#3d694a] rounded-3xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          INICIAR MEU TREINO
        </Button>
        <p className="mt-4 text-sm text-gray-500">Estimativa: 10 minutos</p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-white text-center rounded-2xl border-0 shadow-sm">
          <p className="text-secondary font-medium">Sequência</p>
          <p className="text-3xl font-bold">{stats.streak} dias</p>
        </Card>
        <Card className="p-4 bg-white text-center rounded-2xl border-0 shadow-sm">
          <p className="text-secondary font-medium">Média Acertos</p>
          <p className="text-3xl font-bold">{stats.evolution}%</p>
        </Card>
      <div className="mt-12">
        <h3 className="text-xl font-bold mb-6 text-foreground/80">Categorias de Treino</h3>
        <div className="grid grid-cols-1 gap-4">
          {[
            { id: "memory", name: "Fortalecer Memória", icon: <Brain />, color: "bg-green-100 text-green-700" },
            { id: "attention", name: "Foco e Atenção", icon: <Eye />, color: "bg-amber-100 text-amber-700" },
            { id: "logic", name: "Raciocínio Lógico", icon: <Puzzle />, color: "bg-blue-100 text-blue-700" },
            { id: "word-search", name: "Caça-Palavras", icon: <Search />, color: "bg-purple-100 text-purple-700" }
          ].map((cat) => (
            <div key={cat.id} className="flex items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-50">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${cat.color}`}>
                {cat.icon}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1F2937]">{cat.name}</p>
                <p className="text-xs text-gray-500">Conteúdo atualizado hoje</p>
              </div>
              <div className="text-primary/40">
                <Settings className="w-5 h-5 rotate-90" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

      <div className="mt-8">
        <Button 
          variant="ghost"
          onClick={() => navigate({ to: "/progresso" })}
          className="w-full text-lg text-[#4A7C59]"
        >
          Ver minha evolução →
        </Button>
      </div>
    </div>
  );
}
