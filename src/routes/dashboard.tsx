import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { GAME_ASSETS } from "@/lib/game-engine";
import { Settings, BarChart3, Home as HomeIcon } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/", replace: true });
        return;
      }

      const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (!prof) {
        navigate({ to: "/onboarding", replace: true });
        return;
      }
      setProfile(prof);

      const [{ data: str }, { data: challs }] = await Promise.all([
        supabase.from("streaks").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("daily_challenges").select("*").eq("user_id", user.id).order('created_at', { ascending: false })
      ]);

      setStreak(str);
      setChallenges(challs || []);
      setLoading(false);
    }
    loadData();
  }, [navigate]);


  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();

  // Dias concluídos baseados nos desafios do banco
  const completedDays = challenges.map(c => new Date(c.created_at).getDate());

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 max-w-2xl mx-auto pb-32">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Bom dia{profile?.display_name || profile?.name ? `, ${profile.display_name || profile.name}` : ""}! 👋</h1>
          <p className="text-gray-600">Sua mente agradece o treino de hoje.</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center space-x-2 border border-white/50">
          <span className="text-2xl">🔥</span>
          <span className="font-bold text-xl text-[#D97706]">{streak?.current_streak || 0}</span>
        </div>
      </header>

      {/* Calendário de Progresso */}
      <Card className="p-6 bg-white rounded-3xl shadow-sm mb-8 border-none overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
        <h2 className="font-bold text-lg mb-4 flex items-center space-x-2">
          <span>📅</span>
          <span>Seu Progresso em {today.toLocaleDateString('pt-BR', { month: 'long' })}</span>
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === currentDay;
            const isCompleted = completedDays.includes(day);
            return (
              <div 
                key={day} 
                className={`h-11 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                  isToday ? "bg-primary text-white shadow-lg scale-110 ring-2 ring-primary/20" : 
                  isCompleted ? "bg-primary/20 text-primary" : "bg-gray-50 text-gray-300"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Botão de Destaque */}
      <Button 
        onClick={() => navigate({ to: "/game", search: { mode: 'daily' } })}
        className="w-full py-12 text-2xl font-bold bg-primary hover:bg-primary/90 text-white rounded-[2.5rem] shadow-xl mb-12 transform transition-all hover:scale-[1.02] active:scale-95 flex flex-col space-y-1 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
        <span className="relative z-10">INICIAR DESAFIO DO DIA</span>
        <span className="text-sm font-normal opacity-80 relative z-10">Treino completo para hoje • 5 minutos</span>
      </Button>

      <h3 className="text-xl font-bold mb-6 text-[#1F2937] flex items-center space-x-2">
        <span className="text-2xl">🧩</span>
        <span>Treino por Categoria</span>
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {GAME_ASSETS.categories.map((cat) => (
          <Button
            key={cat.id}
            onClick={() => navigate({ to: "/game", search: { mode: 'category', categoryId: cat.id } })}
            className="h-auto p-5 bg-white hover:bg-gray-50 text-left justify-start border-none rounded-3xl shadow-sm flex items-center space-x-4 transition-all hover:translate-x-1 group"
          >
            <div className="text-4xl p-4 rounded-2xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
              {cat.icon}
            </div>
            <div className="flex flex-col flex-1">
              <span className="text-lg font-bold text-[#1F2937]">{cat.name}</span>
              <span className="text-sm text-gray-500 font-normal">{cat.description}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
              →
            </div>
          </Button>
        ))}
      </div>

      {/* Navegação Inferior Fixa */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none">
        <nav className="max-w-md mx-auto bg-white/90 backdrop-blur-lg p-3 rounded-[2.5rem] shadow-2xl flex justify-around items-center border border-white/50 pointer-events-auto">
          <button 
            onClick={() => navigate({ to: "/dashboard" })} 
            className="flex flex-col items-center p-2 text-primary transition-transform active:scale-90"
          >
            <HomeIcon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Início</span>
          </button>
          <button 
            onClick={() => navigate({ to: "/progresso" })} 
            className="flex flex-col items-center p-2 text-gray-400 hover:text-primary transition-all active:scale-90"
          >
            <BarChart3 className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Progresso</span>
          </button>
          <button 
            onClick={() => navigate({ to: "/settings" })} 
            className="flex flex-col items-center p-2 text-gray-400 hover:text-primary transition-all active:scale-90"
          >
            <Settings className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ajustes</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
