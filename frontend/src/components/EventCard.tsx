import { Link } from 'react-router-dom'
import type { Event } from '../types'
import { formatEventDate, formatEventTime, formatPrice } from '../utils/format'
import { getCategoryImage } from '../utils/categoryImages'
import EventImage from './EventImage'
import FavoriteButton from './FavoriteButton'
import { MagicCard, useMobileDetection } from './MagicBento'
import { IconCalendar, IconMapPin } from './icons'

interface EventCardProps {
  event: Event
}

function EventCard({ event }: EventCardProps) {
  const isMobile = useMobileDetection()

  return (
    <MagicCard
      className="magic-bento-card magic-bento-card--border-glow flex flex-col"
      glowColor="168, 85, 247"
      particleCount={8}
      disableAnimations={isMobile}
      enableTilt={!isMobile}
      enableMagnetism={!isMobile}
      clickEffect={!isMobile}
    >
      <div className="relative h-32 w-full overflow-hidden">
        <EventImage
          src={event.image}
          alt={event.title}
          fallbackSrc={getCategoryImage(event.category.name)}
          className="h-full w-full transition duration-300 hover:scale-105"
        />
        <span className="absolute left-2.5 top-2.5 rounded-full bg-black/40 px-2.5 py-0.5 text-[11px] font-semibold text-brand-100 backdrop-blur">
          {event.category.name}
        </span>
        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-brand-600/90 px-2.5 py-0.5 text-[11px] font-semibold text-brand-50 backdrop-blur">
          {formatPrice(event.price)}
        </span>
        <div className="absolute right-2.5 top-2.5">
          <FavoriteButton eventId={event.id} variant="icon" />
        </div>
      </div>

      <div className="relative z-[2] flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-brand-50">{event.title}</h3>

        <div className="space-y-1 text-xs text-brand-200">
          <p className="flex items-center gap-1.5">
            <IconCalendar className="h-3.5 w-3.5 shrink-0 text-brand-300" />
            <span className="line-clamp-1">
              {formatEventDate(event.date)} · {formatEventTime(event.time)}
            </span>
          </p>
          <p className="flex items-center gap-1.5">
            <IconMapPin className="h-3.5 w-3.5 shrink-0 text-brand-300" />
            <span className="line-clamp-1">{event.location}</span>
          </p>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="relative z-[3] mt-auto inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-brand-50 transition hover:bg-brand-500"
        >
          Ver evento
        </Link>
      </div>
    </MagicCard>
  )
}

export default EventCard
