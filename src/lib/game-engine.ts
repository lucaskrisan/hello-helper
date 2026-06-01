
import { CONTENT_POOLS, ContentItem } from './content-pools';

/**
 * MOTOR DE EXERCÍCIOS - VERSÃO V2 (VALIDADA)
 */

export const GAME_ASSETS = {
  letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
  colors: ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#F43F5E", "#84CC16", "#14B8A6"],
  categories: [
    { id: "memory", name: "Memória", icon: "🧠", color: "#4A7C59", description: "Exercícios de fixação" },
    { id: "attention", name: "Atenção", icon: "👁️", color: "#D97706", description: "Foco e percepção" },
    { id: "logic", name: "Raciocínio", icon: "🧩", color: "#3B82F6", description: "Lógica e padrões" },
    { id: "language", name: "Linguagem", icon: "✍️", color: "#8B5CF6", description: "Palavras e ordens" }
  ]
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

/**
 * CONTROLE DE REPETIÇÃO
 */
const getHistory = (): string[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem('mente_ativa_history') || '[]');
};

const saveToHistory = (id: string) => {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  if (!history.includes(id)) {
    const newHistory = [...history, id].slice(-500); // Mantém os últimos 500 itens
    localStorage.setItem('mente_ativa_history', JSON.stringify(newHistory));
  }
};

export const getAvailableItems = (category: string, count: number, random: () => number): ContentItem[] => {
  const pool = CONTENT_POOLS[category] || CONTENT_POOLS['culinaria']; // Fallback
  const history = getHistory();
  
  // Filtra itens não usados recentemente
  let available = pool.filter(item => !history.includes(item.id));
  
  // Se faltar item, reseta parte do histórico para aquela categoria
  if (available.length < count) {
    available = [...pool];
  }

  const selected = available.sort(() => random() - 0.5).slice(0, count);
  selected.forEach(item => saveToHistory(item.id));
  return selected;
};

/**
 * GERAÇÃO DE TAREFAS POR CATEGORIA COGNITIVA
 */
export const generateTaskByCategory = (cogType: string, seedOffset: number = 0, level: 'easy' | 'medium' | 'hard' = 'easy') => {
  const seed = Date.now() + seedOffset;
  const random = mulberry32(seed);

  switch (cogType) {
    case 'memory': {
      const roll = random();
      if (roll < 0.5) {
        // Memória de Palavras
        const categories = Object.keys(CONTENT_POOLS);
        const cat = categories[Math.floor(random() * categories.length)];
        const count = level === 'easy' ? 3 : level === 'medium' ? 5 : 7;
        const items = getAvailableItems(cat, count, random);
        const words = items.map(i => i.word);
        
        // Opções misturadas
        const allWords = CONTENT_POOLS[cat].map(i => i.word);
        const options = [...words, ...allWords.filter(w => !words.includes(w)).sort(() => random() - 0.5).slice(0, 5)].sort(() => random() - 0.5);
        
        return { type: 'memory-words', words, options, level, categoryName: cat };
      } else {
        // Lista de Compras
        const items = ["Pão", "Leite", "Café", "Maçã", "Arroz", "Feijão", "Açúcar", "Ovo"];
        const count = level === 'easy' ? 2 : level === 'medium' ? 3 : 5;
        const selected = items.sort(() => random() - 0.5).slice(0, count).map(name => ({
          item: name,
          qty: Math.floor(random() * 5) + 1
        }));
        const correct = selected[Math.floor(random() * selected.length)];
        const options = [correct.qty, (correct.qty + 1) % 10 || 1, (correct.qty + 2) % 10 || 2].sort(() => random() - 0.5);
        return { type: 'memory-shopping', list: selected, question: `Quantos(as) ${correct.item} estavam na lista?`, answer: correct.qty, options, level };
      }
    }

    case 'attention': {
      const roll = random();
      if (roll < 0.5) {
        // Atenção Visual (Grade)
        const size = level === 'easy' ? 9 : level === 'medium' ? 16 : 25;
        const letters = ["M", "N", "O", "Q", "E", "F", "B", "P"];
        const baseIdx = Math.floor(random() * letters.length);
        const intruderIdx = (baseIdx + 1) % letters.length;
        const grid = Array(size).fill(letters[baseIdx]);
        const pos = Math.floor(random() * size);
        grid[pos] = letters[intruderIdx];
        return { type: 'attention-letter', grid, intruder: letters[intruderIdx], cols: Math.sqrt(size), level };
      } else {
        // Palavra Intrusa
        const categories = ["biblia", "culinaria", "geografia", "familia"];
        const cat = categories[Math.floor(random() * categories.length)];
        const pool = CONTENT_POOLS[cat];
        const items = pool.sort(() => random() - 0.5).slice(0, 4);
        const otherCat = categories.find(c => c !== cat)!;
        const intruder = CONTENT_POOLS[otherCat][0];
        const options = [...items, intruder].sort(() => random() - 0.5);
        return { type: 'word-intruder', options, intruder: intruder.word, categoryName: cat, level };
      }
    }

    case 'logic': {
      const roll = random();
      if (roll < 0.5) {
        // Sequência Numérica
        const start = Math.floor(random() * 10) + 1;
        const step = Math.floor(random() * 5) + 2;
        const sequence = [start, start + step, start + step * 2, start + step * 3];
        const answer = start + step * 4;
        const options = [answer, answer + step, answer - 1, answer + 1].sort(() => random() - 0.5);
        return { type: 'logic', sequence, answer, options, level };
      } else {
        // Cálculo de Troco
        const itemPrice = Math.floor(random() * 15) + 5;
        const paid = itemPrice > 10 ? 20 : 10;
        const answer = paid - itemPrice;
        const options = [answer, answer + 1, answer - 1, answer + 2].sort(() => random() - 0.5);
        return { type: 'logic-change', price: itemPrice, paid, answer, options, level };
      }
    }

    case 'language': {
      const roll = random();
      if (roll < 0.5) {
        // Verdadeiro ou Falso
        const categories = Object.keys(CONTENT_POOLS);
        const cat = categories[Math.floor(random() * categories.length)];
        const item = CONTENT_POOLS[cat].sort(() => random() - 0.5)[0];
        return { type: 'true-false', statement: item.word, isTrue: item.isTrue, curiosity: item.curiosity, level };
      } else {
        // Ordem Alfabética
        const items = CONTENT_POOLS['biblia'].sort(() => random() - 0.5).slice(0, 4);
        const words = items.map(i => i.word);
        const answer = [...words].sort((a, b) => a.localeCompare(b));
        return { type: 'alphabetical-order', words, answer, level };
      }
    }

    default: return null;
  }
};

export const generateDailyChallenge = (seedStr: string) => {
  const numericSeed = seedStr.split('-').reduce((acc, part) => acc + parseInt(part), 0);
  const tasks = [];
  const cogTypes = ['memory', 'attention', 'logic', 'language', 'memory', 'attention', 'logic']; // 7 etapas
  
  const random = mulberry32(numericSeed);
  
  for (let i = 0; i < 7; i++) {
    const level = i < 3 ? 'easy' : i < 6 ? 'medium' : 'hard';
    const task = generateTaskByCategory(cogTypes[i], numericSeed + i * 100, level);
    if (task) tasks.push(task);
  }

  return { tasks };
};
