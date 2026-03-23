'use client'

import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LocationBannerProps {
  onRequestPermission: () => void
}

export function LocationBanner({ onRequestPermission }: LocationBannerProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-card rounded-xl shadow-xl border border-border p-4 flex flex-col gap-3 max-w-sm mx-auto sm:right-auto sm:left-4">
      <div className="flex items-start gap-3">
        <div className="bg-primary/5 p-2 rounded-lg shrink-0">
          <MapPin className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 leading-tight">Melhore sua experiência</h4>
          <p className="text-sm text-slate-500 mt-0.5">Ative sua localização para descobrir restaurantes que entregam em sua casa.</p>
        </div>
      </div>
      <Button 
        onClick={onRequestPermission} 
        size="sm" 
        variant="default" 
        className="w-full font-semibold bg-primary hover:bg-primary/90 active:scale-95 transition-all"
      >
        Ativar Localização
      </Button>
    </div>
  )
}
