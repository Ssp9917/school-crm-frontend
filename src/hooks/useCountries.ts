import { useMemo } from 'react';
import { useGetCountriesQuery } from '../services/countries';

export interface CountryOption {
  labelText: string;
  value:     string;
  flag:      string | null;
  name:      string;
  dial:      string | null;
}

export interface CountryInfo {
  name:  string;
  flag:  string | null;
  dial?: string | null;
}

export function useCountries() {
  const { data: countriesData } = useGetCountriesQuery(undefined);

  const countryOptions = useMemo<CountryOption[]>(() => {
    const list: any[] = Array.isArray(countriesData) ? (countriesData as any[]) : [];
    const opts: CountryOption[] = [];

    list.forEach((c: any) => {
      const name = c?.name?.common || c.name || '';
      const flag = c?.flags?.png || c?.flags?.svg || null;
      const iso  = (c?.cca2 || c?.cca3 || '').toUpperCase();
      const idd  = c?.idd;
      let dial: string | null = null;
      if (idd?.root && Array.isArray(idd.suffixes) && idd.suffixes.length) {
        dial = `${idd.root}${idd.suffixes[0]}`.replace(/\s+/g, '');
      } else if (idd?.root) {
        dial = idd.root.replace(/\s+/g, '');
      }
      if (iso) opts.push({ labelText: `${name}${dial ? ` (${dial})` : ''}`, value: iso, flag, name, dial });
    });

    const map = new Map<string, CountryOption>();
    opts.forEach(o => { if (!map.has(o.value)) map.set(o.value, o); });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [countriesData]);

  // Reverse map: dial code ("+44") ya ISO code ("IN") → { name, flag, dial }
  // (kuch records me countryCode dial format me saved hai, kuch me ISO format me)
  const dialCodeMap = useMemo<Map<string, CountryInfo>>(() => {
    const map = new Map<string, CountryInfo>();
    // root-only key ("+1") ke liye sabse zyada suffixes wala desh jeetta hai (US/CA type)
    const rootSuffixCount = new Map<string, number>();
    const list: any[] = Array.isArray(countriesData) ? (countriesData as any[]) : [];
    list.forEach((c: any) => {
      const name = c?.name?.common || c.name || '';
      const flag = c?.flags?.png || c?.flags?.svg || null;
      const iso  = (c?.cca2 || c?.cca3 || '').toUpperCase();
      const idd  = c?.idd;
      let primaryDial: string | null = null;
      if (idd?.root) {
        const suffixes = Array.isArray(idd.suffixes) && idd.suffixes.length ? idd.suffixes : [''];
        const rootOnly = idd.root.replace(/\s+/g, '');
        // bahut saare suffixes = area codes (NANP); display ke liye root hi sahi hai
        primaryDial = suffixes.length > 3
          ? rootOnly
          : `${idd.root}${suffixes[0]}`.replace(/\s+/g, '');
        suffixes.forEach((s: string) => {
          const dial = `${idd.root}${s}`.replace(/\s+/g, '');
          if (dial && !map.has(dial)) map.set(dial, { name, flag, dial });
        });
        if (rootOnly && (rootSuffixCount.get(rootOnly) ?? -1) < suffixes.length) {
          rootSuffixCount.set(rootOnly, suffixes.length);
          map.set(rootOnly, { name, flag, dial: rootOnly });
        }
      }
      if (iso && !map.has(iso)) map.set(iso, { name, flag, dial: primaryDial });
    });
    return map;
  }, [countriesData]);

  return { countryOptions, dialCodeMap };
}
