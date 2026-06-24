/* app.js — Shared application logic for Plan-Fit */

/* ─── User data (localStorage) ─────────────────── */

/* Returns the REAL registered user — always.
 * Used for authentication guards. Never returns a demo persona. */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem('pf_user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (!u.initials && u.name) {
      const parts = u.name.trim().split(/\s+/);
      u.initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    }
    return u;
  } catch (_) {}
  return null;
}

/* Returns the user to DISPLAY in the UI.
 * When showing the 'principiante' demo persona, returns Carlos Mendoza's data.
 * In all other cases (including 'activo') returns the real registered user. */
function getDisplayUser() {
  const realUser = getCurrentUser();
  try {
    const demo = localStorage.getItem('pf_active_demo');
    if (demo === 'principiante' && realUser?.registered && typeof DEMO_PROFILES !== 'undefined') {
      const p = DEMO_PROFILES.principiante;
      if (p?.name) return p;
    }
  } catch (_) {}
  return realUser;
}

function saveUser(data) {
  try {
    const current = getCurrentUser() || {};
    localStorage.setItem('pf_user', JSON.stringify({ ...current, ...data }));
  } catch (_) {}
}

/* Redirect to registro if user has no account yet (call from inner pages) */
function requireUser() {
  const u = getCurrentUser();
  if (!u || !u.registered) {
    window.location.href = 'registro.html';
    return false;
  }
  return true;
}

/* ─── Logo SVG ───────────────────────────────── */
const LOGO_SVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <rect width="32" height="32" rx="8" fill="#15B86E"/>
  <polyline points="3,16 7,16 10,9.5 13,22.5 15.5,12 18,19 21,16 29,16"
    stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

/* ─── Navigation items ─────────────────────────── */
const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Panel',       icon: 'dashboard',     href: 'dashboard.html' },
  { id: 'ejercicio',    label: 'Ejercicio',   icon: 'fitness_center', href: 'ejercicio.html' },
  { id: 'hidratacion',  label: 'Hidratación', icon: 'water_drop',    href: 'hidratacion.html' },
  { id: 'metas',        label: 'Metas',       icon: 'flag',          href: 'metas.html' },
  { id: 'reportes',     label: 'Reportes',    icon: 'bar_chart',     href: 'reportes.html' },
  { id: 'perfil',       label: 'Perfil',      icon: 'person',        href: 'perfil.html' },
];

/* ─── Detect active page ───────────────────────── */
function getActivePage() {
  const file = window.location.pathname.split('/').pop().replace('.html', '');
  return file || 'dashboard';
}

/* ─── Sidebar user card ─────────────────────────── */
function _sidebarUserHTML() {
  const u = getDisplayUser();
  const initials  = u ? u.initials  : '?';
  const name      = u ? u.name      : 'Usuario';
  const plan      = u ? (u.plan || 'Básico') : '';
  const roleLabel = plan.toLowerCase().includes('premium') ? 'Miembro Premium' : (plan || 'Miembro');
  const avatar    = localStorage.getItem('pf_avatar');

  // Demo badge
  const demoType = localStorage.getItem('pf_active_demo') || 'activo';
  const demoLabels = { principiante: 'Principiante', admin: 'Administrador' };
  const demoBadge = demoType !== 'activo' && demoLabels[demoType] ? `
    <a href="perfil.html" style="display:inline-block;margin-top:4px;font-size:10px;font-weight:700;
       background:rgba(255,107,53,0.15);color:var(--coral);border-radius:50px;
       padding:2px 8px;letter-spacing:.04em;text-transform:uppercase;text-decoration:none">
      DEMO · ${demoLabels[demoType]}
    </a>` : '';

  const avatarHTML = avatar
    ? `<div class="sidebar-avatar" style="padding:0;overflow:hidden" aria-hidden="true"><img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt=""/></div>`
    : `<div class="sidebar-avatar" aria-hidden="true">${initials}</div>`;

  return `
    ${avatarHTML}
    <div class="sidebar-user-info">
      <p class="sidebar-user-name">${name}</p>
      <p class="sidebar-user-role">${roleLabel}</p>
      ${demoBadge}
    </div>
    <a href="perfil.html" style="color:var(--gris-piedra);display:flex;align-items:center;transition:color .15s;flex-shrink:0" title="Ver perfil"
       onmouseover="this.style.color='var(--verde-vital)'" onmouseout="this.style.color='var(--gris-piedra)'">
      <span class="material-symbols-outlined" style="font-size:18px">settings</span>
    </a>`;
}

