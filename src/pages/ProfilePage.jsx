import { useEffect, useMemo, useState } from 'react';
import AppShell from '../components/layout/AppShell';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import { useAuth } from '../context/AuthContext';
import { cx, formatDate } from '../utils/format';
import {
  PASSWORD_STRENGTH_LABELS,
  PROFILE_FIELDS,
  calculateAge,
  passwordStrength,
  validatePasswordChange,
  validateProfile,
} from '../utils/validation';

const STRENGTH_COLORS = ['bg-rule', 'bg-severe', 'bg-high', 'bg-elevated', 'bg-cobalt-600'];

/** Sección con título y filete, el contenedor estándar de esta pantalla. */
function Panel({ title, description, children, footer }) {
  return (
    <section className="border border-rule bg-paper">
      <header className="border-b border-rule px-6 py-5">
        <h2 className="text-[1.05rem] font-extrabold tracking-[-0.02em] text-ink">{title}</h2>
        {description && (
          <p className="mt-1 max-w-xl text-[12.5px] leading-relaxed text-graphite">{description}</p>
        )}
      </header>
      <div className="px-6 py-6">{children}</div>
      {footer && (
        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-rule px-6 py-4">
          {footer}
        </div>
      )}
    </section>
  );
}

/** Confirmación efímera tras guardar. */
function Saved({ children }) {
  return (
    <p
      role="status"
      className="mr-auto text-[12.5px] font-semibold text-cobalt-600"
      style={{ animation: 'var(--animate-fade)' }}
    >
      {children}
    </p>
  );
}

