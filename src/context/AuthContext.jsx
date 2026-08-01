import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isBooting, setIsBooting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Rehidratación de la sesión guardada en localStorage.
  useEffect(() => {
    setUser(authService.getStoredSession());
    setIsBooting(false);
  }, []);

  const runAuthAction = useCallback(async (action) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const nextUser = await action();
      setUser(nextUser);
      return nextUser;
    } catch (caught) {
      setError(caught.message);
      throw caught;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const signIn = useCallback(
    (credentials) => runAuthAction(() => authService.login(credentials)),
    [runAuthAction],
  );

  const signUp = useCallback(
    (payload) => runAuthAction(() => authService.register(payload)),
    [runAuthAction],
  );

  const signOut = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setError(null);
  }, []);

  /** Edita los datos personales del usuario de la sesión. */
  const updateProfile = useCallback(
    async (changes) => {
      if (!user) throw new Error('No hay una sesión activa.');
      const updated = await authService.updateProfile(user.id, changes);
      setUser(updated);
      return updated;
    },
    [user],
  );

  /** Cambia la contraseña. No altera la sesión: el usuario sigue adentro. */
  const changePassword = useCallback(
    async (payload) => {
      if (!user) throw new Error('No hay una sesión activa.');
      await authService.changePassword(user.id, payload);
    },
    [user],
  );

  /** Guarda un resultado de cuestionario en el perfil del paciente. */
  const saveResult = useCallback(
    async (result) => {
      if (!user) throw new Error('No hay una sesión activa.');
      const updated = await authService.appendResultToUser(user.id, result);
      setUser(updated);
      return updated;
    },
    [user],
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      isBooting,
      isSubmitting,
      error,
      signIn,
      signUp,
      signOut,
      updateProfile,
      changePassword,
      saveResult,
      clearError,
    }),
    [
      user,
      isBooting,
      isSubmitting,
      error,
      signIn,
      signUp,
      signOut,
      updateProfile,
      changePassword,
      saveResult,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>.');
  }
  return context;
}
