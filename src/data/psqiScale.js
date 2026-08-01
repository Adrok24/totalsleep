/**
 * ÍNDICE DE CALIDAD DE SUEÑO DE PITTSBURGH (PSQI)
 * ---------------------------------------------------------------------------
 * A diferencia de la FFS y el ISI, el PSQI NO es una suma directa de opciones:
 * las 19 preguntas autoadministradas se agrupan en 7 componentes, cada uno
 * puntuado de 0 (muy buena) a 3 (muy mala).
 *
 *   C1  Calidad subjetiva del sueño ............ P6
 *   C2  Latencia del sueño ..................... P2 + P5a  (tabla de corte)
 *   C3  Duración del sueño ..................... P4
 *   C4  Eficiencia habitual del sueño .......... P1, P3, P4 (h dormidas / h en cama)
 *   C5  Trastornos del sueño ................... P5b a P5j  (tabla de corte)
 *   C6  Uso de medicación para dormir .......... P7
 *   C7  Disfunción diurna ...................... P8 + P9    (tabla de corte)
 *   ------------------------------------------------------------------------
 *   PUNTAJE GLOBAL = C1 + … + C7 ............... 0 a 21
 *
 * ⚠️ Discrepancia de la fuente: la página resumen del PDF atribuye C1 a la
 * P9, C6 a la P6 y C7 a las P7-P8. Ese mapeo está corrido respecto del
 * cuestionario real; las tablas de puntuación del propio PDF (y el
 * instrumento original de Buysse et al., 1989) usan el mapeo de arriba,
 * que es el implementado.
 *
 * ⚠️ La tabla de eficiencia del PDF está truncada (llega hasta 65–74% = 2).
 * Se completa con `< 65% = 3`, sin lo cual C4 nunca alcanzaría su máximo.
 *
 * Las preguntas del compañero de cama (P10 y 10a-10e) NO puntúan: se
 * registran como información clínica adicional para el profesional.
 */

import { completionOf, isAnswered, scoreQuestion } from './scoring';

export const PSQI_META = {
  id: 'pittsburgh-sleep-quality-index',
  version: '1.0.0',
  code: 'PSQI',
  slug: 'psqi',
  title: 'Índice de Calidad de Sueño de Pittsburgh',
  subtitle: 'Calidad del sueño · último mes',
  instructions:
    'Las siguientes cuestiones hacen referencia a tus hábitos de sueño sólo durante el último mes. Tus respuestas deben reflejar fielmente lo ocurrido la mayoría de días y noches del último mes. Por favor contesta a todas las preguntas.',
  estimatedMinutes: 6,
};

export const PSQI_GROUPS = {
  habits: {
    id: 'habits',
    title: 'Tus horarios de sueño durante el último mes',
    help: 'Estos cuatro datos se combinan para calcular tu latencia, duración y eficiencia del sueño.',
  },
  disturbances: {
    id: 'disturbances',
    title:
      'Durante el último mes, ¿con qué frecuencia has tenido un sueño alterado a consecuencia de…?',
    help: 'Respondé cada causa por separado.',
  },
  partner: {
    id: 'partner',
    title: 'Compañero/a de cama o de habitación',
    help: 'Estas preguntas no puntúan: son información clínica adicional para el profesional.',
  },
  partnerReports: {
    id: 'partnerReports',
    title:
      'Si dormís acompañado/a, ¿con qué frecuencia te ha dicho, durante el último mes, que has tenido…?',
    help: 'Tampoco puntúan y podés dejarlas sin responder.',
  },
};

/** Escala de frecuencia estándar del PSQI (0 a 3). */
const SCALE_FREQUENCY = [
  { id: 'w0', label: 'No me ha ocurrido durante el último mes', points: 0 },
  { id: 'w1', label: 'Menos de una vez a la semana', points: 1 },
  { id: 'w2', label: 'Una o dos veces a la semana', points: 2 },
  { id: 'w3', label: 'Tres o más veces a la semana', points: 3 },
];

/** Genera los ítems 5a-5j y 10a-10e, que comparten la escala de frecuencia. */
const frequencyItem = (id, number, text, extra = {}) => ({
  id,
  number,
  type: 'single',
  text,
  maxPoints: 3,
  options: SCALE_FREQUENCY,
  ...extra,
});

const hasPartner = (answers) => Boolean(answers.psqi_10) && answers.psqi_10 !== 'r0';

