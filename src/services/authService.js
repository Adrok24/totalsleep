/**
 * authService — capa MOCK de autenticación.
 *
 * ⚠️ Frontera del backend: todas las funciones son async y devuelven
 * promesas, de modo que al conectar la API real solo cambia el cuerpo de
 * cada función (fetch/axios) sin tocar componentes ni contextos.
 *
 * ⚠️ Las contraseñas viajan y se guardan en claro porque esto es un mock
 * de desarrollo. El backend real debe hashearlas (bcrypt/argon2) y emitir
 * un JWT en lugar de persistir el usuario completo en localStorage.
 */

import mockUsers from '../data/mockUsers.json';
import { historyFor } from '../data/seedHistory';
import { buildSubmission } from './questionnaireService';
import { STORAGE_KEYS, createId, delay, readStorage, removeStorage, writeStorage } from './storage';

/**
 * Semilla: la primera vez copia los usuarios mock a localStorage y les
 * adosa un historial de evaluaciones, para que el panel de administración
 * tenga progreso real que mostrar desde el arranque.
 */
function seedUsers() {
  return mockUsers.map((user) => ({
    ...user,
    results: historyFor(user.username).map((session) =>
      buildSubmission({
        user,
        answersByQuestionnaire: session.answersByQuestionnaire,
        startedAt: session.startedAt,
        id: session.id,
        completedAt: session.completedAt,
      }),
    ),
  }));
}

function getUsers() {
  const stored = readStorage(STORAGE_KEYS.users);
  if (Array.isArray(stored) && stored.length > 0) return stored;
  const seeded = seedUsers();
  writeStorage(STORAGE_KEYS.users, seeded);
  return seeded;
}

function persistUsers(users) {
  writeStorage(STORAGE_KEYS.users, users);
  return users;
}

/** Nunca exponemos la contraseña al resto de la app. */
function sanitize(user) {
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

const normalize = (value = '') => value.trim().toLowerCase();

/* -------------------------------------------------------------------------- */
/* API pública                                                                 */
/* -------------------------------------------------------------------------- */

/** POST /auth/login */
export async function login({ identifier, password }) {
  await delay();

  const users = getUsers();
  const found = users.find(
    (user) =>
      normalize(user.username) === normalize(identifier) ||
      normalize(user.email) === normalize(identifier),
  );

  if (!found) {
    throw new Error('No encontramos una cuenta con ese usuario o email.');
  }
  if (found.password !== password) {
    throw new Error('La contraseña no es correcta.');
  }

  const safeUser = sanitize(found);
  writeStorage(STORAGE_KEYS.session, safeUser);
  return safeUser;
}

/** POST /auth/register */
export async function register(payload) {
  await delay(700);

  const users = getUsers();

  if (users.some((user) => normalize(user.email) === normalize(payload.email))) {
    throw new Error('Ese email ya está registrado.');
  }
  if (users.some((user) => normalize(user.username) === normalize(payload.username))) {
    throw new Error('Ese nombre de usuario ya está en uso.');
  }

  const newUser = {
    id: createId('usr'),
    role: 'patient',
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    email: payload.email.trim(),
    birthDate: payload.birthDate,
    username: payload.username.trim(),
    password: payload.password,
    createdAt: new Date().toISOString(),
    results: [],
  };

  persistUsers([...users, newUser]);

  const safeUser = sanitize(newUser);
  writeStorage(STORAGE_KEYS.session, safeUser); // alta + login automático
  return safeUser;
}

/**
 * PATCH /users/:id — edición de datos personales.
 *
 * La unicidad de email y usuario se comprueba EXCLUYENDO al propio
 * usuario: de lo contrario nadie podría guardar sin cambiar esos campos.
 */
export async function updateProfile(userId, changes) {
  await delay(600);

  const users = getUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index === -1) throw new Error('El usuario de la sesión ya no existe.');

  const isTaken = (field, value) =>
    users.some((user) => user.id !== userId && normalize(user[field]) === normalize(value));

  if (isTaken('email', changes.email)) throw new Error('Ese email ya está registrado.');
  if (isTaken('username', changes.username)) throw new Error('Ese nombre de usuario ya está en uso.');

  const updated = {
    ...users[index],
    firstName: changes.firstName.trim(),
    lastName: changes.lastName.trim(),
    email: changes.email.trim(),
    birthDate: changes.birthDate,
    username: changes.username.trim(),
    updatedAt: new Date().toISOString(),
  };

  const nextUsers = [...users];
  nextUsers[index] = updated;
  persistUsers(nextUsers);

  const safeUser = sanitize(updated);
  writeStorage(STORAGE_KEYS.session, safeUser);
  return safeUser;
}

/**
 * POST /users/:id/password
 *
 * Exige la contraseña actual: sin eso, cualquiera con una sesión abierta
 * podría cambiarla y quedarse con la cuenta.
 */
export async function changePassword(userId, { currentPassword, newPassword }) {
  await delay(600);

  const users = getUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index === -1) throw new Error('El usuario de la sesión ya no existe.');

  if (users[index].password !== currentPassword) {
    throw new Error('La contraseña actual no es correcta.');
  }

  const nextUsers = [...users];
  nextUsers[index] = {
    ...users[index],
    password: newPassword,
    updatedAt: new Date().toISOString(),
  };
  persistUsers(nextUsers);
}

/** POST /auth/logout */
export async function logout() {
  await delay(180);
  removeStorage(STORAGE_KEYS.session);
}

/** GET /auth/me — rehidrata la sesión al recargar la página. */
export function getStoredSession() {
  return readStorage(STORAGE_KEYS.session, null);
}

/** GET /users — sólo lo usa la vista de administración. */
export async function listUsers() {
  await delay(300);
  return getUsers().map(sanitize);
}

/**
 * Persiste un resultado de cuestionario en el perfil del paciente y
 * devuelve el usuario actualizado (ya saneado).
 */
export async function appendResultToUser(userId, result) {
  await delay(220);

  const users = getUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index === -1) throw new Error('El usuario de la sesión ya no existe.');

  const updated = {
    ...users[index],
    results: [result, ...(users[index].results ?? [])],
  };

  const nextUsers = [...users];
  nextUsers[index] = updated;
  persistUsers(nextUsers);

  const safeUser = sanitize(updated);
  writeStorage(STORAGE_KEYS.session, safeUser);
  return safeUser;
}
