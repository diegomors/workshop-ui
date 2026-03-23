'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface MapSearchBarProps {
  onSearch: (query: string) => void
}

export function MapSearchBar({ onSearch }: MapSearchBarProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] flex items-center bg-card rounded-full shadow-lg border border-slate-200 px-4 py-2 hover:shadow-xl transition-shadow">
      <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
      <input
        type="text"
        placeholder="Buscar restaurantes (ex: Pizza)"
        className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-slate-400 focus:ring-0 appearance-none"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
}
