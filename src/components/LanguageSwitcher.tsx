import { useTranslation } from "react-i18next";
import { setLocaleManually } from "@/i18n/detect-country";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, ChevronDown } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: "pt", label: "Português", flag: "🇧🇷", country: "Brasil", countryCode: "BR" },
    { code: "es", label: "Español", flag: "🇲🇽", country: "América Latina", countryCode: "MX" },
    { code: "en", label: "English", flag: "🇺🇸", country: "USA / Other", countryCode: "US" },
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (lng: string, countryCode: string) => {
    setLocaleManually(countryCode);
    // Dispara um evento para atualizar outros componentes se necessário
    window.dispatchEvent(new Event('languageChange'));
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="hover:bg-gray-50 border border-gray-200 rounded-full px-4 py-2 h-10 flex items-center gap-2 transition-all hover:shadow-sm active:scale-95 group bg-white"
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
            <div className="flex items-center gap-1.5">
              <span className="text-lg leading-none">{currentLanguage.flag}</span>
              <span className="font-medium text-gray-600 text-sm hidden xs:inline-block">{currentLanguage.label}</span>
            </div>
          </div>
          <ChevronDown className="h-3 w-3 text-gray-400 group-hover:text-primary transition-colors ml-0.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px] p-2 rounded-2xl border border-gray-100 shadow-xl z-[100] animate-in fade-in zoom-in-95 duration-200">
        <div className="grid gap-1">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => changeLanguage(lang.code, lang.countryCode)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                i18n.language === lang.code 
                  ? "bg-primary/10 text-primary font-semibold" 
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm">{lang.label}</span>
                  <span className="text-[10px] opacity-60 uppercase tracking-tighter">{lang.country}</span>
                </div>
              </div>
              {i18n.language === lang.code && (
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}