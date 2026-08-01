/** Validaciones de formularios (todas del lado cliente). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const NAME_RE = /^[a-záéíóúüñ' -]{2,40}$/i;
const USERNAME_RE = /^[a-z0-9_.-]{4,20}$/i;

export function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

/** Fuerza de contraseña: 0 (vacía) a 4 (robusta). */
export function passwordStrength(password = '') {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return password ? Math.max(1, score) : 0;
}

export const PASSWORD_STRENGTH_LABELS = ['', 'Débil', 'Aceptable', 'Buena', 'Robusta'];

/* -------------------------------------------------------------------------- */
/* Reglas por campo — una sola definición, reutilizada por todos los forms      */
/* -------------------------------------------------------------------------- */

const RULES = {
  firstName: (value) => {
    if (!value?.trim()) return 'Ingresá tu nombre.';
    if (!NAME_RE.test(value.trim())) return 'Usá solo letras (mínimo 2 caracteres).';
    return null;
  },
  lastName: (value) => {
    if (!value?.trim()) return 'Ingresá tu apellido.';
    if (!NAME_RE.test(value.trim())) return 'Usá solo letras (mínimo 2 caracteres).';
    return null;
  },
  email: (value) => {
    if (!value?.trim()) return 'Ingresá tu email.';
    if (!EMAIL_RE.test(value.trim())) return 'El formato del email no es válido.';
    return null;
  },
  birthDate: (value) => {
    if (!value) return 'Ingresá tu fecha de nacimiento.';
    const age = calculateAge(value);
    if (age === null) return 'La fecha no es válida.';
    if (age < 0) return 'La fecha no puede ser futura.';
    if (age < 18) return 'Debés ser mayor de 18 años.';
    if (age > 120) return 'Revisá la fecha ingresada.';
    return null;
  },
  username: (value) => {
    if (!value?.trim()) return 'Elegí un nombre de usuario.';
    if (!USERNAME_RE.test(value.trim()))
      return 'Entre 4 y 20 caracteres: letras, números, punto, guion o guion bajo.';
    return null;
  },
  password: (value) => {
    if (!value) return 'Creá una contraseña.';
    if (value.length < 8) return 'Mínimo 8 caracteres.';
    if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Combiná al menos letras y números.';
    return null;
  },
};

/** Aplica las reglas indicadas y devuelve sólo los campos con error. */
function check(values, fields) {
  const errors = {};
  for (const field of fields) {
    const message = RULES[field](values[field]);
    if (message) errors[field] = message;
  }
  return errors;
}

/** Campos de identidad, compartidos por el registro y la edición de perfil. */
export const PROFILE_FIELDS = ['firstName', 'lastName', 'email', 'birthDate', 'username'];

/* -------------------------------------------------------------------------- */
/* Formularios                                                                 */
/* -------------------------------------------------------------------------- */

export function validateRegistration(values) {
  const errors = check(values, [...PROFILE_FIELDS, 'password']);

  if (!values.confirmPassword) errors.confirmPassword = 'Repetí la contraseña.';
  else if (values.confirmPassword !== values.password)
    errors.confirmPassword = 'Las contraseñas no coinciden.';

  if (!values.acceptTerms) errors.acceptTerms = 'Necesitamos tu consentimiento para continuar.';

  return errors;
}

export function validateLogin(values) {
  const errors = {};
  if (!values.identifier?.trim()) errors.identifier = 'Ingresá tu usuario o email.';
  if (!values.password) errors.password = 'Ingresá tu contraseña.';
  return errors;
}

/** Edición de datos personales: identidad sin tocar la contraseña. */
export function validateProfile(values) {
  return check(values, PROFILE_FIELDS);
}

/** Cambio de contraseña: exige la actual para evitar secuestro de sesión. */
export function validatePasswordChange(values) {
  const errors = {};

  if (!values.currentPassword) errors.currentPassword = 'Ingresá tu contraseña actual.';

  const passwordError = RULES.password(values.newPassword);
  if (passwordError) errors.newPassword = passwordError.replace('Creá una', 'Ingresá la nueva');
  else if (values.newPassword === values.currentPassword)
    errors.newPassword = 'La nueva contraseña debe ser distinta de la actual.';

  if (!values.confirmPassword) errors.confirmPassword = 'Repetí la nueva contraseña.';
  else if (values.confirmPassword !== values.newPassword)
    errors.confirmPassword = 'Las contraseñas no coinciden.';

  return errors;
}
