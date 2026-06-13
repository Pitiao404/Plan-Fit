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

  // Demo badge
  const demoType = localStorage.getItem('pf_active_demo') || 'activo';
  const demoLabels = { principiante: 'Principiante', admin: 'Administrador' };
  const demoBadge = demoType !== 'activo' && demoLabels[demoType] ? `
    <a href="perfil.html" style="display:inline-block;margin-top:4px;font-size:10px;font-weight:700;
       background:rgba(255,107,53,0.15);color:var(--coral);border-radius:50px;
       padding:2px 8px;letter-spacing:.04em;text-transform:uppercase;text-decoration:none">
      DEMO · ${demoLabels[demoType]}
    </a>` : '';

  return `
    <div class="sidebar-avatar" aria-hidden="true">${initials}</div>
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
    <div class="sidebar-avatar" style="width:32px;height:32px;font-size:11px;cursor:pointer" onclick="location.href='perfil.html'">${(getDisplayUser()||{}).initials||'?'}</div>
  `;
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
