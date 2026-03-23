'use client'

import { MizzThemeProvider } from '@/components/mizz/MizzThemeProvider'

export function MizzThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MizzThemeProvider defaultTheme={{ colorScheme: 'light' }}>
      {children}
    </MizzThemeProvider>
  )
}
