import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ age_range: "", main_goal: "" });
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate({ to: "/login", replace: true });
      }
    }
    checkAuth();
  }, [navigate]);

  const handleFinish = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        user_id: user.id,
        name: user.email?.split('@')[0], // Nome padrão baseado no email
        age_range: data.age_range,
        main_goal: data.main_goal,
      });
      navigate({ to: "/dashboard", replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
        {step === 1 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">Qual sua faixa de idade?</h2>
            {["45–54", "55–64", "65–74", "75+"].map(age => (
              <Button key={age} onClick={() => { setData({...data, age_range: age}); setStep(2); }} className="w-full mb-3 py-6 bg-[#F7F3EA] text-[#1F2937] hover:bg-[#8AAE92]">
                {age}
              </Button>
            ))}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Qual seu principal objetivo?</h2>
            {["Melhorar memória", "Melhorar concentração", "Manter minha mente ativa", "Criar uma rotina diária"].map(goal => (
              <Button key={goal} onClick={() => { setData({...data, main_goal: goal}); handleFinish(); }} className="w-full mb-3 py-6 bg-[#F7F3EA] text-[#1F2937] hover:bg-[#8AAE92]">
                {goal}
              </Button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
