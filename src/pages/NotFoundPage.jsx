import { Link } from 'react-router-dom';
import Logo from '../components/layout/Logo';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="w-full max-w-lg" style={{ animation: 'var(--animate-enter)' }}>
        <Logo className="h-11" />

        <p className="tnum mt-16 text-[clamp(6rem,20vw,11rem)] leading-[0.8] font-extrabold tracking-[-0.06em] text-cobalt-50">
          404
        </p>

        <h1 className="mt-6 border-t border-rule pt-6 text-[1.75rem] leading-tight font-extrabold tracking-[-0.035em] text-ink">
          Esta página se quedó dormida
        </h1>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-graphite">
          La ruta que buscás no existe o fue movida durante la fase de prototipo.
        </p>

        <Button as={Link} to="/cuestionario" size="lg" className="mt-8">
          Volver al cuestionario
        </Button>
      </div>
    </div>
  );
}
