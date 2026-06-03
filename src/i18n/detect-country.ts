import i18n from './config';
import { supabase } from '@/integrations/supabase/client';

const COUNTRY_CACHE_KEY = 'mente_ativa_country';
const LANG_CACHE_KEY = 'mente_ativa_lang';

const HISPANIC_COUNTRIES = new Set([
  'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY',
  'CR', 'PA', 'DO', 'CU', 'GT', 'HN', 'SV', 'NI', 'PR', 'ES',
]);

export const countryToLanguage = (country: string): 'pt' | 'es' | 'en' => {
  const c = country?.toUpperCase();
  if (c === 'BR' || c === 'PT') return 'pt';
  if (HISPANIC_COUNTRIES.has(c)) return 'es';
  return 'en';
};

const fetchCountryByIp = async (): Promise<string | null> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
    const res = await fetch('https://ipapi.co/json/', { 
      cache: 'no-store',
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.country_code || null;
  } catch {
    return null;
  }
};

export const applyLocale = (country: string | null) => {
  const safeCountry = country || 'BR';
  const lang = countryToLanguage(safeCountry);
  if (typeof window !== 'undefined') {
    localStorage.setItem(COUNTRY_CACHE_KEY, safeCountry);
    localStorage.setItem(LANG_CACHE_KEY, lang);
  }
  if (i18n.language !== lang) i18n.changeLanguage(lang);
  return { country: safeCountry, lang };
};

export const getStoredCountry = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(COUNTRY_CACHE_KEY);
};

export const getStoredLanguage = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(LANG_CACHE_KEY);
};

let initialized = false;

export const initLocale = async () => {
  if (typeof window === 'undefined' || initialized) return;
  initialized = true;

  // 1) Preferência salva do usuário logado (DB) tem prioridade máxima
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('country, language')
        .eq('user_id', user.id)
        .maybeSingle();
      if (prefs?.country) {
        applyLocale(prefs.country);
        return;
      }
    }
  } catch {}

  // 2) Cache local
  const stored = getStoredCountry();
  if (stored) {
    applyLocale(stored);
    return;
  }

  // 3) Detecção por IP
  const country = await fetchCountryByIp();
  if (country) {
    applyLocale(country);
    // Persiste pro usuário logado
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_preferences').upsert(
          { user_id: user.id, country, language: countryToLanguage(country) },
          { onConflict: 'user_id' }
        );
      }
    } catch {}
    return;
  }

  // 4) Fallback navegador
  const navLang = navigator.language?.slice(0, 2).toLowerCase();
  if (navLang === 'es') applyLocale('MX');
  else if (navLang === 'en') applyLocale('US');
  else applyLocale('BR');
};

export const setLocaleManually = async (country: string) => {
  applyLocale(country);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_preferences').upsert(
        { user_id: user.id, country, language: countryToLanguage(country) },
        { onConflict: 'user_id' }
      );
    }
  } catch {}
};
