

// Banco de dados massivo para garantir que nada se repita
export const GAME_ASSETS = {
  words: [
    "Amizade", "Natureza", "Saúde", "Tempo", "Família", "Cidade", "Viagem", "Festa",
    "Carinho", "Alegria", "Esperança", "Respeito", "Bondade", "Coragem", "Sorriso",
    "Abraço", "Caminho", "Horizonte", "Paixão", "Tesouro", "História", "Memória",
    "Sabedoria", "Cultura", "Música", "Pintura", "Poesia", "Jardim", "Flores",
    "Oceano", "Estrela", "Planeta", "Vento", "Chuva", "Nuvem", "Mapa",
    "Livro", "Caneta", "Papel", "Quadro", "Piano", "Violão", "Flauta",
    "Delfim", "Águia", "Leão", "Tigre", "Girafa", "Zebra", "Urso",
    "Café", "Chá", "Pão", "Fruta", "Vinho", "Queijo", "Mel", "Sabor",
    "Relógio", "Janela", "Porta", "Escada", "Espelho", "Quadro", "Mesa", "Cadeira",
    "Tapete", "Luz", "Sombra", "Sol", "Lua", "Terra", "Mar", "Rio", "Lago",
    "Montanha", "Vale", "Floresta", "Deserto", "Ilha", "Barco", "Avião", "Trem",
    "Carro", "Bicicleta", "Caminhada", "Corrida", "Dança", "Canto", "Risada",
    "Sonho", "Realidade", "Futuro", "Passado", "Presente", "Vida", "Amor", "Paz"
  ],
  categories: [
    { id: "memory", name: "Fortalecer Memória", icon: "🧠", color: "#4A7C59", description: "Exercícios de fixação e lembrança" },
    { id: "attention", name: "Foco e Atenção", icon: "👁️", color: "#D97706", description: "Treine seu olhar e percepção" },
    { id: "logic", name: "Raciocínio Lógico", icon: "🧩", color: "#3B82F6", description: "Padrões, números e sequências" },
    { id: "word-search", name: "Caça-Palavras", icon: "🔍", color: "#8B5CF6", description: "Encontre palavras escondidas" }
  ],
  letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
  logicPatterns: [
    { name: "Addition", fn: (start: number, step: number) => [start, start + step, start + step * 2, start + step * 3, start + step * 4] },
    { name: "Multiplication", fn: (start: number, step: number) => [start, start * step, start * (step * step), start * (step * step * step), start * (step * step * step * step)] },
    { name: "Subtraction", fn: (start: number, step: number) => [start, start - step, start - step * 2, start - step * 3, start - step * 4] },
    { name: "Fibonacci-ish", fn: (start: number, step: number) => [start, start + step, start + (start + step), (start + step) + (start + start + step), (start + (start + step)) + ((start + step) + (start + start + step))] },
    { name: "DoublePlusOne", fn: (start: number, step: number) => [start, start * 2 + 1, (start * 2 + 1) * 2 + 1, ((start * 2 + 1) * 2 + 1) * 2 + 1, (((start * 2 + 1) * 2 + 1) * 2 + 1) * 2 + 1] }
  ],
  colors: ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#F43F5E", "#84CC16", "#14B8A6"],
  shapes: ["square", "circle", "triangle", "star", "diamond", "hexagon"]
};

// Gerador de aleatoriedade com seed
const mulberry32 = (a: number) => {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
};

export const generateTaskByCategory = (categoryId: string, seedOffset: number = 0) => {
  const seed = Date.now() + seedOffset;
  const random = mulberry32(seed);

  switch (categoryId) {
    case 'memory': {
      // Alternar entre tipos de memória para nunca cansar
      const subType = random() > 0.5 ? 'words' : 'sequence';
      
      if (subType === 'words') {
        const shuffledWords = [...GAME_ASSETS.words].sort(() => random() - 0.5);
        const selectedWords = shuffledWords.slice(0, 5);
        const wordOptions = [...selectedWords, ...shuffledWords.slice(5, 10)].sort(() => random() - 0.5);
        return { type: 'memory-words', words: selectedWords, options: wordOptions };
      } else {
        // Sequência de cores (Genius)
        const sequenceLength = 4;
        const sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
          sequence.push(Math.floor(random() * 4)); // 4 cores
        }
        return { type: 'memory-sequence', sequence, colors: GAME_ASSETS.colors.slice(0, 4) };
      }
    }
    case 'attention': {
      const isColorMode = random() > 0.5;
      if (isColorMode) {
        const baseColorIndex = Math.floor(random() * GAME_ASSETS.colors.length);
        const intruderColorIndex = (baseColorIndex + 1 + Math.floor(random() * (GAME_ASSETS.colors.length - 1))) % GAME_ASSETS.colors.length;
        const baseColor = GAME_ASSETS.colors[baseColorIndex];
        const intruderColor = GAME_ASSETS.colors[intruderColorIndex];
        const grid = Array(16).fill(baseColor);
        grid[Math.floor(random() * 16)] = intruderColor;
        return { type: 'attention-color', grid, intruder: intruderColor };
      } else {
        const baseLetterIndex = Math.floor(random() * GAME_ASSETS.letters.length);
        const intruderLetterIndex = (baseLetterIndex + 1 + Math.floor(random() * (GAME_ASSETS.letters.length - 1))) % GAME_ASSETS.letters.length;
        const baseLetter = GAME_ASSETS.letters[baseLetterIndex];
        const intruderLetter = GAME_ASSETS.letters[intruderLetterIndex];
        const grid = Array(16).fill(baseLetter);
        grid[Math.floor(random() * 16)] = intruderLetter;
        return { type: 'attention-letter', grid, intruder: intruderLetter };
      }
    }
    case 'logic': {
      const pattern = GAME_ASSETS.logicPatterns[Math.floor(random() * GAME_ASSETS.logicPatterns.length)];
      const startNum = Math.floor(random() * 10) + 1;
      const stepNum = Math.floor(random() * 5) + 2;
      const fullSeq = pattern.fn(startNum, stepNum);
      const sequence = fullSeq.slice(0, 4);
      const answer = fullSeq[4];
      const logicOptions = [answer, answer + Math.floor(random() * 5) + 1, answer - Math.floor(random() * 5) - 1, answer + 10].sort(() => random() - 0.5);
      return { type: 'logic', sequence, options: logicOptions, answer };
    }
    case 'word-search': {
      const word = GAME_ASSETS.words[Math.floor(random() * GAME_ASSETS.words.length)].toUpperCase();
      const size = 6;
      const grid = Array(size).fill(null).map(() => 
        Array(size).fill(null).map(() => GAME_ASSETS.letters[Math.floor(random() * 26)])
      );
      const row = Math.floor(random() * size);
      const colStart = Math.floor(random() * (size - word.length + 1));
      for (let i = 0; i < word.length; i++) {
        grid[row][colStart + i] = word[i];
      }
      return { type: 'word-search', grid, word };
    }
    default:
      return null;
  }
};


export const generateDailyChallenge = (seedStr: string) => {
  const numericSeed = seedStr.split('-').reduce((acc, part) => acc + parseInt(part), 0);
  const random = mulberry32(numericSeed);

  // Um desafio diário agora é uma sequência de uma tarefa de cada categoria
  return {
    tasks: [
      generateTaskByCategory('memory', numericSeed),
      generateTaskByCategory('attention', numericSeed + 1),
      generateTaskByCategory('word-search', numericSeed + 2),
      generateTaskByCategory('logic', numericSeed + 3)
    ]
  };
};

