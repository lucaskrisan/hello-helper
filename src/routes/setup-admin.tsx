import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/setup-admin")({
  component: SetupAdmin,
});

type State = "loading" | "no-session" | "already-admin" | "no-admin-exists" | "already-has-admin" | "done" | "error";

function SetupAdmin() {
  const navigate = useNavigate();
  const [state, setState] = useState<State>("loading");
  const [userName, setUserName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setState("no-session"); return; }

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("is_admin, name")
        .eq("user_id", user.id)
        .maybeSingle();

      setUserName(myProfile?.name || user.email || "");

      if (myProfile?.is_admin) { setState("already-admin"); return; }

      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_admin", true);

      if ((count ?? 0) > 0) {
        setState("already-has-admin");
      } else {
        setState("no-admin-exists");
      }
    }
    check();
  }, []);

  const handleBecomeAdmin = async () => {
    setState("loading");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setState("no-session"); return; }

    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, is_admin: true }, { onConflict: "user_id" });

    if (error) {
      setErrorMsg(error.message);
      setState("error");
    } else {
      setState("done");
      setTimeout(() => navigate({ to: "/admin", replace: true }), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F2937] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border-none text-center">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8 text-purple-600" />
        </div>

        {state === "loading" && (
          <>
            <h1 className="text-xl font-bold mb-2">Verificando...</h1>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          </>
        )}

        {state === "no-session" && (
          <>
            <h1 className="text-xl font-bold mb-4">Faça login primeiro</h1>
            <Button onClick={() => navigate({ to: "/login" })} className="w-full">Ir para o Login</Button>
          </>
        )}

        {state === "no-admin-exists" && (
          <>
            <h1 className="text-2xl font-bold mb-2">Bootstrap de Admin</h1>
            <p className="text-gray-500 mb-6">
              Nenhum administrador existe ainda. Como <strong>{userName}</strong>, você pode se tornar o primeiro admin agora.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">Esta opção desaparece assim que o primeiro admin for criado.</p>
            </div>
            <Button onClick={handleBecomeAdmin} className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700 font-bold">
              Tornar-me Admin
            </Button>
          </>
        )}

        {state === "already-has-admin" && (
          <>
            <h1 className="text-xl font-bold mb-4 text-red-600">Acesso Bloqueado</h1>
            <p className="text-gray-500 mb-6">Já existe um administrador cadastrado. Esta rota só funciona quando não há nenhum admin.</p>
            <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>Voltar ao Dashboard</Button>
          </>
        )}

        {state === "already-admin" && (
          <>
            <h1 className="text-xl font-bold mb-4">Você já é admin!</h1>
            <Button onClick={() => navigate({ to: "/admin" })} className="w-full bg-purple-600 hover:bg-purple-700">
              Ir para o Painel Admin
            </Button>
          </>
        )}

        {state === "done" && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-green-600">Admin ativado!</h1>
            <p className="text-gray-500">Redirecionando para o painel...</p>
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-xl font-bold mb-2 text-red-600">Erro</h1>
            <p className="text-gray-500 mb-4 text-sm font-mono">{errorMsg}</p>
            <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })}>Voltar</Button>
          </>
        )}
      </Card>
    </div>
  );
}
