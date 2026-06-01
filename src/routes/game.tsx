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
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime] = useState(Date.now());
  const navigate = useNavigate();

  // EXERCICIO 1: Memória
  const [memState, setMemState] = useState<'showing' | 'choosing'>('showing');
  const [timeLeft, setTimeLeft] = useState(10);
  const words = ["Amizade", "Natureza", "Saúde", "Tempo", "Família"];
  const options = ["Amizade", "Natureza", "Saúde", "Tempo", "Família", "Cidade", "Viagem", "Festa"];

  // EXERCICIO 2: Atenção
  const letters = "AAAAAAAAABAAAAAAAA".split("");
  
  // EXERCICIO 3: Lógica
  const sequence = [2, 4, 6, 8];
  const logicOptions = [9, 10, 11, 12];

  useEffect(() => {
    if (exercise === 1 && memState === 'showing') {
      if (timeLeft <= 0) {
        setMemState('choosing');
        return;
      }
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [exercise, memState, timeLeft]);

  const finishChallenge = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const finalScore = score;
    const totalTime = Math.floor((Date.now() - startTime) / 1000);

    const { data: challenge } = await supabase.from("daily_challenges").insert({
      user_id: user.id,
      score: finalScore,
      total_questions: 3,
      correct_answers: correctCount,
      total_time: totalTime,
    }).select().maybeSingle();

    // Update streak 
    const { data: existingStreak } = await supabase.from("streaks").select("*").eq("user_id", user.id).maybeSingle();
    
    await supabase.from("streaks").upsert({
      user_id: user.id,
      current_streak: (existingStreak?.current_streak || 0) + 1,
      best_streak: Math.max((existingStreak?.best_streak || 0), (existingStreak?.current_streak || 0) + 1),
      last_completed_date: new Date().toISOString().split('T')[0]
    });

    navigate({ to: "/conclusao", search: { score: finalScore, time: totalTime }, replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 flex flex-col items-center justify-center">
      {exercise === 1 && (
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-6">Memorize estas palavras</h2>
          {memState === 'showing' ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-gray-100"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      strokeDasharray="226.2"
                      strokeDashoffset={226.2 * (1 - timeLeft / 10)}
                      className="text-[#D97706] transition-all duration-1000"
                    />
                  </svg>
                  <span className="text-2xl font-bold text-[#D97706]">{timeLeft}</span>
                </div>
              </div>
              <p className="text-lg text-gray-600 mb-4 font-medium">Memorize estas palavras:</p>
              {words.map(w => <p key={w} className="text-3xl font-bold text-[#4A7C59] animate-in fade-in slide-in-from-bottom-2">{w}</p>)}
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-xl font-medium text-gray-700">Selecione as 5 palavras que você viu:</p>
              <div className="grid grid-cols-2 gap-3">
                {options.map(opt => {
                  const isSelected = selectedWords.includes(opt);
                  return (
                    <Button 
                      key={opt} 
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => { 
                        if (isSelected) {
                          setSelectedWords(prev => prev.filter(w => w !== opt));
                        } else if (selectedWords.length < 5) {
                          setSelectedWords(prev => [...prev, opt]);
                        }
                      }} 
                      className={`py-8 text-lg rounded-2xl shadow-sm transition-all border-2 ${
                        isSelected 
                          ? "bg-primary text-white border-primary" 
                          : "bg-white border-gray-100 text-[#1F2937] hover:border-primary/50"
                      }`}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>
              
              {selectedWords.length === 5 && !showFeedback && (
                <Button 
                  onClick={() => {
                    const matches = selectedWords.filter(w => words.includes(w)).length;
                    setCorrectCount(prev => prev + (matches === 5 ? 1 : 0));
                    setScore(prev => prev + (matches * 6.6)); // Pontuação proporcional
                    setShowFeedback(true);
                    setTimeout(() => {
                      setExercise(2);
                      setShowFeedback(false);
                    }, 1500);
                  }}
                  className="w-full py-8 text-xl font-bold bg-[#D97706] hover:bg-[#b46205] rounded-2xl animate-in zoom-in"
                >
                  CONFERIR RESPOSTAS
                </Button>
              )}

              {showFeedback && (
                <div className="py-4 text-2xl font-bold text-primary animate-in fade-in bounce-in">
                  Muito bem! Vamos ao próximo.
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {exercise === 2 && (
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-2">Atenção Visual</h2>
          <p className="text-gray-600 mb-6">Clique na letra diferente entre as demais:</p>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {letters.map((l, i) => (
              <Button key={i} onClick={() => {
                if (l === 'B') {
                  setScore(s => s + 33);
                  setCorrectCount(c => c + 1);
                }
                setExercise(3);
              }} className="text-2xl h-16 bg-background text-foreground">
                {l}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {exercise === 3 && (
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-2">Qual o próximo número?</h2>
          <p className="text-gray-600 mb-8">Identifique o padrão na sequência:</p>
          <div className="text-5xl font-bold mb-10 text-[#4A7C59] tracking-wider">{sequence.join(", ")} , ?</div>
          <div className="grid grid-cols-2 gap-4">
            {logicOptions.map(num => (
              <Button 
                key={num} 
                onClick={async () => {
                  if (num === 10) {
                    setScore(prev => prev + 34);
                    setCorrectCount(prev => prev + 1);
                  }
                  // Chama diretamente a função sem setTimeout para evitar desync
                  await finishChallenge();
                }} 
                className="py-6 text-xl bg-background text-foreground hover:bg-secondary"
              >
                {num}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
