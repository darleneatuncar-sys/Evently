import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

function MainLayout() {
  return (
    <div className="relative isolate flex min-h-screen flex-col text-brand-100">
      {/* Fondo unificado: un solo degradado morado oscuro para navbar, hero y body */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#210835] via-[#2a0a40] to-[#3a0d47]" />
        <div className="absolute -top-40 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-[150px]" />
        <div className="absolute bottom-[-16rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-brand-600/25 blur-[150px]" />
        <div className="absolute left-[-12rem] top-1/3 h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[150px]" />
      </div>

      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-brand-300 sm:flex-row">
          <span className="font-semibold text-brand-200">Evently</span>
          <span>Descubre, organiza y participa en eventos.</span>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
