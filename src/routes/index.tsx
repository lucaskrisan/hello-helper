import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";


export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();


  useEffect(() => {
    trackEvent('landing_view');
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center p-6 text-center relative">
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
        <span className="text-5xl">🧠</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-8 tracking-tight max-w-2xl leading-tight">
        {t('landing_title')}

      </h1>
      
      <div className="space-y-6 mb-12 text-left max-w-md w-full">
        {[
          t('landing_item_1'),
          t('landing_item_2'),
        ].map((item) => (

          <div key={item} className="flex items-center space-x-3 text-xl text-gray-700 font-medium">
            <span>{item}</span>
          </div>
        ))}
      </div>

      <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
        {t('landing_subtitle')}

      </p>
      
      <div className="space-y-4 w-full max-w-xs">
        <Button 
          onClick={() => navigate({ to: "/game", search: { mode: 'trial' } })}
          className="w-full bg-primary hover:bg-primary/90 text-white text-2xl py-10 px-12 rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95 font-bold uppercase tracking-wider"
        >
          {t('start_test')}
        </Button>
        <p className="text-sm text-gray-400">{t('free_test_info')}</p>
      </div>

      <div className="mt-16 text-gray-400 text-sm">
        {t('made_for_50plus')}

      </div>
    </div>
  );
}
