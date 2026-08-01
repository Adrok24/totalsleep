import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { cx } from '../utils/format';
import {
  PASSWORD_STRENGTH_LABELS,
  calculateAge,
  passwordStrength,
  validateRegistration,
} from '../utils/validation';

const INITIAL = {
  firstName: '',
  lastName: '',
  email: '',
  birthDate: '',
  username: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

/** La fuerza avanza por la rampa de marca: magenta débil → azul robusta. */
const STRENGTH_COLORS = ['bg-rule', 'bg-severe', 'bg-high', 'bg-elevated', 'bg-cobalt-600'];

export default function RegisterPage() {
  const { signUp, isSubmitting, error, clearError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => clearError, [clearError]);

  const strength = useMemo(() => passwordStrength(values.password), [values.password]);
  const age = values.birthDate ? calculateAge(values.birthDate) : null;
  const today = new Date().toISOString().slice(0, 10);

  if (isAuthenticated) return <Navigate to="/cuestionario" replace />;

  const update = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) setErrors(validateRegistration({ ...values, [field]: value }));
    clearError();
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validateRegistration(values));
  };

  const errorFor = (field) => (touched[field] ? errors[field] : undefined);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateRegistration(values);
    setErrors(nextErrors);
    setTouched(Object.fromEntries(Object.keys(INITIAL).map((key) => [key, true])));
    if (Object.keys(nextErrors).length > 0) {
      document.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    try {
      await signUp(values); // alta simulada + inicio de sesión automático
      navigate('/cuestionario', { replace: true, state: { justRegistered: true } });
    } catch {
      /* el mensaje lo expone AuthContext */
    }
  };

  return (
    <AuthLayout
      eyebrow="Alta de paciente"
      title="Creá tu cuenta"
      subtitle="Tus datos quedan en este dispositivo mientras dure la fase de prototipo."
      wide
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Nombre"
            name="firstName"
            autoComplete="given-name"
            placeholder="Lucía"
            value={values.firstName}
            onChange={update('firstName')}
            onBlur={handleBlur('firstName')}
            error={errorFor('firstName')}
          />
          <TextField
            label="Apellido"
            name="lastName"
            autoComplete="family-name"
            placeholder="Ferrer"
            value={values.lastName}
            onChange={update('lastName')}
            onBlur={handleBlur('lastName')}
            error={errorFor('lastName')}
          />
        </div>

        <TextField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="nombre@correo.com"
          value={values.email}
          onChange={update('email')}
          onBlur={handleBlur('email')}
          error={errorFor('email')}
        />

        <TextField
          label="Fecha de nacimiento"
          type="date"
          name="birthDate"
          max={today}
          value={values.birthDate}
          onChange={update('birthDate')}
          onBlur={handleBlur('birthDate')}
          error={errorFor('birthDate')}
          hint={age !== null && age >= 0 ? `${age} años` : 'Debés ser mayor de 18 años.'}
        />

        <TextField
          label="Nombre de usuario"
          name="username"
          autoComplete="username"
          placeholder="lucia.ferrer"
          value={values.username}
          onChange={update('username')}
          onBlur={handleBlur('username')}
          error={errorFor('username')}
          hint="4 a 20 caracteres. Con esto vas a iniciar sesión."
        />

        <div>
          <TextField
            label="Contraseña"
            type="password"
            name="password"
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            value={values.password}
            onChange={update('password')}
            onBlur={handleBlur('password')}
            error={errorFor('password')}
          />

          {values.password && !errorFor('password') && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={cx(
                      'h-0.5 flex-1 transition-colors duration-200',
                      level <= strength ? STRENGTH_COLORS[strength] : 'bg-rule',
                    )}
                  />
                ))}
              </div>
              <span className="label w-16 text-right text-graphite">
                {PASSWORD_STRENGTH_LABELS[strength]}
              </span>
            </div>
          )}
        </div>

        <TextField
          label="Repetir contraseña"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirmPassword}
          onChange={update('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
          error={errorFor('confirmPassword')}
        />

        {/* Consentimiento */}
        <label
          className={cx(
            'flex cursor-pointer items-start gap-3 border p-3.5 transition-colors',
            errorFor('acceptTerms')
              ? 'border-magenta-500 bg-magenta-50'
              : 'border-rule bg-paper hover:border-silver',
          )}
        >
          <input
            type="checkbox"
            name="acceptTerms"
            checked={values.acceptTerms}
            onChange={update('acceptTerms')}
            onBlur={handleBlur('acceptTerms')}
            className="mt-0.5 size-4 shrink-0 accent-[var(--color-magenta-500)]"
          />
          <span className="text-[12.5px] leading-relaxed text-graphite">
            Acepto que mis respuestas se utilicen con fines de seguimiento clínico y entiendo que los
            resultados <strong className="text-ink">no reemplazan una consulta médica</strong>.
          </span>
        </label>
        {errorFor('acceptTerms') && (
          <p role="alert" className="-mt-2 text-[12.5px] font-semibold text-magenta-600">
            {errorFor('acceptTerms')}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="border-l-2 border-magenta-500 bg-magenta-50 py-2.5 pl-4 text-[13px] font-semibold text-magenta-600"
          >
            {error}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-1">
          {isSubmitting ? 'Creando tu cuenta…' : 'Crear cuenta y comenzar'}
        </Button>
      </form>

      <p className="mt-8 text-center text-[13.5px] text-graphite">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-bold text-magenta-500 underline-offset-4 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </AuthLayout>
  );
}