/* ─── Render sidebar ───────────────────────────── */
function renderSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const active = getActivePage();

  const navHTML = NAV_ITEMS.map(item => `
    <a href="${item.href}"
       class="nav-item${active === item.id ? ' active' : ''}"
       aria-current="${active === item.id ? 'page' : 'false'}">
      <span class="material-symbols-outlined nav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </a>`).join('');

  container.innerHTML = `
    <aside id="app-sidebar" class="app-sidebar" role="navigation" aria-label="Navegación principal">
      <div class="sidebar-logo">
        ${LOGO_SVG}
        <span class="sidebar-logo-text">Plan·<span>Fit</span></span>
      </div>
      <nav class="sidebar-nav" aria-label="Menú principal">
        ${navHTML}
      </nav>
      <div class="sidebar-user">
        ${_sidebarUserHTML()}
      </div>
    </aside>
    <div id="sidebar-overlay" class="sidebar-overlay" onclick="closeSidebar()" role="button" aria-label="Cerrar menú"></div>
  `;
}

/* ─── Mobile sidebar toggle ────────────────────── */
function toggleSidebar() {
  const s = document.getElementById('app-sidebar');
  const o = document.getElementById('sidebar-overlay');
  if (!s) return;
  const open = s.classList.toggle('open');
  if (o) o.classList.toggle('visible', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

function closeSidebar() {
  const s = document.getElementById('app-sidebar');
  const o = document.getElementById('sidebar-overlay');
  if (s) s.classList.remove('open');
  if (o) o.classList.remove('visible');
  document.body.style.overflow = '';
}

/* ─── Toast ────────────────────────────────────── */
function showToast(msg, type = 'success', dur = 3200) {
  const icons = { success:'check_circle', error:'error', info:'info', warning:'warning' };
  const colors = { success:'#15B86E', error:'#EF4444', info:'#2BB3E0', warning:'#FF6B35' };

  document.querySelector('.planfit-toast')?.remove();

  const t = document.createElement('div');
  t.className = 'planfit-toast';
  t.style.background = colors[type] || colors.success;
  t.setAttribute('role', 'alert');
  t.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px">${icons[type]||'check_circle'}</span>${msg}`;
  document.body.appendChild(t);

  setTimeout(() => {
    t.style.transition = 'opacity .3s, transform .3s';
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(16px)';
    setTimeout(() => t.remove(), 320);
  }, dur);
}

/* ─── State management ─────────────────────────── */
const _KEY = 'pf_state_v1';

function getState() {
  try {
    const raw = localStorage.getItem(_KEY);
    if (raw) return Object.assign(_defaults(), JSON.parse(raw));
  } catch (_) {}
  return _defaults();
}

function _defaults() {
  return {
    waterMl: 1850,
    activeGoal: 'Salud',
    goalHorizon: 12,
    exerciseActive: false,
    exerciseStart: null,
    notifHydration: true,
    notifSummary: true,
    notifSedentary: false,
    userProfile: 'activo',   // principiante | activo | admin
    completedSeries: {},
  };
}

function setState(updates) {
  const next = Object.assign(getState(), updates);
  try { localStorage.setItem(_KEY, JSON.stringify(next)); } catch (_) {}
  return next;
}

/* ─── SVG progress ring ────────────────────────── */
function setRing(svgEl, pct, color, r = 52, sw = 10) {
  if (!svgEl) return;
  const cx = 64, cy = 64;
  const circ = +(2 * Math.PI * r).toFixed(3);
  const off  = +(circ * (1 - Math.min(1, Math.max(0, pct) / 100))).toFixed(3);
  svgEl.setAttribute('viewBox', '0 0 128 128');
  svgEl.innerHTML = `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="rgba(0,0,0,0.07)" stroke-width="${sw}"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
      stroke="${color}" stroke-width="${sw}"
      stroke-dasharray="${circ}" stroke-dashoffset="${off}"
      stroke-linecap="round"
      transform="rotate(-90 ${cx} ${cy})"/>`;
}

/* ─── Number helpers ───────────────────────────── */
const fmt = n => n.toLocaleString('es-ES');
const pad2 = n => String(n).padStart(2, '0');

function fmtSecs(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${pad2(h)}:${pad2(m)}:${pad2(sec)}`
    : `${pad2(m)}:${pad2(sec)}`;
}

/* ─── Mobile header builder ─────────────────────── */
function renderMobileHeader(title) {
  const el = document.getElementById('mobile-header');
  if (!el) return;
  el.innerHTML = `
    <button onclick="toggleSidebar()" class="p-2 rounded-lg" style="background:none;border:none;cursor:pointer;color:var(--carbon)"
            aria-label="Abrir menú">
      <span class="material-symbols-outlined" style="font-size:24px">menu</span>
    </button>
    <div style="display:flex;align-items:center;gap:8px">
      ${LOGO_SVG.replace('width="32" height="32"','width="28" height="28"')}
      <span style="font-family:'Poppins',sans-serif;font-weight:700;font-size:16px;color:var(--carbon)">
        Plan·<span style="color:var(--verde-vital)">Fit</span>
      </span>
    </div>
    ${(()=>{ const av=localStorage.getItem('pf_avatar'); return av ? `<div class="sidebar-avatar" style="width:32px;height:32px;padding:0;overflow:hidden;cursor:pointer" onclick="location.href='perfil.html'"><img src="${av}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt=""/></div>` : `<div class="sidebar-avatar" style="width:32px;height:32px;font-size:11px;cursor:pointer" onclick="location.href='perfil.html'">${(getDisplayUser()||{}).initials||'?'}</div>`; })()}
  `;
}

/* ─── Demo / Feria mode ─────────────────────────── */

/* Set up a demo user and redirect to dashboard, bypassing registration */
function enterDemoMode(type) {
  type = type || 'activo';
  localStorage.clear();
  const profiles = {
    activo: {
      name: 'Elena Martínez', firstName: 'Elena', lastName: 'Martínez',
      email: 'elena@planfit.app', initials: 'EM',
      plan: 'Premium Anual', memberSince: 'Enero 2024',
      registered: true, onboardingDone: true,
      age: 28, height: 172, weight: 64, gender: 'Femenino',
      objective: 'Salud', activityLevel: 'mod', kcal: 2150,
    },
    principiante: {
      name: 'Carlos Mendoza', firstName: 'Carlos', lastName: 'Mendoza',
      email: 'carlos@planfit.app', initials: 'CM',
      plan: 'Básico', memberSince: 'Abril 2025',
      registered: true, onboardingDone: true,
      age: 35, height: 178, weight: 92, gender: 'Masculino',
      objective: 'Salud', activityLevel: 'sed', kcal: 2100,
    },
  };
  const user = profiles[type] || profiles.activo;
  localStorage.setItem('pf_user', JSON.stringify(user));
  localStorage.setItem('pf_active_demo', type === 'principiante' ? 'principiante' : 'activo');
  window.location.href = 'dashboard.html';
}

/* Clear demo state and return to login for next visitor */
function resetDemo() {
  if (!confirm('¿Reiniciar la demo para el próximo visitante?\n\nSe borrarán todos los datos de esta sesión.')) return;
  localStorage.clear();
  window.location.href = 'login.html';
}

/* Render a fixed bottom banner indicating demo/feria mode */
function renderDemoBanner() {
  const page = getActivePage();
  if (['login', 'registro', 'onboarding'].includes(page)) return;
  if (!getCurrentUser()?.registered) return;

  const banner = document.createElement('div');
  banner.className = 'demo-banner no-print';
  banner.setAttribute('role', 'status');
  banner.innerHTML = `
    <div class="demo-banner-label">
      <span class="material-symbols-outlined" style="font-size:16px;color:var(--verde-vital);font-variation-settings:'FILL' 1">live_tv</span>
      <span>Modo Demo · Feria Tech</span>
    </div>
    <div class="demo-banner-actions">
      <button class="demo-btn" onclick="location.href='perfil.html'" title="Cambiar perfil de demostración">
        Cambiar Perfil
      </button>
      <button class="demo-btn demo-btn-reset" onclick="resetDemo()" title="Reiniciar demo para el próximo visitante">
        Reiniciar Demo
      </button>
    </div>`;
  document.body.appendChild(banner);
  document.body.classList.add('has-demo-banner');
}

/* ─── Dynamic today label ───────────────────────── */
function getTodayLabel(short) {
  const now = new Date();
  const days   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months = short
    ? ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    : ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return short
    ? `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
    : `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}

/* ─── Init ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar();
  renderMobileHeader();

  // Close sidebar on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });

  // Close sidebar on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeSidebar();
  });
});
