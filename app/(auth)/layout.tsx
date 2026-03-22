export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl p-4">
        {children}
      </div>
    </div>
  )
}
