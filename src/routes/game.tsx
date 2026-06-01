import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { generateDailyChallenge } from "@/lib/game-engine";

export const Route = createFileRoute("/game")({
  component: Game,
});

function Game() {
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(0); // 0 = Intro, 1 = Memória, 2 = Atenção, 3 = Lógica
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [exerciseOrder, setExerciseOrder] = useState<number[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'retry' | null; message: string }>({ type: null, message: "" });
  const [startTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(10);
  const [memState, setMemState] = useState<'showing' | 'choosing'>('showing');

  // Gera o desafio único do dia baseado na data atual
  const today = new Date().toISOString().split('T')[0];
  const challengeData = useMemo(() => generateDailyChallenge(today), [today]);

    const { words, options } = challengeData.memory;
    const { grid, intruder } = challengeData.attention;
    const { sequence, options: logicOptions, answer } = challengeData.logic;
    const { grid: colorGrid, intruder: intruderColor } = challengeData.colorAttention;

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

    const finalScore = Math.min(100, Math.round(score));
    const totalTime = Math.floor((Date.now() - startTime) / 1000);

    await supabase.from("daily_challenges").insert({
      user_id: user.id,
      score: finalScore,
      total_questions: 3,
      correct_answers: correctCount,
      total_time: totalTime,
    });

    const { data: existingStreak } = await supabase.from("streaks").select("*").eq("user_id", user.id).maybeSingle();
    
    await supabase.from("streaks").upsert({
      user_id: user.id,
      current_streak: (existingStreak?.current_streak || 0) + 1,
      best_streak: Math.max((existingStreak?.best_streak || 0), (existingStreak?.current_streak || 0) + 1),
      last_completed_date: today
    });

    navigate({ to: "/conclusao", search: { score: finalScore, time: totalTime }, replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 flex flex-col items-center justify-center">
      {exercise === 0 && (
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🧠</span>
          </div>
          <h2 className="text-2xl font-bold mb-4">Seu Desafio de Hoje</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Preparamos 3 exercícios rápidos para treinar sua memória, atenção e raciocínio lógico. 
            <br/><br/>
            <strong>Pronto para começar?</strong>
          </p>
          <Button 
            onClick={() => setExercise(1)}
            className="w-full py-8 text-xl font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl"
          >
            ESTOU PRONTO!
          </Button>
        </Card>
      )}

      {exercise === 1 && (
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-6">Memorize estas palavras</h2>
          {memState === 'showing' ? (
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                    <circle
                      cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent"
                      strokeDasharray="226.2" strokeDashoffset={226.2 * (1 - timeLeft / 10)}
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
                      onClick={() => { 
                        if (isSelected) setSelectedWords(prev => prev.filter(w => w !== opt));
                        else if (selectedWords.length < 5) setSelectedWords(prev => [...prev, opt]);
                      }} 
                      className={`py-8 text-lg rounded-2xl shadow-sm transition-all border-2 ${
                        isSelected ? "bg-primary text-white border-primary" : "bg-white border-gray-100 text-[#1F2937]"
                      }`}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </div>
              {selectedWords.length === 5 && !feedback.type && (
                <Button 
                  onClick={() => {
                    const matches = selectedWords.filter(w => words.includes(w)).length;
                    if (matches >= 3) {
                      setCorrectCount(prev => prev + 1);
                      setScore(prev => prev + 33.3);
                      setFeedback({ type: 'success', message: "Muito bem! Sua memória está ótima. Vamos ao próximo!" });
                      setTimeout(() => { 
                        setExercise(2); 
                        setFeedback({ type: null, message: "" });
                        setSelectedWords([]);
                      }, 2500);
                    } else {
                      setFeedback({ type: 'retry', message: "Sua mente ainda não registrou essas palavras. Vamos tentar de novo com calma?" });
                      setTimeout(() => {
                        setSelectedWords([]);
                        setFeedback({ type: null, message: "" });
                        setMemState('showing');
                        setTimeLeft(10);
                      }, 3500);
                    }
                  }}
                  className="w-full py-8 text-xl font-bold bg-[#D97706] hover:bg-[#b46205] rounded-2xl"
                >
                  CONFERIR RESPOSTAS
                </Button>
              )}

              {feedback.type && (
                <div className={`py-6 px-4 rounded-2xl text-xl font-bold animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 ${
                  feedback.type === 'success' ? "text-primary bg-primary/10" : "text-[#D97706] bg-[#FFF9E6]"
                }`}>
                  {feedback.message}
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
          {!feedback.type ? (
            <div className="grid grid-cols-4 gap-4 mb-8">
              {grid.map((l, i) => (
                <Button key={i} onClick={() => {
                  if (l === intruder) {
                    setScore(s => s + 33.3);
                    setCorrectCount(c => c + 1);
                    setFeedback({ type: 'success', message: "Excelente observação! Você encontrou!" });
                    setTimeout(() => {
                      setExercise(3);
                      setFeedback({ type: null, message: "" });
                    }, 2500);
                  } else {
                    setFeedback({ type: 'retry', message: "Quase lá! Olhe com um pouquinho mais de atenção..." });
                    setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
                  }
                }} className="text-2xl h-16 bg-background text-foreground hover:bg-secondary transition-all active:scale-90">
                  {l}
                </Button>
              ))}
            </div>
          ) : (
            <div className={`py-12 px-4 rounded-2xl text-xl font-bold animate-in fade-in zoom-in ${
              feedback.type === 'success' ? "text-primary bg-primary/10" : "text-[#D97706] bg-[#FFF9E6]"
            }`}>
              {feedback.message}
            </div>
          )}
        </Card>
      )}

      {exercise === 3 && (
        <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm text-center">
          <h2 className="text-2xl font-bold mb-2">Qual o próximo número?</h2>
          <p className="text-gray-600 mb-8">Identifique o padrão na sequência:</p>
          {!feedback.type ? (
            <>
              <div className="text-5xl font-bold mb-10 text-[#4A7C59] tracking-wider">{sequence.join(", ")} , ?</div>
              <div className="grid grid-cols-2 gap-4">
                {logicOptions.map(num => (
                  <Button key={num} onClick={async () => {
                    if (num === answer) {
                      setScore(prev => prev + 33.4);
                      setCorrectCount(prev => prev + 1);
                      setFeedback({ type: 'success', message: "Incrível! Raciocínio nota dez!" });
                      setTimeout(async () => {
                        await finishChallenge();
                      }, 2500);
                    } else {
                      setFeedback({ type: 'retry', message: "O padrão é um pouquinho diferente... tente pensar na sequência de novo." });
                      setTimeout(() => setFeedback({ type: null, message: "" }), 3000);
                    }
                  }} className="py-6 text-xl bg-background text-foreground hover:bg-secondary transition-all active:scale-95">
                    {num}
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className={`py-12 px-4 rounded-2xl text-xl font-bold animate-in fade-in zoom-in ${
              feedback.type === 'success' ? "text-primary bg-primary/10" : "text-[#D97706] bg-[#FFF9E6]"
            }`}>
              {feedback.message}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
