/* profiles.js — Demo profiles for Plan-Fit presentation
 * Load order: data.js → profiles.js → app.js → page script
 * This file overwrites PLANFIT data based on the active demo profile.
 */

/* ─── Demo profile datasets ────────────────────────────────── */
const DEMO_PROFILES = {

  /* ── Principiante: Carlos Mendoza ─── */
  principiante: {
    /* User identity */
    name: 'Carlos Mendoza', firstName: 'Carlos', lastName: 'Mendoza',
    initials: 'CM', email: 'carlos.mendoza@planfit.app',
    age: 35, gender: 'Masculino', weight: 92, height: 178,
    activityLevel: 'sed', objective: 'Salud',
    plan: 'Básico', memberSince: 'Abril 2025',
    registered: true, onboardingDone: true, kcal: 2100,

    /* Daily stats */
    today: {
      label: 'Jueves, 12 de junio de 2025',
      steps: 3800, stepsGoal: 5000, stepsChangePct: -8,
      caloriesBurned: 850, caloriesGoal: 2100,
      waterMl: 950, waterGoalMl: 2000,
      sleepScore: 58, recoveryScore: 48,
      sleepHours: '5h 20m', sleepType: 'interrumpido',
    },
    weeklySteps: [2100, 4200, 3100, 3800, 0, 0, 0],

    /* Exercise */
    routine: {
      name: 'Primeros Pasos',
      focus: 'Cardio Suave',
      muscles: 'Cuerpo completo (bajo impacto)',
      duration: '25 min estim.',
      intensityLabel: 'Baja (40%)',
      intensityPct: 40,
      recoveryMsg: 'Tu cuerpo está listo para una sesión suave. Recuerda mantener buena postura y no apresurarte — la consistencia es más importante que la intensidad.',
    },
    exercises: [
      {
        id: 1, name: 'Caminata en Cinta', category: 'Cardio',
        technique: 'Velocidad 4–5 km/h, postura erguida',
        icon: 'directions_walk', previousRecord: '10 min / nivel 3',
        series: [
          { num: 1, reps: 10, weight: 0, bw: true },
          { num: 2, reps: 10, weight: 0, bw: true },
        ],
      },
      {
        id: 2, name: 'Sentadillas con Peso Corporal', category: 'Fuerza básica',
        technique: 'Rodillas detrás de los pies, espalda recta',
        icon: 'fitness_center', previousRecord: '8 reps',
        series: [
          { num: 1, reps: 10, weight: 0, bw: true },
          { num: 2, reps: 10, weight: 0, bw: true },
          { num: 3, reps: 8,  weight: 0, bw: true },
        ],
      },
      {
        id: 3, name: 'Flexiones en Pared', category: 'Fuerza básica',
        technique: 'Cuerpo en línea recta, codos a 45°',
        icon: 'accessibility_new', previousRecord: '8 reps',
        series: [
          { num: 1, reps: 10, weight: 0, bw: true },
          { num: 2, reps: 8,  weight: 0, bw: true },
        ],
      },
    ],

    /* Hydration */
    hydration: {
      currentMl: 950, goalMl: 2000,
      reminderOn: false, intervalMin: 90, nextReminder: '15:00',
      tip: 'Empieza con un vaso de agua al despertar. Es el hábito más sencillo y poderoso para comenzar bien el día.',
      records: [
        { icon: 'water_full', label: 'Al despertar', time: '07:30', ml: 200 },
        { icon: 'coffee',     label: 'Café mañana',  time: '09:00', ml: 150 },
        { icon: 'water_full', label: 'Agua',          time: '12:30', ml: 200 },
        { icon: 'restaurant', label: 'Con almuerzo',  time: '13:00', ml: 400 },
      ],
    },

    /* Goals */
    goals: {
      current: 'Salud', horizon: 12,
      quarterly: [
        { name: 'Pasos Diarios',   target: '5k diarios',  progress: 38, unit: '1,900 prom.' },
        { name: 'Pérdida de Peso', target: '−5 kg',        progress: 10, unit: '−0.5 kg logrados' },
        { name: 'Constancia',      target: '5 días/sem.',  progress: 20, unit: '1 día esta semana' },
      ],
    },

    /* Report */
    report: {
      period: 'MAYO 2025', healthScore: 42,
      healthChange: '+5% vs mes anterior',
      weeklyActivityMin: [15, 25, 20, 40],
      activityGoalMin: 150,
      hydrationAvgL: 1.2, hydrationGoalPct: 40, hydrationStreak: 3,
      nutrition: { kcalAvg: 2800, prot: 55, carb: 320, fat: 95 },
      goalsCompliance: [
        { name: 'Caminar 30 min diarios', done: 8,  total: 30 },
        { name: 'Beber 2L de agua',       done: 12, total: 30 },
        { name: 'Sin comida chatarra',    done: 14, total: 30 },
      ],
    },

    /* App state override */
    state: {
      waterMl: 950, activeGoal: 'Salud', goalHorizon: 12,
      notifHydration: false, notifSummary: false, notifSedentary: false,
      userProfile: 'principiante',
    },
  },

  /* ── Activo: Elena Martínez ─── */
  activo: {
    /* Uses PLANFIT.* data already defined in data.js — just override user identity */
    name: 'Elena Martínez', firstName: 'Elena', lastName: 'Martínez',
    initials: 'EM', email: 'elena.martinez@planfit.app',
    age: 28, gender: 'Femenino', weight: 64, height: 172,
    activityLevel: 'mod', objective: 'Salud',
    plan: 'Premium Anual', memberSince: 'Enero 2024',
    registered: true, onboardingDone: true, kcal: 2150,
    /* No stat overrides — uses PLANFIT.today, PLANFIT.exercises, etc. */
    state: null,
  },

};

/* ─── Active demo management ────────────────────────────────── */
const DEMO_KEY = 'pf_active_demo';

function getActiveDemoType() {
  try { return localStorage.getItem(DEMO_KEY) || 'activo'; } catch (_) { return 'activo'; }
}

function switchDemoProfile(type) {
  try { localStorage.setItem(DEMO_KEY, type); } catch (_) {}
  if (type === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

/* ─── Apply active profile to PLANFIT at load time (IIFE) ─────
 * Runs synchronously after data.js is loaded, before page init.
 */
(function applyActiveProfile() {
  const type = getActiveDemoType();
  if (type === 'activo' || type === 'admin') return;

  const p = DEMO_PROFILES[type];
  if (!p || typeof PLANFIT === 'undefined') return;

  if (p.today)    Object.assign(PLANFIT.today, p.today);
  if (p.weeklySteps) PLANFIT.weeklySteps = p.weeklySteps;
  if (p.exercises)   PLANFIT.exercises   = p.exercises;
  if (p.routine)     Object.assign(PLANFIT.routine, p.routine);
  if (p.hydration)   Object.assign(PLANFIT.hydration, p.hydration);
  if (p.goals) {
    if (p.goals.quarterly) PLANFIT.goals.quarterly = p.goals.quarterly;
    if (p.goals.current)   PLANFIT.goals.current   = p.goals.current;
    if (p.goals.horizon)   PLANFIT.goals.horizon   = p.goals.horizon;
  }
  if (p.report)  Object.assign(PLANFIT.report, p.report);
  if (p.state) {
    try {
      const existing = JSON.parse(localStorage.getItem('pf_state_v1') || '{}');
      localStorage.setItem('pf_state_v1', JSON.stringify({ ...existing, ...p.state }));
    } catch (_) {}
  }
})();
