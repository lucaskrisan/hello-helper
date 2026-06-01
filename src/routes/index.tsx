import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
        Seu desafio mental de hoje está pronto.
      </h1>
      <p className="text-xl text-foreground/80 mb-10 max-w-lg">
        Exercícios simples para memória, atenção e raciocínio, feitos para adultos 50+.
      </p>
      <Button 
        onClick={() => navigate({ to: "/login" })}
        className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-8 px-12 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        COMEÇAR AGORA
      </Button>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl text-left">
        {[
          "Treine sua memória todos os dias",
          "Exercícios simples e rápidos",
          "Acompanhe sua evolução",
          "Crie uma rotina saudável",
        ].map((benefit) => (
          <div key={benefit} className="flex items-center space-x-3 p-4 bg-white rounded-xl shadow-sm">
            <div className="w-4 h-4 rounded-full bg-secondary" />
            <span className="text-foreground font-semibold text-lg">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
