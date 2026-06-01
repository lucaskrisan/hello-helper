import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ streak: 0, total: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/login" });
        return;
      }
      
      const { data: prof } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (!prof) navigate({ to: "/onboarding" });
      else setProfile(prof);

      const { data: streak } = await supabase.from("streaks").select("*").eq("user_id", user.id).single();
      const { count } = await supabase.from("daily_challenges").select("*", { count: 'exact', head: true }).eq("user_id", user.id);
      
      setStats({ streak: streak?.current_streak || 0, total: count || 0 });
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 max-w-lg mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Bom dia{profile?.name ? `, ${profile.name}` : ""}</h1>
      </header>

      <Card className="p-8 bg-white mb-8 text-center rounded-3xl shadow-sm border-0">
        <p className="text-xl mb-4 font-medium text-[#4A7C59]">Seu desafio de hoje está pronto.</p>
        <Button 
          onClick={() => navigate({ to: "/game" })}
          className="w-full py-10 text-2xl font-bold bg-[#4A7C59] hover:bg-[#3d694a] rounded-2xl shadow-md"
        >
          COMEÇAR DESAFIO
        </Button>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-white text-center rounded-2xl border-0 shadow-sm">
          <p className="text-[#8AAE92] font-medium">Sequência</p>
          <p className="text-3xl font-bold">{stats.streak} dias</p>
        </Card>
        <Card className="p-4 bg-white text-center rounded-2xl border-0 shadow-sm">
          <p className="text-[#8AAE92] font-medium">Concluídos</p>
          <p className="text-3xl font-bold">{stats.total}</p>
        </Card>
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
