import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [ageRange, setAgeRange] = useState("");
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

  const handleFinish = async (selectedGoal: string) => {
    if (!ageRange || !selectedGoal) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const defaultName = user.email?.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, ' ') || t('user', 'Usuário');
      await supabase.from("profiles").upsert({
        user_id: user.id,
        name: defaultName,
        age_range: ageRange,
        main_goal: selectedGoal,
      }, { onConflict: "user_id" });
      navigate({ to: "/dashboard", replace: true });
    }
  };

  const goals = [
    t('onboarding_goal_1'),
    t('onboarding_goal_2'),
    t('onboarding_goal_3'),
    t('onboarding_goal_4'),
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 sm:p-10 bg-white shadow-2xl rounded-[2rem] sm:rounded-[3rem] border-none">
        {step === 1 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('onboarding_age_title')}</h2>
            {["45–54", "55–64", "65–74", "75+"].map(age => (
              <Button key={age} onClick={() => { setAgeRange(age); setStep(2); }} className="w-full mb-3 py-6 bg-[#F7F3EA] text-[#1F2937] hover:bg-[#8AAE92]">
                {age}
              </Button>
            ))}
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">{t('onboarding_goal_title')}</h2>
            {goals.map(goal => (
              <Button key={goal} onClick={() => handleFinish(goal)} className="w-full mb-3 py-6 bg-[#F7F3EA] text-[#1F2937] hover:bg-[#8AAE92]">
                {goal}
              </Button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
