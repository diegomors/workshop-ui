import { Header } from '@/components/header'
import { SkipLink } from '@/components/skip-link'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main-content" className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </>
  )
}
