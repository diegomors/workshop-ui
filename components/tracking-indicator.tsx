'use client'

import { cn } from '@/lib/utils'

interface TrackingIndicatorProps {
  isActive: boolean
  className?: string
}

/**
 * Visual indicator showing whether GPS tracking is active.
 */
export function TrackingIndicator({ isActive, className }: TrackingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2 text-xs font-medium', className)}>
      <span
        className={cn(
          'size-2.5 rounded-full',
          isActive ? 'bg-green-500 animate-pulse' : 'bg-red-400'
        )}
      />
      <span className={cn(isActive ? 'text-green-700' : 'text-red-500')}>
        {isActive ? 'Rastreamento ativo' : 'GPS inativo'}
      </span>
    </div>
  )
}
