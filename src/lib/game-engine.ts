import { CONTENT_POOLS as PT_POOLS, ContentItem } from './content-pools';
import { ES_POOLS, EN_POOLS } from './content-pools-i18n';
import { supabase } from '@/integrations/supabase/client';
import i18n from '@/i18n/config';

const getActivePools = (): Record<string, ContentItem[]> => {
  const lang = (typeof window !== 'undefined' && i18n.language) || 'pt';
  if (lang.startsWith('es')) return ES_POOLS;
  if (lang.startsWith('en')) return EN_POOLS;
  return PT_POOLS;
};


const localizedCategories = () => {
  const lang = i18n.language || 'pt';
  const labels: Record<string, { name: string; desc: string }> = {
    pt: {
      name: '', desc: '',
    },
  };
  return [
    { id: "memory", name: i18n.t('category_memory'), icon: "🧠", color: "#4A7C59", description: i18n.t('category_desc_memory') },
    { id: "attention", name: i18n.t('category_attention'), icon: "👁️", color: "#D97706", description: i18n.t('category_desc_attention') },
    { id: "logic", name: i18n.t('category_logic'), icon: "🧩", color: "#3B82F6", description: i18n.t('category_desc_logic') },
    { id: "language", name: i18n.t('category_language'), icon: "✍️", color: "#8B5CF6", description: i18n.t('category_desc_language') }
  ];
};

export const GAME_ASSETS = {
  letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
  colors: ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#F43F5E", "#84CC16", "#14B8A6"],
  get categories() { return localizedCategories(); }
};


const mulberry32 = (a: number) => {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
};

const getSessionId = () => {
  if (typeof window === 'undefined') return 'server';
  let sid = localStorage.getItem('mente_ativa_session_id');
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('mente_ativa_session_id', sid);
  }
  return sid;
};

export const getUsedItemIds = async (userId?: string): Promise<string[]> => {
  const sessionId = getSessionId();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  let query = supabase
    .from('exercise_history')
    .select('item_id')
    .gt('used_at', sevenDaysAgo.toISOString());

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.eq('session_id', sessionId);
  }

  const { data } = await query;
  return data?.map(d => d.item_id) || [];
};

export const saveToHistory = async (id: string, category: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  const sessionId = getSessionId();
  
  await supabase.from('exercise_history').insert({
    user_id: user?.id,
    session_id: sessionId,
    item_id: id,
    category: category
  });
};

export const getAvailableItems = async (
  category: string, 
  count: number, 
  random: () => number, 
  usedIds: string[] = []
): Promise<ContentItem[]> => {
  const pools = getActivePools();
  const pool = pools[category] || pools['culinaria'] || Object.values(pools)[0];
  
  let available = pool.filter(item => !usedIds.includes(item.id));
  
  if (available.length < count) {
    available = [...pool];
  }

  return [...available].sort(() => random() - 0.5).slice(0, count);
};

