import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export const Route = createFileRoute("/premium")({
  component: Premium,
});

function Premium() {
  const navigate = useNavigate();

  const benefits = [
    "Desafios ilimitados",
    "Histórico completo",
    "Novos exercícios todos os dias",
    "Relatórios de evolução",
    "Modo impressão",
    "Sem limite diário"
  ];

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-6 max-w-lg mx-auto">
      <header className="mb-8 flex items-center">
        <Button variant="ghost" onClick={() => navigate({ to: "/dashboard" })} className="mr-4">←</Button>
        <h1 className="text-3xl font-bold text-[#D97706]">Premium</h1>
      </header>

      <Card className="p-8 bg-white rounded-3xl border-0 shadow-lg mb-8">
        <h2 className="text-2xl font-bold mb-6">Mantenha sua mente afiada sem limites.</h2>
        <ul className="space-y-4 mb-8">
          {benefits.map(b => (
            <li key={b} className="flex items-center space-x-3">
              <div className="bg-[#FFF9E6] p-1 rounded-full">
                <Check className="w-5 h-5 text-[#D97706]" />
              </div>
              <span className="text-lg text-[#1F2937]">{b}</span>
            </li>
          ))}
        </ul>

        <div className="space-y-4">
          <Button className="w-full py-8 text-xl font-bold bg-[#4A7C59] hover:bg-[#3d694a] rounded-2xl">
            PLANO ANUAL - US$29.90
          </Button>
          <Button variant="outline" className="w-full py-8 text-xl font-bold border-2 border-[#4A7C59] text-[#4A7C59] hover:bg-[#F7F3EA] rounded-2xl">
            PLANO MENSAL - US$4.90
          </Button>
        </div>
      </Card>
      
      <p className="text-center text-gray-500 text-sm">
        Cancele quando quiser. Pagamento seguro via Stripe.
      </p>
    </div>
  );
}
