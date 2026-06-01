import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, BookOpen, Brain, Activity, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    activeSubscriptions: 0,
    dailyChallenges: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/login", replace: true });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.is_admin && user.email !== 'trafegocomkrisan@gmail.com') {
        console.log("Not admin, redirecting...");
        navigate({ to: "/dashboard", replace: true });
        return;
      }

      setIsAdmin(true);
      
      // Load some basic stats
      const [usersCount, subCount, challengesCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).limit(1),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).limit(1), // Mocking subscriptions for now
        supabase.from('daily_challenges').select('*', { count: 'exact', head: true }).limit(1),
      ]);

      setStats({
        users: usersCount.count || 0,
        activeSubscriptions: Math.floor((usersCount.count || 0) * 0.3), // Mock 30% conversion
        dailyChallenges: challengesCount.count || 0,
      });

      setLoading(false);
    }
    checkAdmin();
  }, [navigate]);

  if (loading) return <div className="p-8 text-center">Carregando painel de controle...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-32">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="text-primary w-8 h-8" />
          Painel CEO SaaS
        </h1>
        <p className="text-gray-500">Visão geral do Desafio da Mente</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          icon={<Users className="w-6 h-6 text-blue-500" />} 
          label="Total de Inscritos" 
          value={stats.users} 
          sub="Usuários cadastrados"
        />
        <StatCard 
          icon={<CreditCard className="w-6 h-6 text-green-500" />} 
          label="Assinaturas Ativas" 
          value={stats.activeSubscriptions} 
          sub="Planos Premium"
        />
        <StatCard 
          icon={<Activity className="w-6 h-6 text-purple-500" />} 
          label="Engajamento" 
          value={stats.dailyChallenges} 
          sub="Desafios completados"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Conteúdo & Exercícios
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span>Categorias Ativas</span>
              <span className="font-bold">4</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span>Tipos de Desafios</span>
              <span className="font-bold">12+</span>
            </div>
            <Button variant="outline" className="w-full">Gerenciar Conteúdo</Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Configurações Globais
          </h2>
          <div className="space-y-4">
            <Button className="w-full bg-primary">Ver Relatórios Detalhados</Button>
            <Button variant="outline" className="w-full">Configurar Planos Stripe</Button>
            <Button variant="ghost" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50">Log de Erros do Sistema</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: any) {
  return (
    <Card className="p-6 flex items-start space-x-4">
      <div className="p-3 bg-white shadow-sm rounded-xl">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
    </Card>
  );
}
