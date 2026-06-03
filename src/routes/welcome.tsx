import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/welcome")({
  component: Welcome,
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: search.session_id as string | undefined,
  }),
});

function Welcome() {
  const { session_id } = useSearch({ from: "/welcome" });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const setAuthenticated = useAuthStore(state => state.setAuthenticated);

  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 8;
    const DELAY_MS = 2000;

    async function tryGetSession(): Promise<void> {
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
        return;
      }

      attempts += 1;
      if (session_id && attempts < MAX_ATTEMPTS) {
        setTimeout(tryGetSession, DELAY_MS);
      } else {
        setLoading(false);
      }
    }

    tryGetSession();
  }, [session_id, setAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center overflow-x-hidden">
      <Card className="w-full max-w-md p-6 sm:p-10 bg-white rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl text-center border-none relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          {t('welcome_title')}{userName ? `, ${userName}` : ""}!
          <Sparkles className="w-6 h-6 text-yellow-500" />
        </h1>
        
        <p className="text-xl text-gray-700 mb-8 leading-relaxed">
          {t('welcome_subtitle')}
        </p>

        <div className="bg-[#F7F3EA] p-6 rounded-2xl mb-8 text-left border-l-4 border-primary">
          <p className="text-sm font-bold text-primary uppercase mb-1">{t('welcome_tip_title')}</p>
          <p className="text-gray-700 italic">{t('welcome_tip')}</p>
        </div>

        <Button 
          onClick={() => navigate({ to: "/game", search: { mode: 'daily' } })}
          className="w-full py-8 md:py-10 text-xl md:text-2xl font-black bg-primary hover:bg-primary/90 text-white rounded-2xl md:rounded-[2rem] shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest h-auto"
        >
          {t('welcome_start')}
        </Button>
      </Card>
      
      <p className="mt-8 text-gray-400 text-sm italic">
        {t('welcome_footer', 'A Dona Maria está orgulhosa de você. 🧠')}
      </p>
    </div>
  );
}
