import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="text-6xl font-extrabold text-brand-300">404</span>
      <h1 className="text-2xl font-bold text-brand-100">Página no encontrada</h1>
      <p className="max-w-md text-sm text-brand-300">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFoundPage
