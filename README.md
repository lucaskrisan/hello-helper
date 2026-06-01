# Hello Helper - Mente Ativa 🧠

Este é o projeto completo do motor de treinamento cognitivo para o público 45+.

## Estrutura Principal

- `src/lib/game-engine.ts`: Motor lógico dos desafios.
- `src/lib/content-pools.ts`: Base de dados temática com mais de 500 itens.
- `src/routes/game.tsx`: Interface do jogo com cronômetro e feedback.
- `src/routes/conclusao.tsx`: Relatório de performance cognitiva.
- `src/routes/welcome.tsx`: Onboarding e checkout.
- `supabase/functions/stripe-webhook/index.ts`: Processamento de pagamentos.

## Tecnologias

- **Frontend**: React, TanStack Router, Tailwind CSS.
- **Backend**: Supabase (Auth, DB, Edge Functions).
- **Pagamentos**: Stripe Integration.

## Como Executar

1. Instale as dependências: `npm install`
2. Configure as variáveis do Supabase.
3. Inicie o servidor: `npm run dev`
