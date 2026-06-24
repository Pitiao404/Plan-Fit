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

    /* ── Fallback ── */
    default: {
      const tips = [
        `Prueba: "¿cómo va mi hidratación?" o "registra 250ml de agua"`,
        `Puedes decirme: "hice 2 series de press de banca" o "mi peso es 72kg"`,
        `Pregúntame: "¿cómo fue mi semana en pasos?" o "dame mi reporte mensual"`,
        `Dime: "desactiva recordatorios" o "cambia mi meta de agua a 3 litros"`,
        `Intenta: "¿qué hago hoy?" y te daré un plan según tu sueño y objetivo`,
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