export default function ProfilePage() {
  const { user, isAdmin, updateProfile, changePassword } = useAuth();

  /* ── Datos personales ──────────────────────────────────────────── */
  const initialProfile = useMemo(
    () => Object.fromEntries(PROFILE_FIELDS.map((field) => [field, user?.[field] ?? ''])),
    [user],
  );

  const [profile, setProfile] = useState(initialProfile);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileTouched, setProfileTouched] = useState({});
  const [profileState, setProfileState] = useState('idle'); // idle | saving | saved
  const [profileError, setProfileError] = useState(null);

  // Si la sesión cambia por fuera, el formulario se resincroniza.
  useEffect(() => setProfile(initialProfile), [initialProfile]);

  const isDirty = PROFILE_FIELDS.some((field) => profile[field] !== initialProfile[field]);
  const age = profile.birthDate ? calculateAge(profile.birthDate) : null;
  const today = new Date().toISOString().slice(0, 10);

  const updateField = (field) => (event) => {
    const { value } = event.target;
    setProfile((prev) => ({ ...prev, [field]: value }));
    setProfileState('idle');
    setProfileError(null);
    if (profileTouched[field]) setProfileErrors(validateProfile({ ...profile, [field]: value }));
  };

  const blurField = (field) => () => {
    setProfileTouched((prev) => ({ ...prev, [field]: true }));
    setProfileErrors(validateProfile(profile));
  };

  const errorFor = (field) => (profileTouched[field] ? profileErrors[field] : undefined);

  const submitProfile = async (event) => {
    event.preventDefault();
    const errors = validateProfile(profile);
    setProfileErrors(errors);
    setProfileTouched(Object.fromEntries(PROFILE_FIELDS.map((field) => [field, true])));
    if (Object.keys(errors).length > 0) return;

    setProfileState('saving');
    setProfileError(null);
    try {
      await updateProfile(profile);
      setProfileState('saved');
    } catch (caught) {
      setProfileState('idle');
      setProfileError(caught.message);
    }
  };

  const discardProfile = () => {
    setProfile(initialProfile);
    setProfileErrors({});
    setProfileTouched({});
    setProfileState('idle');
    setProfileError(null);
  };

  /* ── Contraseña ────────────────────────────────────────────────── */
  const EMPTY_PASSWORD = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [password, setPassword] = useState(EMPTY_PASSWORD);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordState, setPasswordState] = useState('idle');
  const [passwordError, setPasswordError] = useState(null);

  const strength = passwordStrength(password.newPassword);

  const updatePassword = (field) => (event) => {
    setPassword((prev) => ({ ...prev, [field]: event.target.value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
    setPasswordState('idle');
    setPasswordError(null);
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    const errors = validatePasswordChange(password);
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setPasswordState('saving');
    setPasswordError(null);
    try {
      await changePassword(password);
      setPassword(EMPTY_PASSWORD); // no dejamos la clave en pantalla
      setPasswordState('saved');
    } catch (caught) {
      setPasswordState('idle');
      setPasswordError(caught.message);
    }
  };

  return (
    <AppShell>
      <header
        className="mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-6"
        style={{ animation: 'var(--animate-enter)' }}
      >
        <div>
          <span className="label text-magenta-500">Mi cuenta</span>
          <h1 className="mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)] leading-none font-extrabold tracking-[-0.038em] text-ink">
            Datos personales
          </h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-graphite">
            Podés actualizar tu información y tu contraseña en cualquier momento. Los cambios se
            aplican de inmediato en tu sesión.
          </p>
        </div>

        <dl className="flex divide-x divide-rule border border-rule bg-paper">
          {[
            ['Rol', isAdmin ? 'Administración' : 'Paciente'],
            ['Alta', formatDate(user?.createdAt)],
            ['Edad', age !== null ? `${age}` : '—'],
          ].map(([label, value]) => (
            <div key={label} className="px-4 py-2.5">
              <dt className="label-sm text-silver">{label}</dt>
              <dd className="tnum mt-1 text-[15px] leading-none font-bold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div
        className="grid gap-6 xl:grid-cols-2 xl:items-start"
        style={{ animation: 'var(--animate-enter)', animationDelay: '60ms' }}
      >
        {/* ── Identidad ───────────────────────────────────────────── */}
        <form onSubmit={submitProfile} noValidate>
          <Panel
            title="Información personal"
            description="El email y el nombre de usuario deben ser únicos: con cualquiera de los dos vas a iniciar sesión."
            footer={
              <>
                {profileState === 'saved' && <Saved>Datos actualizados.</Saved>}
                {profileError && (
                  <p role="alert" className="mr-auto text-[12.5px] font-semibold text-magenta-600">
                    {profileError}
                  </p>
                )}
                <Button
                  type="button"
                  variant="quiet"
                  size="md"
                  onClick={discardProfile}
                  disabled={!isDirty || profileState === 'saving'}
                >
                  Descartar
                </Button>
                <Button
                  type="submit"
                  size="md"
                  loading={profileState === 'saving'}
                  disabled={!isDirty}
                >
                  {profileState === 'saving' ? 'Guardando…' : 'Guardar cambios'}
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Nombre"
                  name="firstName"
                  autoComplete="given-name"
                  value={profile.firstName}
                  onChange={updateField('firstName')}
                  onBlur={blurField('firstName')}
                  error={errorFor('firstName')}
                />
                <TextField
                  label="Apellido"
                  name="lastName"
                  autoComplete="family-name"
                  value={profile.lastName}
                  onChange={updateField('lastName')}
                  onBlur={blurField('lastName')}
                  error={errorFor('lastName')}
                />
              </div>

              <TextField
                label="Email"
                type="email"
                name="email"
                autoComplete="email"
                value={profile.email}
                onChange={updateField('email')}
                onBlur={blurField('email')}
                error={errorFor('email')}
              />

              <TextField
                label="Fecha de nacimiento"
                type="date"
                name="birthDate"
                max={today}
                value={profile.birthDate}
                onChange={updateField('birthDate')}
                onBlur={blurField('birthDate')}
                error={errorFor('birthDate')}
                hint={age !== null && age >= 0 ? `${age} años` : undefined}
              />

              <TextField
                label="Nombre de usuario"
                name="username"
                autoComplete="username"
                value={profile.username}
                onChange={updateField('username')}
                onBlur={blurField('username')}
                error={errorFor('username')}
                hint="4 a 20 caracteres: letras, números, punto, guion o guion bajo."
              />
            </div>
          </Panel>
        </form>

        {/* ── Contraseña ──────────────────────────────────────────── */}
        <form onSubmit={submitPassword} noValidate>
          <Panel
            title="Contraseña"
            description="Pedimos la contraseña actual para confirmar que sos vos quien la cambia."
            footer={
              <>
                {passwordState === 'saved' && <Saved>Contraseña actualizada.</Saved>}
                {passwordError && (
                  <p role="alert" className="mr-auto text-[12.5px] font-semibold text-magenta-600">
                    {passwordError}
                  </p>
                )}
                <Button type="submit" size="md" loading={passwordState === 'saving'}>
                  {passwordState === 'saving' ? 'Actualizando…' : 'Cambiar contraseña'}
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-5">
              <TextField
                label="Contraseña actual"
                type="password"
                name="currentPassword"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password.currentPassword}
                onChange={updatePassword('currentPassword')}
                error={passwordErrors.currentPassword}
              />

              <div>
                <TextField
                  label="Nueva contraseña"
                  type="password"
                  name="newPassword"
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  value={password.newPassword}
                  onChange={updatePassword('newPassword')}
                  error={passwordErrors.newPassword}
                />

                {password.newPassword && !passwordErrors.newPassword && (
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
                label="Repetir nueva contraseña"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password.confirmPassword}
                onChange={updatePassword('confirmPassword')}
                error={passwordErrors.confirmPassword}
              />
            </div>
          </Panel>

          <p className="mt-4 text-[11.5px] leading-relaxed text-silver">
            En esta fase de prototipo las contraseñas se guardan sin cifrar en este dispositivo.
            Cuando exista backend se almacenarán con hash y el cambio se hará contra la API.
          </p>
        </form>
      </div>

      {!isAdmin && (
        <div className="mt-6">
          <Badge tone="neutral">
            Tus evaluaciones no se ven afectadas por estos cambios · {user?.results?.length ?? 0}{' '}
            guardadas
          </Badge>
        </div>
      )}
    </AppShell>
  );
}
