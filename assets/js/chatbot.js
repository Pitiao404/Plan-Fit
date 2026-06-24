/* chatbot.js v2 — Plan·Fit Asistente IA (motor de intenciones completo) */

/* ─── Estado ─── */
let _chatOpen    = false;
let _chatHistory = [];
const _HIST_KEY  = 'pf_chat_history';

/* ─── Motor de intenciones v2 ─── */
const _INTENTS = [
  // Registro de datos (acción)
  { id: 'register_water',    test: m => /(\d+(?:[.,]\d+)?)\s*(ml|mililitros?|litros?|l\b)/i.test(m) && /registr|anot|tom|beb|agreg|tomo|bebi|bebido|quiero|agrega/i.test(m) },
  { id: 'register_weight',   test: m => /(\d+(?:[.,]\d+)?)\s*kg/i.test(m) && /peso|kilo|peso|mido|medi|actualiz|soy/i.test(m) },
  { id: 'register_exercise', test: m => /hic[ei]|complet|termin|acab|realic|entrene|hice|hizo/i.test(m) && /ejercicio|serie|entreno|rutina|press|sentadill|flexion|caminat/i.test(m) },

  // Cambios de configuración (acción)
  { id: 'change_goal',       test: m => /cambiar|cambio|quiero cambiar|prefiero|cambia/i.test(m) && /objetivo|meta|goal|salud|estetica|rendimiento|fuerza|estetica/i.test(m) },
  { id: 'change_water_goal', test: m => /(\d+(?:[.,]\d+)?)\s*(l\b|litros?)/i.test(m) && /meta|quiero beber|quiero tomar|objetivo.*agua|agua.*objetivo/i.test(m) },
  { id: 'change_notif',      test: m => /activ|desactiv|encend|apag|turn on|turn off/i.test(m) && /notif|recordatorio|alerta|aviso|reminder/i.test(m) },

  // Consultas de métricas
  { id: 'query_water',       test: m => /agua|hidrat|beber|tomar|cuanta.*agua|como.*hidrat/i.test(m) },
  { id: 'query_sleep',       test: m => /sue[ñn]o|dormi|descan|recuper|cansado.*dormir|como.*dormi/i.test(m) },
  { id: 'query_steps',       test: m => /\bpaso[s]?\b|caminar|caminata|actividad fisica/i.test(m) },
  { id: 'query_calories',    test: m => /caloria|kcal|quem|energia|cuantas.*quem|me quedan/i.test(m) },
  { id: 'query_nutrition',   test: m => /proteina|carbohid|macro|nutrici|comer|dieta|grasa|macro/i.test(m) },
  { id: 'query_routine',     test: m => /rutina|ejercicios de hoy|que.*entreno|workout|gym|cuales.*ejercicios/i.test(m) },
  { id: 'query_deficit',     test: m => /deficit|cuanto.*falt|cuantas.*quedan|me sobran|bajo.*caloria|perder grasa/i.test(m) },

  // Análisis y reportes
  { id: 'query_streak',      test: m => /racha|dias.*seguidos|consecutiv|cuantos dias|dias sin fallar/i.test(m) },
  { id: 'query_report',      test: m => /reporte|como me fue|historial|mes pasado|resumen.*mes|actividad.*mes/i.test(m) },
  { id: 'weekly_analysis',   test: m => /semana|esta semana|ultimos.*dias|tendencia|como.*semana|semana.*pasos/i.test(m) },
  { id: 'query_plan',        test: m => /que.*hago hoy|plan.*hoy|recomiendam|que.*entreno|como.*empiezo|consej/i.test(m) },

  // Dispositivos y configuración
  { id: 'query_devices',     test: m => /reloj|dispositivo|watch|bascula|smart|sensor|sincroniz|conectad/i.test(m) },
  { id: 'query_reminders',   test: m => /recordatorio|alerta|aviso|cada cuanto|proximo aviso|cuando.*alerta/i.test(m) },
  { id: 'query_insight',     test: m => /consejo|insight|aprende|sabias|tip|habito|curiosidad/i.test(m) },
  { id: 'query_profile',     test: m => /cuanto.*llevo|desde cuando|perfil|plan.*tengo|soy.*miembro/i.test(m) },

  // Metas y motivación
  { id: 'query_goals',       test: m => /\bmeta[s]?\b|objetivo|progres|avance|logro|cuanto.*falt.*meta/i.test(m) },
  { id: 'motivation',        test: m => /motiv|anim|no puedo|dificil|cansad|rend[ií]|sin ganas|desanimad/i.test(m) },
  { id: 'summary',           test: m => /resumen|como estoy|estado.*hoy|puntuaci|score|que tal.*dia/i.test(m) },
  { id: 'greeting',          test: m => /^(hola|hey|buenas|buenos|hi\b|ey|buenas tardes|buenas noches|buen d[ií]a)/i.test(m) },

  // ── Conocimiento general de salud y ejercicio ──
  { id: 'kb_hiit',          test: m => /\bhiit\b|intervalo|interval|alta intensidad|tabata/i.test(m) },
  { id: 'kb_cardio',        test: m => /cardio|aerobic|correr|trotar|corr[ei]|zona.*grasa|liss|steady state/i.test(m) },
  { id: 'kb_fuerza',        test: m => /fuerza|musculo|hipertrofia|masa muscular|ganar musculo|volumen|compound|compuesto/i.test(m) },
  { id: 'kb_reps',          test: m => /cuantas.*rep|rep.*musculo|rep.*fuerza|series.*rep|peso.*rep|rango.*rep/i.test(m) },
  { id: 'kb_descanso',      test: m => /dia.*descanso|descanso.*entreno|cuantos.*dias.*gym|frecuencia.*entreno|overtraining|sobreentren/i.test(m) },
  { id: 'kb_calentamiento', test: m => /calentar|calentamiento|warm.?up|antes.*entreno|estiramient/i.test(m) },
  { id: 'kb_doms',          test: m => /dolor.*musculo|agujeta|doms|dolor.*despues|dolorido|adolorido/i.test(m) },
  { id: 'kb_proteina',      test: m => /cuanta.*proteina|proteina.*dia|gramo.*proteina|suplemento.*proteina|whey|batido.*proteina/i.test(m) },
  { id: 'kb_creatina',      test: m => /creatina|monohidrat|suplemento/i.test(m) },
  { id: 'kb_ayuno',         test: m => /ayuno|intermitente|fasting|ventana.*comida|16.?8|18.?6/i.test(m) },
  { id: 'kb_pre_post',      test: m => /comer.*antes.*entreno|antes.*gym|despues.*entreno|post.*workout|pre.*workout|que.*comer.*gym/i.test(m) },
  { id: 'kb_perdida_grasa', test: m => /perder grasa|quemar grasa|bajar.*grasa|reducir.*grasa|definicion|cutting/i.test(m) },
  { id: 'kb_ganar_masa',    test: m => /ganar.*peso|ganar.*masa|subir.*peso|bulk|volumen.*muscular|comer.*mas/i.test(m) },
  { id: 'kb_imc',           test: m => /\bimc\b|indice.*masa|peso.*ideal|sobrepeso|obesidad/i.test(m) },
  { id: 'kb_frecuencia_c',  test: m => /frecuencia.*cardiaca|pulso|latidos|zona.*cardiaca|fc.*max|220.*edad/i.test(m) },
  { id: 'kb_sueño_gen',     test: m => /cuanto.*dormir|horas.*dormir|importancia.*sueno|calidad.*sueno|dormir.*bien/i.test(m) },
  { id: 'kb_estres',        test: m => /estres|cortisol|ansiedad|tension|relajar|mental|salud.*mental/i.test(m) },
  { id: 'kb_agua_gen',      test: m => /cuanta.*agua.*dia|agua.*cuerpo|importancia.*agua|deshidrat|beber.*suficiente/i.test(m) },
  { id: 'kb_flexibilidad',  test: m => /flexibilidad|estirar|yoga|movilidad|stretching/i.test(m) },
  { id: 'kb_abdomen',       test: m => /abdomen|abdominales|six.?pack|core|panza|cintura/i.test(m) },
  { id: 'kb_gluteos',       test: m => /gluteo|pompas|sentadill|hip.*thrust|pierna/i.test(m) },
  { id: 'kb_espalda',       test: m => /espalda|lumbar|dolor.*espalda|postura/i.test(m) },
  { id: 'kb_principiante',  test: m => /empezar.*gym|primer.*vez|principiante|nunca.*entren|como.*empezar|sin.*experiencia/i.test(m) },
  { id: 'kb_plateau',       test: m => /plateau|estancado|no avanzo|no progreso|no bajo|no subo/i.test(m) },
  { id: 'kb_alcohol',       test: m => /alcohol|cerveza|vino|copa|bebida.*alcoholic/i.test(m) },
  { id: 'kb_vitaminas',     test: m => /vitamina|mineral|hierro|calcio|magnesio|zinc|omega|d3/i.test(m) },
];

function _detectIntent(msg) {
  const norm = msg.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  for (const intent of _INTENTS) {
    if (intent.test(norm)) return intent.id;
  }
  return 'fallback';
}

