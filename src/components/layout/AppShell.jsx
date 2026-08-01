import AppHeader from './AppHeader';

/** Marco de las vistas autenticadas. Fondo gris, contenido sobre filetes. */
export default function AppShell({ children }) {
  return (
    // Sin fondo propio: deja ver la textura del lienzo.
    <div className="flex min-h-dvh flex-col">
      <AppHeader />

      {/* Ancho completo en escritorio: el aire lo dan los paddings, no un
          contenedor centrado que deja márgenes muertos en pantallas grandes. */}
      <main className="w-full flex-1 px-5 py-10 sm:px-8 lg:py-14 xl:px-12 2xl:px-16">
        {children}
      </main>

      <footer className="border-t border-rule bg-paper">
        <div className="flex w-full flex-col gap-1 px-5 py-6 text-[12px] text-silver sm:flex-row sm:items-center sm:justify-between sm:px-8 xl:px-12 2xl:px-16">
          <p>© {new Date().getFullYear()} TotalSleep · Fase 1, prototipo con datos simulados.</p>
          <p className="font-semibold text-graphite">
            Los resultados no constituyen un diagnóstico médico.
          </p>
        </div>
      </footer>
    </div>
  );
}
