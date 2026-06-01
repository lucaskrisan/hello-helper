import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "lucide-react";

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
      const { data: challenges, count } = await supabase.from("daily_challenges").select("*", { count: 'exact' }).eq("user_id", user.id);
      
      const avgScore = count ? Math.round(challenges?.reduce((acc: number, curr: any) => acc + curr.score, 0) / count) : 0;
      setStats({ 
        streak: streak?.current_streak || 0, 
        total: count || 0,
        evolution: avgScore
      });
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 max-w-lg mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bom dia{profile?.name ? `, ${profile.name}` : ""}</h1>
        <Link to="/settings" className="p-2 bg-white rounded-full shadow-sm text-primary">
          <Settings className="w-6 h-6" />
        </Link>
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
          <p className="text-secondary font-medium">Sequência</p>
          <p className="text-3xl font-bold">{stats.streak} dias</p>
        </Card>
        <Card className="p-4 bg-white text-center rounded-2xl border-0 shadow-sm">
          <p className="text-secondary font-medium">Média Acertos</p>
          <p className="text-3xl font-bold">{stats.evolution}%</p>
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
