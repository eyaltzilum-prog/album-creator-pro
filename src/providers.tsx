import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AssetProvider } from '@/contexts/AssetContext';

/**
 * ⚠️ App-wide providers. Add new providers here — they'll be available in all routes.
 * This component is rendered in main.tsx OUTSIDE the router.
 * Do NOT add routing-related providers here (like BrowserRouter).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AssetProvider>
          {children}
        </AssetProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
