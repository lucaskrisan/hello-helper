import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Star, Mail } from "lucide-react";

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
  const navigate = useNavigate();
  const [step, setStep] = useState<'report' | 'explanation' | 'offer'>('report');

  const renderStars = (count: number) => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-5 h-5 ${s <= count ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
      ))}
    </div>
  );

  if (step === 'report') {
    return (
      <div className="min-h-screen bg-[#F7F3EA] p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-sm text-center">
          <h1 className="text-3xl font-bold mb-6 text-[#1F2937]">Seu Perfil Cognitivo</h1>
          
          <div className="space-y-6 mb-8 text-left">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-medium">Memória</span>
              {renderStars(3)}
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-medium">Atenção</span>
              {renderStars(4)}
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-medium">Raciocínio</span>
              {renderStars(4)}
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-medium">Velocidade Mental</span>
              {renderStars(3)}
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl mb-8 text-left border-l-4 border-orange-500">
            <p className="text-orange-900 font-medium leading-relaxed">
              Você está indo bem em atenção e raciocínio. Mas sua memória e velocidade mental podem ser mais estimuladas no dia a dia.
            </p>
            <p className="text-orange-900 font-bold mt-4 italic">
              Muitas pessoas só percebem isso quando começam a esquecer pequenas coisas da rotina.
            </p>
          </div>

          <Button 
            onClick={() => setStep('explanation')}
            className="w-full py-10 text-xl font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 uppercase"
          >
            CONTINUAR TREINANDO
          </Button>
        </Card>
      </div>
    );
  }

  if (step === 'explanation') {
    return (
      <div className="min-h-screen bg-[#F7F3EA] p-4 flex flex-col items-center justify-center">
        <Card className="w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-sm text-center">
          <h1 className="text-3xl font-bold mb-6 text-[#1F2937]">O que isso significa?</h1>
          
          <div className="space-y-4 text-left mb-8">
            <p className="text-gray-700 leading-relaxed text-lg">
              Sua atenção está em um bom nível. Sua memória apresentou espaço para evolução.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              Isso não significa que exista um problema. Significa apenas que sua mente, como qualquer outra parte do corpo, pode ser estimulada e treinada.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg font-medium">
              A maioria das pessoas nunca faz isso.
            </p>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl mb-8 text-left">
            <p className="font-bold text-green-800 mb-4">Nos próximos 30 dias você receberá:</p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-green-900">
                <Check className="w-5 h-5" /> Um desafio novo por dia
              </li>
              <li className="flex items-center gap-2 text-green-900">
                <Check className="w-5 h-5" /> Exercícios progressivos
              </li>
              <li className="flex items-center gap-2 text-green-900">
                <Check className="w-5 h-5" /> Acompanhamento da sua evolução
              </li>
              <li className="flex items-center gap-2 text-green-900">
                <Check className="w-5 h-5" /> Novos desafios de memória e atenção
              </li>
            </ul>
          </div>

          <Button 
            onClick={() => setStep('offer')}
            className="w-full py-10 text-xl font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 uppercase"
          >
            VER MEU PLANO
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-xl text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
        
        <h2 className="text-2xl font-bold mb-2">Treine sua mente todos os dias</h2>
        <p className="text-gray-600 mb-8">Acesso completo a todos os exercícios e acompanhamento de evolução por 1 ano.</p>

        <div className="mb-8 p-8 border-2 border-primary bg-primary/5 rounded-3xl text-center">
          <p className="text-sm text-primary font-bold uppercase tracking-wider mb-2">Oferta Única de Lançamento</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-gray-400 line-through text-lg">US$ 49,90</span>
            <span className="text-4xl font-black text-[#1F2937]">US$ 19,90</span>
          </div>
          <p className="text-xs text-gray-500">Pagamento único • Sem mensalidades</p>
        </div>

        <ul className="space-y-4 mb-8 text-left px-2">
          {["Novos desafios diários", "Relatórios detalhados", "Acesso ilimitado", "Garantia total de 7 dias"].map(b => (
            <li key={b} className="flex items-center space-x-3 text-gray-700">
              <Check className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-base font-medium">{b}</span>
            </li>
          ))}
        </ul>

        <Button 
          onClick={() => {
            // Substituir pelo link de produção do seu Stripe quando for lançar
            window.location.href = "https://buy.stripe.com/test_6oEbMh9708pI5EYeUV"; 
          }}
          className="w-full py-8 text-2xl font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95"
        >
          GARANTIR MEU ACESSO
        </Button>
        
        <div className="mt-6 flex items-center justify-center gap-4 grayscale opacity-50">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
        </div>
      </Card>
    </div>
  );
}
