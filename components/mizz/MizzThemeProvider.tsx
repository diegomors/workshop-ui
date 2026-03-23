import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

/** Temas white-label disponíveis */
export type MizzBrand = '' | 'theme-green' | 'theme-blue' | 'theme-purple' | 'theme-red' | 'theme-pink';
export type MizzColorScheme = 'light' | 'dark' | 'system';

export interface MizzThemeConfig {
  /** Esquema de cores */
  colorScheme: MizzColorScheme;
  /** Marca/tema white-label */
  brand: MizzBrand;
  /** Família tipográfica personalizada */
  fontFamily?: string;
  /** Família tipográfica dos headings */
  headingFontFamily?: string;
}

interface MizzThemeContextValue extends MizzThemeConfig {
  /** Modo efetivo (resolvido de 'system') */
  resolvedScheme: 'light' | 'dark';
  /** Atualizar configuração do tema */
  setTheme: (config: Partial<MizzThemeConfig>) => void;
  /** Alternar entre light e dark */
  toggleColorScheme: () => void;
}

const MizzThemeContext = createContext<MizzThemeContextValue | null>(null);

/** Hook para acessar o tema atual */
export const useMizzTheme = () => {
  const ctx = useContext(MizzThemeContext);
  if (!ctx) throw new Error('useMizzTheme must be used within MizzThemeProvider');
  return ctx;
};

/** Propriedades para o MizzThemeProvider */
export interface MizzThemeProviderProps {
  /** Configuração inicial do tema */
  defaultTheme?: Partial<MizzThemeConfig>;
  /** Conteúdo da aplicação */
  children: ReactNode;
}

/**
 * MizzThemeProvider - Provedor de tema white-label do Design System Mizz.
 *
 * Aplica classes CSS e variáveis customizadas para theming dinâmico.
 * Suporta light/dark/system e múltiplas marcas (brands).
 * Para customizar cores, fontes ou tokens, passe via defaultTheme ou setTheme().
 */
export const MizzThemeProvider = ({ defaultTheme, children }: MizzThemeProviderProps) => {
  const [config, setConfig] = useState<MizzThemeConfig>({
    colorScheme: defaultTheme?.colorScheme ?? 'light',
    brand: defaultTheme?.brand ?? '',
    fontFamily: defaultTheme?.fontFamily,
    headingFontFamily: defaultTheme?.headingFontFamily,
  });

  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>('light');

  // Listen for system color scheme changes
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mql.matches ? 'dark' : 'light');
    const handler = (e: MediaQueryListEvent) => setSystemPreference(e.matches ? 'dark' : 'light');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const resolvedScheme = config.colorScheme === 'system' ? systemPreference : config.colorScheme;

  // Apply theme classes and CSS vars to document
  useEffect(() => {
    const root = document.documentElement;

    // Color scheme
    root.classList.toggle('dark', resolvedScheme === 'dark');

    // Brand
    const brands: MizzBrand[] = ['theme-green', 'theme-blue', 'theme-purple', 'theme-red', 'theme-pink'];
    brands.forEach((b) => root.classList.remove(b));
    if (config.brand) root.classList.add(config.brand);

    // Custom fonts
    if (config.fontFamily) {
      root.style.setProperty('--font-family-sans', config.fontFamily);
    }
    if (config.headingFontFamily) {
      root.style.setProperty('--font-family-heading', config.headingFontFamily);
    }
  }, [resolvedScheme, config.brand, config.fontFamily, config.headingFontFamily]);

  const setTheme = useCallback((partial: Partial<MizzThemeConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  const toggleColorScheme = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      colorScheme: (prev.colorScheme === 'system' ? systemPreference : prev.colorScheme) === 'dark' ? 'light' : 'dark',
    }));
  }, [systemPreference]);

  return (
    <MizzThemeContext.Provider value={{ ...config, resolvedScheme, setTheme, toggleColorScheme }}>
      {children}
    </MizzThemeContext.Provider>
  );
};
