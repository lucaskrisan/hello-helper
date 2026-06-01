import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  return (
    <div className="min-h-screen bg-[#F7F3EA] flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl">
        <h2 className="text-2xl font-bold text-center mb-8 text-[#1F2937]">Entrar no Desafio da Mente</h2>
        <Button 
          onClick={() => lovable.auth.signInWithOAuth("google")}
          className="w-full py-6 text-lg bg-white border-2 border-[#1F2937] text-[#1F2937] hover:bg-[#F7F3EA]"
        >
          Entrar com Google
        </Button>
      </Card>
    </div>
  );
}
