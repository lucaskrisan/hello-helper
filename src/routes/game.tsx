import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { generateTaskByCategory, generateDailyChallenge, GAME_ASSETS } from "@/lib/game-engine";
import { toast } from "sonner";
import { ChevronLeft, Trophy, Brain, Timer, Hourglass, Check, X } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
import { getCurrencySymbol } from "@/i18n/detect-country";


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
  const { t } = useTranslation();
  
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

  const isFinishedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const finishChallenge = useCallback(async () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;

    const { data: { user } } = await supabase.auth.getUser();
    const finalScore = Math.min(100, Math.round(scoreRef.current));
    const totalTime = Math.floor((Date.now() - startTime) / 1000);

    if (user) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      const yesterdayStr = yest.toISOString().split('T')[0];

      await supabase.from("daily_challenges").insert({
        user_id: user.id,
        score: finalScore,
        total_questions: tasksLengthRef.current || 7,
        correct_answers: correctCountRef.current,
        total_time: totalTime,
      });

      // Update streak — only if this is the first challenge today
      const { data: existingStreak } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      const lastDate = existingStreak?.last_completed_date;
      if (lastDate !== todayStr) {
        const currentStreak = existingStreak?.current_streak || 0;
        const newStreak = lastDate === yesterdayStr ? currentStreak + 1 : 1;
        const bestStreak = Math.max(existingStreak?.best_streak || 0, newStreak);
        await supabase.from("streaks").upsert(
          { user_id: user.id, current_streak: newStreak, best_streak: bestStreak, last_completed_date: todayStr },
          { onConflict: "user_id" }
        );
      }
    }

    if (search.mode === 'trial') {
      trackEvent('test_completed', { score: finalScore, time: totalTime });
    } else {
      trackEvent('daily_challenge_completed', { score: finalScore, time: totalTime });
    }

    if (isMountedRef.current) {
      navigate({ to: "/conclusao", search: { score: finalScore, time: totalTime }, replace: true });
    }
  }, [startTime, navigate, search.mode]);


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
        } else if (search.mode === 'category' && search.categoryId) {
          trackEvent('category_started', { category: search.categoryId });
          const seed = Date.now();
          newTasks = await Promise.all([
            generateTaskByCategory(search.categoryId, seed, 'easy', usedIds),
            generateTaskByCategory(search.categoryId, seed + 100, 'easy', usedIds),
            generateTaskByCategory(search.categoryId, seed + 200, 'medium', usedIds),
            generateTaskByCategory(search.categoryId, seed + 300, 'medium', usedIds),
            generateTaskByCategory(search.categoryId, seed + 400, 'hard', usedIds),
          ]);
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
        toast.error(t('game_error_loading'));
      } finally {
        setIsLoading(false);
      }
    }
    
    setSelectedWords([]);
    setMemState('showing');
    setTimeLeft(15);
    setUserSequence([]);
    setFeedback({ type: null, message: "" });
  }, [search.mode, finishChallenge, tasks, taskIndex]);


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
        import("@/lib/game-engine")
          .then(m => m.saveToHistory(id, currentTask.categoryName || currentTask.category || "unknown"))
          .catch(console.error);
      });
    } else if (currentTask?.itemId) {
      import("@/lib/game-engine")
        .then(m => m.saveToHistory(currentTask.itemId, currentTask.categoryName || currentTask.category || "unknown"))
        .catch(console.error);
    }

    setFeedback({ type: 'success', message: t('game_feedback_success_msg') });
    setTimeout(() => {
      loadNextTask();
    }, 800);
  };

  const handleRetry = (msg?: string) => {
    setErrorCount(e => e + 1);
    setFeedback({ 
      type: 'retry', 
      message: msg || t('game_feedback_retry_msg') 
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
    if (globalTimeLeft === 0 && !isLoading && isMountedRef.current) {
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
      <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-6 text-center">
        <div className="flex flex-col items-center gap-6 max-w-xs">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-bold text-xl leading-relaxed">{t('game_loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-lg flex justify-between items-center mb-6 gap-2 md:gap-4">
        <Button variant="ghost" onClick={() => navigate({ to: "/" })} className="rounded-full w-10 h-10 md:w-12 md:h-12 p-0 bg-white shadow-sm shrink-0 border border-gray-100">
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </Button>
        <div className="bg-white px-3 py-2 md:px-4 md:py-2.5 rounded-full shadow-sm flex items-center space-x-2 flex-1 justify-center border border-gray-100">
          <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary" />
          <span className="font-bold text-gray-700 text-xs md:text-sm whitespace-nowrap">{t('game_step', { current: taskIndex, total: tasks.length || (search.mode === 'trial' ? '5' : '10') })}</span>
        </div>
        <div className="bg-white px-3 py-2 md:px-4 md:py-2.5 rounded-full shadow-sm flex items-center space-x-1.5 shrink-0 border border-gray-100">
          <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
          <span className="font-bold text-gray-700 text-xs md:text-sm">{Math.round(score)}</span>
        </div>
        <div className="bg-white px-3 py-2 md:px-4 md:py-2.5 rounded-full shadow-sm flex items-center space-x-1.5 shrink-0 border border-gray-100">
          <Hourglass className={`w-4 h-4 md:w-5 md:h-5 ${globalTimeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
          <span className={`font-mono font-bold text-xs md:text-sm ${globalTimeLeft < 60 ? 'text-red-500' : 'text-gray-700'}`}>
            {formatTime(globalTimeLeft)}
          </span>
        </div>
      </div>

      <Card className="w-full max-w-lg p-6 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl border-none min-h-[450px] sm:min-h-[500px] md:min-h-[600px] flex flex-col justify-center relative overflow-hidden">
        {feedback.type && (
          <div className={`absolute inset-0 z-10 flex items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300 ${
            feedback.type === 'success' ? "bg-primary/95 text-white" : "bg-orange-500/95 text-white"
          }`}>
            <div className="flex flex-col items-center">
              <span className="text-6xl mb-4">{feedback.type === 'success' ? "🌟" : "💡"}</span>
              <h3 className="text-3xl font-bold mb-2">{feedback.type === 'success' ? t('game_feedback_success_title') : t('game_feedback_retry_title')}</h3>
              <p className="text-xl opacity-90">{feedback.message}</p>
            </div>
          </div>
        )}
        
        {currentTask.type === 'memory-shopping' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">{t('ex_shopping_title')}</h2>
            <p className="text-gray-500 mb-6">{t('ex_shopping_subtitle')}</p>
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
                  {t('ex_memorized')}
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <p className="text-2xl font-bold text-gray-700">{t('ex_shopping_question', { item: currentTask.list?.find((it: any) => it.qty === currentTask.answer)?.item ?? currentTask.answer })}</p>
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
            <h2 className="text-2xl font-bold mb-2">{t('ex_memorize_words_title')}</h2>
            <p className="text-gray-500 mb-6">{t('ex_memorize_words_subtitle')} <span className="text-primary font-bold uppercase">{currentTask.categoryName}</span>.</p>
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
                  {t('ex_ready')}
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
                  const wrongPicks = selectedWords.filter(w => !currentTask.words.includes(w)).length;
                  if (correct === currentTask.words.length && wrongPicks === 0) handleCorrect();
                  else handleRetry();
                }} className="col-span-2 mt-4 bg-orange-500 py-6 text-xl font-bold">{t('ex_check')}</Button>
              </div>
            )}
          </div>
        )}

        {currentTask.type === 'attention-letter' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t('ex_attention_title')}</h2>
            <p className="text-gray-500 mb-8">{t('ex_attention_subtitle')}</p>
            <div className="grid gap-2 md:gap-3 mx-auto max-w-full" style={{ gridTemplateColumns: `repeat(${currentTask.cols}, 1fr)` }}>
              {currentTask.grid.map((item: string, i: number) => (
                <Button 
                  key={i} 
                  onClick={() => item === currentTask.intruder ? handleCorrect() : handleRetry()} 
                  className="h-10 sm:h-12 md:h-16 text-lg md:text-2xl font-black bg-gray-50 text-gray-700 border-2 hover:bg-white hover:border-primary/30 transition-all active:scale-90"
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        )}

        {currentTask.type === 'word-intruder' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t('ex_intruder_title')}</h2>
            <p className="text-gray-500 mb-8">{t('ex_intruder_subtitle')} <span className="font-bold text-primary">{currentTask.categoryName}</span>?</p>
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
            <h2 className="text-2xl font-bold mb-4">{t('ex_true_false_title')}</h2>
            <p className="text-2xl font-medium text-gray-700 mb-12">"{currentTask.statement}"</p>
            <div className="flex gap-4">
              <Button onClick={() => currentTask.isTrue ? handleCorrect() : handleRetry()} className="flex-1 py-10 bg-green-500 text-white text-2xl font-bold"><Check className="mr-2" /> {t('ex_true')}</Button>
              <Button onClick={() => !currentTask.isTrue ? handleCorrect() : handleRetry()} className="flex-1 py-10 bg-red-500 text-white text-2xl font-bold"><X className="mr-2" /> {t('ex_false')}</Button>
            </div>
          </div>
        )}

        {currentTask.type === 'logic-change' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t('ex_change_title')}</h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('ex_change_question', { 
                currency: getCurrencySymbol(), 
                price: currentTask.price, 
                paid: currentTask.paid 
              })}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {currentTask.options.map((opt: number) => (
                <Button key={opt} onClick={() => opt === currentTask.answer ? handleCorrect() : handleRetry()} className="py-8 text-3xl font-bold bg-white text-gray-700 border-2">
                  {getCurrencySymbol()} {opt}
                </Button>
              ))}
            </div>
          </div>
        )}


        {currentTask.type === 'alphabetical-order' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">{t('ex_alpha_title')}</h2>
            <p className="text-gray-500 mb-8">{t('ex_alpha_subtitle')}</p>
            <div className="space-y-2">
              {currentTask.words.map((word: string) => (
                <Button key={word} onClick={() => {
                  const newSeq = [...userSequence, word];
                  setUserSequence(newSeq);
                  if (currentTask.answer[newSeq.length - 1] !== word) {
                    handleRetry(t('game_order_wrong'));
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
            <h2 className="text-2xl font-bold mb-4">{t('ex_sequence_title')}</h2>
            <p className="text-gray-500 mb-8">{t('ex_sequence_subtitle')}</p>
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
        <span className="italic">{t('game_motivational')}</span>
      </div>
    </div>
  );
}
