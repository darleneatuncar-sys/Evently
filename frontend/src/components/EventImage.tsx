import { useState } from 'react'

interface EventImageProps {
  src?: string | null
  alt: string
  className?: string
  fit?: 'cover' | 'contain'
  fallbackSrc?: string | null
}

function EventImage({ src, alt, className = '', fit = 'cover', fallbackSrc }: EventImageProps) {
  const [failed, setFailed] = useState(false)
  const [fallbackFailed, setFallbackFailed] = useState(false)

  if ((!src || failed) && fallbackSrc && !fallbackFailed) {
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        loading="lazy"
        onError={() => setFallbackFailed(true)}
        className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
      />
    )
  }

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 ${className}`}
      >
        <span className="text-2xl font-extrabold tracking-tight text-white/90">Evently</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
    />
  )
}

export default EventImage
