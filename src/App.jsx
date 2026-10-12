import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuestionnaireProvider } from './context/QuestionnaireContext';
import { FIRST_QUESTIONNAIRE } from './data/questionnaires';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import PatientDetailPage from './pages/PatientDetailPage';
import PatientsPage from './pages/PatientsPage';
import ProfilePage from './pages/ProfilePage';
import QuestionnairePage from './pages/QuestionnairePage';
import RegisterPage from './pages/RegisterPage';
import ResultsPage from './pages/ResultsPage';
import SummaryPage from './pages/SummaryPage';

/** Cada rol entra a su propio recorrido. */
function HomeRedirect() {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/pacientes' : '/cuestionario'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <QuestionnaireProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Routes>
            {/* Públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />

            {/* Flujo de cuestionarios — sólo pacientes */}
            <Route
              path="/cuestionario"
              element={<Navigate to={`/cuestionario/${FIRST_QUESTIONNAIRE.slug}`} replace />}
            />
            <Route
              path="/cuestionario/:slug"
              element={
                <ProtectedRoute patientOnly>
                  <QuestionnairePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resumen"
              element={
                <ProtectedRoute patientOnly>
                  <SummaryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-resultados"
              element={
                <ProtectedRoute patientOnly>
                  <ResultsPage />
                </ProtectedRoute>
              }
            />

            {/* Cuenta propia — disponible para ambos roles */}
            <Route
              path="/mi-perfil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Administración — sólo lectura del progreso de los pacientes */}
            <Route
              path="/pacientes"
              element={
                <ProtectedRoute requireAdmin>
                  <PatientsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pacientes/:id"
              element={
                <ProtectedRoute requireAdmin>
                  <PatientDetailPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomeRedirect />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </QuestionnaireProvider>
    </AuthProvider>
  );
}
