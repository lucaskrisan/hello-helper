import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/hooks/use-auth";

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/login", replace: true });
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(data);
    }
    load();
  }, []);

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    logout();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 max-w-lg mx-auto">
      <header className="mb-8 flex items-center">
        <Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })} className="mr-4">←</Button>
        <h1 className="text-3xl font-bold">Configurações</h1>
      </header>

      <Card className="bg-white rounded-3xl border-0 shadow-sm p-4 space-y-2 mb-8">
        <div className="p-4 border-b">
          <p className="text-sm text-gray-500">Nome</p>
          <p className="text-lg font-medium">{profile?.name || "Usuário"}</p>
        </div>
        <div className="p-4 border-b">
          <p className="text-sm text-gray-500">Idioma</p>
          <p className="text-lg font-medium">Português</p>
        </div>
        <div className="p-4 border-b">
          <p className="text-sm text-gray-500">Tamanho da fonte</p>
          <p className="text-lg font-medium">Médio</p>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500">Notificações</p>
          <p className="text-lg font-medium">Ativadas</p>
        </div>
      </Card>

      <Button 
        variant="destructive"
        onClick={handleLogout}
        className="w-full py-6 text-lg rounded-2xl"
      >
        SAIR DA CONTA
      </Button>
    </div>
  );
}
