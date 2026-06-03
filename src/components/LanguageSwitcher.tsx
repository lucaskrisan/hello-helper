import { useTranslation } from "react-i18next";
import { setLocaleManually } from "@/i18n/detect-country";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages, ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: "pt", label: "Português", flag: "🇧🇷", country: "Brasil" },
    { code: "es", label: "Español", flag: "🇲🇽", country: "América Latina" },
    { code: "en", label: "English", flag: "🇺🇸", country: "USA / Other" },
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    // Dispara um evento para atualizar outros componentes se necessário
    window.dispatchEvent(new Event('languageChange'));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white border-2 border-primary/20 hover:border-primary/50 rounded-2xl px-4 py-6 h-auto flex items-center gap-3 shadow-md transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-primary uppercase tracking-tighter leading-none mb-1">
              {t('language')}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentLanguage.flag}</span>
              <span className="font-bold text-gray-800 text-lg">{currentLanguage.label}</span>
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] p-3 rounded-2xl border-2 shadow-2xl z-[100]">
        <div className="text-sm font-black text-gray-400 px-3 py-2 uppercase tracking-widest mb-2 border-b">
          {t('select_language')}
        </div>
        <div className="grid gap-2">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${
                i18n.language === lang.code 
                  ? "bg-primary/10 border-primary text-primary shadow-sm" 
                  : "bg-gray-50 border-transparent hover:border-gray-200 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="text-lg font-bold leading-none mb-1">{lang.label}</span>
                  <span className="text-xs font-medium text-gray-500">{lang.country}</span>
                </div>
              </div>
              {i18n.language === lang.code && (
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}