/* chatbot.js — Plan·Fit Asistente IA (contextual, sin API) */

/* ─── State ─── */
let _chatOpen    = false;
let _chatHistory = [];

/* ─── Render widget ─── */
function renderChatbot() {
  const page = (window.location.pathname.split('/').pop() || '').replace('.html','');
  if (['login','registro','onboarding','bienvenida'].some(p => page.includes(p))) return;
  if (!getCurrentUser()?.registered) return;
  if (document.getElementById('pf-chatbot')) return;

  const wrap = document.createElement('div');
  wrap.id = 'pf-chatbot';
  wrap.innerHTML = `
    <button id="chat-toggle" class="chat-toggle-btn" onclick="toggleChat()" aria-label="Abrir asistente IA" title="Asistente Plan·Fit">
      <span id="chat-icon">💬</span>
    </button>

    <div id="chat-panel" class="chat-panel" role="dialog" aria-label="Asistente Plan·Fit" style="display:none">
      <div class="chat-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div class="chat-avatar-icon">🤖</div>
          <div>
            <p class="chat-title">Asistente Plan·Fit</p>
            <p class="chat-subtitle"><span class="chat-dot"></span>Activo · Conoce tu plan</p>
          </div>
        </div>
        <button onclick="toggleChat()" class="chat-close-btn" aria-label="Cerrar">✕</button>
      </div>

      <div class="chat-messages" id="chat-messages"></div>

      <div id="chat-suggestions" class="chat-suggestions">
        <button class="chat-sugg" onclick="askQuick('¿Cómo va mi hidratación hoy?')">💧 Hidratación</button>
        <button class="chat-sugg" onclick="askQuick('¿Cuál es mi rutina de hoy?')">💪 Rutina</button>
        <button class="chat-sugg" onclick="askQuick('Dame un resumen de mi día')">📊 Resumen</button>
        <button class="chat-sugg" onclick="askQuick('Necesito motivación')">🔥 Motivación</button>
      </div>

      <div class="chat-input-wrap">
        <input id="chat-input" class="chat-input" type="text"
          placeholder="Escribe tu pregunta o registra datos..."
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

  // Saludo inicial
  setTimeout(() => {
    const u  = getDisplayUser() || {};
    const fn = u.firstName || u.name || 'visitante';
    _addBotMsg(`¡Hola ${fn}! 👋 Soy tu asistente de salud. Conozco tu plan completo y puedo ayudarte a:\n• Ver tus métricas del día\n• Registrar agua, peso u otros datos\n• Explicarte tu rutina y nutrición\n• Cambiar tu objetivo\n\n¿En qué te ayudo hoy?`, false);
  }, 500);
}

/* ─── Toggle ─── */
function toggleChat() {
  _chatOpen = !_chatOpen;
  const panel = document.getElementById('chat-panel');
  const icon  = document.getElementById('chat-icon');
  if (!panel) return;

  if (_chatOpen) {
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(10px) scale(.97)';
    requestAnimationFrame(() => {
      panel.style.transition = 'opacity .2s, transform .2s';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0) scale(1)';
    });
    icon.textContent = '✕';
    setTimeout(() => document.getElementById('chat-input')?.focus(), 220);
  } else {
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(8px) scale(.97)';
    setTimeout(() => { panel.style.display = 'none'; panel.style.transition = ''; }, 200);
    icon.textContent = '💬';
  }
}

/* ─── Send ─── */
function sendMessage() {
  const input = document.getElementById('chat-input');
  const text  = (input?.value || '').trim();
  if (!text) return;
  input.value = '';

  document.getElementById('chat-suggestions').style.display = 'none';
  _addUserMsg(text);
  _chatHistory.push({ role: 'user', text });

  const tid = _addTyping();
  setTimeout(() => {
    _removeTyping(tid);
    const { reply, action } = _processMessage(text);
    _addBotMsg(reply);
    if (action) _execAction(action);
    _chatHistory.push({ role: 'bot', text: reply });
  }, 500 + Math.random() * 500);
}

function askQuick(q) {
  const input = document.getElementById('chat-input');
  if (input) input.value = q;
  sendMessage();
}

/* ─── UI helpers ─── */
function _addUserMsg(text) {
  const el = document.createElement('div');
  el.className = 'chat-msg chat-msg-user';
  el.textContent = text;
  _append(el);
}

function _addBotMsg(text, anim = true) {
  const el = document.createElement('div');
  el.className = 'chat-msg chat-msg-bot';
  // Convert **bold** and \n
  el.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
  _append(el, anim);
}

function _append(el, anim = true) {
  const box = document.getElementById('chat-messages');
  if (!box) return;
  if (anim) {
    el.style.opacity = '0'; el.style.transform = 'translateY(6px)';
    box.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transition = 'opacity .2s, transform .2s';
      el.style.opacity = '1'; el.style.transform = 'translateY(0)';
    });
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

/* ─── Intent engine ─── */
function _processMessage(raw) {
  const msg  = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const u    = getDisplayUser() || {};
  const st   = getState();
  const td   = PLANFIT.today;
  const fn   = u.firstName || u.name || 'amigo';
  const goal = PLANFIT.goals.current || 'Salud';
  const plan = PLANFIT.goals.plans?.[goal] || {};

  /* ── Registrar agua ── */
  const wMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*(ml|mililitros?|l\b|litros?)/i);
  if (wMatch && (msg.includes('agua') || msg.includes('registr') || msg.includes('beb') || msg.includes('tom') || msg.includes('anot') || msg.includes('agreg') || msg.includes('ml') || msg.includes('litro'))) {
    let ml = parseFloat(wMatch[1].replace(',','.'));
    if (/litro/i.test(wMatch[2]) || wMatch[2].toLowerCase() === 'l') ml *= 1000;
    ml = Math.round(ml);
    const newTotal = (st.waterMl || 0) + ml;
    const pct = Math.round((newTotal / (td.waterGoalMl || 2500)) * 100);
    return { reply: `✅ ¡Registrado, ${fn}! **+${ml}ml** de agua.\n\n💧 Total hoy: **${newTotal.toLocaleString('es-ES')}ml** (${pct}% de tu meta de ${(td.waterGoalMl||2500).toLocaleString('es-ES')}ml)\n\n${pct >= 100 ? '🎉 ¡Meta de hidratación alcanzada!' : pct >= 70 ? '¡Vas excelente, casi en la meta!' : '¡Sigue tomando agua a lo largo del día!'}`, action: { type:'update_water', ml } };
  }

  /* ── Actualizar peso ── */
  const pMatch = raw.match(/(\d+(?:[.,]\d+)?)\s*kg/i);
  if (pMatch && (msg.includes('peso') || msg.includes('kilo') || msg.includes('kg') || msg.includes('mido') || msg.includes('actualiz'))) {
    const kg = parseFloat(pMatch[1].replace(',','.'));
    return { reply: `⚖️ ¡Listo! He actualizado tu peso a **${kg}kg**. El progreso real se mide en semanas — ¡sigue constante, ${fn}!`, action: { type:'update_weight', kg } };
  }

  /* ── Cambiar objetivo ── */
  if (msg.includes('cambiar') || msg.includes('cambio') || msg.includes('quiero') || msg.includes('prefiero')) {
    if (msg.includes('estetica') || msg.includes('estet') || msg.includes('tonif') || msg.includes('defin') || msg.includes('bajar grasa')) {
      return { reply: `✨ ¡Objetivo actualizado a **Estética**!\n\n• Calorías: **${PLANFIT.goals.plans['Estética']?.kcal||1850} kcal/día**\n• Sesiones: ${PLANFIT.goals.plans['Estética']?.sessions||'4 sesiones/sem'}\n• Enfoque: ${PLANFIT.goals.plans['Estética']?.desc||'Definición y tonificación'}\n\nTu plan ha sido ajustado. Ve a Metas para ver los detalles. 💪`, action: { type:'update_goal', goal:'Estética' } };
    }
    if (msg.includes('rendimiento') || msg.includes('fuerza') || msg.includes('atletico') || msg.includes('deportista') || msg.includes('musculo')) {
      return { reply: `⚡ ¡Objetivo actualizado a **Rendimiento**!\n\n• Calorías: **${PLANFIT.goals.plans['Rendimiento']?.kcal||2450} kcal/día**\n• Sesiones: ${PLANFIT.goals.plans['Rendimiento']?.sessions||'5 sesiones/sem'}\n• Enfoque: Fuerza máxima y resistencia\n\nPlan ajustado. ¡A entrenar fuerte, ${fn}!`, action: { type:'update_goal', goal:'Rendimiento' } };
    }
    if (msg.includes('salud') || msg.includes('bienestar') || msg.includes('energia') || msg.includes('vida')) {
      return { reply: `❤️ ¡Objetivo actualizado a **Salud**!\n\n• Calorías: **${PLANFIT.goals.plans['Salud']?.kcal||2150} kcal/día**\n• Sesiones: ${PLANFIT.goals.plans['Salud']?.sessions||'3 sesiones/sem'}\n• Enfoque: Longevidad y bienestar general\n\nPlan ajustado, ${fn}. ¡La constancia es la clave! 🌱`, action: { type:'update_goal', goal:'Salud' } };
    }
  }

  /* ── Agua / hidratación ── */
  if (msg.includes('agua') || msg.includes('hidrat') || msg.includes('beber') || msg.includes('tomar')) {
    const ml   = st.waterMl || 0;
    const meta = td.waterGoalMl || 2500;
    const pct  = Math.round((ml / meta) * 100);
    const rest = Math.max(0, meta - ml);
    const eval_ = pct >= 100 ? '🎉 ¡Meta alcanzada! Hidratación perfecta.' : pct >= 70 ? '¡Vas muy bien! Solo faltan ' + rest.toLocaleString('es-ES') + 'ml.' : pct >= 40 ? '⚠️ Puedes mejorar. Un vaso grande ahora ayuda mucho.' : '🚨 Baja hidratación. El agua es esencial para el rendimiento.';
    return { reply: `💧 **Hidratación de hoy, ${fn}:**\n• Consumido: **${ml.toLocaleString('es-ES')}ml** de ${meta.toLocaleString('es-ES')}ml\n• Progreso: **${pct}%**\n• Faltan: ${rest.toLocaleString('es-ES')}ml\n\n${eval_}\n\n💡 ¿Quieres que registre agua? Dime: "registra 300ml"`, action: null };
  }

  /* ── Ejercicio / rutina ── */
  if (msg.includes('ejercicio') || msg.includes('rutina') || msg.includes('entrena') || msg.includes('workout') || msg.includes('serie') || msg.includes('repeticion')) {
    const r  = PLANFIT.routine || {};
    const ex = PLANFIT.exercises?.map((e, i) => `${i+1}. **${e.name}** (${e.category})`).join('\n') || '—';
    return { reply: `💪 **Tu rutina de hoy — ${r.name || 'Sin nombre'}:**\n• Enfoque: ${r.focus || '—'}\n• Músculos: ${r.muscles || '—'}\n• Duración: ${r.duration || '—'}\n• Intensidad: ${r.intensityLabel || '—'}\n\n**Ejercicios:**\n${ex}\n\n${r.recoveryMsg || '¡A dar el máximo!'}`, action: null };
  }

  /* ── Calorías / nutrición ── */
  if (msg.includes('caloria') || msg.includes('kcal') || msg.includes('nutricion') || msg.includes('comer') || msg.includes('dieta') || msg.includes('macro') || msg.includes('proteina') || msg.includes('carbohidrato')) {
    const m = plan.macros || { p:160, c:220, g:70 };
    return { reply: `🍽️ **Plan nutricional — ${goal}:**\n• Calorías objetivo: **${plan.kcal||2150} kcal/día**\n• Proteína: **${m.p}g** | Carbohidratos: **${m.c}g** | Grasas: **${m.g}g**\n• Actividad: ${plan.activity||'Cardio'} (${plan.sessions||'3 sesiones/sem'})\n\n🔥 Hoy quemaste: ${td.caloriesBurned?.toLocaleString('es-ES')||0} kcal de ${(td.caloriesGoal||2150).toLocaleString('es-ES')} kcal meta\n\n${plan.desc || ''}`, action: null };
  }

  /* ── Sueño ── */
  if (msg.includes('sueno') || msg.includes('sueño') || msg.includes('dormi') || msg.includes('descanso') || msg.includes('recuper') || msg.includes('cansado')) {
    const sc = td.sleepScore || 0;
    const ev = sc >= 80 ? '😴✨ Excelente descanso. Tu cuerpo está listo para dar el máximo hoy.' : sc >= 60 ? '😴 Buen descanso. Podrías mejorar acostándote 30 min antes.' : '😫 Sueño insuficiente. Prioriza el descanso — es cuando los músculos se recuperan.';
    return { reply: `**Sueño de anoche:**\n• Duración: **${td.sleepHours || '—'}**\n• Puntaje: **${sc}/100**\n• Recuperación: **${td.recoveryScore || 0}%**\n• Tipo: ${td.sleepType || '—'}\n\n${ev}\n\n💡 Consejo: 7-9h de sueño aumenta la síntesis de proteínas y reduce el cortisol.`, action: null };
  }

  /* ── Pasos ── */
  if (msg.includes('paso') || msg.includes('caminar') || msg.includes('camina') || msg.includes('actividad')) {
    const s = td.steps || 0;
    const sg = td.stepsGoal || 10000;
    const pct = Math.round((s / sg) * 100);
    return { reply: `🚶 **Pasos de hoy:**\n• Completados: **${s.toLocaleString('es-ES')}** pasos\n• Meta: ${sg.toLocaleString('es-ES')} pasos\n• Progreso: **${pct}%**\n• vs ayer: ${(td.stepsChangePct||0) >= 0 ? '+' : ''}${td.stepsChangePct||0}%\n\n${pct >= 100 ? '🎉 ¡Meta de pasos completada!' : pct >= 70 ? '¡Casi llenas la meta! Un poco más.' : 'Intenta caminar un rato — cada paso cuenta, ' + fn + '.'}`, action: null };
  }

  /* ── Metas / objetivo / progreso ── */
  if (msg.includes('meta') || msg.includes('objetivo') || msg.includes('progres') || msg.includes('avance') || msg.includes('logro')) {
    const qts = PLANFIT.goals.quarterly || [];
    const qText = qts.map(q => `• **${q.name}**: ${q.unit} (${q.progress}% — meta: ${q.target})`).join('\n');
    return { reply: `🎯 **Objetivo actual: ${goal}**\n${plan.desc || ''}\n\n**Progreso trimestral:**\n${qText || '— Sin metas activas'}\n\n**Impacto proyectado (12 semanas):**\n${plan.impact?.[12] || 'Resultados visibles con constancia.'}`, action: null };
  }

  /* ── Resumen del día ── */
  if (msg.includes('resumen') || msg.includes('como estoy') || msg.includes('estado') || msg.includes('todo') || msg.includes('dia')) {
    const wPct = Math.round(((st.waterMl||0) / (td.waterGoalMl||2500)) * 100);
    const ePct = Math.round((td.caloriesBurned / (td.caloriesGoal||2150)) * 100);
    const sPct = Math.round(((td.steps||0) / (td.stepsGoal||10000)) * 100);
    const slPct = td.sleepScore || 0;
    const score = Math.round((wPct + ePct + sPct + slPct) / 4);
    return { reply: `📊 **Resumen de hoy, ${fn}:**\n\n💧 Hidratación: ${wPct}% ${wPct>=80?'✅':'⚠️'}\n🔥 Calorías activas: ${ePct}% ${ePct>=80?'✅':'🔄'}\n🚶 Pasos: ${sPct}% ${sPct>=80?'✅':'🔄'}\n😴 Sueño: ${slPct}/100 ${slPct>=75?'✅':'⚠️'}\n\n**Score del día: ${score}/100** ${score>=80?'🌟 Excelente jornada!':score>=60?'👍 Buen día, sigue así.':'💪 Hay margen de mejora, ¡tú puedes!'}\n\n🎯 Objetivo: **${goal}** — ${plan.desc||''}`, action: null };
  }

  /* ── Motivación ── */
  if (msg.includes('motivar') || msg.includes('motivacion') || msg.includes('animar') || msg.includes('no puedo') || msg.includes('dificil') || msg.includes('cansad') || msg.includes('ayuda')) {
    const phrases = [
      `🔥 ¡${fn}, el único mal entrenamiento es el que no se hace! Cualquier esfuerzo, por pequeño que sea, te acerca a tu meta. ¡Tú puedes!`,
      `💪 Recuerda por qué empezaste, ${fn}. El progreso no siempre es visible, pero cada día que te mueves estás ganando. ¡Adelante!`,
      `🌟 ${fn}, el cuerpo logra lo que la mente cree. Empieza con 5 minutos — el movimiento genera más energía. ¡Venga, tú puedes!`,
      `⚡ Los resultados llegan para quienes no se rinden, ${fn}. ¡Un día más, un día mejor. Este momento define tu futuro!`,
    ];
    return { reply: phrases[Math.floor(Math.random() * phrases.length)], action: null };
  }

  /* ── Saludos ── */
  if (msg.match(/^(hola|buenos|buenas|hey|hi|que tal)\b/) || msg.includes('hola') || msg.includes('buenas')) {
    return { reply: `¡Hola de nuevo, ${fn}! 😊 Estoy aquí para lo que necesites.\n\n¿Qué hacemos hoy?\n• Consultar métricas\n• Registrar agua o peso\n• Ver rutina o plan nutricional\n• Cambiar objetivo\n• Recibir motivación`, action: null };
  }

  /* ── Fallback ── */
  const tips = [
    `Prueba: "¿cuánta agua llevo?" o "registra 250ml de agua"`,
    `Puedes preguntarme: "¿cuál es mi rutina hoy?" o "dame mi plan calórico"`,
    `Intenta: "¿cómo va mi progreso?" o "necesito motivación"`,
    `Puedes decirme: "mi peso es 75kg" o "cambia mi objetivo a Rendimiento"`,
  ];
  return { reply: `Entendí tu mensaje, ${fn} 😊 pero necesito más contexto.\n\n💡 ${tips[Math.floor(Math.random()*tips.length)]}`, action: null };
}

/* ─── Execute actions ─── */
function _execAction(action) {
  try {
    if (action.type === 'update_water') {
      const cur = getState().waterMl || 0;
      setState({ waterMl: cur + action.ml });
      window.dispatchEvent(new CustomEvent('pf_water_updated'));
      if (typeof showToast === 'function') showToast(`+${action.ml}ml registrados`, 'info', 2000);
    } else if (action.type === 'update_weight') {
      saveUser({ weight: action.kg });
      if (typeof showToast === 'function') showToast(`Peso actualizado: ${action.kg}kg`, 'success', 2000);
    } else if (action.type === 'update_goal') {
      setState({ activeGoal: action.goal });
      PLANFIT.goals.current = action.goal;
      const p = PLANFIT.goals.plans?.[action.goal];
      if (p) PLANFIT.today.caloriesGoal = p.kcal;
      if (typeof showToast === 'function') showToast(`Objetivo: ${action.goal}`, 'success', 2000);
    }
  } catch(e) {}
}

/* ─── Auto-init ─── */
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderChatbot);
  } else {
    renderChatbot();
  }
})();