export const PSQI_QUESTIONS = [
  /* ── Hábitos horarios (P1 a P4) ─────────────────────────────────── */
  {
    id: 'psqi_1',
    number: 1,
    groupId: 'habits',
    type: 'time',
    text: 'Durante el último mes, ¿a qué hora solías acostarte por la noche?',
    inputLabel: 'Hora habitual de acostarse',
  },
  {
    id: 'psqi_2',
    number: 2,
    groupId: 'habits',
    type: 'number',
    text: 'Durante el último mes, ¿cuánto tiempo (en minutos) te ha costado quedarte dormido después de acostarte por las noches?',
    inputLabel: 'Número de minutos para conciliar el sueño',
    unit: 'min',
    min: 0,
    max: 600,
    step: 5,
  },
  {
    id: 'psqi_3',
    number: 3,
    groupId: 'habits',
    type: 'time',
    text: 'Durante el último mes, ¿a qué hora te has levantado habitualmente por la mañana?',
    inputLabel: 'Hora habitual de levantarse',
  },
  {
    id: 'psqi_4',
    number: 4,
    groupId: 'habits',
    type: 'number',
    text: 'Durante el último mes, ¿cuántas horas de sueño real has mantenido por las noches?',
    help: 'Puede ser diferente del número de horas que estuviste acostado.',
    inputLabel: 'Horas de sueño por noche',
    unit: 'h',
    min: 0,
    max: 24,
    step: 0.5,
  },

  /* ── P5: causas de sueño alterado ───────────────────────────────── */
  frequencyItem('psqi_5a', '5a', 'No poder conciliar el sueño después de 30 minutos de intentarlo', {
    groupId: 'disturbances',
  }),
  frequencyItem('psqi_5b', '5b', 'Despertarse en mitad de la noche o de madrugada', {
    groupId: 'disturbances',
  }),
  ...[
    ['psqi_5c', '5c', 'Tener que ir al baño'],
    ['psqi_5d', '5d', 'No poder respirar adecuadamente'],
    ['psqi_5e', '5e', 'Tos o ronquidos'],
    ['psqi_5f', '5f', 'Sensación de frío'],
    ['psqi_5g', '5g', 'Sensación de calor'],
    ['psqi_5h', '5h', 'Pesadillas'],
    ['psqi_5i', '5i', 'Sentir dolor'],
  ].map(([id, number, text]) => frequencyItem(id, number, text, { groupId: 'disturbances' })),
  {
    id: 'psqi_5j_desc',
    number: '5j',
    groupId: 'disturbances',
    type: 'text',
    optional: true,
    text: 'Otra causa(s), describir',
    inputLabel: 'Otra causa (opcional)',
    placeholder: 'Ej.: ruido en la calle',
  },
  frequencyItem(
    'psqi_5j',
    '5j',
    '¿Con qué frecuencia has tenido un sueño alterado a consecuencia de este problema?',
    {
      groupId: 'disturbances',
      help: 'Si no indicaste otra causa, marcá "No me ha ocurrido durante el último mes".',
    },
  ),

  /* ── P6 a P9 ────────────────────────────────────────────────────── */
  {
    id: 'psqi_6',
    number: 6,
    type: 'single',
    text: 'Durante el último mes, ¿cómo calificarías, en general, la calidad de tu sueño?',
    maxPoints: 3,
    options: [
      { id: 'q0', label: 'Muy buena', points: 0 },
      { id: 'q1', label: 'Bastante buena', points: 1 },
      { id: 'q2', label: 'Bastante mala', points: 2 },
      { id: 'q3', label: 'Muy mala', points: 3 },
    ],
  },
  frequencyItem(
    'psqi_7',
    7,
    'Durante el último mes, ¿con qué frecuencia tuviste que tomar medicinas (prescritas o automedicadas) para poder dormir?',
  ),
  frequencyItem(
    'psqi_8',
    8,
    'Durante el último mes, ¿con qué frecuencia tuviste dificultad para mantenerte despierto mientras conducías, comías o desarrollabas alguna actividad social?',
  ),
  {
    id: 'psqi_9',
    number: 9,
    type: 'single',
    text: 'Durante el último mes, ¿cómo de problemático ha resultado para ti el mantener el entusiasmo por hacer las cosas?',
    maxPoints: 3,
    options: [
      { id: 'e0', label: 'No ha resultado problemático en absoluto', points: 0 },
      { id: 'e1', label: 'Sólo ligeramente problemático', points: 1 },
      { id: 'e2', label: 'Moderadamente problemático', points: 2 },
      { id: 'e3', label: 'Muy problemático', points: 3 },
    ],
  },

  /* ── P10: compañero de cama (no puntúa) ─────────────────────────── */
  {
    id: 'psqi_10',
    number: 10,
    groupId: 'partner',
    type: 'single',
    optional: true,
    unscored: true,
    text: '¿Tienes pareja o compañero/a de habitación?',
    options: [
      { id: 'r0', label: 'No tengo pareja ni compañero/a de habitación', points: 0 },
      { id: 'r1', label: 'Sí tengo pero duerme en otra habitación', points: 0 },
      { id: 'r2', label: 'Sí tengo, pero duerme en la misma habitación y distinta cama', points: 0 },
      { id: 'r3', label: 'Sí tengo y duerme en la misma cama', points: 0 },
    ],
  },
  ...[
    ['psqi_10a', '10a', 'Ronquidos fuertes'],
    ['psqi_10b', '10b', 'Largas pausas entre las respiraciones mientras dormía'],
    ['psqi_10c', '10c', 'Temblor o sacudidas de las piernas mientras dormía'],
    ['psqi_10d', '10d', 'Episodios de desorientación o confusión durante el sueño'],
  ].map(([id, number, text]) =>
    frequencyItem(id, number, text, {
      optional: true,
      unscored: true,
      maxPoints: 0,
      groupId: 'partnerReports',
      visibleIf: hasPartner,
    }),
  ),
  {
    id: 'psqi_10e_desc',
    number: '10e',
    groupId: 'partnerReports',
    type: 'text',
    optional: true,
    unscored: true,
    visibleIf: hasPartner,
    text: 'Otro tipo de trastorno mientras dormía, por favor descríbelo',
    inputLabel: 'Otro trastorno (opcional)',
    placeholder: 'Ej.: hablaba dormido',
  },
  frequencyItem('psqi_10e', '10e', 'Frecuencia de ese otro trastorno', {
    optional: true,
    unscored: true,
    maxPoints: 0,
    groupId: 'partnerReports',
    visibleIf: hasPartner,
  }),
];

