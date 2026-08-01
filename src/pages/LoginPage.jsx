import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validation';

/** Accesos de demostración mientras no exista backend. */
const DEMO_ACCOUNTS = [
  { label: 'Paciente', identifier: 'lucia', password: 'paciente123' },
  { label: 'Administración', identifier: 'admin', password: 'admin123' },
];

export default function LoginPage() {
  const { signIn, isSubmitting, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => clearError, [clearError]);

  if (isAuthenticated) {
    return <Navigate to={location.state?.from ?? '/cuestionario'} replace />;
  }

  const update = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    clearError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await signIn(values);
      navigate(location.state?.from ?? '/cuestionario', { replace: true });
    } catch {
      /* el mensaje lo expone AuthContext */
    }
  };

  const useDemo = (account) => {
    setValues({ identifier: account.identifier, password: account.password });
    setErrors({});
    clearError();
  };

  return (
    <AuthLayout
      eyebrow="Portal de pacientes"
      title="Iniciá sesión"
      subtitle="Accedé para completar tus cuestionarios y revisar tu historial."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label="Usuario o email"
          name="identifier"
          autoComplete="username"
          placeholder="lucia"
          value={values.identifier}
          onChange={update('identifier')}
          error={errors.identifier}
        />

        <TextField
          label="Contraseña"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={values.password}
          onChange={update('password')}
          error={errors.password}
        />

        {error && (
          <p
            role="alert"
            className="border-l-2 border-magenta-500 bg-magenta-50 py-2.5 pl-4 text-[13px] font-semibold text-magenta-600"
          >
            {error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-1">
          {isSubmitting ? 'Verificando…' : 'Entrar'}
        </Button>
      </form>

      {/* Accesos rápidos de demo */}
      <div className="mt-8 border-t border-rule pt-5">
        <p className="label text-silver">Cuentas de prueba</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.identifier}
              type="button"
              onClick={() => useDemo(account)}
              className="tnum rounded-sm border border-rule bg-paper px-3 py-1.5 text-[12px] font-semibold text-graphite transition-colors hover:border-ink hover:text-ink"
            >
              {account.label}
              <span className="ml-2 text-silver">{account.identifier}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-[13.5px] text-graphite">
        ¿Todavía no tenés cuenta?{' '}
        <Link
          to="/registro"
          className="font-bold text-magenta-500 underline-offset-4 hover:underline"
        >
          Registrate como paciente
        </Link>
      </p>
    </AuthLayout>
  );
}
