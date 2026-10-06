import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState'
import EventCard from '../components/EventCard'
import Loader from '../components/Loader'
import { MagicGrid } from '../components/MagicBento'
import { useFavorites } from '../hooks/useFavorites'

function FavoritesPage() {
  const { favorites, loading } = useFavorites()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-brand-100">Me gusta</h1>
        <p className="mt-1 text-sm text-brand-300">Los eventos que guardaste para más tarde.</p>
      </div>

      {loading ? (
        <Loader label="Cargando tus eventos guardados..." fullHeight />
      ) : favorites.length === 0 ? (
        <EmptyState
          title="Todavía no tienes eventos guardados"
          description="Explora los eventos y pulsa el corazón para guardarlos aquí."
          action={
            <Link
              to="/"
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Explorar eventos
            </Link>
          }
        />
      ) : (
        <MagicGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </MagicGrid>
      )}
    </div>
  )
}

export default FavoritesPage
