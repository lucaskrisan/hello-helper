## Resumo (modo simples)

Você escolheu o caminho mais profissional: cada país vai ver o app com referências da própria cultura. Um mexicano vê "tacos, Guadalajara, peso"; um argentino vê "asado, Córdoba, mate"; um brasileiro continua vendo "feijão, Belo Horizonte, churrasco". Tudo decidido automaticamente pelo IP de onde a pessoa está acessando.

Antes de eu sair codando, preciso seu OK neste plano.

---

## O que vai ser feito

### 1. Consertar os bugs atuais (primeiro de tudo)
- Remover o botão manual de troca de idioma que está bugando a tela (mostrando "landing_title" em vez do texto).
- Corrigir o erro de carregamento das traduções (problema de servidor vs navegador).

### 2. Detecção automática por IP
- Quando alguém abre o site, consultamos um serviço gratuito de geolocalização (ipapi.co).
- Identificamos o país e definimos o idioma + banco de exercícios certo automaticamente.
- Salvamos a preferência para não consultar de novo a cada visita.
- Fallback: se o IP não responder ou falhar, usa o idioma do navegador.

### 3. Países e idiomas suportados (fase 1)
| País | Código | Idioma | Banco de exercícios |
|------|--------|--------|---------------------|
| Brasil | BR | PT-BR | Banco brasileiro (atual) |
| México | MX | ES-MX | Banco mexicano |
| Argentina | AR | ES-AR | Banco argentino |
| Colômbia | CO | ES-CO | Banco colombiano |
| Chile | CL | ES-CL | Banco chileno |
| Outros países hispânicos | — | ES (genérico LATAM) | Banco genérico hispânico |
| EUA / outros | — | EN | Banco inglês genérico |

### 4. Tradução da interface (telas, botões, textos)
Todas as telas vão ter texto em PT, ES e EN:
- Landing (página inicial)
- Login / cadastro
- Onboarding
- Dashboard
- Tela de exercício (instruções, botões, feedbacks)
- Tela de conclusão
- Progresso
- Configurações
- Página de assinatura premium
- Tela pós-pagamento
- Admin (mantém em PT só, é interno)

### 5. Adaptação cultural dos exercícios
Cada banco regional terá ~100 palavras por categoria, adaptadas:

**Exemplo — categoria "Culinária":**
- 🇧🇷 BR: Feijão, Açaí, Brigadeiro, Pão de Queijo, Tapioca…
- 🇲🇽 MX: Frijol, Tacos, Mole, Guacamole, Chiles…
- 🇦🇷 AR: Asado, Empanadas, Dulce de Leche, Mate, Choripán…
- 🇨🇴 CO: Arepa, Bandeja Paisa, Sancocho, Ajiaco…

**Exemplo — categoria "Cidades":**
- 🇧🇷 BR: São Paulo, Rio de Janeiro, Salvador…
- 🇲🇽 MX: Ciudad de México, Guadalajara, Monterrey…
- 🇦🇷 AR: Buenos Aires, Córdoba, Rosario…

**Categorias afetadas (todas):**
Bíblia, Culinária, Geografia, Saúde, Animais, História, Objetos, Profissões, Família, Cidades.

### 6. Preferência salva no usuário logado
- Tabela `user_preferences` já tem campo `language`.
- Adicionar campo `country` (BR, MX, AR, CO, CL, etc) para salvar a região definida pelo IP.
- Usuário logado: usa a preferência salva.
- Usuário não logado: usa o IP.

### 7. Pequeno seletor manual (discreto)
Mantenho um seletor de idioma/região nas Configurações (não no topo da tela como antes) para o caso de alguém querer mudar manualmente. Sem botão flutuante intrusivo.

---

## Detalhes técnicos (pode pular se não te interessa)

- Biblioteca: `react-i18next` já instalada — vou corrigir a inicialização para funcionar com SSR (problema atual = hidratação quebrada).
- Detecção de IP: chamada client-side para `https://ipapi.co/json/` no primeiro carregamento (gratuito até 30k requests/mês — suficiente pra começar).
- Estrutura de arquivos:
  ```
  src/i18n/
    config.ts                    (config i18next)
    detect-country.ts            (chamada IP + cache)
    locales/
      pt-BR/common.json
      es-MX/common.json
      es-AR/common.json
      es-CO/common.json
      es/common.json             (genérico hispânico fallback)
      en/common.json
  src/lib/content-pools/
    pt-BR.ts
    es-MX.ts
    es-AR.ts
    es-CO.ts
    es-generic.ts
    en.ts
    index.ts                     (seletor por região)
  ```
- Migration: adicionar coluna `country text` em `user_preferences`.

---

## Custo estimado em créditos

Esse é o ponto importante. Vou ser honesto:

- Conserto bug + IP + tradução de interface (PT/ES/EN): **médio** — algumas horas de trabalho.
- Bancos culturais MX + AR + CO + CL + ES genérico + EN: **alto** — são ~6.000 palavras curadas (10 categorias × 100 palavras × 6 regiões), mais dicas e curiosidades equivalentes.

**Sugestão de faseamento para economizar:**
- **Fase 1 (agora):** Conserto + IP + interface traduzida + 1 banco ES genérico (vale pra qualquer hispânico) + EN. Já te permite vender em LATAM amanhã.
- **Fase 2 (depois):** Conforme você ver tração em cada país, eu adapto o banco específico (MX, AR, CO, CL).

---

## O que eu preciso de você antes de começar

1. **Confirma o faseamento?** Fase 1 agora, Fase 2 sob demanda?
2. **Os bancos ES/EN podem ser gerados por IA** (Gemini ou GPT) que eu chamo aqui no próprio gerador, ou você quer revisar palavra por palavra antes?
3. **Países além de BR + LATAM hispânica + EN?** Por exemplo, Portugal entra como PT-BR ou cria PT-PT separado?
4. **Posso prosseguir** ou quer ajustar algo no plano?

Quando você responder, eu executo.