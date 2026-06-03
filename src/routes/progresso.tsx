import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/progresso")({
  component: Progress,
});

function Progress() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/login", replace: true });
        return;
      }

      const { data: streak } = await supabase.from("streaks").select("*").eq("user_id", user.id).single();
      const { data: challenges } = await supabase.from("daily_challenges").select("*").eq("user_id", user.id).order('date', { ascending: true });
      
      setStats(streak);
      setHistory(challenges || []);
    }
    loadStats();
  }, []);

  const chartData = history.slice(-7).map(h => ({
    date: new Date(h.date).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit' }),
    score: h.score
  }));

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 sm:p-6 md:p-8 max-w-2xl mx-auto overflow-x-hidden">
      <header className="mb-6 md:mb-10 flex items-center">
        <Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })} className="mr-3 md:mr-4 rounded-full w-10 h-10 p-0 bg-white shadow-sm border border-gray-100">←</Button>
        <h1 className="text-2xl md:text-3xl font-black text-[#1F2937]">{t('progress_title')}</h1>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="p-6 bg-white rounded-2xl border-0 shadow-sm text-center">
          <p className="text-sm text-gray-500">{t('progress_current_streak')}</p>
          <p className="text-3xl font-bold">{stats?.current_streak || 0} {t('progress_days')}</p>
        </Card>
        <Card className="p-6 bg-white rounded-2xl border-0 shadow-sm text-center">
          <p className="text-sm text-gray-500">{t('progress_best_streak')}</p>
          <p className="text-3xl font-bold">{stats?.best_streak || 0} {t('progress_days')}</p>
        </Card>
      </div>

      <Card className="p-6 bg-white rounded-3xl border-0 shadow-sm mb-8">
        <h3 className="text-lg font-bold mb-6 text-[#1F2937]">{t('progress_last_7')}</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#4A7C59" strokeWidth={4} dot={{ r: 6, fill: "#4A7C59" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Button 
        onClick={() => navigate({ to: "/premium" })}
        className="w-full py-8 text-xl font-bold bg-[#D97706] hover:bg-[#b46205] rounded-2xl shadow-md text-white"
      >
        {t('progress_unlock_premium')}
      </Button>
    </div>
  );
}