/* ─── Render widget ─── */
function renderChatbot() {
  const page = (window.location.pathname.split('/').pop() || '').replace('.html', '');
  if (['login','registro','onboarding','bienvenida'].some(p => page.includes(p))) return;
  if (!getCurrentUser()?.registered) return;
  if (document.getElementById('pf-chatbot')) return;

  const wrap = document.createElement('div');
  wrap.id = 'pf-chatbot';
  wrap.innerHTML = `
    <button id="chat-toggle" class="chat-toggle-btn" onclick="toggleChat()" aria-label="Abrir asistente" title="Asistente Plan·Fit">
      <span id="chat-icon">💬</span>
    </button>

    <div id="chat-panel" class="chat-panel" role="dialog" style="display:none">
      <div class="chat-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="chat-avatar-icon">🤖</div>
          <div>
            <p class="chat-title">Asistente Plan·Fit</p>
            <p class="chat-subtitle"><span class="chat-dot"></span>Activo · v2</p>
          </div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button onclick="clearHistory()" title="Limpiar chat"
            style="background:rgba(255,255,255,.12);border:none;color:rgba(255,255,255,.7);width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center" aria-label="Limpiar historial">🗑</button>
          <button onclick="toggleChat()" class="chat-close-btn" aria-label="Cerrar">✕</button>
        </div>
      </div>

      <div class="chat-messages" id="chat-messages"></div>

      <div id="chat-suggestions" class="chat-suggestions"></div>

      <div class="chat-input-wrap">
        <input id="chat-input" class="chat-input" type="text"
          placeholder="Pregunta o registra datos..."
          autocomplete="off" maxlength="300"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){sendMessage();event.preventDefault()}"/>
        <button class="chat-send-btn" onclick="sendMessage()" aria-label="Enviar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);
  _buildSuggestions();
}

/* ─── Toggle ─── */
function toggleChat() {
  _chatOpen = !_chatOpen;
  const panel = document.getElementById('chat-panel');
  const icon  = document.getElementById('chat-icon');
  if (!panel) return;

  if (_chatOpen) {
    panel.style.display = 'flex'; panel.style.flexDirection = 'column';
    panel.style.opacity = '0'; panel.style.transform = 'translateY(10px) scale(.97)';
    requestAnimationFrame(() => {
      panel.style.transition = 'opacity .2s,transform .2s';
      panel.style.opacity = '1'; panel.style.transform = 'none';
    });
    icon.textContent = '✕';
    _initHistory();
    setTimeout(() => document.getElementById('chat-input')?.focus(), 220);
  } else {
    panel.style.opacity = '0'; panel.style.transform = 'translateY(8px) scale(.97)';
    setTimeout(() => { panel.style.display = 'none'; panel.style.transition = ''; }, 200);
    icon.textContent = '💬';
  }
}

/* ─── Sugerencias dinámicas ─── */
function _buildSuggestions() {
  const box = document.getElementById('chat-suggestions');
  if (!box) return;

  const st  = getState();
  const td  = PLANFIT?.today || {};
  const now = new Date();
  const h   = now.getHours();
  const suggs = [];

  const wPct = (st.waterMl || 0) / (td.waterGoalMl || 2500) * 100;
  if (wPct < 50) suggs.push('💧 Mi hidratación hoy');

  const sPct = (td.steps || 0) / (td.stepsGoal || 10000) * 100;
  if (sPct < 70) suggs.push('🚶 ¿Cuántos pasos llevo?');

  if ((td.sleepScore || 100) < 65) suggs.push('😴 Mi sueño fue bajo');

  if (h >= 6 && h <= 10) suggs.push('💪 ¿Qué entreno hoy?');
  else if (h >= 11 && h <= 15) suggs.push('🍽️ Mi plan nutricional');
  else if (h >= 18 && h <= 22) suggs.push('📊 Resumen de mi día');

  const fallbacks = ['📊 Resumen del día','🔥 Dame motivación','🎯 Mi progreso mensual','📈 Mi semana en pasos'];
  while (suggs.length < 4) suggs.push(fallbacks.shift() || '');

  box.innerHTML = suggs.slice(0, 4)
    .map(s => `<button class="chat-sugg" onclick="askQuick('${s.replace(/'/g,"\\'")}')">  ${s}</button>`)
    .join('');
}

/* ─── Historial persistente ─── */
function _initHistory() {
  const box = document.getElementById('chat-messages');
  if (!box || box.children.length > 0) return; // ya tiene mensajes

  try {
    const saved  = JSON.parse(localStorage.getItem(_HIST_KEY) || '[]');
    const cutoff = Date.now() - 2 * 60 * 60 * 1000; // 2 horas
    _chatHistory = saved.filter(m => m.ts > cutoff);
  } catch(_) { _chatHistory = []; }

  if (_chatHistory.length > 0) {
    _chatHistory.forEach(m => {
      if (m.role === 'bot') _addBotMsg(m.text, false);
      else _addUserMsg(m.text, m.ts);
    });
    // Separador "Conversación anterior"
    const sep = document.createElement('div');
    sep.style.cssText = 'text-align:center;font-size:10px;color:#9CA3AF;padding:4px 0;';
    sep.textContent = '— conversación reciente —';
    box.insertBefore(sep, box.firstChild);
  } else {
    _showWelcome();
    document.getElementById('chat-suggestions').style.display = 'flex';
  }
}

function _persistHistory() {
  try { localStorage.setItem(_HIST_KEY, JSON.stringify(_chatHistory.slice(-30))); } catch(_) {}
}

function clearHistory() {
  _chatHistory = [];
  localStorage.removeItem(_HIST_KEY);
  const box = document.getElementById('chat-messages');
  if (box) box.innerHTML = '';
  _showWelcome();
  document.getElementById('chat-suggestions').style.display = 'flex';
  _buildSuggestions();
}

function _showWelcome() {
  const u  = getDisplayUser() || {};
  const fn = u.firstName || u.name || 'visitante';
  _addBotMsg(`¡Hola ${fn}! 👋 Soy tu asistente v2 de salud. Ahora puedo:\n• Consultar cualquier métrica tuya\n• Registrar agua, peso y ejercicios\n• Analizar tu semana y reportes\n• Cambiar metas y notificaciones\n• Darte un plan inteligente para hoy\n\n¿Qué necesitas?`, false);
}

/* ─── Send ─── */
function sendMessage() {
  const input = document.getElementById('chat-input');
  const text  = (input?.value || '').trim();
  if (!text) return;
  input.value = '';

  document.getElementById('chat-suggestions').style.display = 'none';
  const ts = Date.now();
  _addUserMsg(text, ts);
  _chatHistory.push({ role: 'user', text, ts });

  const tid = _addTyping();
  const delay = 200 + Math.random() * 300;
  setTimeout(() => {
    _removeTyping(tid);
    const { reply, action } = _processMessage(text);
    _addBotMsg(reply);
    if (action) _execAction(action);
    const replyTs = Date.now();
    _chatHistory.push({ role: 'bot', text: reply, ts: replyTs });
    _persistHistory();
  }, delay);
}

function askQuick(q) {
  const input = document.getElementById('chat-input');
  if (input) input.value = q;
  sendMessage();
}

/* ─── UI helpers ─── */
function _addUserMsg(text, ts) {
  const el = document.createElement('div');
  el.className = 'chat-msg chat-msg-user';
  el.innerHTML = `<span>${_esc(text)}</span>${ts ? `<span class="chat-ts">${_fmtTs(ts)}</span>` : ''}`;
  _append(el);
}

function _addBotMsg(text, anim = true) {
  const el = document.createElement('div');
  el.className = 'chat-msg chat-msg-bot';
  const ts = Date.now();
  el.innerHTML = `<div>${text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>')}</div><span class="chat-ts">${_fmtTs(ts)}</span>`;
  _append(el, anim);
}

function _esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _fmtTs(ts) { const d = new Date(ts); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; }

function _append(el, anim = true) {
  const box = document.getElementById('chat-messages');
  if (!box) return;
  if (anim) {
    el.style.opacity = '0'; el.style.transform = 'translateY(6px)';
    box.appendChild(el);
    requestAnimationFrame(() => { el.style.transition = 'opacity .18s,transform .18s'; el.style.opacity = '1'; el.style.transform = 'none'; });
  } else {
    box.appendChild(el);
  }
  box.scrollTop = box.scrollHeight;
}

let _tc = 0;
function _addTyping() {
  const id = 'typ-' + (++_tc);
  const el = document.createElement('div');
  el.className = 'chat-msg chat-msg-bot chat-typing'; el.id = id;
  el.innerHTML = '<span></span><span></span><span></span>';
  const box = document.getElementById('chat-messages');
  if (box) { box.appendChild(el); box.scrollTop = box.scrollHeight; }
  return id;
}
function _removeTyping(id) { document.getElementById(id)?.remove(); }

