import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cx, initialsOf } from '../../utils/format';
import Logo from './Logo';

/**
 * Barra superior blanca con filete inferior. La navegación activa se marca
 * con un filete magenta de 2px al pie del enlace — no con una píldora.
 */
function HeaderLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(
          'relative px-1 py-5 text-[13.5px] font-semibold transition-colors duration-150',
          isActive ? 'text-ink' : 'text-graphite hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {children}
          <span
            aria-hidden="true"
            className={cx(
              'absolute inset-x-0 bottom-0 h-0.5 bg-magenta-500 transition-transform duration-200',
              isActive ? 'scale-x-100' : 'scale-x-0',
            )}
          />
        </>
      )}
    </NavLink>
  );
}

export default function AppHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    };
    const onKeyDown = (event) => event.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper">
      <div className="flex h-16 w-full items-center gap-8 px-5 sm:px-8 xl:px-12 2xl:px-16">
        <Link to={isAdmin ? '/pacientes' : '/cuestionario'} className="shrink-0">
          <Logo />
        </Link>

        {/* Cada rol ve sólo su recorrido: el admin no completa cuestionarios. */}
        <nav className="hidden items-center gap-7 self-stretch md:flex">
          {isAdmin ? (
            <HeaderLink to="/pacientes">Pacientes</HeaderLink>
          ) : (
            <>
              <HeaderLink to="/cuestionario">Cuestionario</HeaderLink>
              <HeaderLink to="/mis-resultados">Resultados</HeaderLink>
            </>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-4" ref={menuRef}>
          <div className="hidden text-right sm:block">
            <p className="text-[13px] leading-tight font-semibold text-ink">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="label-sm mt-0.5 text-silver">{isAdmin ? 'Administración' : 'Paciente'}</p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className={cx(
                'tnum grid size-9 place-items-center rounded-sm border text-[12px] font-bold transition-colors',
                menuOpen
                  ? 'border-magenta-500 bg-magenta-500 text-white'
                  : 'border-rule text-cobalt-600 hover:border-ink hover:text-ink',
              )}
            >
              {initialsOf(user)}
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-60 border border-rule bg-paper"
                style={{ animation: 'var(--animate-fade)' }}
              >
                <div className="border-b border-rule px-4 py-3">
                  <p className="truncate text-[13px] font-semibold text-ink">{user?.email}</p>
                  <p className="mt-0.5 text-[12px] text-silver">@{user?.username}</p>
                </div>

                <nav className="flex flex-col border-b border-rule md:hidden">
                  {(isAdmin
                    ? [['/pacientes', 'Pacientes']]
                    : [
                        ['/cuestionario', 'Cuestionario'],
                        ['/mis-resultados', 'Resultados'],
                      ]
                  ).map(([to, label]) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className="px-4 py-2.5 text-[13.5px] font-semibold text-graphite hover:bg-rule-soft hover:text-ink"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>

                <Link
                  to="/mi-perfil"
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-rule px-4 py-3 text-[13.5px] font-semibold text-graphite transition-colors hover:bg-rule-soft hover:text-ink"
                >
                  Mi perfil
                </Link>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 text-left text-[13.5px] font-semibold text-magenta-600 transition-colors hover:bg-magenta-50"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
