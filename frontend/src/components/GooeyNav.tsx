import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './GooeyNav.css'

export interface GooeyNavItem {
  label: string
  to: string
  icon: ReactNode
}

export interface GooeyNavProps {
  items: GooeyNavItem[]
  animationTime?: number
  particleCount?: number
  particleDistances?: [number, number]
  particleR?: number
  timeVariance?: number
  colors?: number[]
}

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 12,
  particleDistances = [60, 8],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
}: GooeyNavProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLUListElement>(null)
  const filterRef = useRef<HTMLSpanElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const location = useLocation()

  const noise = (n = 1) => n / 2 - Math.random() * n

  const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180)
    return [distance * Math.cos(angle), distance * Math.sin(angle)]
  }

  const createParticle = (i: number, t: number, d: [number, number], r: number) => {
    const rotate = noise(r / 10)
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    }
  }

  const makeParticles = (element: HTMLElement) => {
    const d = particleDistances
    const r = particleR
    const bubbleTime = animationTime * 2 + timeVariance
    element.style.setProperty('--time', `${bubbleTime}ms`)

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2)
      const p = createParticle(i, t, d, r)
      element.classList.remove('active')

      window.setTimeout(() => {
        const particle = document.createElement('span')
        const point = document.createElement('span')
        particle.classList.add('particle')
        particle.style.setProperty('--start-x', `${p.start[0]}px`)
        particle.style.setProperty('--start-y', `${p.start[1]}px`)
        particle.style.setProperty('--end-x', `${p.end[0]}px`)
        particle.style.setProperty('--end-y', `${p.end[1]}px`)
        particle.style.setProperty('--time', `${p.time}ms`)
        particle.style.setProperty('--scale', `${p.scale}`)
        particle.style.setProperty('--color', `var(--color-${p.color}, #3b0764)`)
        particle.style.setProperty('--rotate', `${p.rotate}deg`)

        point.classList.add('point')
        particle.appendChild(point)
        element.appendChild(particle)
        requestAnimationFrame(() => {
          element.classList.add('active')
        })
        window.setTimeout(() => {
          try {
            element.removeChild(particle)
          } catch {
            // el nodo ya pudo ser eliminado
          }
        }, t)
      }, 30)
    }
  }

  const updateEffectPosition = (element: HTMLElement) => {
    if (!containerRef.current || !filterRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const pos = element.getBoundingClientRect()

    Object.assign(filterRef.current.style, {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`,
    })
  }

  useEffect(() => {
    const index = items.findIndex((item) => {
      const [path, hash] = item.to.split('#')
      if (hash) {
        return location.pathname === path && location.hash === `#${hash}`
      }
      return location.pathname === path
    })
    setActiveIndex(index)
  }, [items, location.pathname, location.hash])

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return
    const listItems = navRef.current.querySelectorAll('li')
    const activeItem = activeIndex >= 0 ? (listItems[activeIndex] as HTMLElement | undefined) : undefined

    if (activeItem) {
      updateEffectPosition(activeItem)
      filterRef.current?.classList.add('active')
    } else {
      filterRef.current?.classList.remove('active')
    }

    const resizeObserver = new ResizeObserver(() => {
      const current =
        activeIndex >= 0
          ? (navRef.current?.querySelectorAll('li')[activeIndex] as HTMLElement | undefined)
          : undefined
      if (current) updateEffectPosition(current)
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [activeIndex])

  const handleClick = (index: number) => {
    if (activeIndex === index) return
    setActiveIndex(index)
    const item = navRef.current?.querySelectorAll('li')[index] as HTMLElement | undefined
    if (item) updateEffectPosition(item)

    if (filterRef.current) {
      filterRef.current.querySelectorAll('.particle').forEach((particle) => {
        filterRef.current?.removeChild(particle)
      })
      makeParticles(filterRef.current)
    }
  }

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li
              key={item.to}
              className={activeIndex === index ? 'active' : ''}
              onClick={() => handleClick(index)}
            >
              <Link to={item.to}>
                <span className="gooey-nav-icon">{item.icon}</span>
                <span className="gooey-nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <span className="effect filter" ref={filterRef} />
    </div>
  )
}

export default GooeyNav