export const generateTaskByCategory = async (
  cogType: string, 
  seedOffset: number = 0, 
  level: 'easy' | 'medium' | 'hard' = 'easy',
  usedIds: string[] = []
) => {
  const seed = Date.now() + seedOffset;
  const random = mulberry32(seed);

  switch (cogType) {
    case 'memory': {
      const roll = random();
      if (roll < 0.5) {
        const pools = getActivePools();
        const categories = Object.keys(pools);
        const catKey = categories[Math.floor(random() * categories.length)];
        const count = level === 'easy' ? 3 : level === 'medium' ? 5 : 7;
        const items = await getAvailableItems(catKey, count, random, usedIds);
        const words = items.map(i => i.word);
        const itemIds = items.map(i => i.id);
        const categoryName = items[0].category;
        
        const allWords = pools[catKey].map(i => i.word);
        const options = [...words, ...allWords.filter(w => !words.includes(w)).sort(() => random() - 0.5).slice(0, 5)].sort(() => random() - 0.5);
        
        return { type: 'memory-words', words, options, level, categoryName, itemIds };
      } else {
        const items = ["Pão", "Leite", "Café", "Maçã", "Arroz", "Feijão", "Açúcar", "Ovo"];
        const count = level === 'easy' ? 2 : level === 'medium' ? 3 : 5;
        const selected = [...items].sort(() => random() - 0.5).slice(0, count).map(name => ({
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
        const size = level === 'easy' ? 9 : level === 'medium' ? 16 : 25;
        const letters = ["M", "N", "O", "Q", "E", "F", "B", "P"];
        const baseIdx = Math.floor(random() * letters.length);
        const intruderIdx = (baseIdx + 1) % letters.length;
        const grid = Array(size).fill(letters[baseIdx]);
        const pos = Math.floor(random() * size);
        grid[pos] = letters[intruderIdx];
        return { type: 'attention-letter', grid, intruder: letters[intruderIdx], cols: Math.sqrt(size), level };
      } else {
        const pools = getActivePools();
        const categories = Object.keys(pools);
        const catKey = categories[Math.floor(random() * categories.length)];
        const items = await getAvailableItems(catKey, 4, random, usedIds);
        const categoryName = items[0].category;
        const otherCatKey = categories.find(c => c !== catKey)!;
        const intruderItems = await getAvailableItems(otherCatKey, 1, random, usedIds);
        const intruder = intruderItems[0];
        const options = [...items, intruder].sort(() => random() - 0.5);
        return { type: 'word-intruder', options, intruder: intruder.word, categoryName, level, itemIds: options.map(o => o.id) };
      }
    }

    case 'logic': {
      const roll = random();
      if (roll < 0.5) {
        const start = Math.floor(random() * 10) + 1;
        const step = Math.floor(random() * 5) + 2;
        const sequence = [start, start + step, start + step * 2, start + step * 3];
        const answer = start + step * 4;
        const options = [answer, answer + step, answer - 1, answer + 1].sort(() => random() - 0.5);
        return { type: 'logic', sequence, answer, options, level };
      } else {
        const itemPrice = Math.floor(random() * 15) + 5;
        const paid = itemPrice > 10 ? 20 : 10;
        const answer = paid - itemPrice;
        const options = [answer, answer + 1, answer - 1, answer + 2].sort(() => random() - 0.5);
        return { type: 'logic-change', price: itemPrice, paid, answer, options, level };
      }
    }

    case 'language': {
      const roll = random();
      const pools = getActivePools();
      const categories = Object.keys(pools);
      const cat = categories[Math.floor(random() * categories.length)];
      
      if (roll < 0.5) {
        const items = await getAvailableItems(cat, 1, random, usedIds);
        const item = items[0];
        const isTrue = random() > 0.5;
        
        let statement = "";
        let finalIsTrue = isTrue;
        
        if (isTrue) {
          statement = `"${item.word}" faz parte do grupo: ${item.category}?`;
        } else {
          const otherCats = categories.filter(c => c !== cat);
          const randomOtherCatKey = otherCats[Math.floor(random() * otherCats.length)];
          const otherCatName = pools[randomOtherCatKey][0].category;
          statement = `"${item.word}" faz parte do grupo: ${otherCatName}?`;
          finalIsTrue = false;
        }
        
        return { 
          type: 'true-false', 
          statement, 
          isTrue: finalIsTrue, 
          curiosity: item.curiosity, 
          level, 
          itemId: item.id, 
          category: cat 
        };
      } else {
        const pools = getActivePools();
        const categories = Object.keys(pools);
        const cat = categories[Math.floor(random() * categories.length)];
        const items = await getAvailableItems(cat, 4, random, usedIds);
        const words = items.map(i => i.word);
        const answer = [...words].sort((a, b) => a.localeCompare(b, 'pt-BR'));
        return { type: 'alphabetical-order', words, answer, level, itemIds: items.map(i => i.id), category: cat };
      }
    }

    default: return null;
  }
};

export const generateDailyChallenge = async (seedStr: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  const usedIds = await getUsedItemIds(user?.id);
  
  const numericSeed = seedStr.split('-').reduce((acc, part) => acc + (parseInt(part) || 0), 0);
  const tasks = [];
  const cogTypes = ['memory', 'attention', 'logic', 'language'];
  
  for (let i = 0; i < 10; i++) {
    const type = cogTypes[i % cogTypes.length];
    const level = i < 3 ? 'easy' : i < 7 ? 'medium' : 'hard';
    const task = await generateTaskByCategory(type, numericSeed + i * 100, level as any, usedIds);
    if (task) {
      tasks.push(task);
      // Evitar que itens escolhidos na mesma geração sejam repetidos
      if (task.itemIds) usedIds.push(...task.itemIds);
      if (task.itemId) usedIds.push(task.itemId);
    }
  }

  return { tasks };
};
