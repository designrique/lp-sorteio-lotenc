import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header>
        <div className="container mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display">
            Loteria Encruzilhada
          </h1>
        </div>
      </header>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="w-full py-6 bg-foreground text-background">
        <div className="container mx-auto text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Loteria Encruzilhada. Todos os
            direitos reservados.
          </p>
          <a
            href="#"
            className="underline hover:text-primary transition-colors"
          >
            Termos e Condições
          </a>
        </div>
      </footer>
    </div>
  )
}
