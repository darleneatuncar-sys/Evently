import { IconAlert } from './icons'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

function ErrorState({ message = 'Ha ocurrido un error al cargar la información.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[20px] border border-red-400/30 bg-red-500/10 px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-red-500/20 text-red-300">
        <IconAlert className="h-6 w-6" />
      </span>
      <p className="max-w-md text-sm font-medium text-red-200">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-red-500/80 px-4 py-2 text-sm font-semibold text-brand-50 transition hover:bg-red-500"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

export default ErrorState
