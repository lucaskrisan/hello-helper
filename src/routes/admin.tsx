import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, CreditCard, Brain, Activity, ShieldCheck,
  TrendingUp, BarChart3, DollarSign, List, CheckCircle2,
  Clock, X, Search, ChevronDown, ChevronUp
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { toast } from "sonner";
import { CONTENT_POOLS } from "@/lib/content-pools";
import { ES_POOLS, EN_POOLS } from "@/lib/content-pools-i18n";

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
  is_admin: boolean;
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
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [contentSearch, setContentSearch] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [contentLang, setContentLang] = useState<'pt' | 'es' | 'en'>('pt');
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

        const ownerEmail = import.meta.env.VITE_ADMIN_EMAIL;
        const isOwner = ownerEmail && user.email === ownerEmail;

        if (!profile?.is_admin && !isOwner) {
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
      const results = await Promise.allSettled([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
        supabase.from('daily_challenges').select('user_id, score, total_time'),
        supabase.from('payment_events').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('name, user_id, is_premium, is_admin, created_at, last_sign_in_at'),
        supabase.from('funnel_events').select('event_name, created_at').order('created_at', { ascending: false }),
        supabase.from('exercise_history').select('category'),
      ]);

      const getValue = <T,>(i: number, key: string): T | null => {
        const r = results[i];
        return r.status === 'fulfilled' ? (r.value as any)[key] ?? null : null;
      };

      const totalUsers = getValue<number>(0, 'count');
      const premiumUsers = getValue<number>(1, 'count');
      const challengesAll = getValue<any[]>(2, 'data');
      const paymentsData = getValue<any[]>(3, 'data');
      const profiles = getValue<any[]>(4, 'data');
      const events = getValue<any[]>(5, 'data');
      const history = getValue<any[]>(6, 'data');

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

      const challengesByUser: Record<string, { score: number; total_time: number }[]> = {};
      (challengesAll || []).forEach(c => {
        const uid = c.user_id as string;
        if (!challengesByUser[uid]) challengesByUser[uid] = [];
        challengesByUser[uid].push({ score: c.score || 0, total_time: c.total_time || 0 });
      });

      const paymentsByUser: Record<string, { amount_total: number }[]> = {};
      (paymentsData || []).forEach(p => {
        if (p.user_id) {
          if (!paymentsByUser[p.user_id]) paymentsByUser[p.user_id] = [];
          paymentsByUser[p.user_id].push({ amount_total: p.amount_total || 0 });
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
          is_admin: !!p.is_admin,
          challengesCount: userChallenges.length,
          avgScore: avgUserScore.toFixed(1),
          totalPaid
        };
      });
      setUsers(enrichedUsers);

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

      setPayments(paymentsData || []);

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

  const toggleUserFlag = async (userId: string, field: 'is_admin' | 'is_premium', current: boolean) => {
    const { error } = await supabase.from("profiles").update({ [field]: !current }).eq("user_id", userId);
    if (error) {
      toast.error("Erro ao atualizar permissão");
      return;
    }
    setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, [field]: !current } : u));
    const label = field === 'is_admin' ? 'Admin' : 'Premium';
    toast.success(!current ? `${label} concedido` : `${label} removido`);
  };

  const activePool = contentLang === 'es' ? ES_POOLS : contentLang === 'en' ? EN_POOLS : CONTENT_POOLS;
  const contentEntries = Object.entries(activePool);
  const filteredContent = contentSearch.trim()
    ? contentEntries.map(([key, items]) => ({
        key,
        items: items.filter(item =>
          item.word.toLowerCase().includes(contentSearch.toLowerCase()) ||
          item.category.toLowerCase().includes(contentSearch.toLowerCase())
        )
      })).filter(({ items }) => items.length > 0)
    : contentEntries.map(([key, items]) => ({ key, items }));

  if (loading) return <div className="p-8 text-center">Verificando permissões...</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedPayment(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Detalhes do Pagamento</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(null)}><X className="w-4 h-4" /></Button>
            </div>
            <pre className="text-xs bg-gray-50 p-4 rounded-xl overflow-auto whitespace-pre-wrap break-all">
              {JSON.stringify(selectedPayment.raw_payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

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
            <Activity className="w-4 h-4" /> Atualizar
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
              <StatCard title="Receita Total" value={`$${stats.totalRevenue?.toFixed(2)}`} sub={`Últimos 30d: $${stats.revenue30d?.toFixed(2)}`} icon={<DollarSign className="text-green-500" />} />
              <StatCard title="Engajamento" value={stats.challengesCompleted} sub="Desafios concluídos" icon={<Activity className="text-purple-500" />} />
              <StatCard title="Score Médio" value={`${stats.avgScore}%`} sub={`Tempo médio: ${stats.avgTime}s`} icon={<Brain className="text-orange-500" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Performance Financeira</h3>
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Receita Últimos 7 dias</span>
                    <span className="font-bold text-green-600">${stats.revenue7d?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span>Receita Últimos 30 dias</span>
                    <span className="font-bold text-green-600">${stats.revenue30d?.toFixed(2)}</span>
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
                    <span>Admins ativos</span>
                    <span className="font-bold">{users.filter(u => u.is_admin).length}</span>
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
                        <span className="font-bold capitalize">{step.name.replace(/_/g, ' ')}</span>
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
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              <strong>Permissões:</strong> Alterações em Admin e Premium são salvas imediatamente no banco.
            </div>
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead className="text-center">Desafios</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Pago</TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-10">Nenhum usuário encontrado.</TableCell>
                    </TableRow>
                  )}
                  {users.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell>
                        <div>
                          <p className="font-bold">{u.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{u.user_id.slice(0, 8)}…</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold w-fit ${u.is_premium ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {u.is_premium ? 'PREMIUM' : 'FREE'}
                          </span>
                          {u.is_admin && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold w-fit bg-purple-100 text-purple-700">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">{new Date(u.created_at).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-xs text-gray-500">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell className="text-center font-medium">{u.challengesCount}</TableCell>
                      <TableCell className="text-center">{u.avgScore}%</TableCell>
                      <TableCell className="text-center font-bold text-green-600">${u.totalPaid.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant={u.is_premium ? "destructive" : "outline"}
                            className="text-xs h-7 px-2"
                            onClick={() => toggleUserFlag(u.user_id, 'is_premium', u.is_premium)}
                          >
                            {u.is_premium ? 'Remover Premium' : 'Dar Premium'}
                          </Button>
                          <Button
                            size="sm"
                            variant={u.is_admin ? "destructive" : "outline"}
                            className="text-xs h-7 px-2"
                            onClick={() => toggleUserFlag(u.user_id, 'is_admin', u.is_admin)}
                          >
                            {u.is_admin ? 'Remover Admin' : 'Dar Admin'}
                          </Button>
                        </div>
                      </TableCell>
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
                    <TableHead>E-mail</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10">Nenhum pagamento registrado.</TableCell>
                    </TableRow>
                  )}
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs font-mono">{p.event_type}</TableCell>
                      <TableCell className="font-bold text-green-600">${((p.amount_total || 0) / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {p.status === 'succeeded' || p.status === 'paid'
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : <Clock className="w-4 h-4 text-orange-500" />}
                          <span className="capitalize text-xs">{p.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{p.raw_payload?.customer_details?.email || '-'}</TableCell>
                      <TableCell className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPayment(p)}>
                          <List className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="exercises">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exerciseStats.length === 0 && (
                <p className="col-span-full text-center py-20 text-gray-400">Sem dados de exercícios ainda.</p>
              )}
              {exerciseStats.map((ex) => (
                <Card key={ex.name} className="p-6">
                  <h4 className="font-bold text-lg capitalize mb-4">{ex.name}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-xs text-gray-500 uppercase">Exibições</p>
                      <p className="text-2xl font-black">{ex.shown}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="flex gap-2 mb-4">
              {(['pt', 'es', 'en'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => { setContentLang(lang); setContentSearch(""); setExpandedCategory(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${contentLang === lang ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-primary'}`}
                >
                  {lang === 'pt' ? '🇧🇷 Português' : lang === 'es' ? '🇲🇽 Español' : '🇺🇸 English'}
                </button>
              ))}
              <span className="ml-auto text-xs text-gray-400 self-center">
                {contentEntries.reduce((acc, [, items]) => acc + items.length, 0)} palavras total
              </span>
            </div>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar palavra ou categoria..."
                  value={contentSearch}
                  onChange={e => setContentSearch(e.target.value)}
                  className="pl-9 h-12 rounded-xl"
                />
              </div>
              {contentSearch && (
                <p className="text-sm text-gray-500 mt-2">
                  {filteredContent.reduce((acc, { items }) => acc + items.length, 0)} resultado(s) encontrado(s)
                </p>
              )}
            </div>

            <div className="space-y-4">
              {filteredContent.map(({ key, items }) => {
                const isExpanded = expandedCategory === key || !!contentSearch;
                return (
                  <Card key={key} className="overflow-hidden">
                    <button
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedCategory(isExpanded && !contentSearch ? null : key)}
                    >
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold capitalize text-lg">{key}</h4>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                          {items.length} itens
                        </span>
                      </div>
                      {!contentSearch && (isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />)}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 border-t">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                          {items.map(item => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-2 text-sm">
                              <p className="font-medium text-gray-800">{item.word}</p>
                              <p className="text-xs text-gray-400 mt-0.5 capitalize">{item.level}</p>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-4 italic">
                          Conteúdo estático em src/lib/content-pools.ts — edite o arquivo para adicionar/remover itens.
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
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
