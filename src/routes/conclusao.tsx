import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/conclusao")({
  component: Conclusion,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      score: (search.score as number) || 0,
      time: (search.time as number) || 0,
    };
  },
});

function Conclusion() {
  const { score, time } = Route.useSearch();
  const navigate = useNavigate();

  const curiosities = [
    "Aprender algo novo todos os dias ajuda o cérebro a criar novas conexões.",
    "Beber água regularmente é fundamental para a clareza mental.",
    "Uma caminhada de 10 minutos pode melhorar significativamente sua atenção.",
    "Dormir bem é o momento em que o cérebro organiza as memórias do dia."
  ];
  const curiosity = curiosities[Math.floor(Math.random() * curiosities.length)];

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md p-8 bg-white rounded-3xl shadow-sm text-center">
        <CheckCircle2 className="w-20 h-20 text-[#4A7C59] mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Parabéns!</h1>
        <p className="text-xl text-[#1F2937] mb-8">Você completou o desafio de hoje.</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#F7F3EA] p-4 rounded-2xl">
            <p className="text-sm text-gray-500">Pontuação</p>
            <p className="text-2xl font-bold">{score}</p>
          </div>
          <div className="bg-[#F7F3EA] p-4 rounded-2xl">
            <p className="text-sm text-gray-500">Tempo</p>
            <p className="text-2xl font-bold">{time}s</p>
          </div>
        </div>

        <div className="bg-[#FFF9E6] p-6 rounded-2xl mb-8 text-left border-l-4 border-[#D97706]">
          <p className="text-xs font-bold text-[#D97706] uppercase mb-1">Curiosidade do dia</p>
          <p className="text-[#1F2937] italic">"{curiosity}"</p>
        </div>

        <Button 
          onClick={() => navigate({ to: "/dashboard" })}
          className="w-full py-6 text-lg bg-[#4A7C59] hover:bg-[#3d694a]"
        >
          VOLTAR AO INÍCIO
        </Button>
      </Card>
    </div>
  );
}
