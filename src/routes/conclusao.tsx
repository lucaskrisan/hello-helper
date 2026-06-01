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
  const { score } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState<'report' | 'offer'>('report');
  const [email, setEmail] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);

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
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="font-medium">Memória</span>
              {renderStars(4)}
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="font-medium">Atenção</span>
              {renderStars(3)}
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="font-medium">Raciocínio</span>
              {renderStars(4)}
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
              <span className="font-medium">Velocidade Mental</span>
              {renderStars(3)}
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl mb-8 text-left border-l-4 border-blue-500">
            <p className="text-blue-900 font-medium leading-relaxed">
              Você apresentou boa capacidade de atenção e raciocínio. Sua memória mostrou sinais normais para quem não treina regularmente.
            </p>
            <p className="text-blue-900 font-bold mt-4">
              A boa notícia? Pequenos exercícios diários podem ajudar você a manter sua mente ativa e desafiada.
            </p>
          </div>

          {!showEmailCapture ? (
            <div className="space-y-4">
              <p className="text-gray-600 font-medium">Você gostaria de receber um novo desafio gratuito amanhã?</p>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowEmailCapture(true)}
                  className="flex-1 py-6 bg-primary text-white font-bold"
                >
                  SIM
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setStep('offer')}
                  className="flex-1 py-6 border-2"
                >
                  NÃO
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                  type="email" 
                  placeholder="Seu melhor e-mail" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 py-6 rounded-xl border-gray-200"
                />
              </div>
              <Button 
                onClick={() => setStep('offer')}
                disabled={!email.includes('@')}
                className="w-full py-6 bg-primary text-white font-bold text-lg"
              >
                VER MEU PLANO DE TREINO
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-bold mb-2">Seu desafio de hoje foi concluído.</h2>
        <p className="text-gray-600 mb-8">Continue treinando sua mente diariamente para manter os resultados.</p>

        <div className="space-y-4 mb-8">
          <div className="p-6 border-2 border-primary bg-primary/5 rounded-2xl relative text-left">
            <div className="absolute -top-3 right-4 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">POPULAR</div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg text-primary">Plano Anual</span>
              <span className="text-2xl font-bold">US$ 29,90</span>
            </div>
            <p className="text-sm text-gray-500">Equivale a apenas US$ 2,49 por mês</p>
          </div>

          <div className="p-6 border-2 border-gray-100 rounded-2xl text-left hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-lg">Plano Mensal</span>
              <span className="text-2xl font-bold">US$ 4,90</span>
            </div>
            <p className="text-sm text-gray-500">Cancele quando quiser</p>
          </div>
        </div>

        <ul className="space-y-3 mb-8 text-left px-2">
          {["Desafio diário personalizado", "Histórico de evolução", "Novos exercícios todos os dias", "Suporte prioritário"].map(b => (
            <li key={b} className="flex items-center space-x-3 text-gray-700">
              <Check className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-sm font-medium">{b}</span>
            </li>
          ))}
        </ul>

        <Button 
          onClick={() => {
            // Simulando clique no checkout para validação
            console.log("Validação: Usuário clicou em começar agora");
            navigate({ to: "/premium" }); 
          }}
          className="w-full py-8 text-xl font-bold bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          COMEÇAR AGORA
        </Button>
        <p className="text-xs text-gray-400 mt-4">Pagamento seguro via Stripe • Garantia de 7 dias</p>
      </Card>
    </div>
  );
}
