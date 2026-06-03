import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, CreditCard, BookOpen, Brain, Activity, ShieldCheck, 
  TrendingUp, BarChart3, Users2, DollarSign, List, History, AlertCircle,
  Clock, CheckCircle2, XCircle, ArrowRight
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { CONTENT_POOLS } from "@/lib/content-pools";

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  totalRevenue: number;
  revenue7d: number;
  revenue30d: number;
  challengesCompleted: number;
  avgScore: string;
  avgTime: number;
}

interface EnrichedUser {
  name: string;
  user_id: string;
  is_premium: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  challengesCount: number;
  avgScore: string;
  totalPaid: number;
}

function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({} as AdminStats);
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<{ name: string; count: number }[]>([]);
  const [exerciseStats, setExerciseStats] = useState<{ name: string; shown: number }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAdminAndLoadData() {
      try {
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

        if (!profile?.is_admin) {
          navigate({ to: "/dashboard", replace: true });
          return;
        }

        setIsAdmin(true);
        await loadAllData();
      } catch (err) {
        console.error("Admin dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    checkAdminAndLoadData();
  }, [navigate]);

  async function loadAllData() {
    setLoading(true);
    try {
      // 1. Basic Stats — fetch challenges with user_id for reuse in user enrichment
      const [
        { count: totalUsers },
        { count: premiumUsers },
        { data: challengesAll },
        { data: paymentsData },
        { data: profiles },
        { data: events },
        { data: history },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('daily_challenges').select('user_id, score, total_time'),
        supabase.from('payment_events').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('name, user_id, is_premium, created_at, last_sign_in_at'),
        supabase.from('funnel_events').select('event_name, created_at').order('created_at', { ascending: false }),
        supabase.from('exercise_history').select('category'),
      ]);

      const avgScore = challengesAll?.length ? challengesAll.reduce((acc, c) => acc + (c.score || 0), 0) / challengesAll.length : 0;
      const avgTime = challengesAll?.length ? challengesAll.reduce((acc, c) => acc + (c.total_time || 0), 0) / challengesAll.length : 0;

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const totalRevenue = (paymentsData || []).reduce((acc, p) => acc + (p.amount_total || 0), 0) / 100;
      const revenue7d = (paymentsData || []).filter(p => new Date(p.created_at) > sevenDaysAgo).reduce((acc, p) => acc + (p.amount_total || 0), 0) / 100;
      const revenue30d = (paymentsData || []).filter(p => new Date(p.created_at) > thirtyDaysAgo).reduce((acc, p) => acc + (p.amount_total || 0), 0) / 100;

      setStats({
        totalUsers: totalUsers || 0,
        premiumUsers: premiumUsers || 0,
        freeUsers: (totalUsers || 0) - (premiumUsers || 0),
        totalRevenue,
        revenue7d,
        revenue30d,
        challengesCompleted: challengesAll?.length || 0,
        avgScore: avgScore.toFixed(1),
        avgTime: Math.floor(avgTime),
      });

      // 2. Users Table — group challenges/payments in memory to avoid N+1 queries
      const challengesByUser: Record<string, { score: number; total_time: number }[]> = {};
      (challengesAll || []).forEach(c => {
        const uid = c.user_id as string;
        if (!challengesByUser[uid]) challengesByUser[uid] = [];
        challengesByUser[uid].push({
          score: c.score || 0,
          total_time: c.total_time || 0
        });
      });

      const paymentsByUser: Record<string, { amount_total: number }[]> = {};
      (paymentsData || []).forEach(p => {
        if (p.user_id) {
          if (!paymentsByUser[p.user_id]) paymentsByUser[p.user_id] = [];
          paymentsByUser[p.user_id].push({
            amount_total: p.amount_total || 0
          });
        }
      });

      const enrichedUsers: EnrichedUser[] = (profiles || []).map(p => {
        const userChallenges = challengesByUser[p.user_id] || [];
        const userPayments = paymentsByUser[p.user_id] || [];
        const avgUserScore = userChallenges.length ? userChallenges.reduce((acc, c) => acc + c.score, 0) / userChallenges.length : 0;
        const totalPaid = userPayments.reduce((acc, pay) => acc + pay.amount_total, 0) / 100;
        return { 
          ...p, 
          name: p.name || 'Sem nome',
          is_premium: !!p.is_premium,
          challengesCount: userChallenges.length, 
          avgScore: avgUserScore.toFixed(1), 
          totalPaid 
        };
      });
      setUsers(enrichedUsers);

      // 3. Funnel
      const funnelCounts = {
        landing_view: events?.filter(e => e.event_name === 'landing_view').length || 0,
        test_started: events?.filter(e => e.event_name === 'test_started').length || 0,
        test_completed: events?.filter(e => e.event_name === 'test_completed').length || 0,
        result_viewed: events?.filter(e => e.event_name === 'result_viewed').length || 0,
        offer_viewed: events?.filter(e => e.event_name === 'offer_viewed').length || 0,
        checkout_clicked: events?.filter(e => e.event_name === 'checkout_clicked').length || 0,
        payment_success: events?.filter(e => e.event_name === 'payment_success').length || 0,
      };
      setFunnel(Object.entries(funnelCounts).map(([name, count]) => ({ name, count })));

      // 4. Payments
      setPayments(paymentsData || []);

      // 5. Exercise Stats
      const grouped: Record<string, { name: string; shown: number }> = {};
      (history || []).forEach(curr => {
        const key = curr.category || 'unknown';
        if (!grouped[key]) grouped[key] = { name: key, shown: 0 };
        grouped[key].shown += 1;
      });
      setExerciseStats(Object.values(grouped));

    } catch (err) {
      toast.error("Failed to load admin data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-8 text-center">Verificando permissões...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="text-primary w-8 h-8" />
              Painel SaaS Mente Ativa
            </h1>
            <p className="text-gray-500 font-medium">Controle real e métricas de funil</p>
          </div>
          <Button onClick={loadAllData} variant="outline" className="gap-2">
            <Activity className="w-4 h-4" /> Atualizar Dados
          </Button>
        </header>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white p-1 border shadow-sm w-full justify-start overflow-x-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="funnel">Funil</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="exercises">Exercícios</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Usuários Totais" value={stats.totalUsers} sub={`${stats.premiumUsers} premium / ${stats.freeUsers} free`} icon={<Users className="text-blue-500" />} />
              <StatCard title="Receita Total" value={`$${stats.totalRevenue}`} sub={`Últimos 30d: $${stats.revenue30d}`} icon={<DollarSign className="text-green-500" />} />
              <StatCard title="Engajamento" value={stats.challengesCompleted} sub="Desafios concluídos" icon={<Activity className="text-purple-500" />} />
              <StatCard title="Score Médio" value={`${stats.avgScore}%`} sub={`Tempo médio: ${stats.avgTime}s`} icon={<Brain className="text-orange-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Performance Financeira</h3>
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Receita Últimos 7 dias</span>
                    <span className="font-bold text-green-600">${stats.revenue7d}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Receita Últimos 30 dias</span>
                    <span className="font-bold text-green-600">${stats.revenue30d}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Ticket Médio</span>
                    <span className="font-bold">${stats.totalUsers > 0 ? (stats.totalRevenue / (stats.premiumUsers || 1)).toFixed(2) : 0}</span>
                  </div>
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Saúde do Produto</h3>
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Conversão Premium</span>
                    <span className="font-bold">{stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Retorno Diário (Est.)</span>
                    <span className="font-bold">Em breve</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="funnel">
            <Card className="p-6">
              <h3 className="font-bold mb-6 text-xl">Taxa de Conversão do Funil</h3>
              <div className="space-y-8">
                {funnel.map((step, idx) => {
                  const prevCount = idx > 0 ? funnel[idx-1].count : step.count;
                  const conv = prevCount > 0 ? (step.count / prevCount) * 100 : 0;
                  return (
                    <div key={step.name} className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold capitalize">{step.name.replace('_', ' ')}</span>
                        <div className="text-right">
                          <div className="text-2xl font-black">{step.count}</div>
                          {idx > 0 && <div className="text-xs text-green-600 font-bold">{conv.toFixed(1)}% conv.</div>}
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-1000" 
                          style={{ width: `${funnel[0].count > 0 ? (step.count / funnel[0].count) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Desafios</TableHead>
                    <TableHead>Score Médio</TableHead>
                    <TableHead>Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-10">Nenhum usuário encontrado.</TableCell></TableRow>}
                  {users.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="font-bold">{u.name || "Sem nome"}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.is_premium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.is_premium ? 'PREMIUM' : 'FREE'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs text-gray-500">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="font-medium text-center">{u.challengesCount}</TableCell>
                      <TableCell className="text-center">{u.avgScore}%</TableCell>
                      <TableCell className="font-bold text-green-600">${u.totalPaid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>E-mail (Customer)</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-10">Nenhum pagamento registrado.</TableCell></TableRow>}
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs font-mono">{p.event_type}</TableCell>
                      <TableCell className="font-bold text-green-600">${p.amount_total / 100}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {p.status === 'succeeded' || p.status === 'paid' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-orange-500" />}
                          <span className="capitalize">{p.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{p.raw_payload?.customer_details?.email || '-'}</TableCell>
                      <TableCell className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => console.log(p.raw_payload)}><List className="w-4 h-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="exercises">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exerciseStats.length === 0 && <p className="col-span-full text-center py-20 text-gray-400">Sem dados de exercícios ainda.</p>}
              {exerciseStats.map((ex) => (
                <Card key={ex.name} className="p-6">
                  <h4 className="font-bold text-lg capitalize mb-4">{ex.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-500 uppercase">Exibições</p>
                      <p className="text-2xl font-black">{ex.shown}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-500 uppercase">Eficiência</p>
                      <p className="text-2xl font-black">-%</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(CONTENT_POOLS).map(([key, pool]) => (
                <Card key={key} className="p-4">
                  <h4 className="font-bold capitalize flex justify-between">
                    {key}
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{pool.length} itens</span>
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">Status: Ativo</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: ReactNode;
}

function StatCard({ title, value, sub, icon }: StatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        <p className="text-xs text-gray-400 mt-1 font-medium">{sub}</p>
      </div>
    </Card>
  );
}
