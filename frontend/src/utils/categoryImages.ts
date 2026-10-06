const UNSPLASH_PARAMS = '?auto=format&fit=crop&w=1200&q=80'

function unsplash(id: string): string {
  return `https://images.unsplash.com/${id}${UNSPLASH_PARAMS}`
}

export const DEFAULT_EVENT_IMAGE = unsplash('photo-1492684223066-81342ee5ff30')

export const CATEGORY_IMAGES: Record<string, string> = {
  tecnologia: unsplash('photo-1540575467063-178a50c2df87'),
  musica: unsplash('photo-1470229722913-7c0e2dbbafd3'),
  deportes: unsplash('photo-1461896836934-ffe607ba8211'),
  educacion: unsplash('photo-1524178232363-1fb2b075b655'),
  negocios: unsplash('photo-1511578314322-379afb476865'),
  cultura: unsplash('photo-1531243269054-5ebf6f34081e'),
}

const CATEGORY_ALIASES: Record<string, string> = {
  tech: 'tecnologia',
  informatica: 'tecnologia',
  programacion: 'tecnologia',
  arte: 'cultura',
  concierto: 'musica',
  deporte: 'deportes',
  formacion: 'educacion',
  empresa: 'negocios',
  emprendimiento: 'negocios',
}

function normalizeCategory(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function getCategoryImage(name?: string | null): string {
  if (!name) {
    return DEFAULT_EVENT_IMAGE
  }
  const key = normalizeCategory(name)
  const canonical = CATEGORY_ALIASES[key] ?? key
  return CATEGORY_IMAGES[canonical] ?? DEFAULT_EVENT_IMAGE
}
