
// Banco de dados expandido para geração dinâmica
export const GAME_ASSETS = {
  words: [
    "Amizade", "Natureza", "Saúde", "Tempo", "Família", "Cidade", "Viagem", "Festa",
    "Carinho", "Alegria", "Esperança", "Respeito", "Bondade", "Coragem", "Sorriso",
    "Abraço", "Caminho", "Horizonte", "Paixão", "Tesouro", "História", "Memória",
    "Sabedoria", "Cultura", "Música", "Pintura", "Poesia", "Jardim", "Flores",
    "Oceano", "Estrela", "Planeta", "Vento", "Chuva", "Nuvem", "Mapa",
    "Livro", "Caneta", "Papel", "Quadro", "Piano", "Violão", "Flauta",
    "Delfim", "Águia", "Leão", "Tigre", "Girafa", "Zebra", "Urso",
    "Café", "Chá", "Pão", "Fruta", "Vinho", "Queijo", "Mel", "Sabor"
  ],
  categories: [
    { id: "memory", name: "Fortalecer Memória", icon: "🧠", color: "#4A7C59" },
    { id: "attention", name: "Foco e Atenção", icon: "👁️", color: "#D97706" },
    { id: "logic", name: "Raciocínio Lógico", icon: "🧩", color: "#3B82F6" },
    { id: "word-search", name: "Caça-Palavras", icon: "🔍", color: "#8B5CF6" }
  ],
  letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
  logicPatterns: [
    { name: "Addition", fn: (start: number, step: number) => [start, start + step, start + step * 2, start + step * 3, start + step * 4] },
    { name: "Multiplication", fn: (start: number, step: number) => [start, start * step, start * (step * step), start * (step * step * step), start * (step * step * step * step)] },
    { name: "Subtraction", fn: (start: number, step: number) => [start, start - step, start - step * 2, start - step * 3, start - step * 4] },
    { name: "Fibonacci-ish", fn: (start: number, step: number) => [start, start + step, start + (start + step), (start + step) + (start + start + step), (start + (start + step)) + ((start + step) + (start + start + step))] }
  ],
  colors: ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"],
  shapes: ["square", "circle", "triangle"]
};

export const generateDailyChallenge = (seed: string) => {
  // Função helper para gerar números pseudo-aleatórios baseados numa seed (data do dia)
  const mulberry32 = (a: number) => {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
  }

  const numericSeed = seed.split('-').reduce((acc, part) => acc + parseInt(part), 0);
  const random = mulberry32(numericSeed);

  // 1. Gerar Palavras (Embaralhar e pegar subset)
  const shuffledWords = [...GAME_ASSETS.words].sort(() => random() - 0.5);
  const selectedWords = shuffledWords.slice(0, 5);
  const wordOptions = [...selectedWords, ...shuffledWords.slice(5, 8)].sort(() => random() - 0.5);

  // 2. Gerar Atenção Visual (Letra base e letra intrusa)
  const baseLetterIndex = Math.floor(random() * GAME_ASSETS.letters.length);
  const intruderLetterIndex = (baseLetterIndex + 1 + Math.floor(random() * (GAME_ASSETS.letters.length - 1))) % GAME_ASSETS.letters.length;
  
  const baseLetter = GAME_ASSETS.letters[baseLetterIndex];
  const intruderLetter = GAME_ASSETS.letters[intruderLetterIndex];
  
  const grid = Array(16).fill(baseLetter);
  const intruderPos = Math.floor(random() * 16);
  grid[intruderPos] = intruderLetter;

  // 3. Gerar Lógica (Padrão e números)
  const pattern = GAME_ASSETS.logicPatterns[Math.floor(random() * GAME_ASSETS.logicPatterns.length)];
  const startNum = Math.floor(random() * 10) + 1;
  const stepNum = Math.floor(random() * 5) + 2;
  const fullSeq = pattern.fn(startNum, stepNum);
  const sequence = fullSeq.slice(0, 4);
  const answer = fullSeq[4];
  const logicOptions = [answer, answer + 2, answer - 2, answer + 5].sort(() => random() - 0.5);

  // 4. Gerar Atenção de Cores (Nova Categoria)
  const baseColorIndex = Math.floor(random() * GAME_ASSETS.colors.length);
  const intruderColorIndex = (baseColorIndex + 1 + Math.floor(random() * (GAME_ASSETS.colors.length - 1))) % GAME_ASSETS.colors.length;
  const baseColor = GAME_ASSETS.colors[baseColorIndex];
  const intruderColor = GAME_ASSETS.colors[intruderColorIndex];
  const colorGrid = Array(16).fill(baseColor);
  colorGrid[Math.floor(random() * 16)] = intruderColor;

  return {
    memory: { words: selectedWords, options: wordOptions },
    attention: { grid, intruder: intruderLetter },
    logic: { sequence, options: logicOptions, answer },
    colorAttention: { grid: colorGrid, intruder: intruderColor }
  };
};
