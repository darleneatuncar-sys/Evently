import type { ReactNode } from 'react'
import { IconInbox } from './icons'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="brutal-card flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-brand-200">
        <IconInbox className="h-6 w-6" />
      </span>
      <h3 className="text-base font-semibold text-brand-50">{title}</h3>
      {description && <p className="max-w-md text-sm text-brand-300">{description}</p>}
      {action}
    </div>
  )
}

export default EmptyState
