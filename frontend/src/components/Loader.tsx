interface LoaderProps {
  label?: string
  fullHeight?: boolean
}

function Loader({ label = 'Cargando...', fullHeight = false }: LoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${fullHeight ? 'min-h-[60vh]' : 'py-16'}`}
    >
      <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
      <p className="text-sm font-medium text-brand-300">{label}</p>
    </div>
  )
}

export default Loader
