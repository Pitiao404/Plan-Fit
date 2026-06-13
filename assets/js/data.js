/* data.js — Mock data for Plan-Fit */

const PLANFIT = {

  user: {
    name: 'Elena Martínez',
    email: 'elena.martinez@planfit.app',
    age: 28,
    height: 172,
    weight: 64,
    gender: 'Femenino',
    plan: 'Premium Anual',
    planRenewal: '16 de enero, 2026',
    memberSince: 'Enero 2024',
    initials: 'EM',
    title: 'Atleta de Bienestar',
  },

  today: {
    label: 'Jueves, 12 de junio de 2025',
    steps: 8432,
    stepsGoal: 10000,
    stepsChangePct: 12,
    caloriesBurned: 1840,
    caloriesGoal: 2150,
    waterMl: 1850,
    waterGoalMl: 2500,
    sleepScore: 88,
    recoveryScore: 92,
    sleepHours: '7h 40m',
    sleepType: 'sueño profundo',
  },

  weeklySteps: [7200, 9100, 6800, 8200, 8432, 0, 0],

  goals: {
    current: 'Salud',
    horizon: 12,

    quarterly: [
      { name: 'Peso Corporal', target: '−3 kg', progress: 70, unit: '−2.1 kg logrados' },
      { name: 'Pasos Activos', target: '10k diarios', progress: 75, unit: '7,500 prom.' },
      { name: 'Consistencia', target: '12 días seguidos', progress: 65, unit: '8 días streak' },
    ],

    plans: {
      Salud: {
        kcal: 2150,
        macros: { p: 160, c: 220, g: 70 },
        activity: 'Cardio Moderado',
        activityIcon: 'directions_run',
        sessions: '3 sesiones / semana',
        impact: {
          4:  'Mejora del 15% en tu capacidad aeróbica y niveles de energía diaria.',
          12: 'Reducción del 8% en grasa corporal y +15% en resistencia cardiovascular.',
          24: 'Transformación integral de la composición corporal con hábitos consolidados.',
        },
        desc: 'Longevidad y bienestar general',
        icon: 'favorite',
      },
      Estética: {
        kcal: 1850,
        macros: { p: 175, c: 185, g: 58 },
        activity: 'HIIT & Cardio',
        activityIcon: 'local_fire_department',
        sessions: '4 sesiones / semana',
        impact: {
          4:  'Pérdida de 1.5–2 kg de grasa con aumento muscular visible.',
          12: 'Definición muscular notable con −15% de grasa corporal.',
          24: 'Transformación estética completa con masa magra preservada.',
        },
        desc: 'Composición corporal y tonificación',
        icon: 'self_improvement',
      },
      Rendimiento: {
        kcal: 2450,
        macros: { p: 185, c: 280, g: 75 },
        activity: 'Fuerza + HIIT',
        activityIcon: 'fitness_center',
        sessions: '5 sesiones / semana',
        impact: {
          4:  'Aumento de 10–15% en fuerza máxima en ejercicios compuestos.',
          12: '+20% en VO₂ máx y mejora significativa en marcas personales.',
          24: 'Nivel de rendimiento atlético avanzado con adaptaciones neuromusculares.',
        },
        desc: 'Fuerza, velocidad y resistencia',
        icon: 'bolt',
      },
    },
  },

  routine: {
    name: 'Power Builder A',
    focus: 'Fuerza',
    muscles: 'Pecho, Hombros y Tríceps',
    duration: '55 min estim.',
    intensityLabel: 'Alta (85%)',
    intensityPct: 85,
    recoveryMsg: 'Dormiste 7h 40m con sueño profundo óptimo. Tus niveles de energía están al máximo para una rutina de fuerza intensa hoy.',
  },

  exercises: [
    {
      id: 1,
      name: 'Press de Banca Plano',
      category: 'Fuerza',
      technique: 'Enfoque en tempo 3-1-1',
      icon: 'fitness_center',
      previousRecord: '80kg × 8',
      series: [
        { num: 1, reps: 10, weight: 75 },
        { num: 2, reps: 8,  weight: 80 },
      ],
    },
    {
      id: 2,
      name: 'Press Militar con Mancuernas',
      category: 'Hipertrofia',
      technique: 'Controlar la bajada',
      icon: 'sports_gymnastics',
      previousRecord: '22kg × 10',
      series: [
        { num: 1, reps: 12, weight: 20 },
        { num: 2, reps: 10, weight: 22 },
      ],
    },
    {
      id: 3,
      name: 'Fondos en Paralelas',
      category: 'Control',
      technique: 'Rango completo de movimiento',
      icon: 'accessibility_new',
      previousRecord: 'Peso corporal',
      series: [
        { num: 1, reps: 10, weight: 0,   bw: true },
        { num: 2, reps: 8,  weight: 5 },
      ],
    },
    {
      id: 4,
      name: 'Extensiones de Tríceps en Polea',
      category: 'Aislamiento',
      technique: 'Codos fijos al torso',
      icon: 'sports_mma',
      previousRecord: '15kg × 12',
      series: [
        { num: 1, reps: 12, weight: 15   },
        { num: 2, reps: 10, weight: 17.5 },
        { num: 3, reps: 10, weight: 17.5 },
      ],
    },
  ],

  hydration: {
    currentMl: 1850,
    goalMl: 2500,
    reminderOn: true,
    intervalMin: 60,
    nextReminder: '14:30',
    tip: 'Beber agua antes de las comidas puede ayudar a mejorar tu metabolismo hasta en un 24%.',
    records: [
      { icon: 'coffee',         label: 'Café (Contable)',  time: '08:15',  ml: 150 },
      { icon: 'water_full',     label: 'Vaso de agua',     time: '10:30',  ml: 250 },
      { icon: 'sports_score',   label: 'Post-Entreno',     time: '12:00',  ml: 500 },
      { icon: 'restaurant',     label: 'Almuerzo',         time: '05:45',  ml: 350 },
    ],
  },

  report: {
    period: 'OCTUBRE 2023',
    healthScore: 85,
    healthChange: '+12% vs mes anterior',
    weeklyActivityMin: [80, 145, 160, 95],
    activityGoalMin: 150,
    hydrationAvgL: 2.4,
    hydrationGoalPct: 82,
    hydrationStreak: 12,
    nutrition: { kcalAvg: 1950, prot: 85, carb: 210, fat: 55 },
    goalsCompliance: [
      { name: '10k Pasos diarios',    done: 24, total: 30 },
      { name: 'Sin azúcar refinada',  done: 26, total: 30 },
      { name: 'Meditación 10 min',    done: 12, total: 30 },
    ],
  },

  devices: [
    {
      name: 'Apple Watch Series 8',
      type: 'smartwatch',
      icon: 'watch',
      connected: true,
      syncLabel: 'Sincronizado hace 3 min',
    },
    {
      name: 'Smart Scale Pro',
      type: 'scale',
      icon: 'monitor_weight',
      connected: false,
      syncLabel: 'Desconectada · hace 5 días',
    },
  ],

  notifications: {
    hydrationReminders: true,
    dailySummary: true,
    sedentaryAlerts: false,
  },

  insightWeekly: {
    title: 'Cómo la meditación mejora tu recuperación metabólica',
    body: 'Tan solo 10 minutos de meditación después de tu entrenamiento puede duplicar tu recuperación muscular y reducir el cortisol en un 35%.',
  },
};
