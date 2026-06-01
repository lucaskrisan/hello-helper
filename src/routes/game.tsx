import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/game")({
  component: Game,
});

function Game() {
  const [exercise, setExercise] = useState(1);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const navigate = useNavigate();

  // EXERCICIO 1: Memória
  const [memState, setMemState] = useState<'showing' | 'choosing'>('showing');
  const words = ["Amizade", "Natureza", "Saúde", "Tempo", "Família"];
  const options = ["Amizade", "Natureza", "Saúde", "Tempo", "Família", "Cidade", "Viagem", "Festa"];

  // EXERCICIO 2: Atenção
  const letters = "AAAAAAAAABAAAAAAAA".split("");
  
  // EXERCICIO 3: Lógica
  const sequence = [2, 4, 6, 8];
  const logicOptions = [9, 10, 11, 12];

  useEffect(() => {
    if (exercise === 1) {
      const timer = setTimeout(() => setMemState('choosing'), 10000);
      return () => clearTimeout(timer);
    }
  }, [exercise]);

  const finishChallenge = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const finalScore = score + 10; // Simplificado
    const totalTime = Math.floor((Date.now() - startTime) / 1000);

    const { data: challenge } = await supabase.from("daily_challenges").insert({
      user_id: user.id,
      score: finalScore,
      total_questions: 3,
      correct_answers: 3,
      total_time: totalTime,
    }).select().single();

    // Update streak (simplified logic)
    await supabase.from("streaks").upsert({
      user_id: user.id,
      current_streak: 1,
      last_completed_date: new Date().toISOString().split('T')[0]
    });

    navigate({ to: "/conclusao", search: { score: finalScore, time: totalTime } });
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 flex flex-col items-center justify-center">
      {exercise === 1 && (
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-6">Memorize estas palavras</h2>
          {memState === 'showing' ? (
            <div className="space-y-4">
              {words.map(w => <p key={w} className="text-3xl font-medium text-[#4A7C59]">{w}</p>)}
              <p className="mt-8 text-sm text-gray-500">Memorize em 10 segundos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {options.map(opt => (
                <Button key={opt} onClick={() => setExercise(2)} className="py-6 bg-[#F7F3EA] text-[#1F2937] hover:bg-[#8AAE92]">
                  {opt}
                </Button>
              ))}
            </div>
          )}
        </Card>
      )}

      {exercise === 2 && (
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-6">Encontre a letra diferente</h2>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {letters.map((l, i) => (
              <Button key={i} onClick={() => l === 'B' && setExercise(3)} className="text-2xl h-16 bg-[#F7F3EA] text-[#1F2937]">
                {l}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {exercise === 3 && (
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-6">Qual o próximo número?</h2>
          <div className="text-4xl font-bold mb-8 text-[#4A7C59]">{sequence.join(", ")} , ?</div>
          <div className="grid grid-cols-2 gap-4">
            {logicOptions.map(num => (
              <Button key={num} onClick={finishChallenge} className="py-6 text-xl bg-[#F7F3EA] text-[#1F2937]">
                {num}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
