# Plan·Fit — Prototipo Web

Prototipo web responsivo de salud y bienestar con recomendaciones personalizadas de ejercicio, hidratación y alimentación.

## Cómo correr localmente

```bash
cd plan-fit
python3 -m http.server 8000
```

Abre `http://localhost:8000` en tu navegador.

> También puedes usar: `npx serve .` o cualquier servidor HTTP estático.

## Estructura del proyecto

```
plan-fit/
├── index.html          Splash → redirige a login
├── login.html          Inicio de sesión + MFA
├── onboarding.html     Wizard de configuración (4 pasos)
├── dashboard.html      Panel principal
├── ejercicio.html      Rutina de ejercicio
├── hidratacion.html    Control de hidratación
├── metas.html          Metas personalizadas
├── reportes.html       Reporte mensual
├── perfil.html         Perfil y ajustes
└── assets/
    ├── css/styles.css  Estilos globales y componentes
    └── js/
        ├── data.js     Datos mock (Elena Martínez)
        └── app.js      Lógica compartida (sidebar, toast, estado)
```

## Tabla de trazabilidad — Pantalla → Requisito Funcional

| Pantalla | Archivo | RF cubiertos |
|---|---|---|
| Login | `login.html` | **RF-05** Registro de usuario (correo + contraseña), MFA (modal código 6 dígitos), mostrar/ocultar contraseña, medidor de fortaleza |
| Onboarding | `onboarding.html` | **RF-01** Ingreso de datos personales y de salud; **RF-03** Cálculo de requerimientos calóricos (Mifflin-St Jeor) |
| Panel (Dashboard) | `dashboard.html` | **RF-04** Sincronización wearable (chip "Fit-Band Conectado"); **RF-10** Calidad de sueño con score y anillo |
| Ejercicio | `ejercicio.html` | **RF-02** Rutina con series/reps/peso editables, checkbox de completado, cronómetro, historial mock; **RF-10** Banner de intensidad basado en sueño/recuperación |
| Hidratación | `hidratacion.html` | **RF-06** Nivel de hidratación con anillo dinámico y botones +100/+200/+250/+500 ml; **RF-07** Recordatorios con switch, próxima alerta e intervalo ajustable |
| Metas | `metas.html` | **RF-09** Metas Salud/Estética/Rendimiento con horizonte 4/12/24 sem; recalculo instantáneo de kcal, macros, actividad e impacto proyectado |
| Reportes | `reportes.html` | **RF-08** Reporte mensual con gráfico SVG de actividad, anillo de salud, hidratación, nutrición, cumplimiento de metas y descarga PDF (window.print) |
| Perfil | `perfil.html` | Datos personales, dispositivos vinculados (RF-04), preferencias de notificación (RF-07), selector de perfiles (Principiante/Activo/Admin) |

## Perfiles de usuario

| Perfil | Descripción | Acceso desde |
|---|---|---|
| **Principiante** | Orientación guiada, pasos simples | Perfil → Demo |
| **Activo** *(predeterminado)* | Rendimiento avanzado, wearables | Predeterminado |
| **Administrador** | Gestión de usuarios y rutinas | Perfil → Demo |

## Datos de demostración

- **Usuario demo:** Elena Martínez (elena.martinez@planfit.app)
- Contraseña demo: cualquier texto + código MFA: `123456`
- Estado hidratación, meta activa y sesiones persisten en `localStorage`

## Despliegue en hosting estático

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Netlify
Arrastra la carpeta `plan-fit/` al panel de Netlify en [app.netlify.com](https://app.netlify.com).

### GitHub Pages
1. Crea repositorio en GitHub
2. Sube el contenido de `plan-fit/` a la rama `main`
3. En Settings → Pages → Deploy from branch: `main / (root)`

## Stack

- HTML5 semántico
- CSS3 (custom properties, flexbox, grid, animations)
- [Tailwind CSS CDN](https://tailwindcss.com) (play CDN)
- [Poppins](https://fonts.google.com/specimen/Poppins) + [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)
- [Material Symbols Outlined](https://fonts.google.com/icons) (iconografía)
- JavaScript vanilla (ES6+)
- SVG inline para charts y rings
- `window.print()` para exportar PDF

## Sin dependencias externas frágiles

- Sin avatares de Google/lh3.googleusercontent
- Sin CDN de imágenes de terceros
- Sin frameworks de backend
- Funciona 100% offline (excepto fuentes de Google Fonts — opcional cachear)
