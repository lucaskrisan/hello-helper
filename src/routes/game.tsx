import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { generateTaskByCategory, generateDailyChallenge, GAME_ASSETS } from "@/lib/game-engine";
import { toast } from "sonner";
import { ChevronLeft, Trophy, Brain, Timer, Hourglass, Check, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/game")({
  component: Game,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      mode: (search.mode as 'daily' | 'category' | 'trial') || 'daily',
      categoryId: search.categoryId as string | undefined
    };
  }
});

function Game() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/game" });
  
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskIndex, setTaskIndex] = useState(0); 
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const scoreRef = useRef(0);
  const correctCountRef = useRef(0);
  const tasksLengthRef = useRef(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [feedback, setFeedback] = useState<{ type: 'success' | 'retry' | null; message: string }>({ type: null, message: "" });
  
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [memState, setMemState] = useState<'showing' | 'choosing'>('showing');
  const [timeLeft, setTimeLeft] = useState(15);
  const [userSequence, setUserSequence] = useState<any[]>([]);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(300);
  const [isLoading, setIsLoading] = useState(true);


  const finishChallenge = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const finalScore = Math.min(100, Math.round(scoreRef.current));
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    
    if (user) {
      await supabase.from("daily_challenges").insert({
        user_id: user.id,
        score: finalScore,
        total_questions: tasksLengthRef.current || 7,
        correct_answers: correctCountRef.current,
        total_time: totalTime,
      });
    }
    
    if (search.mode === 'trial') {
      trackEvent('test_completed', { score: finalScore, time: totalTime });
    } else {
      trackEvent('daily_challenge_completed', { score: finalScore, time: totalTime });
    }
    
    navigate({ to: "/conclusao", search: { score: finalScore, time: totalTime }, replace: true });
  }, [startTime, navigate]);


  const loadNextTask = useCallback(async (forceTasks?: any[]) => {
    if (forceTasks) {
      tasksLengthRef.current = forceTasks.length;
      setTasks(forceTasks);
      setCurrentTask(forceTasks[0]);
      setTaskIndex(1);
    } else if (tasks.length > 0) {
      if (taskIndex < tasks.length) {
        setCurrentTask(tasks[taskIndex]);
        setTaskIndex(prev => prev + 1);
      } else {
        finishChallenge();
      }
    } else {
      // Carregamento inicial
      setIsLoading(true);
      try {
        let newTasks: any[] = [];
        const { data: { user } } = await supabase.auth.getUser();
        const { getUsedItemIds } = await import("@/lib/game-engine");
        const usedIds = await getUsedItemIds(user?.id);

        if (search.mode === 'trial') {
          trackEvent('test_started');
          newTasks = [
            await generateTaskByCategory('memory', 10, 'easy', usedIds),
            await generateTaskByCategory('attention', 20, 'easy', usedIds),
            await generateTaskByCategory('logic', 30, 'easy', usedIds),
            await generateTaskByCategory('language', 40, 'medium', usedIds),
            await generateTaskByCategory('memory', 50, 'medium', usedIds),
          ];
        } else {
          const daily = await generateDailyChallenge(new Date().toISOString().split('T')[0]);
          newTasks = daily.tasks;
        }
        
        tasksLengthRef.current = newTasks.length;
        setTasks(newTasks);
        setCurrentTask(newTasks[0]);
        setTaskIndex(1);
      } catch (err) {
        console.error("Error loading tasks:", err);
        toast.error("Erro ao carregar os exercícios. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }
    
    setSelectedWords([]);
    setMemState('showing');
    setTimeLeft(15);
    setUserSequence([]);
    setFeedback({ type: null, message: "" });
  }, [search.mode, finishChallenge, score, correctCount, tasks.length]);


  useEffect(() => {
    loadNextTask();
  }, []);

  const handleCorrect = () => {
    const total = tasksLengthRef.current || (search.mode === 'trial' ? 5 : 10);
    const increment = 100 / total;
    setScore(s => {
      const next = s + increment;
      scoreRef.current = next;
      return next;
    });
    setCorrectCount(c => {
      const next = c + 1;
      correctCountRef.current = next;
      return next;
    });
    
    // Save to history if it has itemIds
    if (currentTask?.itemIds) {
      currentTask.itemIds.forEach((id: string) => {
        import("@/lib/game-engine").then(m => m.saveToHistory(id, currentTask.categoryName || currentTask.category || "unknown"));
      });
    } else if (currentTask?.itemId) {
      import("@/lib/game-engine").then(m => m.saveToHistory(currentTask.itemId, currentTask.categoryName || currentTask.category || "unknown"));
    }

    setFeedback({ type: 'success', message: "Muito bem! Sua mente está despertando!" });
    setTimeout(() => {
      loadNextTask();
    }, 800);
  };

  const handleRetry = (msg?: string) => {
    setErrorCount(e => e + 1);
    setFeedback({ 
      type: 'retry', 
      message: msg || "Vamos tentar de novo? Com calma a mente grava tudo." 
    });
    setTimeout(() => {
      setFeedback({ type: null, message: "" });
      if (currentTask?.type?.startsWith('memory')) {
        setMemState('showing');
        setTimeLeft(15);
      }
    }, 1200);
  };


  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Usamos refs ou estado capturado para evitar o loop de dependência
          // Mas aqui o componente vai re-renderizar e o finishChallenge vai ser chamado
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Sem dependências para não reiniciar o timer

  useEffect(() => {
    if (globalTimeLeft === 0 && !isLoading) {
      finishChallenge();
    }
  }, [globalTimeLeft, isLoading, finishChallenge]);

  useEffect(() => {
    if (currentTask?.type?.includes('memory') && memState === 'showing') {
      if (timeLeft <= 0) {
        setMemState('choosing');
        return;
      }
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [currentTask, memState, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !currentTask) {
    return (
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Preparando seu treino cerebral...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 flex flex-col items-center">
      <div className="w-full max-w-md flex justify-between items-center mb-4 gap-2">
        <Button variant="ghost" onClick={() => navigate({ to: "/" })} className="rounded-full w-10 h-10 p-0 bg-white shadow-sm shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-2 flex-1 justify-center">
          <Brain className="w-4 h-4 text-primary" />
          <span className="font-bold text-gray-700 text-sm">Etapa {taskIndex}/{tasks.length || (search.mode === 'trial' ? '5' : '10')}</span>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-1.5 shrink-0">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="font-bold text-gray-700 text-sm">{Math.round(score)}</span>
        </div>
        <div className="bg-white px-3 py-1.5 rounded-full shadow-sm flex items-center space-x-1.5 shrink-0">
          <Hourglass className={`w-4 h-4 ${globalTimeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
          <span className={`font-mono font-bold text-sm ${globalTimeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>
            {formatTime(globalTimeLeft)}
          </span>
        </div>
      </div>

      <Card className="w-full max-w-md p-6 bg-white rounded-[2rem] shadow-sm border-none min-h-[500px] flex flex-col justify-center relative overflow-hidden">
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
        
        {currentTask.type === 'memory-shopping' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Lista de Compras</h2>
            <p className="text-gray-500 mb-6">Memorize os itens e as quantidades.</p>
            {memState === 'showing' ? (
              <div className="space-y-4">
                <div className="text-3xl font-bold text-orange-600 mb-6">{timeLeft}s</div>
                <div className="bg-orange-50 p-6 rounded-2xl space-y-3 mb-6">
                  {currentTask.list.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-xl font-bold text-orange-900 border-b border-orange-200 pb-2">
                      <span>{item.item}</span>
                      <span className="bg-orange-200 px-3 py-1 rounded-lg">{item.qty}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={() => setMemState('choosing')}
                  variant="outline"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 font-bold py-6 rounded-xl"
                >
                  JÁ DECOREI
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <p className="text-2xl font-bold text-gray-700">{currentTask.question}</p>
                <div className="grid grid-cols-3 gap-4">
                  {currentTask.options.map((opt: number) => (
                    <Button 
                      key={opt}
                      onClick={() => opt === currentTask.answer ? handleCorrect() : handleRetry()}
                      className="py-8 text-3xl font-bold bg-white text-gray-700 border-2"
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentTask.type === 'memory-words' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Memorize as palavras</h2>
            <p className="text-gray-500 mb-6">Foque nestas palavras da categoria <span className="text-primary font-bold uppercase">{currentTask.categoryName}</span>.</p>
            {memState === 'showing' ? (
              <div className="space-y-4">
                <div className="text-3xl font-bold text-orange-600 mb-6">{timeLeft}s</div>
                <div className="space-y-3 mb-8">
                  {currentTask.words.map((w: string) => <p key={w} className="text-3xl font-bold text-[#4A7C59]">{w}</p>)}
                </div>
                <Button 
                  onClick={() => setMemState('choosing')}
                  variant="outline"
                  className="w-full border-green-200 text-[#4A7C59] hover:bg-green-50 font-bold py-6 rounded-xl"
                >
                  ESTOU PRONTO
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {currentTask.options.map((opt: string) => (
                  <Button 
                    key={opt}
                    onClick={() => {
                      if (selectedWords.includes(opt)) setSelectedWords(s => s.filter(w => w !== opt));
                      else setSelectedWords(s => [...s, opt]);
                    }}
                    className={`py-6 text-lg rounded-2xl border-2 ${selectedWords.includes(opt) ? "bg-primary text-white" : "bg-white text-gray-700"}`}
                  >
                    {opt}
                  </Button>
                ))}
                <Button onClick={() => {
                  const correct = selectedWords.filter(w => currentTask.words.includes(w)).length;
                  if (correct >= currentTask.words.length - 1) handleCorrect();
                  else handleRetry();
                }} className="col-span-2 mt-4 bg-orange-500 py-6 text-xl font-bold">CONFERIR</Button>
              </div>
            )}
          </div>
        )}

        {currentTask.type === 'attention-letter' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Atenção Visual</h2>
            <p className="text-gray-500 mb-8">Encontre o intruso no quadro abaixo.</p>
            <div className="grid gap-3 mx-auto max-w-[300px]" style={{ gridTemplateColumns: `repeat(${currentTask.cols}, 1fr)` }}>
              {currentTask.grid.map((item: string, i: number) => (
                <Button key={i} onClick={() => item === currentTask.intruder ? handleCorrect() : handleRetry()} className="h-12 text-xl font-bold bg-gray-50 text-gray-700 border-2">
                  {item}
                </Button>
              ))}
            </div>
          </div>
        )}

        {currentTask.type === 'word-intruder' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Palavra Intrusa</h2>
            <p className="text-gray-500 mb-8">Qual destas palavras NÃO pertence à categoria <span className="font-bold text-primary">{currentTask.categoryName}</span>?</p>
            <div className="space-y-3">
              {currentTask.options.map((opt: any) => (
                <Button key={opt.word} onClick={() => opt.word === currentTask.intruder ? handleCorrect() : handleRetry()} className="w-full py-6 text-xl bg-white text-gray-700 border-2">
                  {opt.word}
                </Button>
              ))}
            </div>
          </div>
        )}

        {currentTask.type === 'true-false' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Verdadeiro ou Falso?</h2>
            <p className="text-2xl font-medium text-gray-700 mb-12">"{currentTask.statement}"</p>
            <div className="flex gap-4">
              <Button onClick={() => currentTask.isTrue ? handleCorrect() : handleRetry()} className="flex-1 py-10 bg-green-500 text-white text-2xl font-bold"><Check className="mr-2" /> VERDADE</Button>
              <Button onClick={() => !currentTask.isTrue ? handleCorrect() : handleRetry()} className="flex-1 py-10 bg-red-500 text-white text-2xl font-bold"><X className="mr-2" /> FALSO</Button>
            </div>
          </div>
        )}

        {currentTask.type === 'logic-change' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Cálculo de Troco</h2>
            <p className="text-xl text-gray-600 mb-8">Você comprou um item por <span className="font-bold">R${currentTask.price}</span> e pagou com uma nota de <span className="font-bold">R${currentTask.paid}</span>. Quanto recebe de troco?</p>
            <div className="grid grid-cols-2 gap-4">
              {currentTask.options.map((opt: number) => (
                <Button key={opt} onClick={() => opt === currentTask.answer ? handleCorrect() : handleRetry()} className="py-8 text-3xl font-bold bg-white text-gray-700 border-2">
                  R$ {opt}
                </Button>
              ))}
            </div>
          </div>
        )}

        {currentTask.type === 'alphabetical-order' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ordem Alfabética</h2>
            <p className="text-gray-500 mb-8">Coloque as palavras na ordem correta (A-Z).</p>
            <div className="space-y-2">
              {currentTask.words.map((word: string) => (
                <Button key={word} onClick={() => {
                  const newSeq = [...userSequence, word];
                  setUserSequence(newSeq);
                  if (currentTask.answer[newSeq.length - 1] !== word) {
                    handleRetry("A ordem não está certa. Vamos começar de novo?");
                    setUserSequence([]);
                  } else if (newSeq.length === currentTask.words.length) {
                    handleCorrect();
                  }
                }} disabled={userSequence.includes(word)} className={`w-full py-4 text-lg ${userSequence.includes(word) ? "opacity-30" : "bg-white text-gray-700 border-2"}`}>
                  {word}
                </Button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {userSequence.map((w, i) => <span key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">{w}</span>)}
            </div>
          </div>
        )}

        {currentTask.type === 'logic' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sequência Numérica</h2>
            <p className="text-gray-500 mb-8">Qual o próximo número da sequência?</p>
            <div className="flex justify-center items-center gap-4 mb-12">
              {currentTask.sequence.map((n: number) => <span key={n} className="text-3xl font-bold text-gray-400">{n} →</span>)}
              <span className="text-4xl font-bold text-primary animate-pulse">?</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {currentTask.options.map((opt: number) => (
                <Button key={opt} onClick={() => opt === currentTask.answer ? handleCorrect() : handleRetry()} className="py-6 text-2xl font-bold bg-white text-gray-700 border-2">
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        )}
      </Card>
      <div className="mt-8 flex items-center space-x-2 text-gray-400">
        <Timer className="w-5 h-5" />
        <span className="italic">Sua mente está ficando mais forte a cada minuto...</span>
      </div>
    </div>
  );
}