/** Puntaje global máximo: 7 componentes × 3. */
export const PSQI_MAX_SCORE = 21;

/**
 * Interpretación oficial del instrumento. La fuente define únicamente dos
 * categorías (corte en 5); no se inventan tramos intermedios.
 */
export const PSQI_BANDS = [
  {
    id: 'good',
    label: 'Buena calidad de sueño',
    min: 0,
    max: 5,
    tone: 'low',
    summary: 'Puntaje global dentro del rango de buena calidad de sueño.',
  },
  {
    id: 'poor',
    label: 'Mala calidad de sueño',
    min: 6,
    max: 21,
    tone: 'high',
    summary:
      'Puntaje por encima del corte de 5: indica problemas de sueño clínicamente significativos. A mayor puntuación, peor calidad.',
  },
];

/* -------------------------------------------------------------------------- */
/* Tablas de corte                                                             */
/* -------------------------------------------------------------------------- */

/** Convierte "HH:MM" a minutos desde medianoche. */
function timeToMinutes(value) {
  if (typeof value !== 'string' || !/^\d{1,2}:\d{2}$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Horas transcurridas entre acostarse y levantarse (cruza la medianoche). */
export function hoursInBed(bedTime, wakeTime) {
  const bed = timeToMinutes(bedTime);
  const wake = timeToMinutes(wakeTime);
  if (bed === null || wake === null) return null;
  const span = wake > bed ? wake - bed : wake + 24 * 60 - bed;
  return span / 60;
}

/** C2 · latencia: minutos declarados en la P2. */
function latencyPoints(minutes) {
  if (minutes === null) return 0;
  if (minutes <= 15) return 0;
  if (minutes <= 30) return 1;
  if (minutes <= 60) return 2;
  return 3;
}

/** Tabla 0 / 1-2 / 3-4 / 5-6 usada por los componentes 2 y 7. */
function pairTable(sum) {
  if (sum === 0) return 0;
  if (sum <= 2) return 1;
  if (sum <= 4) return 2;
  return 3;
}

/** C3 · duración del sueño. */
function durationPoints(hours) {
  if (hours === null) return 0;
  if (hours > 7) return 0;
  if (hours >= 6) return 1;
  if (hours >= 5) return 2;
  return 3;
}

/** C4 · eficiencia (%). El tramo `< 65%` completa la tabla truncada del PDF. */
function efficiencyPoints(efficiency) {
  if (efficiency === null) return 0;
  if (efficiency >= 85) return 0;
  if (efficiency >= 75) return 1;
  if (efficiency >= 65) return 2;
  return 3;
}

/** C5 · suma de 5b a 5j (0 a 27). */
function disturbancePoints(sum) {
  if (sum === 0) return 0;
  if (sum <= 9) return 1;
  if (sum <= 18) return 2;
  return 3;
}

const questionById = Object.fromEntries(PSQI_QUESTIONS.map((question) => [question.id, question]));
const pointsOf = (id, answers) => scoreQuestion(questionById[id], answers[id]);
const numberOf = (id, answers) => {
  const raw = answers[id];
  return raw === '' || raw === null || raw === undefined || Number.isNaN(Number(raw))
    ? null
    : Number(raw);
};

/** Ítems que alimentan el componente 5 (5b a 5j). */
const DISTURBANCE_IDS = [
  'psqi_5b',
  'psqi_5c',
  'psqi_5d',
  'psqi_5e',
  'psqi_5f',
  'psqi_5g',
  'psqi_5h',
  'psqi_5i',
  'psqi_5j',
];

/* -------------------------------------------------------------------------- */
/* Scorer                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Calcula los 7 componentes y el puntaje global.
 * Devuelve la misma forma que `calculateScore`, pero el `breakdown` son los
 * componentes (no las preguntas), que es la unidad de lectura clínica.
 */
export function calculatePsqiScore(questions = PSQI_QUESTIONS, answers = {}) {
  const latencyMinutes = numberOf('psqi_2', answers);
  const sleepHours = numberOf('psqi_4', answers);
  const bedHours = hoursInBed(answers.psqi_1, answers.psqi_3);
  const efficiency =
    bedHours && bedHours > 0 && sleepHours !== null
      ? Math.min(100, (sleepHours / bedHours) * 100)
      : null;

  const latencySum = latencyPoints(latencyMinutes) + pointsOf('psqi_5a', answers);
  const disturbanceSum = DISTURBANCE_IDS.reduce((sum, id) => sum + pointsOf(id, answers), 0);
  const dysfunctionSum = pointsOf('psqi_8', answers) + pointsOf('psqi_9', answers);

  const has = (id) => isAnswered(questionById[id], answers[id]);

  const components = [
    {
      questionId: 'c1',
      number: 'C1',
      text: 'Calidad subjetiva del sueño',
      anchor: 'pregunta-psqi_6',
      points: pointsOf('psqi_6', answers),
      answered: has('psqi_6'),
      labels: ['Pregunta 6'],
    },
    {
      questionId: 'c2',
      number: 'C2',
      text: 'Latencia del sueño',
      anchor: 'pregunta-psqi_2',
      points: pairTable(latencySum),
      answered: has('psqi_2') && has('psqi_5a'),
      labels: [
        latencyMinutes === null ? 'Latencia sin dato' : `${latencyMinutes} min para dormirse`,
        `P2 + P5a = ${latencySum}`,
      ],
    },
    {
      questionId: 'c3',
      number: 'C3',
      text: 'Duración del sueño',
      anchor: 'pregunta-psqi_4',
      points: durationPoints(sleepHours),
      answered: has('psqi_4'),
      labels: [sleepHours === null ? 'Sin dato' : `${sleepHours} h de sueño real`],
    },
    {
      questionId: 'c4',
      number: 'C4',
      text: 'Eficiencia habitual del sueño',
      anchor: 'pregunta-psqi_1',
      points: efficiencyPoints(efficiency),
      answered: has('psqi_1') && has('psqi_3') && has('psqi_4'),
      labels:
        efficiency === null
          ? ['Sin dato']
          : [
              `${efficiency.toFixed(0)}% de eficiencia`,
              `${bedHours.toFixed(1)} h en cama · ${sleepHours} h dormidas`,
            ],
    },
    {
      questionId: 'c5',
      number: 'C5',
      text: 'Trastornos del sueño',
      anchor: 'pregunta-psqi_5b',
      points: disturbancePoints(disturbanceSum),
      answered: DISTURBANCE_IDS.every(has),
      labels: [`Suma 5b–5j = ${disturbanceSum} / 27`],
    },
    {
      questionId: 'c6',
      number: 'C6',
      text: 'Uso de medicación para dormir',
      anchor: 'pregunta-psqi_7',
      points: pointsOf('psqi_7', answers),
      answered: has('psqi_7'),
      labels: ['Pregunta 7'],
    },
    {
      questionId: 'c7',
      number: 'C7',
      text: 'Disfunción diurna',
      anchor: 'pregunta-psqi_8',
      points: pairTable(dysfunctionSum),
      answered: has('psqi_8') && has('psqi_9'),
      labels: [`P8 + P9 = ${dysfunctionSum}`],
    },
  ].map((component) => ({ ...component, maxPoints: 3, type: 'component' }));

  return {
    total: components.reduce((sum, component) => sum + component.points, 0),
    max: PSQI_MAX_SCORE,
    breakdown: components,
    metrics: { latencyMinutes, sleepHours, bedHours, efficiency },
    ...completionOf(questions, answers),
  };
}
