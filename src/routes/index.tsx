import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F7F3EA] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8">
        <span className="text-5xl">🧠</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] mb-8 tracking-tight max-w-2xl leading-tight">
        Você ainda se lembra do nome da sua primeira professora?
      </h1>
      
      <div className="space-y-6 mb-12 text-left max-w-md w-full">
        {[
          "✔ Do telefone da casa onde cresceu?",
          "✔ Da primeira música que marcou sua vida?",
        ].map((item) => (
          <div key={item} className="flex items-center space-x-3 text-xl text-gray-700 font-medium">
            <span>{item}</span>
          </div>
        ))}
      </div>

      <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
        Faça um teste rápido e descubra como está sua atenção e memória hoje.
      </p>
      
      <div className="space-y-4 w-full max-w-xs">
        <Button 
          onClick={() => navigate({ to: "/game", search: { mode: 'trial' } })}
          className="w-full bg-primary hover:bg-primary/90 text-white text-2xl py-10 px-12 rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95 font-bold uppercase tracking-wider"
        >
          FAZER TESTE
        </Button>
        <p className="text-sm text-gray-400">Teste gratuito de 2 minutos</p>
      </div>

      <div className="mt-16 text-gray-400 text-sm">
        Feito com carinho para quem tem 50+
      </div>
    </div>
  );
}
