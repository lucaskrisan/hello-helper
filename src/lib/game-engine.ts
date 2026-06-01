

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

export const generateTaskByCategory = (categoryId: string, seedOffset: number = 0, level: 'easy' | 'medium' | 'hard' = 'easy') => {
  const seed = Date.now() + seedOffset + (level === 'hard' ? 1000 : level === 'medium' ? 500 : 0);
  const random = mulberry32(seed);

  switch (categoryId) {
    case 'memory': {
      const roll = random();
      let subType = 'words';
      if (roll < 0.25) subType = 'words';
      else if (roll < 0.5) subType = 'sequence';
      else if (roll < 0.75) subType = 'association';
      else subType = 'shopping';
      
      if (subType === 'words') {
        const wordCount = level === 'easy' ? 3 : level === 'medium' ? 5 : 7;
        const shuffledWords = [...GAME_ASSETS.words].sort(() => random() - 0.5);
        const selectedWords = shuffledWords.slice(0, wordCount);
        const wordOptions = [...selectedWords, ...shuffledWords.slice(wordCount, wordCount + 5)].sort(() => random() - 0.5);
        return { type: 'memory-words', words: selectedWords, options: wordOptions, level };
      } else if (subType === 'sequence') {
        const sequenceLength = level === 'easy' ? 3 : level === 'medium' ? 5 : 7;
        const sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
          sequence.push(Math.floor(random() * 4));
        }
        return { type: 'memory-sequence', sequence, colors: GAME_ASSETS.colors.slice(0, 4), level };
      } else if (subType === 'association') {
        const items = ["Flor", "Vaso", "Relógio", "Livro", "Caneta", "Cadeira", "Mesa", "Lâmpada"];
        const selectedItem = items[Math.floor(random() * items.length)];
        const selectedColor = GAME_ASSETS.colors[Math.floor(random() * GAME_ASSETS.colors.length)];
        const optionCount = level === 'easy' ? 4 : level === 'medium' ? 6 : 8;
        const options = GAME_ASSETS.colors.sort(() => random() - 0.5).slice(0, optionCount);
        if (!options.includes(selectedColor)) options[0] = selectedColor;
        return { type: 'memory-association', item: selectedItem, color: selectedColor, options: options.sort(() => random() - 0.5), level };
      } else {
        const itemCount = level === 'easy' ? 2 : level === 'medium' ? 3 : 5;
        const items = ["Pão", "Leite", "Café", "Maçã", "Arroz", "Feijão", "Açúcar", "Uva", "Mel", "Ovo"];
        const shuffledItems = items.sort(() => random() - 0.5);
        const list = [];
        for(let i=0; i<itemCount; i++) {
          list.push({ item: shuffledItems[i], qty: Math.floor(random() * 5) + 1 });
        }
        const correct = list[Math.floor(random() * list.length)];
        const options = [correct.qty, (correct.qty + 1) % 10 || 1, (correct.qty + 2) % 10 || 2, (correct.qty + 3) % 10 || 3].sort(() => random() - 0.5);
        return { type: 'memory-shopping', list, question: `Quantos(as) ${correct.item} estavam na lista?`, answer: correct.qty, options, level };
      }
    }

    case 'attention': {
      const isColorMode = random() > 0.5;
      const gridSize = level === 'easy' ? 9 : level === 'medium' ? 16 : 25;
      if (isColorMode) {
        const baseColorIndex = Math.floor(random() * GAME_ASSETS.colors.length);
        const intruderColorIndex = (baseColorIndex + 1 + Math.floor(random() * (GAME_ASSETS.colors.length - 1))) % GAME_ASSETS.colors.length;
        const baseColor = GAME_ASSETS.colors[baseColorIndex];
        const intruderColor = GAME_ASSETS.colors[intruderColorIndex];
        const grid = Array(gridSize).fill(baseColor);
        grid[Math.floor(random() * gridSize)] = intruderColor;
        return { type: 'attention-color', grid, intruder: intruderColor, cols: Math.sqrt(gridSize), level };
      } else {
        const baseLetterIndex = Math.floor(random() * GAME_ASSETS.letters.length);
        const intruderLetterIndex = (baseLetterIndex + 1 + Math.floor(random() * (GAME_ASSETS.letters.length - 1))) % GAME_ASSETS.letters.length;
        const baseLetter = GAME_ASSETS.letters[baseLetterIndex];
        const intruderLetter = GAME_ASSETS.letters[intruderLetterIndex];
        const grid = Array(gridSize).fill(baseLetter);
        grid[Math.floor(random() * gridSize)] = intruderLetter;
        return { type: 'attention-letter', grid, intruder: intruderLetter, cols: Math.sqrt(gridSize), level };
      }
    }
    case 'logic': {
      const patterns = [
        { name: "Soma Constante", fn: (s: number, d: number) => [s, s + d, s + d*2, s + d*3, s + d*4], desc: "Cada número aumenta o mesmo tanto." },
        { name: "Subtração Constante", fn: (s: number, d: number) => [s, s - d, s - d*2, s - d*3, s - d*4], desc: "Cada número diminui o mesmo tanto." },
        { name: "Dobro", fn: (s: number) => [s, s * 2, s * 4, s * 8, s * 16], desc: "Cada número é o dobro do anterior." }
      ];
      
      const pattern = patterns[Math.floor(random() * patterns.length)];
      const startNum = level === 'easy' ? Math.floor(random() * 10) + 1 : Math.floor(random() * 50) + 1;
      const stepNum = Math.floor(random() * 5) + 2;
      
      const fullSeq = pattern.fn(startNum, stepNum);
      const sequence = fullSeq.slice(0, 4);
      const answer = fullSeq[4];
      const logicOptions = [answer, answer + 2, answer - 2, answer + 5].sort(() => random() - 0.5);
      
      return { 
        type: 'logic', 
        sequence, 
        options: logicOptions, 
        answer, 
        level,
        patternDesc: (pattern as any).desc 
      };
    }
    case 'word-search': {
      const word = GAME_ASSETS.words[Math.floor(random() * GAME_ASSETS.words.length)].toUpperCase();
      const size = level === 'easy' ? 6 : level === 'medium' ? 8 : 10;
      const grid = Array(size).fill(null).map(() => 
        Array(size).fill(null).map(() => GAME_ASSETS.letters[Math.floor(random() * 26)])
      );
      const row = Math.floor(random() * size);
      const colStart = Math.floor(random() * (size - word.length + 1));
      for (let i = 0; i < word.length; i++) {
        grid[row][colStart + i] = word[i];
      }
      return { type: 'word-search', grid, word, level };
    }
    default:
      return null;
  }
};

export const generateDailyChallenge = (seedStr: string) => {
  const numericSeed = seedStr.split('-').reduce((acc, part) => acc + parseInt(part), 0);
  const tasks = [];
  const categories = ['memory', 'attention', 'logic', 'word-search'];
  
  for (let i = 0; i < 24; i++) {
    let level: 'easy' | 'medium' | 'hard' = 'easy';
    if (i >= 5 && i < 10) level = 'medium';
    else if (i >= 10) level = 'hard';

    const category = categories[i % categories.length];
    const task = generateTaskByCategory(category, numericSeed + i, level);
    if (task) tasks.push(task);
  }

  return { tasks };
};

