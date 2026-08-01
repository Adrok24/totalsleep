import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import ProgressMatrix from '../components/progress/ProgressMatrix';
import Badge from '../components/ui/Badge';
import { getQuestionnaireById } from '../data/questionnaires';
import { getBand } from '../data/scoring';
import { listUsers } from '../services/authService';
import { cx, formatDate, formatDateTime, initialsOf, monthsBetween } from '../utils/format';
import { calculateAge } from '../utils/validation';

/** Detalle desplegable de una toma. */
function SessionCard({ session, previous, index }) {
  return (
    <article
      className="border border-rule bg-paper"
      style={{ animation: 'var(--animate-enter)', animationDelay: `${index * 50}ms` }}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule px-5 py-3">
        <span className="tnum label text-ink">{formatDateTime(session.completedAt)}</span>
        {previous && (
          <span className="label text-silver">
            {monthsBetween(previous.completedAt, session.completedAt)} meses desde la toma anterior
          </span>
        )}
      </div>

      <table className="w-full text-left">
        <tbody>
          {(session.sections ?? []).map((section) => {
            const questionnaire = getQuestionnaireById(section.questionnaireId);
            const band = getBand(questionnaire?.bands ?? [], section.totalScore);
            const before = previous?.sections?.find(
              (s) => s.questionnaireId === section.questionnaireId,
            );
            const delta = before ? section.totalScore - before.totalScore : null;

            return (
              <tr
                key={section.questionnaireId}
                className="border-b border-rule-soft last:border-b-0"
              >
                <td className="label w-20 py-3 pl-5 align-middle text-cobalt-600">
                  {section.code}
                </td>
                <td className="py-3 pr-4 align-middle text-[13px] font-semibold text-ink">
                  {section.questionnaireTitle}
                </td>
                <td className="w-56 py-3 pr-4 text-right align-middle">
                  <Badge tone={band.tone}>{band.label}</Badge>
                </td>
                <td className="tnum w-20 py-3 pr-4 text-right align-middle">
                  {delta !== null && (
                    <span
                      className={cx(
                        'text-[12px] font-bold',
                        delta < 0
                          ? 'text-cobalt-600'
                          : delta > 0
                            ? 'text-magenta-500'
                            : 'text-silver',
                      )}
                    >
                      {delta > 0 ? '+' : ''}
                      {delta !== 0 ? delta : '='}
                    </span>
                  )}
                </td>
                <td className="tnum w-24 py-3 pr-5 text-right align-middle text-lg font-extrabold text-ink">
                  {section.totalScore}
                  <span className="text-[11px] font-bold text-silver">/{section.maxScore}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </article>
  );
}

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listUsers()
      .then((users) => {
        if (active) setPatient(users.find((user) => user.id === id) ?? null);
      })
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="h-64 animate-pulse border border-rule bg-paper" />
      </AppShell>
    );
  }

  if (!patient) {
    return (
      <AppShell>
        <div className="border border-rule bg-paper px-8 py-16 text-center">
          <h1 className="text-[1.25rem] font-extrabold text-ink">Paciente no encontrado</h1>
          <Link
            to="/pacientes"
            className="mt-3 inline-block text-[13px] font-bold text-magenta-500 underline-offset-4 hover:underline"
          >
            Volver al padrón
          </Link>
        </div>
      </AppShell>
    );
  }

  const results = patient.results ?? [];
  const first = results[results.length - 1];
  const latest = results[0];
  const span = first && latest ? monthsBetween(first.completedAt, latest.completedAt) : null;

  return (
    <AppShell>
      {/* ── Ficha ─────────────────────────────────────────────────── */}
      <header className="mb-8" style={{ animation: 'var(--animate-enter)' }}>
        <Link
          to="/pacientes"
          className="label text-graphite underline-offset-4 hover:text-ink hover:underline"
        >
          ← Padrón de pacientes
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-6 border-b border-rule pb-6">
          <div className="flex items-center gap-4">
            <span className="tnum grid size-14 place-items-center border border-rule text-[16px] font-bold text-cobalt-600">
              {initialsOf(patient)}
            </span>
            <div>
              <h1 className="text-[1.9rem] leading-none font-extrabold tracking-[-0.035em] text-ink">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="mt-2 text-[12.5px] text-graphite">
                {patient.email} · @{patient.username}
              </p>
            </div>
          </div>

          <dl className="flex divide-x divide-rule border border-rule bg-paper">
            {[
              ['Edad', `${calculateAge(patient.birthDate)}`],
              ['Alta', formatDate(patient.createdAt)],
              ['Tomas', `${results.length}`],
              ['Seguimiento', span !== null ? `${span} meses` : '—'],
            ].map(([label, value]) => (
              <div key={label} className="px-4 py-2.5">
                <dt className="label-sm text-silver">{label}</dt>
                <dd className="tnum mt-1 text-[15px] leading-none font-bold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {results.length === 0 ? (
        <div className="border border-dashed border-rule bg-paper px-8 py-16 text-center">
          <h2 className="text-[1.15rem] font-extrabold text-ink">Sin evaluaciones registradas</h2>
          <p className="mx-auto mt-2 max-w-sm text-[13.5px] text-graphite">
            Este paciente todavía no completó ninguna toma. El progreso aparecerá acá en cuanto
            envíe la primera.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {/* ── Progreso entre tomas ───────────────────────────────── */}
          <section style={{ animation: 'var(--animate-enter)', animationDelay: '60ms' }}>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="text-[1.15rem] font-extrabold tracking-[-0.025em] text-ink">
                Progreso entre tomas
              </h2>
              <p className="label text-silver">
                {results.length} tomas
                {span !== null && ` · ${span} meses`}
              </p>
            </div>
            <ProgressMatrix results={results} />
            <p className="mt-3 max-w-3xl text-[11.5px] leading-relaxed text-silver">
              En los cinco instrumentos un puntaje más alto indica peor estado, de modo que un
              cambio negativo es una mejora. Los rangos difieren entre escalas y por eso cada línea
              se normaliza contra su propio máximo: no son comparables entre sí.
            </p>
          </section>

          {/* ── Tomas ──────────────────────────────────────────────── */}
          <section>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <h2 className="text-[1.15rem] font-extrabold tracking-[-0.025em] text-ink">
                Detalle por toma
              </h2>
              <p className="label text-silver">Cambio respecto de la toma anterior</p>
            </div>
            <div className="flex flex-col gap-4">
              {results.map((session, index) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  previous={results[index + 1]}
                  index={index}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
