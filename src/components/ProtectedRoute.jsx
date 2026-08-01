import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './layout/Logo';

function BootScreen() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div
        className="flex flex-col items-center gap-6"
        style={{ animation: 'var(--animate-fade)' }}
      >
        <Logo className="h-11" />
        <span className="h-0.5 w-24 overflow-hidden bg-rule">
          <span className="block h-full w-1/3 animate-pulse bg-magenta-500" />
        </span>
      </div>
    </div>
  );
}

/**
 * Guarda de rutas privadas.
 *
 * - `requireAdmin`: sólo administración (padrón, ficha de paciente).
 * - `patientOnly`: sólo pacientes. El administrador NO completa
 *   cuestionarios: su rol es leer lo que respondieron los pacientes, así
 *   que se lo deriva al padrón en lugar de dejarlo cargar respuestas.
 */
export default function ProtectedRoute({ children, requireAdmin = false, patientOnly = false }) {
  const { isAuthenticated, isAdmin, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) return <BootScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) return <Navigate to="/cuestionario" replace />;
  if (patientOnly && isAdmin) return <Navigate to="/pacientes" replace />;

  return children;
}
