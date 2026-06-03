import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getCurrencySymbol } from "@/i18n/detect-country";


export const Route = createFileRoute("/premium")({
  component: Premium,
});

function Premium() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/login", replace: true });
      }
    }
    checkAuth();
  }, [navigate]);

  const benefits = [
    t('premium_b1'),
    t('premium_b2'),
    t('premium_b3'),
    t('premium_b4'),
    t('premium_b5')
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 max-w-lg mx-auto">
      <header className="mb-8 flex items-center">
        <Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })} className="mr-4">←</Button>
        <h1 className="text-3xl font-bold text-[#D97706]">{t('premium_title')}</h1>
      </header>

      <Card className="p-8 bg-white rounded-3xl border-0 shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-6">{t('premium_headline')}</h2>
        <ul className="space-y-4 mb-8">
          {benefits.map(b => (
            <li key={b} className="flex items-center space-x-3">
              <div className="bg-[#FFF9E6] p-1 rounded-full">
                <Check className="w-5 h-5 text-[#D97706]" />
              </div>
              <span className="text-lg text-[#1F2937]">{b}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-4">
          <Button className="w-full py-8 text-xl font-bold bg-[#4A7C59] hover:bg-[#3d694a] rounded-2xl">
            {t('premium_annual')} - {getCurrencySymbol()}29.90
          </Button>
          <Button variant="outline" className="w-full py-8 text-xl font-bold border-2 border-[#4A7C59] text-[#4A7C59] hover:bg-[#F7F3EA] rounded-2xl">
            {t('premium_monthly')} - {getCurrencySymbol()}4.90
          </Button>

        </div>
      </Card>
      
      <p className="text-center text-gray-500 text-sm">
        {t('premium_secure')}
      </p>
    </div>
  );
}
