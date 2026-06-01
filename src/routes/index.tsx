import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GAME_ASSETS } from "@/lib/game-engine";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const fetchStreak = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("streaks").select("*").eq("user_id", user.id).maybeSingle();
        setStreak(data);
      }
    };
    fetchStreak();
  }, []);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-6">
          Desafio da Mente
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-lg">
          Mantenha sua mente ativa e jovem com exercícios diários divertidos.
        </p>
        <Button 
          onClick={() => navigate({ to: "/login" })}
          className="bg-primary hover:bg-primary/90 text-white text-xl py-8 px-12 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          COMEÇAR AGORA
        </Button>
      </div>
    );
  }

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 max-w-2xl mx-auto pb-24">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Olá, Mente Ativa! 👋</h1>
          <p className="text-gray-600">Pronto para o treino de hoje?</p>
        </div>
        <div className="bg-white p-3 rounded-2xl shadow-sm flex items-center space-x-2">
          <span className="text-2xl">🔥</span>
          <span className="font-bold text-xl">{streak?.current_streak || 0}</span>
        </div>
      </header>

      {/* Calendário de Progresso */}
      <Card className="p-6 bg-white rounded-3xl shadow-sm mb-8 border-none">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Seu Progresso em {today.toLocaleDateString('pt-BR', { month: 'long' })}</h2>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isToday = day === currentDay;
            const isCompleted = day < currentDay; // Mock logic, should come from DB
            return (
              <div 
                key={day} 
                className={`h-10 flex items-center justify-center rounded-lg text-sm font-bold ${
                  isToday ? "bg-primary text-white shadow-md ring-2 ring-primary ring-offset-2" : 
                  isCompleted ? "bg-primary/20 text-primary" : "bg-gray-50 text-gray-400"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </Card>

      <Button 
        onClick={() => navigate({ to: "/game", search: { mode: 'daily' } })}
        className="w-full py-10 text-2xl font-bold bg-primary hover:bg-primary/90 text-white rounded-3xl shadow-xl mb-10 transform transition-all hover:scale-[1.02] active:scale-95 flex flex-col space-y-1"
      >
        <span>INICIAR DESAFIO DO DIA</span>
        <span className="text-sm font-normal opacity-90 text-white/80 italic">4 exercícios rápidos • 5 minutos</span>
      </Button>

      <h3 className="text-xl font-bold mb-6 text-[#1F2937]">Ou escolha uma categoria:</h3>
      <div className="grid grid-cols-1 gap-4">
        {GAME_ASSETS.categories.map((cat) => (
          <Button
            key={cat.id}
            onClick={() => navigate({ to: "/game", search: { mode: 'category', categoryId: cat.id } })}
            className="h-auto p-6 bg-white hover:bg-gray-50 text-left justify-start border-none rounded-2xl shadow-sm flex items-center space-x-4 transition-all hover:translate-x-1"
          >
            <div className="text-4xl p-3 rounded-2xl" style={{ backgroundColor: `${cat.color}20` }}>
              {cat.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#1F2937]">{cat.name}</span>
              <span className="text-sm text-gray-500 font-normal">{cat.description}</span>
            </div>
          </Button>
        ))}
      </div>

      {/* Footer Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-2xl flex justify-around items-center border border-white/20">
        <button onClick={() => navigate({ to: "/" })} className="flex flex-col items-center text-primary">
          <span className="text-2xl">🏠</span>
          <span className="text-xs font-bold">Início</span>
        </button>
        <button onClick={() => navigate({ to: "/progresso" })} className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">📊</span>
          <span className="text-xs font-bold">Progresso</span>
        </button>
        <button onClick={() => navigate({ to: "/settings" })} className="flex flex-col items-center text-gray-400">
          <span className="text-2xl">⚙️</span>
          <span className="text-xs font-bold">Ajustes</span>
        </button>
      </nav>
    </div>
  );
}

