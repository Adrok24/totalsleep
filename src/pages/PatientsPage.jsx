import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import { listUsers } from '../services/authService';
import { getQuestionnaireById } from '../data/questionnaires';
import { getBand } from '../data/scoring';
import { cx, formatDate, formatDateShort, initialsOf } from '../utils/format';
import { calculateAge } from '../utils/validation';

/**
 * Suma de deltas entre la primera y la última toma, normalizada por el
 * máximo de cada instrumento: resume en un solo número si el paciente
 * mejoró o empeoró en conjunto. Negativo = mejora.
 */
function overallTrend(results = []) {
  if (results.length < 2) return null;
  const latest = results[0];
  const first = results[results.length - 1];

  let sum = 0;
  let counted = 0;
  for (const section of latest.sections ?? []) {
    const before = first.sections?.find((s) => s.questionnaireId === section.questionnaireId);
    if (!before) continue;
    sum += (section.totalScore - before.totalScore) / section.maxScore;
    counted += 1;
  }
  return counted === 0 ? null : Math.round((sum / counted) * 100);
}

const TONE_BG = {
  low: 'bg-low',
  guarded: 'bg-guarded',
  elevated: 'bg-elevated',
  high: 'bg-high',
  severe: 'bg-severe',
};

function bandOf(section) {
  const questionnaire = getQuestionnaireById(section.questionnaireId);
  return getBand(questionnaire?.bands ?? [], section.totalScore);
}

/** Vista de administración: padrón con la última evaluación de cada paciente. */
export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listUsers()
      .then((users) => {
        if (active) setPatients(users.filter((user) => user.role === 'patient'));
      })
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell>
      <header
        className="mb-8 border-b border-rule pb-6"
        style={{ animation: 'var(--animate-enter)' }}
      >
        <span className="label text-magenta-500">Panel de administración</span>
        <h1 className="mt-3 text-[clamp(1.9rem,3.4vw,2.6rem)] leading-none font-extrabold tracking-[-0.038em] text-ink">
          Pacientes
        </h1>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-graphite">
          Padrón simulado a partir de <code className="text-ink">mockUsers.json</code> y de las altas
          realizadas en este dispositivo.
        </p>
      </header>

      <div className="border border-rule bg-paper">
        <div className="label hidden grid-cols-[minmax(0,2.4fr)_4rem_6rem_7rem_minmax(0,1.8fr)] gap-4 border-b border-rule px-5 py-3 text-silver md:grid">
          <span>Paciente</span>
          <span>Edad</span>
          <span>Tomas</span>
          <span>Última</span>
          <span className="text-right">Evolución global</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col divide-y divide-rule-soft">
            {[0, 1, 2].map((row) => (
              <div key={row} className="h-16 animate-pulse bg-rule-soft" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <p className="px-5 py-14 text-center text-[13.5px] text-silver">
            Todavía no hay pacientes registrados.
          </p>
        ) : (
          <ul className="divide-y divide-rule">
            {patients.map((patient, index) => {
              const results = patient.results ?? [];
              const latest = results[0];
              const sections = latest?.sections ?? [];
              const trend = overallTrend(results);

              return (
                <li
                  key={patient.id}
                  style={{ animation: 'var(--animate-enter)', animationDelay: `${index * 45}ms` }}
                >
                  <Link
                    to={`/pacientes/${patient.id}`}
                    className="grid grid-cols-1 items-center gap-3 px-5 py-4 transition-colors hover:bg-rule-soft md:grid-cols-[minmax(0,2.4fr)_4rem_6rem_7rem_minmax(0,1.8fr)] md:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="tnum grid size-9 shrink-0 place-items-center rounded-sm border border-rule text-[11.5px] font-bold text-cobalt-600">
                        {initialsOf(patient)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-bold text-ink">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="truncate text-[12px] text-silver">{patient.email}</p>
                      </div>
                    </div>

                    <span className="tnum text-[13px] font-semibold text-graphite">
                      {calculateAge(patient.birthDate)}
                    </span>

                    <span className="tnum text-[13px] font-semibold text-graphite">
                      {results.length}
                    </span>

                    <span className="tnum text-[12.5px] text-graphite">
                      {latest ? formatDateShort(latest.completedAt) : '—'}
                    </span>

                    <div className="flex flex-wrap items-center gap-3 md:justify-end">
                      {sections.length === 0 ? (
                        <span className="text-[12.5px] text-silver">Sin mediciones</span>
                      ) : trend === null ? (
                        <span className="text-[12.5px] text-silver">Toma única</span>
                      ) : (
                        <>
                          <span className="flex items-center gap-1">
                            {sections.map((section) => {
                              const band = bandOf(section);
                              return (
                                <span
                                  key={section.questionnaireId}
                                  title={`${section.code}: ${band.label}`}
                                  className={cx('h-4 w-1.5', TONE_BG[band.tone])}
                                />
                              );
                            })}
                          </span>
                          <span
                            className={cx(
                              'tnum text-[13px] font-extrabold',
                              trend < 0 ? 'text-cobalt-600' : 'text-magenta-500',
                            )}
                          >
                            {trend > 0 ? '+' : ''}
                            {trend}%
                          </span>
                          <span
                            className={cx(
                              'label-sm w-14',
                              trend < 0 ? 'text-cobalt-600' : 'text-magenta-500',
                            )}
                          >
                            {trend < 0 ? 'Mejora' : 'Empeora'}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
