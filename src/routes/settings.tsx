import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<any>(null);
  const [language, setLanguage] = useState(i18n.language || 'pt');
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/login", replace: true });
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      setProfile(data);
      
      const { data: prefs } = await supabase.from("user_preferences").select("language").eq("user_id", user.id).maybeSingle();
      if (prefs?.language) {
        setLanguage(prefs.language);
      }
    }
    load();
  }, [navigate]);

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    logout();
    navigate({ to: "/", replace: true });
  };

  const handleSave = async (newLang: string) => {
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
    
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("user_preferences").upsert({
        user_id: user.id,
        language: newLang,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }
    setIsSaving(false);
    toast.success(t('settings_saved'));
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 sm:p-6 md:p-8 max-w-xl mx-auto overflow-x-hidden">
      <header className="mb-6 md:mb-10 flex items-center">
        <Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })} className="mr-3 md:mr-4 rounded-full w-10 h-10 p-0 bg-white shadow-sm border border-gray-100">←</Button>
        <h1 className="text-2xl md:text-3xl font-black text-[#1F2937]">{t('settings_title')}</h1>
      </header>

      <Card className="bg-white rounded-3xl border-0 shadow-sm p-4 space-y-2 mb-8">
        <div className="p-4 border-b">
          <p className="text-sm text-gray-500">{t('settings_name')}</p>
          <p className="text-lg font-medium">{profile?.name || t('user')}</p>
        </div>
        <div className="p-4 border-b">
          <p className="text-sm text-gray-500 mb-2">{t('settings_language')}</p>
          <Select value={language} onValueChange={handleSave}>
            <SelectTrigger className="w-full bg-gray-50 border-none h-12 rounded-xl text-lg font-medium">
              <SelectValue placeholder={t('settings_language')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt">Português (Brasil)</SelectItem>
              <SelectItem value="es">Español (Latam)</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="p-4 border-b">
          <p className="text-sm text-gray-500">{t('settings_font_size')}</p>
          <p className="text-lg font-medium">{t('font_size_medium', 'Médio')}</p>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500">{t('settings_notifications')}</p>
          <p className="text-lg font-medium">{t('settings_notifications_on')}</p>
        </div>
      </Card>

      <Button 
        variant="destructive"
        onClick={handleLogout}
        className="w-full py-6 text-lg rounded-2xl font-bold uppercase tracking-wide"
      >
        {t('logout')}
      </Button>
    </div>
  );
}
