import { cx } from '../../utils/format';
import CheckCard from './CheckCard';
import ChoiceCard from './ChoiceCard';
import MetricInput from './MetricInput';

const TYPE_LABEL = {
  single: 'Única',
  multiple: 'Múltiple',
  time: 'Hora',
  number: 'Cantidad',
  text: 'Texto',
};

/**
 * Bloque de pregunta dentro de la hoja del cuestionario.
 *
 * Estructura de especificación técnica: el número vive en una canaleta
 * izquierda separada por un filete vertical que, al apilarse los bloques,
 * dibuja una línea continua a lo largo de toda la hoja.
 */
export default function QuestionBlock({
  question,
  answer,
  answered,
  points,
  totalQuestions,
  onChange,
  invalid,
}) {
  const isMultiple = question.type === 'multiple';
  const isChoice = question.type === 'single' || isMultiple;
  const selected = isMultiple ? (Array.isArray(answer) ? answer : []) : answer;
  // Ancho fijo de 2 caracteres: "01", "1a", "5b" alinean en la canaleta.
  const numberLabel = String(question.number).padStart(2, '0');
  const showSubtotal = isChoice && Boolean(question.maxPoints);

  const handleToggle = (optionId) => {
    const current = Array.isArray(answer) ? answer : [];
    onChange(
      current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId],
    );
  };

  return (
    <section
      id={`pregunta-${question.id}`}
      aria-labelledby={`${question.id}-label`}
      className={cx(
        'grid scroll-mt-20 grid-cols-[3rem_minmax(0,1fr)] border-b border-rule transition-colors duration-200 sm:grid-cols-[4.5rem_minmax(0,1fr)]',
        invalid && 'bg-magenta-50',
      )}
    >
      {/* Canaleta de numeración */}
      <div className="border-r border-rule px-3 py-6 sm:px-5 sm:py-7">
        <span
          className={cx(
            'tnum block text-[15px] leading-none font-bold tabular-nums transition-colors duration-200',
            invalid ? 'text-magenta-500' : answered ? 'text-cobalt-600' : 'text-silver',
          )}
        >
          {numberLabel}
        </span>
        {answered && !invalid && (
          <span aria-hidden="true" className="mt-2 block h-0.5 w-4 bg-cobalt-600" />
        )}
      </div>

      {/* Contenido */}
      <div className="min-w-0 px-4 py-6 sm:px-7 sm:py-7">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="label-sm text-silver">
                {TYPE_LABEL[question.type] ?? 'Respuesta'}
              </span>
              {!question.optional && (
                <span className="label-sm text-silver">
                  Ítem <span className="normal-case">{question.number}</span> de {totalQuestions}
                </span>
              )}
              {question.unscored && <span className="label-sm text-silver">No puntúa</span>}
              {question.optional && <span className="label-sm text-silver">Opcional</span>}
            </div>

            {/* La medida de lectura se acota aunque la hoja sea muy ancha */}
            <h3
              id={`${question.id}-label`}
              className="mt-2 max-w-4xl text-[1.0625rem] leading-[1.35] font-bold tracking-[-0.015em] text-ink text-balance sm:text-[1.125rem]"
            >
              {question.text}
            </h3>
            {question.help && (
              <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-graphite">
                {question.help}
              </p>
            )}
          </div>

          {showSubtotal && (
            <div className="hidden shrink-0 text-right sm:block">
              <span className="label-sm block text-silver">Subtotal</span>
              <span
                className={cx(
                  'tnum mt-1 block text-xl leading-none font-extrabold transition-colors duration-200',
                  answered ? 'text-ink' : 'text-rule',
                )}
              >
                {points}
                <span className="text-[12px] font-bold text-silver">/{question.maxPoints}</span>
              </span>
            </div>
          )}
        </div>

        {isChoice ? (
          <div
            role={isMultiple ? 'group' : 'radiogroup'}
            aria-labelledby={`${question.id}-label`}
            className={cx(
              'mt-4 grid gap-2',
              isMultiple
                ? 'sm:grid-cols-2 lg:grid-cols-3'
                : question.options.length === 4
                  ? 'grid-cols-2 lg:grid-cols-4'
                  : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
            )}
          >
            {question.options.map((option) =>
              isMultiple ? (
                <CheckCard
                  key={option.id}
                  name={question.id}
                  option={option}
                  checked={selected.includes(option.id)}
                  onToggle={handleToggle}
                />
              ) : (
                <ChoiceCard
                  key={option.id}
                  name={question.id}
                  option={option}
                  checked={selected === option.id}
                  onSelect={onChange}
                  scaleMax={Math.max(...question.options.map((item) => item.points), 1)}
                  hidePoints={question.unscored}
                />
              ),
            )}
          </div>
        ) : (
          <div className="mt-4 max-w-3xl">
            <MetricInput question={question} value={answer} onChange={onChange} />
          </div>
        )}

        {isMultiple && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[12.5px] text-graphite">
              <span className="tnum font-bold text-ink">{selected.length}</span> de{' '}
              {question.options.length} marcadas ·{' '}
              <span className="tnum font-bold text-magenta-600">{points} pt</span>
            </p>
            <button
              type="button"
              onClick={() => onChange([])}
              className={cx(
                'rounded-sm border px-2.5 py-1 text-[12px] font-semibold transition-colors',
                answered && selected.length === 0
                  ? 'border-cobalt-600 text-cobalt-600'
                  : 'border-rule text-graphite hover:border-ink hover:text-ink',
              )}
            >
              {question.noneLabel ?? 'Ninguna de las anteriores'}
            </button>
          </div>
        )}

        {invalid && (
          <p role="alert" className="mt-3 text-[12.5px] font-semibold text-magenta-600">
            Obligatoria para calcular el puntaje.
          </p>
        )}
      </div>
    </section>
  );
}
