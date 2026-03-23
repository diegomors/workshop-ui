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
          isActive ? 'bg-positive-2 animate-pulse' : 'bg-negative-2'
        )}
      />
      <span className={cn(isActive ? 'text-positive-2' : 'text-negative-2')}>
        {isActive ? 'Rastreamento ativo' : 'GPS inativo'}
      </span>
    </div>
  )
}
