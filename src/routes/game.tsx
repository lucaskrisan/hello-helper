import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { generateTaskByCategory, generateDailyChallenge, GAME_ASSETS } from "@/lib/game-engine";
import { toast } from "sonner";
import { ChevronLeft, Trophy, Brain, Timer, Hourglass } from "lucide-react";

export const Route = createFileRoute("/game")({
  component: Game,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mode: (search.mode as 'daily' | 'category') || 'daily',
      categoryId: search.categoryId as string | undefined
    };
  }
});

function Game() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/game" });
  
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [taskIndex, setTaskIndex] = useState(0); // Para modo diário
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<{ type: 'success' | 'retry' | null; message: string }>({ type: null, message: "" });
  
  // Estados específicos de exercícios
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [memState, setMemState] = useState<'showing' | 'choosing'>('showing');
  const [timeLeft, setTimeLeft] = useState(15);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [searchSelection, setSearchSelection] = useState<{r: number, c: number}[]>([]);
  const [totalTimeInApp, setTotalTimeInApp] = useState(0);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(300); // 5 minutos para categorias

  const finishChallenge = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const finalScore = Math.min(100, Math.round(score));
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    
    if (user) {
      await supabase.from("daily_challenges").insert({
        user_id: user.id,
        score: finalScore,
        total_questions: search.mode === 'daily' ? 24 : taskIndex,
        correct_answers: search.mode === 'daily' ? 24 : taskIndex,
        total_time: totalTime,
      });
    }
    
    navigate({ to: "/conclusao", search: { score: finalScore, time: totalTime }, replace: true });
  }, [score, startTime, search.mode, taskIndex, navigate]);

  // Timer de sessão para modo categoria
  useEffect(() => {
    if (search.mode === 'category') {
      const timer = setInterval(() => {
        setSessionTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [search.mode]);

  useEffect(() => {
    if (search.mode === 'category' && sessionTimeLeft === 0) {
      finishChallenge();
    }
  }, [sessionTimeLeft, search.mode, finishChallenge]);

  // 10-minute engagement check
  useEffect(() => {
    const interval = setInterval(() => {
      setTotalTimeInApp(prev => {
        const next = prev + 1;
        if (next % 600 === 0) { // 10 minutes (600 seconds)
          toast.success("Seu cérebro está em evolução! 🧠", {
            description: `Já se passaram ${next / 60} minutos que sua memória foi melhorada... Muito bem!`,
            duration: 6000,
          });
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadNextTask = useCallback(() => {
    if (search.mode === 'daily') {
      const daily = generateDailyChallenge(new Date().toISOString().split('T')[0]);
      if (taskIndex < daily.tasks.length) {
        setCurrentTask(daily.tasks[taskIndex]);
        setTaskIndex(prev => prev + 1);
      } else {
        finishChallenge();
      }
    } else if (search.mode === 'category' && search.categoryId) {
      const task = generateTaskByCategory(search.categoryId, Math.random() * 10000);
      setCurrentTask(task);
      setTaskIndex(prev => prev + 1);
    }
    
    // Reset states
    setSelectedWords([]);
    setUserSequence([]);
    setActiveButton(null);
    setIsShowingSequence(false);
    setMemState('showing');
    setTimeLeft(15);
    setSearchSelection([]);
    setFeedback({ type: null, message: "" });
  }, [search.mode, search.categoryId, taskIndex]);

  useEffect(() => {
    loadNextTask();
  }, []);

  const playSequence = useCallback(async (sequence: number[]) => {
    setIsShowingSequence(true);
    for (const buttonIdx of sequence) {
      setActiveButton(buttonIdx);
      await new Promise(r => setTimeout(r, 800));
      setActiveButton(null);
      await new Promise(r => setTimeout(r, 300));
    }
    setIsShowingSequence(false);
  }, []);

  useEffect(() => {
    if (currentTask?.type === 'memory-sequence') {
      setTimeout(() => {
        playSequence(currentTask.sequence);
      }, 1000);
    }
  }, [currentTask, playSequence]);

  const handleCorrect = () => {
    const increment = search.mode === 'daily' ? (100 / 24) : 5;
    setScore(s => s + increment);
    setFeedback({ type: 'success', message: "Muito bem! Você está indo muito bem!" });
    setTimeout(() => {
      loadNextTask();
    }, 2000);
  };

  const handleRetry = (msg?: string) => {
    setFeedback({ 
      type: 'retry', 
      message: msg || "Sua mente ainda não registrou essa informação. Vamos corrigi-la? Tente novamente." 
    });
    setTimeout(() => {
      setFeedback({ type: null, message: "" });
      if (currentTask?.type?.startsWith('memory')) {
        setMemState('showing');
        setTimeLeft(15);
        setSelectedWords([]);
        setUserSequence([]);
      } else if (currentTask?.type === 'word-search') {
        setSearchSelection([]);
      }
    }, 3000);
  };


  // Timer para memória
  useEffect(() => {
    if (currentTask?.type?.startsWith('memory') && currentTask.type !== 'memory-sequence' && memState === 'showing') {
      if (timeLeft <= 0) {
        setMemState('choosing');
        return;
      }
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentTask?.type, memState, timeLeft]);

  if (!currentTask) return null;

  const categoryInfo = GAME_ASSETS.categories.find(c => c.id === (search.categoryId || currentTask.type));

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 flex flex-col items-center">
      {/* Top Navigation */}
      <div className="w-full max-w-md flex justify-between items-center mb-4 gap-2">
        <Button 
          variant="ghost" 
          onClick={() => navigate({ to: "/" })}
          className="rounded-full w-10 h-10 p-0 bg-white shadow-sm shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-2 flex-1 justify-center min-w-0">
          {search.mode === 'daily' ? (
            <div className="flex flex-col items-center truncate">
              <div className="flex items-center space-x-1.5">
                <Brain className="w-4 h-4 text-primary shrink-0" />
                <span className="font-bold text-gray-700 text-sm">
                  Etapa {taskIndex}/24
                </span>
              </div>
              <div className="text-[9px] font-bold uppercase tracking-tighter text-primary truncate w-full text-center">
                {currentTask.level === 'easy' ? 'Easy' : currentTask.level === 'medium' ? 'Medium' : 'Mente Forte'}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Hourglass className="w-4 h-4 text-orange-500 animate-pulse shrink-0" />
              <span className="font-bold text-gray-700 text-sm">
                {Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
        <div className="bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-1.5 shrink-0">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-gray-700 text-sm">{Math.round(score)}</span>
        </div>
      </div>

      <Card className="w-full max-w-md p-4 sm:p-6 bg-white rounded-[2rem] shadow-sm border-none min-h-[450px] sm:min-h-[500px] flex flex-col justify-center relative overflow-hidden">
        {feedback.type && (
          <div className={`absolute inset-0 z-10 flex items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300 ${
            feedback.type === 'success' ? "bg-primary/95 text-white" : "bg-orange-500/95 text-white"
          }`}>
            <div className="flex flex-col items-center">
              <span className="text-6xl mb-4">{feedback.type === 'success' ? "🌟" : "💡"}</span>
              <h3 className="text-3xl font-bold mb-2">{feedback.type === 'success' ? "Muito bem!" : "Vamos tentar?"}</h3>
              <p className="text-xl opacity-90">{feedback.message}</p>
            </div>
          </div>
        )}

        {currentTask.type === 'memory-words' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Memorize as palavras</h2>
            <p className="text-gray-500 mb-6 px-4">Tente fixar estas palavras na mente. Você precisará lembrá-las em alguns segundos!</p>
            {memState === 'showing' ? (
              <div className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="226.2" strokeDashoffset={226.2 * (1 - timeLeft / 15)} className="text-orange-500 transition-all duration-1000" />
                    </svg>
                    <span className="text-2xl font-bold text-orange-600">{timeLeft}</span>
                  </div>
                </div>
                {currentTask.words.map((w: string) => <p key={w} className="text-3xl font-bold text-[#4A7C59]">{w}</p>)}
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm sm:text-lg text-gray-600">Quais palavras você viu?</p>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {currentTask.options.map((opt: string) => (
                    <Button 
                      key={opt}
                      onClick={() => {
                        if (selectedWords.includes(opt)) setSelectedWords(s => s.filter(w => w !== opt));
                        else if (selectedWords.length < currentTask.words.length) setSelectedWords(s => [...s, opt]);
                      }}
                      className={`py-4 sm:py-8 text-base sm:text-lg rounded-xl sm:rounded-2xl border-2 transition-all ${
                        selectedWords.includes(opt) ? "bg-primary text-white border-primary" : "bg-white border-gray-100 text-gray-700"
                      }`}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
                {selectedWords.length === currentTask.words.length && (
                  <Button onClick={() => {
                    const correctCount = selectedWords.filter(w => currentTask.words.includes(w)).length;
                    const required = Math.max(1, currentTask.words.length - 1); // Exige acertar quase tudo (ex: 2/3, 4/5, 6/7)
                    if (correctCount >= required) handleCorrect();
                    else handleRetry();
                  }} className="w-full py-8 text-xl font-bold bg-orange-500 rounded-2xl mt-4 shadow-lg">CONFERIR</Button>
                )}
              </div>
            )}
          </div>
        )}

        {currentTask.type === 'memory-sequence' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Sequência de Cores</h2>
            <p className="text-gray-500 mb-8 px-4">{isShowingSequence ? "Observe com atenção a ordem em que as cores piscam..." : "Agora, toque nas cores seguindo a mesma ordem que você acabou de ver!"}</p>
            <div className="grid grid-cols-2 gap-4 max-w-[280px] mx-auto">
              {currentTask.colors.map((color: string, i: number) => (
                <button
                  key={i}
                  disabled={isShowingSequence}
                  onClick={() => {
                    const nextSequence = [...userSequence, i];
                    setUserSequence(nextSequence);
                    
                    // Feedback visual ao clicar
                    setActiveButton(i);
                    setTimeout(() => setActiveButton(null), 300);

                    // Verificar acerto
                    if (currentTask.sequence[nextSequence.length - 1] !== i) {
                      handleRetry("Ops! A sequência foi um pouco diferente. Vamos tentar de novo?");
                      setUserSequence([]);
                      setTimeout(() => playSequence(currentTask.sequence), 3500);
                    } else if (nextSequence.length === currentTask.sequence.length) {
                      handleCorrect();
                    }
                  }}
                  className={`h-20 sm:h-28 rounded-2xl sm:rounded-3xl transition-all transform active:scale-95 ${
                    activeButton === i ? "brightness-125 scale-105 shadow-xl ring-4 ring-white" : "brightness-100 shadow-md"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {!isShowingSequence && userSequence.length > 0 && (
              <p className="mt-4 sm:mt-6 text-primary font-bold text-sm sm:text-base">{userSequence.length} de {currentTask.sequence.length} cores</p>
            )}
          </div>
        )}


        {currentTask.type === 'memory-shopping' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Lista de Compras</h2>
            <p className="text-gray-500 mb-6 px-4">Imagine que você está no mercado. Memorize bem as quantidades de cada item da sua lista!</p>
            {memState === 'showing' ? (
              <div className="space-y-6">
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="226.2" strokeDashoffset={226.2 * (1 - timeLeft / 15)} className="text-orange-500 transition-all duration-1000" />
                    </svg>
                    <span className="text-2xl font-bold text-orange-600">{timeLeft}</span>
                  </div>
                </div>
                <div className="bg-orange-50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-orange-100 text-left">
                  <p className="text-orange-800 font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">🛒 Memorize as quantidades:</p>
                  <ul className="space-y-2 sm:space-y-3">
                    {currentTask.list.map((item: any, i: number) => (
                      <li key={i} className="text-xl sm:text-2xl text-gray-700 flex justify-between border-b border-orange-200/50 pb-1 sm:pb-2">
                        <span className="font-medium">{item.item}</span>
                        <span className="font-bold text-primary">{item.qty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <p className="text-2xl font-bold text-gray-700">{currentTask.question}</p>
                <div className="grid grid-cols-2 gap-4">
                  {currentTask.options.map((qty: number) => (
                    <Button 
                      key={qty}
                      onClick={() => {
                        if (qty === currentTask.answer) handleCorrect();
                        else handleRetry("Quase! Essa não era a quantidade certa. Vamos tentar de novo?");
                      }}
                      className="py-6 sm:py-10 text-2xl sm:text-4xl font-bold rounded-[1.5rem] bg-white border-2 border-gray-100 text-gray-700 shadow-sm transition-all active:scale-95"
                    >
                      {qty}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTask.type === 'memory-association' && (

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Associação de Cores</h2>
            <p className="text-gray-500 mb-6 px-4">Guarde bem a cor deste objeto. Vamos ver se você consegue lembrá-la daqui a pouco!</p>
            {memState === 'showing' ? (
              <div className="space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="absolute w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="226.2" strokeDashoffset={226.2 * (1 - timeLeft / 15)} className="text-orange-500 transition-all duration-1000" />
                    </svg>
                    <span className="text-2xl font-bold text-orange-600">{timeLeft}</span>
                  </div>
                </div>
                <div className="p-8 rounded-[2rem] border-4 inline-block mb-4" style={{ borderColor: currentTask.color }}>
                   <span className="text-6xl">
                     {currentTask.item === 'Flor' ? '🌸' : 
                      currentTask.item === 'Vaso' ? '🏺' : 
                      currentTask.item === 'Relógio' ? '⌚' : 
                      currentTask.item === 'Livro' ? '📖' : 
                      currentTask.item === 'Caneta' ? '🖋️' :
                      currentTask.item === 'Cadeira' ? '🪑' :
                      currentTask.item === 'Mesa' ? '🪑' : // Mesa emoji alternative
                      currentTask.item === 'Lâmpada' ? '💡' : '🖋️'}
                   </span>
                </div>
                <p className="text-2xl font-bold text-gray-700">
                  {['Flor', 'Caneta', 'Cadeira', 'Mesa', 'Lâmpada'].includes(currentTask.item) ? 'A' : 'O'} {currentTask.item} é desta cor.
                </p>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <p className="text-sm sm:text-lg text-gray-600">
                  Qual era a cor {['Flor', 'Caneta', 'Cadeira', 'Mesa', 'Lâmpada'].includes(currentTask.item) ? 'da' : 'do'} <span className="font-bold text-primary">{currentTask.item}</span>?
                </p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {currentTask.options.map((color: string) => (
                    <Button 
                      key={color}
                      onClick={() => {
                        if (color === currentTask.color) handleCorrect();
                        else handleRetry("Aquela cor era um pouquinho diferente... tente lembrar!");
                      }}
                      className="h-20 sm:h-24 rounded-2xl sm:rounded-3xl shadow-md border-4 border-white transition-all transform active:scale-95"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTask.type === 'logic' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Padrão Numérico</h2>
            <div className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
              <p className="text-blue-800 font-bold mb-1">Como resolver?</p>
              <p className="text-sm text-blue-600">
                {currentTask.patternDesc || "Descubra qual número completa a lógica abaixo."}
              </p>
            </div>
            <div className="flex justify-center items-center gap-1.5 sm:gap-2 mb-8 sm:mb-10 overflow-x-auto pb-2">
              {currentTask.sequence.map((num: number, i: number) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 bg-white text-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl font-bold border-2 border-blue-200 shadow-sm">
                      {num}
                    </div>
                  </div>
                  {i < currentTask.sequence.length - 1 && <span className="mx-0.5 sm:mx-1 text-gray-300">→</span>}
                </div>
              ))}
              <span className="mx-0.5 sm:mx-1 text-gray-300">→</span>
              <div className="w-11 h-11 sm:w-14 sm:h-14 bg-blue-600 text-white rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl font-bold animate-pulse shadow-lg ring-4 ring-blue-100">
                ?
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {currentTask.options.map((opt: number) => (
                <Button 
                  key={opt}
                  onClick={() => {
                    if (opt === currentTask.answer) handleCorrect();
                    else handleRetry("Quase! Observe bem a regra da sequência numérica.");
                  }}
                  className="py-6 sm:py-8 text-xl sm:text-2xl font-bold rounded-2xl bg-white border-2 border-gray-100 text-gray-700 hover:bg-blue-50 transition-all"
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {(currentTask.type === 'attention-letter' || currentTask.type === 'attention-color') && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Atenção Visual</h2>
            <p className="text-gray-500 mb-8 px-4">Olhe para o quadro abaixo e toque no único elemento que é diferente dos outros.</p>
            <div className={`grid gap-3 mx-auto max-w-[320px]`} style={{ gridTemplateColumns: `repeat(${currentTask.cols || 4}, 1fr)` }}>
              {currentTask.grid.map((item: string, i: number) => (
                <Button 
                  key={i} 
                  onClick={() => {
                    if (item === currentTask.intruder) handleCorrect();
                    else handleRetry("Quase lá! Olhe com um pouquinho mais de carinho...");
                  }}
                  className={`p-0 rounded-xl shadow-sm border-2 border-gray-50 transition-transform active:scale-90 flex items-center justify-center ${
                    currentTask.type === 'attention-color' ? 'h-12' : 'h-12 text-xl font-bold text-gray-700'
                  }`}
                  style={currentTask.type === 'attention-color' ? { backgroundColor: item } : {}}
                >
                  {currentTask.type === 'attention-letter' ? item : ''}
                </Button>
              ))}
            </div>
          </div>
        )}

        {currentTask.type === 'word-search' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Caça-Palavras</h2>
            <p className="text-gray-500 mb-6 px-4">Toque nas letras para formar a palavra <span className="text-primary font-bold text-xl">{currentTask.word}</span> que está escondida no quadro.</p>
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2 mx-auto w-fit">
              {currentTask.grid.map((row: string[], r: number) => 
                row.map((char: string, c: number) => {
                  const isSelected = searchSelection.some(s => s.r === r && s.c === c);
                  return (
                    <Button
                      key={`${r}-${c}`}
                      onClick={() => {
                        const newSel = [...searchSelection, {r, c}];
                        setSearchSelection(newSel);
                        const word = newSel.map(s => currentTask.grid[s.r][s.c]).join("");
                        if (word === currentTask.word) handleCorrect();
                        else if (!currentTask.word.startsWith(word)) setSearchSelection([]);
                      }}
                      className={`w-9 h-9 sm:w-11 sm:h-11 p-0 text-lg sm:text-xl font-bold rounded-lg sm:rounded-xl transition-all ${
                        isSelected ? "bg-primary text-white scale-110 z-10" : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {char}
                    </Button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Card>
      
      {/* Motivational Footer */}
      <div className="mt-8 flex items-center space-x-2 text-gray-500 animate-pulse">
        <Timer className="w-5 h-5" />
        <span className="font-medium italic">Sua mente está ficando mais forte a cada minuto...</span>
      </div>
    </div>
  );
}

