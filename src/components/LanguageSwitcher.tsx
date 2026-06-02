import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: "pt", label: "Português", flag: "🇧🇷" },
    { code: "es", label: "Español", flag: "🇲🇽" },
    { code: "en", label: "English", flag: "🇺🇸" },
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white border-2 border-primary/20 hover:border-primary/50 rounded-xl px-4 py-2 h-auto flex items-center gap-2 shadow-sm transition-all"
        >
          <span className="text-xl">{currentLanguage.flag}</span>
          <span className="font-semibold text-gray-700 hidden sm:inline">{currentLanguage.label}</span>
          <Languages className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px] p-2 rounded-xl border-2">
        <div className="text-xs font-bold text-gray-400 px-2 py-1 uppercase tracking-wider mb-1">
          {t('select_language')}
        </div>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              i18n.language === lang.code ? "bg-primary/10 text-primary font-bold" : "hover:bg-gray-100"
            }`}
          >
            <span className="text-2xl">{lang.flag}</span>
            <span className="text-lg">{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