/* ─── Motor de respuestas v2 ─── */
function _processMessage(raw) {
  const intent = _detectIntent(raw);
  const msg = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const u   = getDisplayUser() || {};
  const st  = getState();
  const td  = PLANFIT?.today || {};
  const hyd = PLANFIT?.hydration || {};
  const fn  = u.firstName || u.name || 'amigo';
  const goal = PLANFIT?.goals?.current || 'Salud';
  const plan = PLANFIT?.goals?.plans?.[goal] || {};
  const rpt  = PLANFIT?.report || {};

  switch (intent) {

    /* ── Registro de agua ── */
    case 'register_water': {
      const m = raw.match(/(\d+(?:[.,]\d+)?)\s*(ml|mililitros?|litros?|l\b)/i);
      if (!m) break;
      let ml = parseFloat(m[1].replace(',','.'));
      if (/litros?/i.test(m[2]) || m[2].toLowerCase() === 'l') ml *= 1000;
      ml = Math.round(ml);
      const total = (st.waterMl || 0) + ml;
      const pct   = Math.round(total / (td.waterGoalMl || 2500) * 100);
      return { reply: `✅ **+${ml}ml** registrados, ${fn}!\n\n💧 Total hoy: **${total.toLocaleString('es-ES')}ml** (${pct}% de ${(td.waterGoalMl||2500).toLocaleString('es-ES')}ml)\n\n${pct >= 100 ? '🎉 ¡Meta de hidratación completada!' : pct >= 70 ? '¡Vas excelente, casi en la meta!' : 'Sigue hidratándote regularmente.'}`, action: { type:'update_water', ml } };
    }

    /* ── Registro de peso ── */
    case 'register_weight': {
      const m = raw.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
      if (!m) break;
      const kg = parseFloat(m[1].replace(',','.'));
      return { reply: `⚖️ Peso actualizado a **${kg}kg**, ${fn}. El progreso real se mide en semanas — ¡sigue constante!`, action: { type:'update_weight', kg } };
    }

    /* ── Registrar ejercicio ── */
    case 'register_exercise': {
      const exercises = PLANFIT?.exercises || [];
      const numM = raw.match(/(\d+)/);
      const count = numM ? parseInt(numM[1]) : 1;
      // Buscar ejercicio por nombre en el mensaje
      let found = null;
      for (const ex of exercises) {
        const words = ex.name.toLowerCase().split(/\s+/);
        if (words.some(w => w.length > 4 && msg.includes(w))) { found = ex; break; }
      }
      if (!found) {
        // Por número de ejercicio "el segundo", "ejercicio 2"
        const numWords = { primer:0,segundo:1,tercer:2,cuarto:3,quinto:4,'1':0,'2':1,'3':2,'4':3 };
        for (const [k,i] of Object.entries(numWords)) {
          if (msg.includes(k) && exercises[i]) { found = exercises[i]; break; }
        }
      }
      if (found) {
        const cs = { ...st.completedSeries };
        const toMark = Math.min(count, found.series.length);
        for (let i = 0; i < toMark; i++) cs[`${found.id}-${i}`] = true;
        setState({ completedSeries: cs });
        return { reply: `✅ Marqué **${toMark} serie(s) de "${found.name}"** como completadas. ¡Excelente trabajo, ${fn}! 💪`, action: null };
      }
      return { reply: `💪 ¡Bien por entrenar, ${fn}! Dime el nombre del ejercicio para marcarlo: ej. "hice 2 series de press de banca".`, action: null };
    }

    /* ── Cambiar objetivo ── */
    case 'change_goal': {
      let newGoal = null;
      if (/estetica|tonif|defin|grasa|bajar/i.test(msg)) newGoal = 'Estética';
      else if (/rendimiento|fuerza|atletico|deport|musculo|potencia/i.test(msg)) newGoal = 'Rendimiento';
      else if (/salud|bienestar|energia|vida|longev/i.test(msg)) newGoal = 'Salud';
      if (!newGoal) return { reply: `¿A cuál objetivo quieres cambiar, ${fn}? Opciones:\n• ❤️ **Salud** — Energía y bienestar\n• ✨ **Estética** — Definición muscular\n• ⚡ **Rendimiento** — Fuerza máxima`, action: null };
      const np = PLANFIT?.goals?.plans?.[newGoal] || {};
      return { reply: `✅ Objetivo actualizado a **${newGoal}**!\n\n• Calorías: **${np.kcal||'—'} kcal/día**\n• Sesiones: ${np.sessions||'—'}\n• Enfoque: ${np.desc||''}\n\n**Impacto esperado (4 semanas):** ${np.impact?.[4]||'Resultados visibles con constancia.'}`, action: { type:'update_goal', goal: newGoal } };
    }

    /* ── Cambiar meta de agua ── */
    case 'change_water_goal': {
      const m = raw.match(/(\d+(?:[.,]\d+)?)\s*(l\b|litros?)/i);
      if (!m) break;
      const newGoal = Math.round(parseFloat(m[1].replace(',','.')) * 1000);
      if (newGoal < 500 || newGoal > 6000) return { reply: `La meta de agua debe estar entre 0.5L y 6L diarios.`, action: null };
      PLANFIT.today.waterGoalMl = newGoal;
      if (PLANFIT.hydration) PLANFIT.hydration.goalMl = newGoal;
      return { reply: `✅ Meta de agua actualizada a **${(newGoal/1000).toFixed(1)}L diarios**, ${fn}. ¡Una hidratación adecuada es clave para tu objetivo!`, action: null };
    }

    /* ── Cambiar notificaciones ── */
    case 'change_notif': {
      const enable = /activ|encend|quiero|s[íi]|pon/i.test(msg);
      const disable = /desactiv|apag|no quiero|quit|elimina/i.test(msg);
      const action  = enable ? true : disable ? false : null;
      if (action === null) return { reply: `¿Quieres **activar** o **desactivar** los recordatorios de hidratación, ${fn}?`, action: null };
      setState({ notifHydration: action });
      if (PLANFIT.notifications) PLANFIT.notifications.hydrationReminders = action;
      return { reply: `✅ Recordatorios de hidratación **${action ? 'activados' : 'desactivados'}**.${action ? ` Próximo aviso a las ${hyd.nextReminder || '—'}.` : ''}`, action: null };
    }

    /* ── Consultar agua ── */
    case 'query_water': {
      const ml   = st.waterMl || 0;
      const meta = td.waterGoalMl || 2500;
      const pct  = Math.round(ml / meta * 100);
      const rest = Math.max(0, meta - ml);
      const recs = (hyd.records || []).slice(-3);
      let recsTxt = '';
      if (recs.length > 0) recsTxt = '\n\n**Últimas ingestas:**\n' + recs.map(r => `• ${r.time} — ${r.label} (${r.ml}ml)`).join('\n');
      const eval_ = pct >= 100 ? '🎉 ¡Meta alcanzada!' : pct >= 70 ? '¡Muy bien, casi en la meta!' : pct >= 40 ? '⚠️ Puedes mejorar.' : '🚨 Hidratación baja.';
      return { reply: `💧 **Hidratación de hoy, ${fn}:**\n• Consumido: **${ml.toLocaleString('es-ES')}ml** de ${meta.toLocaleString('es-ES')}ml\n• Progreso: **${pct}%** · Faltan: ${rest.toLocaleString('es-ES')}ml\n\n${eval_}${recsTxt}\n\n💡 Tip: ${hyd.tip || 'Hidratarse bien mejora el metabolismo.'}`, action: null };
    }

    /* ── Consultar sueño ── */
    case 'query_sleep': {
      const sc = td.sleepScore || 0;
      const rec = td.recoveryScore || 0;
      const ev = sc >= 80 ? '😴✨ Excelente descanso. Aprovecha la energía hoy.' : sc >= 60 ? '😴 Buen sueño. Puedes mejorar acostándote 30 min antes.' : '😫 Sueño insuficiente. Prioriza el descanso — los músculos se recuperan dormido.';
      return { reply: `**Sueño de anoche:**\n• Duración: **${td.sleepHours || '—'}**\n• Tipo: ${td.sleepType || '—'}\n• Puntaje: **${sc}/100**\n• Recuperación: **${rec}%**\n\n${ev}\n\n💡 Con ${sc >= 75 ? 'este excelente' : 'un mejor'} descanso, ${PLANFIT?.routine?.recoveryMsg || 'puedes entrenar hoy.'}`, action: null };
    }

    /* ── Consultar pasos ── */
    case 'query_steps': {
      const s  = td.steps || 0;
      const sg = td.stepsGoal || 10000;
      const pct = Math.round(s / sg * 100);
      const chg = td.stepsChangePct || 0;
      return { reply: `🚶 **Pasos de hoy, ${fn}:**\n• Completados: **${s.toLocaleString('es-ES')}** de ${sg.toLocaleString('es-ES')}\n• Progreso: **${pct}%**\n• vs ayer: ${chg >= 0 ? '+' : ''}${chg}%\n\n${pct >= 100 ? '🎉 ¡Meta de pasos completada!' : pct >= 70 ? '¡Casi! Unos pasos más y llegas.' : `Faltan ${(sg - s).toLocaleString('es-ES')} pasos para la meta.`}`, action: null };
    }

    /* ── Consultar calorías ── */
    case 'query_calories': {
      const quemadas = td.caloriesBurned || 0;
      const metaCal  = td.caloriesGoal   || plan.kcal || 2150;
      const pct      = Math.round(quemadas / metaCal * 100);
      return { reply: `🔥 **Energía de hoy:**\n• Quemadas: **${quemadas.toLocaleString('es-ES')} kcal**\n• Meta: ${metaCal.toLocaleString('es-ES')} kcal\n• Progreso: **${pct}%**\n\n${pct >= 100 ? '¡Superaste tu meta calórica!' : `Faltan **${(metaCal - quemadas).toLocaleString('es-ES')} kcal** para alcanzar tu meta.`}`, action: null };
    }

    /* ── Déficit calórico ── */
    case 'query_deficit': {
      const quemadas = td.caloriesBurned || 0;
      const meta     = td.caloriesGoal   || plan.kcal || 2150;
      const diff     = meta - quemadas;
      const emoji    = diff > 0 ? '📉' : '📈';
      return { reply: `${emoji} **Balance calórico de hoy:**\n• Meta: **${meta.toLocaleString('es-ES')} kcal**\n• Quemadas: **${quemadas.toLocaleString('es-ES')} kcal**\n\n${diff > 0 ? `Te **faltan ${diff.toLocaleString('es-ES')} kcal** para cubrir tu meta de ${goal}.` : `¡Superaste tu meta en **${Math.abs(diff).toLocaleString('es-ES')} kcal**!`}\n\n💡 Para ${goal === 'Estética' ? 'definición muscular, mantén un déficit de 300-400 kcal' : goal === 'Rendimiento' ? 'rendimiento, asegúrate de cubrir tu meta' : 'salud general, la constancia es más importante que el número exacto'}.`, action: null };
    }

    /* ── Consultar nutrición ── */
    case 'query_nutrition': {
      const m = plan.macros || { p: 160, c: 220, g: 70 };
      const rptNut = rpt.nutrition || {};
      let compareTxt = '';
      if (rptNut.prot) compareTxt = `\n\n📊 Mes pasado (promedio): ${rptNut.kcalAvg} kcal/día | Proteína: ${rptNut.prot}g`;
      return { reply: `🍽️ **Plan nutricional — ${goal}:**\n• Calorías: **${plan.kcal || 2150} kcal/día**\n• Proteína: **${m.p}g** | Carbohidratos: **${m.c}g** | Grasas: **${m.g}g**\n• Actividad: ${plan.activity || 'Cardio'} (${plan.sessions || '3 sesiones/sem'})${compareTxt}`, action: null };
    }

    /* ── Consultar rutina ── */
    case 'query_routine': {
      const r  = PLANFIT?.routine || {};
      const ex = (PLANFIT?.exercises || []).map((e, i) => `${i+1}. **${e.name}** — ${e.category} (${e.series.length} series)`).join('\n');
      const cs = st.completedSeries || {};
      const total = (PLANFIT?.exercises || []).reduce((acc, e) => acc + e.series.length, 0);
      const done  = Object.values(cs).filter(Boolean).length;
      return { reply: `💪 **Rutina de hoy — ${r.name || '—'}:**\n• Enfoque: ${r.focus || '—'} · ${r.muscles || ''}\n• Duración: ${r.duration || '—'} · Intensidad: ${r.intensityLabel || '—'}\n\n**Ejercicios (${done}/${total} series completadas):**\n${ex || '—'}\n\n${r.recoveryMsg || '¡A entrenar!'}`, action: null };
    }

    /* ── Racha de hidratación ── */
    case 'query_streak': {
      const streak = rpt.hydrationStreak || 0;
      const emoji  = streak >= 14 ? '🔥🔥' : streak >= 7 ? '🔥' : '💧';
      return { reply: `${emoji} **Racha de hidratación, ${fn}:**\n\n**${streak} días consecutivos** cumpliendo tu meta de agua.\n\n${streak >= 14 ? '¡Increíble constancia! Eres un ejemplo de disciplina.' : streak >= 7 ? '¡Una semana completa! Sigue así.' : streak >= 3 ? 'Buen inicio. ¿Puedes llegar a 7 días?' : '¡Empieza la racha hoy cumpliendo tu meta!'}`, action: null };
    }

    /* ── Reporte mensual ── */
    case 'query_report': {
      const compliance = (rpt.goalsCompliance || []).map(g => `• **${g.name}**: ${g.done}/${g.total} días`).join('\n');
      const actMin  = (rpt.weeklyActivityMin || []);
      const actAvg  = actMin.length ? Math.round(actMin.reduce((a,b)=>a+b,0)/actMin.length) : 0;
      return { reply: `📊 **Reporte — ${rpt.period || 'último mes'}:**\n• Score de salud: **${rpt.healthScore || 0}/100** (${rpt.healthChange || '—'})\n• Hidratación prom: **${rpt.hydrationAvgL || 0}L/día** (${rpt.hydrationGoalPct || 0}% de meta)\n• Actividad prom: **${actAvg} min/semana**\n• Racha hidratación: **${rpt.hydrationStreak || 0} días**\n\n**Cumplimiento de metas:**\n${compliance || '— Sin datos —'}`, action: null };
    }

    /* ── Análisis semanal ── */
    case 'weekly_analysis': {
      const steps = PLANFIT?.weeklySteps || [];
      const dias  = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'];
      const activos = steps.filter(s => s > 0);
      const promedio = activos.length ? Math.round(activos.reduce((a,b)=>a+b,0)/activos.length) : 0;
      const mejor = Math.max(...steps, 0);
      const idxMejor = steps.indexOf(mejor);
      const stepsStr = steps.map((s,i) => `• ${dias[i]}: ${s > 0 ? s.toLocaleString('es-ES') : '—'}`).join('\n');
      return { reply: `📈 **Pasos esta semana, ${fn}:**\n${stepsStr}\n\n📊 Promedio: **${promedio.toLocaleString('es-ES')}** pasos\n🏆 Mejor día: **${mejor > 0 ? `${dias[idxMejor]} (${mejor.toLocaleString('es-ES')})` : '—'}**\n\n${promedio >= (td.stepsGoal || 10000) ? '🎉 ¡Superaste tu meta diaria en promedio!' : `A **${((td.stepsGoal||10000) - promedio).toLocaleString('es-ES')} pasos** de tu meta diaria en promedio.`}`, action: null };
    }

    /* ── Plan inteligente del día ── */
    case 'query_plan': {
      const sc   = td.sleepScore || 0;
      const rec  = td.recoveryScore || 0;
      const h    = new Date().getHours();
      let planTxt = '';
      if (sc < 55) planTxt = `😴 Tu sueño fue de solo **${sc}/100**. Hoy prioriza **recuperación activa**: caminata suave 20-30 min, mucha agua, y duerme temprano.`;
      else if (sc < 70) planTxt = `😴 Sueño moderado (**${sc}/100**). Entrena a intensidad media. Evita esfuerzo máximo hoy.`;
      else if (goal === 'Rendimiento' && rec >= 85) planTxt = `⚡ Recovery al **${rec}%** y sueño óptimo — ¡condiciones perfectas para tu sesión de **${PLANFIT?.routine?.name}**! Lleva al máximo la intensidad.`;
      else planTxt = `✅ Te ves bien para entrenar hoy — sueño **${sc}/100** y recuperación **${rec}%**. Tu rutina: **${PLANFIT?.routine?.name}** (${PLANFIT?.routine?.duration}).`;

      if (h < 10) planTxt += `\n\n🌅 Siendo temprano: toma un desayuno rico en proteína y 500ml de agua antes de entrenar.`;
      else if (h >= 20) planTxt += `\n\n🌙 Ya es tarde — si no entrenaste, una caminata nocturna de 15 min suma a tu meta de pasos.`;

      return { reply: `🎯 **Tu plan para hoy, ${fn}:**\n\n${planTxt}\n\n**Meta de hoy:** ${(td.stepsGoal||10000).toLocaleString('es-ES')} pasos · ${(td.waterGoalMl||2500).toLocaleString('es-ES')}ml agua · ${(td.caloriesGoal||plan.kcal||2150).toLocaleString('es-ES')} kcal`, action: null };
    }

    /* ── Dispositivos ── */
    case 'query_devices': {
      const devices = PLANFIT?.devices || [];
      if (!devices.length) return { reply: `No tienes dispositivos registrados, ${fn}. Ve a Perfil → Dispositivos para vincular uno.`, action: null };
      const devTxt = devices.map(d => `• **${d.name}** — ${d.connected ? '🟢 Conectado' : '🔴 Desconectado'} · ${d.syncLabel}`).join('\n');
      return { reply: `⌚ **Tus dispositivos:**\n${devTxt}\n\n${devices.some(d => !d.connected) ? '⚠️ Tienes dispositivos desconectados. Ve a Perfil para reconectarlos.' : '✅ Todos tus dispositivos están sincronizados.'}`, action: null };
    }

    /* ── Recordatorios ── */
    case 'query_reminders': {
      const on   = st.notifHydration !== false;
      const intv = hyd.intervalMin || 60;
      const next = hyd.nextReminder || '—';
      return { reply: `🔔 **Recordatorios de hidratación:**\n• Estado: **${on ? '🟢 Activos' : '🔴 Desactivados'}**\n• Frecuencia: cada **${intv} min**\n• Próximo: **${next}**\n\n¿Quieres cambiar algo? Dime: "cambia recordatorio a cada 45 minutos" o "desactiva recordatorios".`, action: null };
    }

    /* ── Insight semanal ── */
    case 'query_insight': {
      const ins = PLANFIT?.insightWeekly || {};
      if (ins.title) return { reply: `💡 **Insight de la semana:**\n\n**${ins.title}**\n\n${ins.body}`, action: null };
      return { reply: `💡 **Consejo personalizado para ${fn}:**\n\n${goal === 'Estética' ? 'Un déficit calórico de 300-400 kcal con alta proteína (1.9g/kg) maximiza la pérdida de grasa sin sacrificar músculo.' : goal === 'Rendimiento' ? 'La periodización (alternar semanas de volumen e intensidad) genera el doble de ganancias de fuerza que un entrenamiento constante.' : 'La consistencia supera a la intensidad. 30 minutos diarios durante 6 meses transforman más que 2 horas esporádicas.'}`, action: null };
    }

    /* ── Perfil de usuario ── */
    case 'query_profile': {
      const pu = PLANFIT?.user || {};
      const mu = getCurrentUser() || {};
      return { reply: `👤 **Tu perfil, ${fn}:**\n• Miembro desde: **${mu.memberSince || pu.memberSince || '—'}**\n• Plan: **${mu.plan || pu.plan || 'Básico'}**\n• Objetivo actual: **${goal}**\n• Altura: ${mu.height || pu.height || '—'}cm · Peso: ${mu.weight || pu.weight || '—'}kg\n• Tipo corporal: ${mu.bodyType || '—'}`, action: null };
    }

    /* ── Metas / progreso ── */
    case 'query_goals': {
      const qts = PLANFIT?.goals?.quarterly || [];
      const qStr = qts.map(q => `• **${q.name}**: ${q.unit} (${q.progress}% → ${q.target})`).join('\n');
      return { reply: `🎯 **Objetivo: ${goal}**\n${plan.desc || ''}\n\n**Progreso trimestral:**\n${qStr || '— Sin metas configuradas —'}\n\n**Impacto proyectado:**\n• 4 semanas: ${plan.impact?.[4] || '—'}\n• 12 semanas: ${plan.impact?.[12] || '—'}`, action: null };
    }

    /* ── Resumen del día ── */
    case 'summary': {
      const wPct = Math.round(((st.waterMl||0)/(td.waterGoalMl||2500))*100);
      const ePct = Math.round(((td.caloriesBurned||0)/(td.caloriesGoal||plan.kcal||2150))*100);
      const sPct = Math.round(((td.steps||0)/(td.stepsGoal||10000))*100);
      const slPct = td.sleepScore || 0;
      const score = Math.round((wPct + ePct + sPct + slPct) / 4);
      const eval_ = score >= 80 ? '🌟 ¡Jornada excepcional!' : score >= 60 ? '👍 Buen día.' : '💪 Hay margen de mejora.';
      return { reply: `📊 **Resumen de hoy, ${fn}:**\n\n💧 Hidratación: **${wPct}%** ${wPct>=80?'✅':'⚠️'}\n🔥 Calorías activas: **${ePct}%** ${ePct>=80?'✅':'🔄'}\n🚶 Pasos: **${sPct}%** ${sPct>=80?'✅':'🔄'}\n😴 Sueño: **${slPct}/100** ${slPct>=75?'✅':'⚠️'}\n\n**Score del día: ${score}/100** ${eval_}\n\n🎯 Objetivo: **${goal}** — ${plan.desc || ''}`, action: null };
    }

    /* ── Motivación ── */
    case 'motivation': {
      const imp4 = plan.impact?.[4] || '';
      const phrases = [
        `🔥 ${fn}, en solo **4 semanas** de constancia: "${imp4 || 'resultados visibles'}". Hoy es el día ${fn}.`,
        `💪 Recuerda por qué empezaste, ${fn}. El progreso no se ve cada día, pero sí cada mes. ¡Sigue!`,
        `🌟 El único mal entrenamiento es el que no se hace. ¡Cualquier esfuerzo hoy te acerca a tu meta!`,
        `⚡ Tu cuerpo puede más de lo que crees. **Con ${(td.steps||0).toLocaleString('es-ES')} pasos hoy**, ya estás avanzando.`,
      ];
      return { reply: phrases[Math.floor(Math.random() * phrases.length)], action: null };
    }

    /* ── Saludo ── */
    case 'greeting': {
      const h = new Date().getHours();
      const greeting = h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
      return { reply: `${greeting}, ${fn}! 😊 Estoy listo para ayudarte.\n\nPuedes preguntarme sobre:\n• 💧 Agua · 🔥 Calorías · 🚶 Pasos · 😴 Sueño\n• 💪 Rutina · 🍽️ Nutrición · 📊 Reportes\n• Registrar agua, peso y ejercicios\n• Cambiar objetivos y notificaciones\n• Análisis de tu semana`, action: null };
    }

    /* ══════════════════════════════════════════
       KNOWLEDGE BASE — Salud, ejercicio y nutrición
    ══════════════════════════════════════════ */

    case 'kb_hiit': {
      return { reply: `⚡ **HIIT (High-Intensity Interval Training):**\n\nAlterna períodos de **esfuerzo máximo** (20-40s) con **descanso** (10-20s). Ejemplo clásico — Tabata: 8 rondas de 20s trabajo / 10s descanso.\n\n**Beneficios:**\n• Quema hasta un **30% más calorías** que el cardio tradicional en menos tiempo\n• El efecto EPOC ("afterburn") continúa quemando grasa hasta **24h** después\n• Mejora la resistencia cardiovascular y la sensibilidad a la insulina\n\n**¿Cuánto?** 2-3 sesiones/semana, máx 30 min. Más no es mejor.\n\n${goal === 'Estética' ? '✅ Para tu objetivo de **Estética**, el HIIT es ideal — maximiza la pérdida de grasa preservando músculo.' : goal === 'Rendimiento' ? '✅ Para **Rendimiento**, el HIIT mejora el VO₂ máx rápidamente.' : '✅ Para **Salud**, 2x HIIT/semana combinado con caminatas es óptimo.'}`, action: null };
    }

    case 'kb_cardio': {
      return { reply: `🏃 **Cardio: tipos y cuándo usar cada uno:**\n\n**LISS (baja intensidad):** caminar, bici suave, nadar despacio\n• Zona de frecuencia cardíaca: 50-65% FC máx\n• Ideal para: recuperación activa, quema de grasa sin fatiga muscular\n• Duración: 30-60 min, puede hacerse a diario\n\n**Cardio moderado:** trotar, elíptica a ritmo medio\n• Zona: 65-75% FC máx\n• 3-4x semana, 20-40 min\n\n**HIIT (alta intensidad):**\n• 2-3x semana máximo, 15-25 min\n• Mayor eficiencia calórica post-ejercicio\n\n💡 Para **${goal}**, te recomiendo: ${goal === 'Estética' ? '2 HIIT + 1-2 LISS por semana' : goal === 'Rendimiento' ? '2 HIIT + cardio de zona 2 (65-70% FC)' : '3-4 sesiones de cardio moderado o caminatas rápidas'}`, action: null };
    }

    case 'kb_fuerza': {
      const u2 = getCurrentUser() || {};
      return { reply: `💪 **Entrenamiento de fuerza e hipertrofia:**\n\n**Para fuerza máxima:**\n• 3-6 series · 1-5 repeticiones · Peso >85% 1RM · Descanso 3-5 min\n\n**Para hipertrofia (masa muscular):**\n• 3-5 series · 6-12 repeticiones · Peso 67-85% 1RM · Descanso 60-90s\n\n**Para resistencia muscular:**\n• 2-4 series · 13-20 repeticiones · Descanso 30-60s\n\n**Principios clave:**\n• **Sobrecarga progresiva**: aumenta peso o reps cada semana\n• **Técnica > peso**: mejor 60kg con forma perfecta que 100kg con mala técnica\n• **Frecuencia**: cada músculo 2x semana para máximo crecimiento\n\n${u2.weight ? `💡 Con tu peso de ${u2.weight}kg, apunta a proteína de ${Math.round(u2.weight * 1.8)}-${Math.round(u2.weight * 2.2)}g/día para hipertrofia.` : ''}`, action: null };
    }

    case 'kb_reps': {
      return { reply: `🔢 **¿Cuántas repeticiones debo hacer?**\n\n| Objetivo | Reps | Series | Descanso |\n|---|---|---|---|\n| Fuerza máxima | 1-5 | 4-6 | 3-5 min |\n| Hipertrofia | 6-12 | 3-5 | 60-90s |\n| Resistencia | 13-20 | 2-3 | 30-45s |\n| Tonificación | 12-15 | 3-4 | 45-60s |\n\n💡 **Regla de oro**: el peso debe ser tal que las últimas 2-3 reps sean difíciles pero con buena técnica. Si terminas fácil, sube el peso. Si pierdes la forma antes de acabar, bájalo.\n\nPara tu objetivo de **${goal}**: ${goal === 'Rendimiento' ? 'prioriza 3-6 reps con peso alto para fuerza máxima.' : goal === 'Estética' ? 'trabaja en rango 8-15 reps para máxima hipertrofia y definición.' : '10-15 reps a intensidad moderada, consistencia sobre intensidad.'}`, action: null };
    }

    case 'kb_descanso': {
      return { reply: `🗓️ **¿Cuántos días de descanso necesito?**\n\n**Regla general:** cada grupo muscular necesita **48-72h** de recuperación antes de volver a trabajarlo.\n\n**Por nivel:**\n• 🌱 Principiante: 3 días/semana con descanso entre sesiones\n• 🚶 Intermedio: 4 días/semana (ej: lun/mar/jue/vie)\n• 🏋️ Avanzado: 5-6 días/semana con splits musculares\n\n**Señales de que necesitas descansar más:**\n• Rendimiento cae sesión a sesión\n• Dolor articular (≠ dolor muscular normal)\n• Mal sueño, irritabilidad, hambre excesiva\n• Ausencia de "pump" en el gimnasio\n\n⚠️ El **descanso no es opcional** — el músculo crece durante el reposo, no durante el ejercicio.\n\nTu nivel actual (${selectedLevel || 'activo'}) sugiere: **${selectedLevel === 'nuevo' ? '3 días de entrenamiento + 4 descanso' : selectedLevel === 'avanzado' ? '5 días + 2 descanso activo' : '4 días entreno + 3 descanso'}**`, action: null };
    }

    case 'kb_calentamiento': {
      return { reply: `🔥 **Calentamiento correcto (10-15 min):**\n\n**Fase 1 — Activación cardiovascular (3-5 min):**\nTrote suave, saltar la cuerda, bici a baja intensidad\n\n**Fase 2 — Movilidad dinámica (5 min):**\n• Círculos de cadera, hombros y tobillos\n• Sentadillas sin peso\n• Estocadas de movilidad\n• Rotaciones de tronco\n\n**Fase 3 — Series de activación (3-5 min):**\nUna serie ligera (50% del peso de trabajo) del primer ejercicio\n\n❌ **Evita:** estiramiento estático antes de entrenar — reduce la fuerza hasta un 8%\n✅ **El estiramiento estático va DESPUÉS** del entrenamiento\n\n💡 Un buen calentamiento reduce el riesgo de lesión en un **40%** y mejora el rendimiento un **10-15%**.`, action: null };
    }

    case 'kb_doms': {
      return { reply: `😅 **Dolor muscular post-ejercicio (DOMS):**\n\nEl DOMS (Delayed Onset Muscle Soreness) aparece **24-72h** después y es causado por micro-roturas musculares — ¡son normales y necesarias para crecer!\n\n**¿Es normal mi dolor?**\n• ✅ Dolor difuso, muscular, que mejora al calentarte → NORMAL\n• ⚠️ Dolor agudo, articular, que empeora al moverte → Posible lesión\n\n**Para reducir el DOMS:**\n• 💧 Hidratación: reduce inflamación\n• Proteína post-entreno: acelera la reparación muscular\n• Sueño: la mayor parte de la recuperación ocurre durmiendo\n• LISS (caminata suave): aumenta el flujo sanguíneo sin fatigar\n• Baño de contraste (frío/calor): reduce inflamación\n\n⏱️ El DOMS disminuye con el tiempo — tu cuerpo se adapta. Si siempre te duele igual, algo está mal con la recuperación.\n\nHoy tu sueño fue **${td.sleepScore || '—'}/100** — ${(td.sleepScore || 0) >= 75 ? 'buena recuperación, el dolor bajará rápido.' : 'con más sueño te recuperarías más rápido.'}`, action: null };
    }

    case 'kb_proteina': {
      const u2 = getCurrentUser() || {};
      const w  = u2.weight || 70;
      const pMin = Math.round(w * 1.6), pMax = Math.round(w * 2.2);
      return { reply: `🥩 **Proteína: cuánta necesitas:**\n\n| Objetivo | g/kg peso corporal |\n|---|---|\n| Sedentario | 0.8g/kg |\n| Salud general | 1.2-1.6g/kg |\n| Hipertrofia | 1.8-2.2g/kg |\n| Pérdida de grasa | 2.0-2.4g/kg |\n\n${u2.weight ? `**Para ti (${w}kg):** ${pMin}-${pMax}g de proteína/día para tu objetivo de ${goal}.` : '**Regla simple:** 1.8-2g por kg de peso corporal si entrenas regularmente.'}\n\n**Fuentes de proteína de calidad:**\n• Pollo/pavo, carne magra, atún, salmón\n• Huevos (proteína de alta biodisponibilidad)\n• Yogur griego, queso cottage\n• Legumbres (lentejas, garbanzos)\n• Proteína en polvo (whey, caseína)\n\n💡 Distribuye la proteína en 4-5 comidas. El cuerpo absorbe ~30-40g por comida óptimamente.`, action: null };
    }

    case 'kb_creatina': {
      return { reply: `💊 **Creatina — el suplemento más estudiado:**\n\nLa creatina monohidratada es uno de los pocos suplementos con evidencia científica sólida.\n\n**Beneficios comprobados:**\n• +5-15% de fuerza en ejercicios de alta intensidad\n• Mejor recuperación entre series\n• Aumento de masa muscular (principalmente por mayor retención de agua en células musculares)\n• Posibles beneficios cognitivos\n\n**Dosis:** 3-5g diarios. No necesitas fase de carga.\n**Cuándo:** en cualquier momento del día, con o sin comida\n\n**¿Es segura?** Sí, ampliamente estudiada. Puede aumentar la creatinina sérica (sin daño renal real). Beber suficiente agua (${((td.waterGoalMl||2500)/1000).toFixed(1)}L, como tu meta).\n\n**Otros suplementos con evidencia:**\n• Cafeína: mejora rendimiento +3-7%\n• Beta-alanina: reduce fatiga muscular\n• Vitamina D: si hay déficit`, action: null };
    }

    case 'kb_ayuno': {
      return { reply: `⏰ **Ayuno intermitente — ¿funciona?**\n\nEl ayuno intermitente (AI) es una estrategia de timing de comidas, no una dieta per se.\n\n**Protocolos más comunes:**\n• **16/8**: 16h ayuno + 8h ventana de comida (ej: comer 12:00-20:00)\n• **18/6**: más restrictivo, mismo principio\n• **5:2**: 5 días normal + 2 días 500-600 kcal\n\n**¿Qué dice la ciencia?**\n• Para pérdida de peso: funciona igual que restricción calórica tradicional **si las calorías son iguales**\n• Ventaja real: algunas personas comen menos naturalmente dentro de la ventana\n• Puede mejorar sensibilidad a la insulina\n\n**Para entrenamiento:** entrena dentro de la ventana de alimentación cuando sea posible, o toma BCAA/proteína si entrenas en ayunas.\n\n${goal === 'Rendimiento' ? '⚠️ Para **Rendimiento**, el AI puede limitar el volumen de entrenamiento. Asegúrate de consumir las ' + (plan.kcal||2450) + ' kcal dentro de la ventana.' : '✅ Para tu objetivo de **' + goal + '**, el AI puede ser una herramienta útil si se te hace difícil comer menos.'}`, action: null };
    }

    case 'kb_pre_post': {
      return { reply: `🍽️ **¿Qué comer antes y después de entrenar?**\n\n**PRE-ENTRENAMIENTO (1-2h antes):**\n• Carbohidratos complejos + proteína moderada + poca grasa\n• Ejemplos: avena con proteína, arroz con pollo, banana con mantequilla de maní\n• ¿Poco tiempo? (30-45 min antes): fruta + proteína en polvo\n\n**POST-ENTRENAMIENTO (dentro de 30-90 min):**\n• Proteína + carbohidratos (relación 1:2 o 1:3)\n• Ejemplos: pollo con arroz, batido de proteína con banana, huevos con tostadas\n• Esto maximiza la síntesis proteica y repone glucógeno\n\n**¿Importa TANTO el timing?**\n• Si comes bien durante el día, el timing importa menos de lo que se cree\n• La ventana anabólica es de **4-6 horas**, no solo 30 min post-entreno\n• Prioridad: **cantidad total diaria** > timing\n\n💡 Tu meta calórica es **${plan.kcal||2150} kcal/día**. Distribuye proteína en cada comida.`, action: null };
    }

    case 'kb_perdida_grasa': {
      const u2 = getCurrentUser() || {};
      const deficit = Math.round((plan.kcal || 1850) * 0.15);
      return { reply: `🔥 **Perder grasa: la guía definitiva**\n\n**Principio fundamental:** necesitas un **déficit calórico** — gastar más de lo que comes.\n• 3.500 kcal de déficit ≈ 0.5 kg de grasa perdida\n• Déficit seguro: 300-500 kcal/día = 0.5-1 kg/semana\n\n**Los 4 pilares:**\n1. 🍽️ **Déficit calórico** sin bajar de tu TMB (metabolismo basal)\n2. 💪 **Entrenamiento de fuerza**: preserva músculo durante el déficit\n3. 🥩 **Proteína alta** (2-2.4g/kg): efecto saciante + preserva músculo\n4. 😴 **Sueño**: dormir poco aumenta grelina (hambre) y cortisol\n\n**Lo que NO funciona:**\n❌ Dietas extremas — pierdes músculo y el metabolismo se ralentiza\n❌ Solo cardio — sin fuerza, pierdes músculo con la grasa\n❌ Productos "quemagrasa" — ninguno tiene evidencia sólida\n\n${u2.weight ? `**Para ti:** con ${u2.weight}kg, tu déficit recomendado es ~${deficit} kcal/día menos que tu TDEE.` : ''}`, action: null };
    }

    case 'kb_ganar_masa': {
      return { reply: `📈 **Ganar masa muscular: cómo hacerlo bien**\n\n**Necesitas un superávit calórico moderado:** +200-300 kcal sobre tu mantenimiento.\nMás calorías = más grasa acumulada sin más músculo.\n\n**Ritmo realista:**\n• Principiante: 1-1.5 kg músculo/mes\n• Intermedio: 0.5-1 kg músculo/mes\n• Avanzado: 0.25-0.5 kg músculo/mes\n\n**Los 3 estímulos para crecer:**\n1. **Tensión mecánica**: levantar cargas progresivamente mayores\n2. **Daño muscular**: el DOMS controlado\n3. **Estrés metabólico**: el "pump" y la quema\n\n**Nutrición para masa:**\n• Calorías: TDEE + 250 kcal\n• Proteína: 1.8-2.2g/kg\n• Carbohidratos: 4-6g/kg (tu combustible principal)\n• Dormir 7-9h: la hormona de crecimiento se libera durmiendo\n\n💡 Tu objetivo actual de **${goal}** tiene ${plan.kcal||2450} kcal/día. ${goal === 'Rendimiento' ? '¡Perfecto para ganar masa!' : 'Considera cambiar a Rendimiento para mayor superávit calórico.'}`, action: null };
    }

    case 'kb_imc': {
      const u2 = getCurrentUser() || {};
      let imcTxt = '';
      if (u2.weight && u2.height) {
        const imc = (u2.weight / ((u2.height/100) ** 2)).toFixed(1);
        const cat  = imc < 18.5 ? 'Bajo peso' : imc < 25 ? 'Peso normal ✅' : imc < 30 ? 'Sobrepeso' : 'Obesidad';
        imcTxt = `\n\n**Tu IMC: ${imc}** → ${cat}`;
      }
      return { reply: `📊 **IMC (Índice de Masa Corporal):**\n\n| Categoría | IMC |\n|---|---|\n| Bajo peso | < 18.5 |\n| Normal | 18.5 - 24.9 |\n| Sobrepeso | 25 - 29.9 |\n| Obesidad | ≥ 30 |${imcTxt}\n\n⚠️ **Limitación importante:** el IMC no distingue músculo de grasa. Un atleta musculoso puede tener IMC de "sobrepeso" siendo completamente sano.\n\n**Mejor indicador:** porcentaje de grasa corporal\n• Hombre: 10-20% saludable, < 10% atlético\n• Mujer: 18-28% saludable, < 18% atlético\n\nLa composición corporal importa más que el número en la báscula.`, action: null };
    }

    case 'kb_frecuencia_c': {
      const u2 = getCurrentUser() || {};
      const fcMax = u2.age ? 220 - u2.age : 195;
      return { reply: `❤️ **Frecuencia cardíaca y zonas de entrenamiento:**\n\n${u2.age ? `**Tu FC máxima estimada: ${fcMax} lpm** (220 - ${u2.age} años)` : '**FC máxima estimada:** 220 - tu edad'}\n\n| Zona | % FC máx | Beneficio |\n|---|---|---|\n| Z1 Reposo | < 60% | Recuperación activa |\n| Z2 Aeróbica | 60-70% | Quema grasa, base aeróbica |\n| Z3 Umbral | 70-80% | Resistencia cardiovascular |\n| Z4 Anaeróbica | 80-90% | VO₂ máx, potencia |\n| Z5 Máxima | > 90% | Sprint, HIIT |\n\n${u2.age ? `**Tus zonas:** Z2: ${Math.round(fcMax*0.6)}-${Math.round(fcMax*0.7)} lpm | Z3: ${Math.round(fcMax*0.7)}-${Math.round(fcMax*0.8)} lpm` : ''}\n\n💡 El **70% del cardio** debería ser en Z2 (puedes hablar mientras entrenas). Solo el 30% en zonas altas.`, action: null };
    }

    case 'kb_sueño_gen': {
      return { reply: `😴 **Sueño: el suplemento más poderoso (gratis)**\n\n**¿Cuánto dormir?**\n• 18-25 años: 7-9 horas\n• 26-64 años: 7-9 horas\n• 65+: 7-8 horas\n\n**Lo que pasa mientras duermes:**\n• Se libera un **70% de la hormona de crecimiento** del día\n• Síntesis proteica muscular máxima\n• Consolidación de memoria motriz (aprendes mejor los movimientos)\n• Regulación de grelina/leptina (hambre y saciedad)\n\n**Dormir menos de 6h causa:**\n• Pérdida de masa muscular incluso con entrenamiento\n• +40% más probabilidad de lesión\n• Cortisol elevado → almacenamiento de grasa abdominal\n• Reducción del 10-15% en rendimiento físico\n\n**Tips para mejor sueño:**\n• Oscuridad total y temperatura 17-19°C\n• Sin pantallas 1h antes\n• Horario consistente (mismo hora siempre)\n• Magnesio glicinato antes de dormir\n\nTu score de anoche: **${td.sleepScore || '—'}/100**`, action: null };
    }

    case 'kb_estres': {
      return { reply: `🧠 **Estrés, cortisol y su impacto en tu cuerpo:**\n\nEl cortisol es la hormona del estrés — en dosis correctas es buena, en exceso destruye.\n\n**Efectos del cortisol crónico alto:**\n• Acumula grasa abdominal (el cuerpo prioriza reservas de energía)\n• Destruye tejido muscular (catabolismo)\n• Suprime el sistema inmune\n• Deteriora la calidad del sueño\n• Eleva la presión arterial\n\n**El ejercicio y el estrés:**\n• ✅ Ejercicio moderado (30-60 min): **reduce** el cortisol\n• ⚠️ Ejercicio excesivo sin recuperación: **eleva** el cortisol\n• ✅ Caminar al aire libre: reduce cortisol 15-20% en solo 20 min\n\n**Estrategias probadas para reducir estrés:**\n• Meditación 10 min/día: -35% cortisol\n• Respiración diafragmática: activa el sistema parasimpático en segundos\n• Ejercicio regular: el mejor ansiolítico natural\n• Reducir cafeína después de las 14:00\n• Desconectar del trabajo 1h antes de dormir`, action: null };
    }

    case 'kb_agua_gen': {
      return { reply: `💧 **¿Cuánta agua necesitas realmente?**\n\n**Regla base:** 35 ml por kg de peso corporal\n${getCurrentUser()?.weight ? `→ Para tus ${getCurrentUser().weight}kg: **${Math.round(getCurrentUser().weight * 35 / 100) / 10}L base**` : '→ Ejemplo: 70kg × 35ml = 2.45L'}\n\n**Factores que aumentan la necesidad:**\n• +500ml por hora de ejercicio intenso\n• +300-500ml en clima caluroso o húmedo\n• +200ml por cada taza de café/té\n• Fiebre, diarrea: reponer activamente\n\n**Señales de deshidratación:**\n• Orina oscura (debe ser amarillo pálido)\n• Dolor de cabeza\n• Fatiga sin causa aparente\n• Dificultad de concentración (el cerebro es 73% agua)\n\n**Impacto en rendimiento:**\n• 2% deshidratación = -20% rendimiento físico\n• 1% = ya hay impacto cognitivo\n\n📊 Hoy llevas **${st.waterMl?.toLocaleString('es-ES') || 0}ml** de ${(td.waterGoalMl||2500).toLocaleString('es-ES')}ml — ${Math.round(((st.waterMl||0)/(td.waterGoalMl||2500))*100)}% de tu meta.`, action: null };
    }

    case 'kb_flexibilidad': {
      return { reply: `🧘 **Flexibilidad y movilidad — diferencias clave:**\n\n**Flexibilidad:** capacidad del músculo de estirarse\n**Movilidad:** rango de movimiento activo de una articulación\n\n*La movilidad importa más para el entrenamiento.*\n\n**¿Cuándo estirar?**\n• ❌ Antes de entrenar: reduce fuerza hasta 8% (evita estático)\n• ✅ Después de entrenar: músculos calientes, mayor beneficio\n• ✅ En días de descanso: sesiones de 20-30 min\n\n**Tipos de estiramiento:**\n• **Dinámico** (antes de entreno): movimientos activos, círculos, balanceos\n• **Estático** (después de entreno): mantener 20-60 segundos\n• **PNF**: contrae → relaja → estira. Más efectivo pero requiere pareja\n\n**Áreas más importantes para trabajar:**\n• Cadera (flexores): esencial para sentadillas y salud lumbar\n• Pectoral/hombros: corrección de postura\n• Isquiotibiales: reduce lesiones de espalda baja\n\n💡 10 min de movilidad de cadera diaria puede mejorar tu sentadilla más que meses de práctica sin trabajarla.`, action: null };
    }

    case 'kb_abdomen': {
      return { reply: `🏋️ **Abdomen y core — la verdad:**\n\n**No existe la "quema grasa localizada"** — no puedes elegir de dónde perder grasa haciendo abdominales.\n\n**Cómo marcar el abdomen:**\n1. **Déficit calórico** para bajar grasa corporal total\n2. **Ejercicios de core** para desarrollar el músculo\n3. Cuando la grasa baje (<12-15% en hombre, <18-22% en mujer) → se marcan\n\n**Mejores ejercicios de core (más efectivos que los crunch tradicionales):**\n• Plancha (isométrico): activa 100% del core\n• Dead bug: coordina core y movilidad\n• Hollow body hold: base de la gimnasia\n• Rueda abdominal: alta activación del recto\n• Elevaciones de piernas colgado: parte baja del abdomen\n\n**¿Cuánto trabajar el core?**\n• 2-3x semana directo es suficiente\n• El core se trabaja indirectamente en sentadillas, peso muerto y press\n\n💡 Con tu objetivo de **${goal}**, el déficit calórico de ${goal === 'Estética' ? 'tu plan actual' : 'un plan de Estética'} es la clave principal para marcar el abdomen.`, action: null };
    }

    case 'kb_gluteos': {
      return { reply: `🍑 **Glúteos — cómo desarrollarlos efectivamente:**\n\n**Los mejores ejercicios (evidencia EMG):**\n1. **Hip Thrust**: activación máxima del glúteo mayor\n2. **Sentadilla búlgara**: glúteo + cuádriceps\n3. **Peso muerto rumano**: isquiotibiales + glúteo\n4. **Glute bridge**: accesible, alto impacto\n5. **Step-up**: unilateral, activa glúteo medio\n\n**Frecuencia óptima:**\n• Glúteos responden muy bien a **2-3x semana** con 3-5 días de recuperación\n• Rango de hipertrofia: 10-20 series semanales totales\n\n**Error común:** solo hacer sentadillas. Los glúteos necesitan **extensión de cadera** (hip thrust) para máxima activación.\n\n**Nutrición:**\n• El glúteo es músculo — necesitas proteína suficiente y no un déficit extremo\n• Para crecimiento: mínimo mantenimiento calórico\n\n**Progresión en 12 semanas:**\n• Semanas 1-4: dominar técnica con peso moderado\n• Semanas 5-8: aumentar carga progresivamente\n• Semanas 9-12: intensificar con técnicas avanzadas (pausa, 1.5 reps)`, action: null };
    }

    case 'kb_espalda': {
      return { reply: `🦴 **Salud de espalda y postura:**\n\n**Las 3 causas principales de dolor lumbar:**\n1. Debilidad del core\n2. Flexores de cadera acortados (por estar sentado)\n3. Técnica incorrecta al levantar\n\n**Ejercicios correctivos esenciales:**\n• **Bird-dog**: estabilidad lumbar\n• **Puente de glúteos**: activa glúteos e isquios (antagonistas de espalda)\n• **Superman/extensiones**: fortalece erector espinal\n• **Estiramiento flexor de cadera**: abre la cadera, alivia lumbar\n\n**Reglas para proteger la espalda al entrenar:**\n• Siempre mantén la columna neutra (ni demasiado arqueada ni redondeada)\n• En peso muerto: empuja el suelo, no jales la barra hacia arriba\n• En sentadilla: rodillas alineadas con pies, pecho arriba\n\n**Para dolor de espalda agudo:**\n• Movimiento suave > reposo total (el reposo prolongado empeora)\n• Caminar 20 min, yoga suave, natación\n• Consultar fisioterapeuta si persiste más de 2 semanas\n\n💡 ¿Tienes dolor de espalda? El chatbot puede sugerir una rutina correctiva.`, action: null };
    }

    case 'kb_principiante': {
      return { reply: `🌱 **Guía para empezar desde cero:**\n\n**Semanas 1-4 — Construye el hábito:**\n• 3 días/semana (lun/mié/vie)\n• Enfócate en los patrones básicos: sentadilla, empuje, jalón, bisagra de cadera\n• Peso que puedas controlar perfectamente\n• 20-30 min máximo\n\n**Los 5 ejercicios fundamentales para aprender:**\n1. Sentadilla con peso corporal → Goblet squat\n2. Flexiones (en pared o suelo) → Press con barra\n3. Remo con mancuerna\n4. Peso muerto rumano con poco peso\n5. Plancha\n\n**Lo más importante al inicio:**\n• ✅ **Consistencia** > intensidad. 3x semana durante 3 meses = base sólida\n• ✅ **Técnica** antes de aumentar peso\n• ✅ **Sueño y proteína**: sin estos, no hay progreso\n• ❌ No imites rutinas de Instagram de atletas avanzados\n\n**Progresión recomendada:**\n• Mes 1: patrones básicos con peso corporal/ligero\n• Mes 2: incorporar barra y mancuernas\n• Mes 3: comenzar sobrecarga progresiva\n\n💡 El mayor error de los principiantes es hacer demasiado muy rápido. La paciencia es tu mayor ventaja.`, action: null };
    }

    case 'kb_plateau': {
      return { reply: `📉 **Estancamiento (plateau) — cómo romperlo:**\n\n**¿Por qué ocurre?**\nTu cuerpo se adapta al mismo estímulo en 4-8 semanas. Lo que funcionó al inicio, deja de funcionar.\n\n**Estrategias para romper el plateau:**\n\n**En pérdida de peso:**\n• Recalcula tu TDEE (probablemente bajó con el peso)\n• Semana de recarga (eat at maintenance): resetea hormonas\n• Cambia el tipo de cardio\n• Revisa si estás midiendo las calorías correctamente\n\n**En fuerza/músculo:**\n• Cambia el esquema de series/reps\n• Introduce nuevos ejercicios para el mismo grupo muscular\n• Aumenta la frecuencia de entrenamiento\n• Deload week: semana de entrenamiento al 60% para recuperación neural\n• Duerme más y come más proteína\n\n**Cuándo es normal estancarse:**\n• Después de 6-12 meses, los progresos son más lentos — es normal\n• El principiante gana fuerza rápido; el avanzado trabaja meses por pequeños avances\n\n💡 Si llevas 2+ semanas sin progreso, cambia UNA variable a la vez para saber qué funcionó.`, action: null };
    }

    case 'kb_alcohol': {
      return { reply: `🍺 **Alcohol y ejercicio — el impacto real:**\n\n**¿Cómo afecta el alcohol al entrenamiento?**\n\n• **Síntesis proteica**: una sola sesión de consumo moderado reduce la síntesis proteica muscular **24%** (incluso con proteína post-entreno)\n• **Testosterona**: el alcohol reduce los niveles hasta un 23% hasta 24h después\n• **Hidratación**: el alcohol es diurético — aumenta la deshidratación\n• **Sueño**: aunque "ayuda a dormir", fragmenta el sueño REM (el reparador)\n• **Calorías vacías**: 7 kcal/g. Una copa de vino ≈ 125 kcal\n\n**Si vas a beber:**\n• No el mismo día que entrenaste (el daño a síntesis proteica es mayor)\n• Hidrátate bien (1 vaso agua por cada bebida alcohólica)\n• Come antes — reduce la absorción\n• Evitarlo 48h antes de eventos importantes de rendimiento\n\n**En perspectiva:** consumo social ocasional (1-2 copas, 1x semana) tiene impacto mínimo en objetivos de salud general. El problema es el consumo frecuente o en exceso.`, action: null };
    }

    case 'kb_vitaminas': {
      return { reply: `💊 **Vitaminas y minerales para el deportista:**\n\n**Las más importantes si entrenas:**\n\n| Nutriente | Para qué | Fuente |\n|---|---|---|\n| **Vitamina D** | Testosterona, huesos, inmunidad | Sol, pescado graso, suplemento |\n| **Magnesio** | Relajación muscular, sueño | Frutos secos, legumbres |\n| **Zinc** | Testosterona, recuperación | Carnes rojas, mariscos |\n| **Omega-3** | Antiinflamatorio, corazón | Salmón, nueces, suplemento |\n| **Hierro** | Transporte de oxígeno | Carne roja, espinacas + vitamina C |\n| **Vitamina C** | Inmunidad, colágeno | Cítricos, pimientos |\n| **Calcio** | Huesos, contracción muscular | Lácteos, brócoli, almendras |\n\n**Déficits más comunes en deportistas:**\n• Vitamina D (80% de la población tiene niveles bajos)\n• Hierro (especialmente mujeres)\n• Magnesio (el estrés y el sudor lo agotan)\n\n**¿Necesito suplementos?**\nSi comes variado: probablemente no. Si hay restricciones alimentarias o entrenas intensamente: considera Vit D + Omega-3 + Magnesio.`, action: null };
    }

    /* ── Fallback ── */
    default: {
      const tips = [
        `Prueba: "¿cómo va mi hidratación?" o "registra 250ml de agua"`,
        `Puedes preguntarme sobre ejercicio: "¿qué es el HIIT?" o "¿cuántas reps debo hacer?"`,
        `Pregúntame sobre nutrición: "¿cuánta proteína necesito?" o "¿qué comer antes de entrenar?"`,
        `Dime: "hice 2 series de press de banca" o "dame el resumen de mi día"`,
        `Intenta: "¿cómo empezar en el gym?" o "¿qué es el plateau y cómo romperlo?"`,
      ];
      return { reply: `Entendí tu mensaje, ${fn} 😊 pero necesito más detalles.\n\n💡 ${tips[Math.floor(Math.random()*tips.length)]}`, action: null };
    }
  }

  // Si llegó aquí desde un case sin return
  return { reply: `No pude procesar eso, ${fn}. Intenta ser más específico.`, action: null };
}

/* ─── Ejecutar acciones ─── */
function _execAction(action) {
  if (!action) return;
  try {
    if (action.type === 'update_water') {
      setState({ waterMl: (getState().waterMl || 0) + action.ml });
      window.dispatchEvent(new CustomEvent('pf_water_updated'));
      if (typeof showToast === 'function') showToast(`+${action.ml}ml registrados`, 'info', 2000);
    } else if (action.type === 'update_weight') {
      saveUser({ weight: action.kg });
      if (typeof showToast === 'function') showToast(`Peso: ${action.kg}kg`, 'success', 2000);
    } else if (action.type === 'update_goal') {
      setState({ activeGoal: action.goal });
      if (PLANFIT?.goals) PLANFIT.goals.current = action.goal;
      const p = PLANFIT?.goals?.plans?.[action.goal];
      if (p && PLANFIT?.today) PLANFIT.today.caloriesGoal = p.kcal;
      if (typeof showToast === 'function') showToast(`Objetivo: ${action.goal}`, 'success', 2000);
    }
  } catch(e) {}
}

/* ─── Auto-init ─── */
(function() {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderChatbot);
  else renderChatbot();
})();
