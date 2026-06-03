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
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center p-6 text-center relative overflow-hidden">
      {/* Overlay de carregamento para evitar flashes de conteúdo não traduzido */}
      {!t('landing_title') || t('landing_title') === 'landing_title' ? (
        <div className="fixed inset-0 bg-[#F7F3EA] z-[9999] flex items-center justify-center">
          <div className="animate-pulse text-primary font-bold">Carregando...</div>
        </div>
      ) : null}

      {/* Header com seletor de idioma - Destaque visual */}
      <header className="w-full max-w-5xl flex justify-center sm:justify-end mb-8 animate-fade-in relative z-50">
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-3xl border-2 border-primary/10 shadow-lg">
          <span className="text-sm font-bold text-primary uppercase tracking-wider">
            {t('select_language')}:
          </span>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 shadow-inner animate-bounce-subtle">
          <span className="text-5xl">🧠</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black text-[#1F2937] mb-8 tracking-tight max-w-3xl leading-[1.1] animate-fade-up">
          {t('landing_title')}
        </h1>
        
        <div className="space-y-6 mb-12 text-left max-w-md w-full animate-fade-up" style={{ animationDelay: '0.2s' }}>
          {[
            t('landing_item_1'),
            t('landing_item_2'),
          ].map((item) => (
            <div key={item} className="flex items-start space-x-3 text-xl md:text-2xl text-gray-700 font-semibold bg-white/50 p-4 rounded-2xl shadow-sm border border-white">
              <span className="shrink-0 text-primary mt-1">✨</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-lg leading-relaxed animate-fade-up" style={{ animationDelay: '0.4s' }}>
          {t('landing_subtitle')}
        </p>
        
        <div className="space-y-4 w-full max-w-xs animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <Button 
            onClick={() => navigate({ to: "/game", search: { mode: 'trial' } })}
            className="w-full bg-primary hover:bg-primary/90 text-white text-2xl py-12 px-12 rounded-3xl shadow-[0_10px_40px_-10px_rgba(var(--primary),0.5)] transition-all hover:scale-105 active:scale-95 font-black uppercase tracking-widest"
          >
            {t('start_test')}
          </Button>
          <p className="text-base font-medium text-gray-500">{t('free_test_info')}</p>
        </div>

        <div className="mt-16 text-gray-400 font-medium animate-fade-in" style={{ animationDelay: '1s' }}>
          {t('made_for_50plus')}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}