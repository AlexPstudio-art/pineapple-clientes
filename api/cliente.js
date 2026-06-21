// /api/cliente.js
// Portal de cliente: GET /cliente/:slug -> este endpoint (via rewrite en vercel.json)
// Lee la fila correspondiente en la base "CRM Clientes" de Notion (por "Slug portal")
// y renderiza una página de avance del proyecto.

const DATA_SOURCE_ID = '37d31127-693f-80ea-8b0e-000bca3c1c9f';

const FASES = [
  '01 Onboarding',
  '02 Investigación',
  '03 Estrategia',
  '04 Ejecución',
  '05 Presentación',
  '06 Ajustes',
  '07 Entrega',
  '08 Cierre'
];

const FASE_DESC = {
  '01 Onboarding': 'Arrancamos el proyecto, alineamos visión y expectativas.',
  '02 Investigación': 'Analizamos tu mercado, competencia y a tu audiencia.',
  '03 Estrategia': 'Definimos el rumbo: posicionamiento, mensaje y plan.',
  '04 Ejecución': 'Estamos diseñando, escribiendo y construyendo tu proyecto.',
  '05 Presentación': 'Te mostramos el trabajo y recogemos tu retroalimentación.',
  '06 Ajustes': 'Afinamos los detalles según lo que conversamos.',
  '07 Entrega': 'Preparamos todos los archivos y accesos finales.',
  '08 Cierre': 'Proyecto entregado. ¡Gracias por confiar en Pineapple!'
};

const STATUS_LABEL = {
  'Prospecto': 'Prospecto',
  'Activo': 'Activo',
  'En pausa': 'En pausa',
  'Cerrado': 'Cerrado'
};

const STATUS_COLOR = {
  'Prospecto': { bg: '#2a2a2a', fg: '#aaa' },
  'Activo': { bg: '#FFD600', fg: '#000' },
  'En pausa': { bg: '#3a3a3a', fg: '#e0b35c' },
  'Cerrado': { bg: '#2a2a2a', fg: '#888' }
};

module.exports = async (req, res) => {
  const slug = (req.query && req.query.slug ? String(req.query.slug) : '').trim();

  const send = (html, status) => {
    res.status(status || 200);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  };

  if (!slug) {
    return send(renderMessage('Portal no encontrado', 'No encontramos este link. Si crees que es un error, escríbenos.'), 404);
  }

  if (!process.env.NOTION_API_KEY) {
    return send(renderMessage('Portal en construcción', 'Estamos terminando de configurar este portal. Vuelve en un momento.'), 503);
  }

  try {
    const notionRes = await fetch(`https://api.notion.com/v1/data_sources/${DATA_SOURCE_ID}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
        'Notion-Version': '2025-09-03',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: { property: 'Slug portal', rich_text: { equals: slug } },
        page_size: 1
      })
    });

    if (!notionRes.ok) {
      return send(renderMessage('No pudimos cargar tu portal', 'Intenta de nuevo en unos minutos. Si el problema sigue, escríbenos.'), 502);
    }

    const data = await notionRes.json();
    const page = data.results && data.results[0];

    if (!page) {
      return send(renderMessage('Portal no encontrado', 'No encontramos este link. Si crees que es un error, escríbenos.'), 404);
    }

    const props = page.properties || {};
    const nombre = getTitle(props['Nombre']) || 'tu proyecto';
    const tipo = getSelect(props['Tipo de proyecto']) || '';
    const fase = getSelect(props['Fase']) || FASES[0];
    const status = getSelect(props['Status']) || 'Prospecto';

    return send(renderPortal({ nombre, tipo, fase, status }), 200);
  } catch (err) {
    return send(renderMessage('Ocurrió un error', 'Intenta de nuevo en unos minutos. Si el problema sigue, escríbenos.'), 500);
  }
};

function getTitle(prop) {
  if (!prop || !Array.isArray(prop.title)) return '';
  return prop.title.map((t) => t.plain_text).join('');
}
function getSelect(prop) {
  if (!prop || !prop.select) return '';
  return prop.select.name || '';
}
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function baseStyles() {
  return `
@font-face{font-family:'NimbusSans';src:url('../fonts/NimbusSanL-Reg.woff2') format('woff2');font-weight:400;font-style:normal;font-display:swap;}
@font-face{font-family:'NimbusSans';src:url('../fonts/NimbusSanL-Bol.woff2') format('woff2');font-weight:700;font-style:normal;font-display:swap;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{--y:#FFD600;--b:#000;--w:#fff;--g:#555;--gl:#888;--bdk:#1c1c1c;--blt:#e0e0e0;--fh:'Barlow Condensed',sans-serif;--fb:'NimbusSans',Helvetica,Arial,sans-serif;--px:64px;--nh:76px;}
body{background:var(--b);color:var(--w);font-family:var(--fb);-webkit-font-smoothing:antialiased;}
nav{height:var(--nh);background:var(--b);border-bottom:1px solid var(--bdk);display:flex;align-items:center;padding:0 var(--px);}
.hero{padding:56px var(--px) 48px;background:var(--b);}
.ey{font-size:11px;font-weight:400;letter-spacing:.2em;text-transform:uppercase;color:var(--gl);margin-bottom:18px;display:flex;align-items:center;gap:14px;}
.ey::before{content:'';display:block;width:20px;height:1px;background:var(--y);}
.title{font-family:var(--fh);font-size:clamp(40px,7vw,76px);font-weight:900;line-height:.95;text-transform:uppercase;letter-spacing:-.01em;margin-bottom:18px;}
.title em{font-style:normal;color:var(--y);}
.sub{font-size:15px;color:var(--gl);line-height:1.7;max-width:520px;margin-bottom:24px;}
.badge{display:inline-flex;align-items:center;gap:8px;font-family:var(--fb);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:8px 16px;}
.steps{background:var(--w);padding:64px var(--px) 80px;}
.steps-h{font-family:var(--fh);font-size:clamp(28px,4vw,42px);font-weight:700;text-transform:uppercase;color:var(--b);margin-bottom:8px;}
.steps-sub{font-size:13px;color:var(--g);margin-bottom:48px;}
.step-list{max-width:680px;}
.step{display:flex;gap:20px;position:relative;padding-bottom:36px;}
.step:last-child{padding-bottom:0;}
.step-line{position:absolute;left:15px;top:34px;bottom:0;width:2px;background:var(--blt);}
.step:last-child .step-line{display:none;}
.step.done .step-line{background:var(--y);}
.step-dot{width:32px;height:32px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:900;font-size:13px;border:2px solid var(--blt);color:#bbb;background:var(--w);z-index:1;}
.step.done .step-dot{background:var(--y);border-color:var(--y);color:var(--b);}
.step.current .step-dot{background:var(--b);border-color:var(--b);color:var(--y);}
.step-body{padding-top:3px;}
.step-name{font-family:var(--fb);font-weight:700;font-size:15px;color:#bbb;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em;}
.step.done .step-name,.step.current .step-name{color:var(--b);}
.step-desc{font-size:13px;color:#999;line-height:1.6;display:none;max-width:440px;}
.step.current .step-desc{display:block;color:var(--g);}
.sf{background:var(--b);border-top:1px solid var(--bdk);padding:44px var(--px);display:grid;grid-template-columns:1fr auto;align-items:center;gap:40px;}
.ftl{font-family:var(--fh);font-size:12px;font-weight:300;letter-spacing:.2em;text-transform:uppercase;color:var(--g);margin-top:10px;}
.fcp{font-size:11px;color:var(--g);margin-top:5px;}
.fc{display:flex;flex-direction:column;align-items:flex-end;gap:10px;}
.fl{font-size:13px;color:var(--gl);text-decoration:none;display:flex;align-items:center;gap:9px;}
.fl:hover{color:var(--y);}
.msg-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--b);padding:40px;text-align:center;}
.msg-title{font-family:var(--fh);font-size:clamp(32px,6vw,56px);font-weight:900;text-transform:uppercase;color:var(--w);margin-bottom:16px;}
.msg-body{font-size:14px;color:var(--gl);max-width:420px;margin:0 auto 28px;line-height:1.7;}
@media(max-width:768px){:root{--px:22px;--nh:64px;}.sf{grid-template-columns:1fr;}.fc{align-items:flex-start;}}
`;
}

function logoSvg() {
  return `<svg width="140" height="40" viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg"><path fill="#FFD600" d="M105.85,20.43c-5.88-5.2-12.44-6.97-24.89-6.97h-35.83v91.21h20.51v-31.04h19.28c10.53,0,17.5-2.6,22.97-8.34,5.2-5.47,7.8-12.72,7.8-21.06,0-9.85-3.56-18.19-9.85-23.8ZM81.78,56.12H19.97v-25.16h61.81c8.07,0,12.99,4.65,12.99,12.58s-4.92,12.58-12.99,12.58Z"/><rect fill="#FFD600" x="115.7" y="73.51" width="25.16" height="25.16"/><path fill="#fff" d="M190.03,81.47c-1.28-2.12-3.32-3.89-6.12-5.32-2.8-1.43-7.45-2.84-13.93-4.24-2.62-.54-4.28-1.13-4.98-1.77-.72-.61-1.08-1.3-1.08-2.06,0-1.05.44-1.94,1.31-2.67.87-.73,2.17-1.1,3.9-1.1,2.1,0,3.74.49,4.93,1.47.97.8,1.65,2.01,2.08,3.59h14.19c-.65-4.82-2.55-8.35-5.7-10.58-3.22-2.28-7.9-3.42-14.03-3.42-5,0-8.93.63-11.8,1.88-2.87,1.25-5.02,2.98-6.45,5.17-1.43,2.19-2.14,4.52-2.14,6.99,0,3.75,1.4,6.84,4.19,9.27,2.77,2.42,7.41,4.37,13.91,5.83,3.97.87,6.5,1.8,7.6,2.78,1.09.98,1.64,2.09,1.64,3.34,0,1.31-.57,2.46-1.72,3.45-1.15.99-2.78,1.49-4.89,1.49-2.84,0-5.02-.97-6.55-2.91-.78-1-1.33-2.41-1.68-4.17h-14.28c.44,4.76,2.21,8.7,5.31,11.8,3.14,3.14,8.8,4.71,16.96,4.71,4.65,0,8.5-.67,11.56-2.01,3.06-1.34,5.43-3.31,7.14-5.91,1.7-2.6,2.55-5.43,2.55-8.51,0-2.62-.64-4.99-1.91-7.1Z"/><path fill="#fff" d="M286.72,72.83c-1.31-1.4-2.81-2.44-4.5-3.14-1.69-.7-3.57-1.05-5.65-1.05-4.26,0-7.76,1.53-10.53,4.58-2.76,3.06-4.14,7.46-4.14,13.23,0,5.15,1.25,9.53,3.75,13.13s6.12,5.4,10.85,5.4c2.36,0,4.5-.5,6.42-1.51,1.44-.76,3.03-2.24,4.78-4.42v5.14h12.47v-47.99h-13.46v16.63ZM285.11,93.22c-1.14,1.33-2.55,2-4.26,2-1.59,0-2.93-.66-4.01-1.98-1.08-1.32-1.62-3.4-1.62-6.24,0-3.03.52-5.19,1.57-6.48,1.05-1.29,2.35-1.93,3.9-1.93,1.77,0,3.23.67,4.39,2.01,1.16,1.34,1.73,3.38,1.73,6.11,0,3.01-.57,5.18-1.7,6.52Z"/><polygon fill="#fff" points="316.82 56.02 303.49 56.02 303.49 104.15 316.82 104.15 316.82 69.38 308.3 69.38 316.82 65.09 316.82 56.02"/><path fill="#fff" d="M355.74,74.69c-3.56-4.04-8.82-6.06-15.78-6.06-6.09,0-10.92,1.72-14.5,5.16-3.58,3.44-5.37,7.81-5.37,13.11,0,5.7,2.12,10.3,6.35,13.82,3.45,2.84,7.97,4.26,13.55,4.26,6.26,0,11.17-1.71,14.72-5.12,3.55-3.42,5.32-7.8,5.32-13.14,0-4.76-1.43-8.76-4.29-12.02ZM344.79,93.78c-1.23,1.46-2.81,2.19-4.73,2.19s-3.48-.74-4.73-2.23-1.88-3.78-1.88-6.88.63-5.33,1.9-6.83,2.87-2.24,4.81-2.24c1.83,0,3.37.74,4.62,2.21,1.24,1.47,1.87,3.72,1.87,6.73,0,3.23-.62,5.58-1.85,7.04Z"/><path fill="#fff" d="M245.15,69.42v20.09c0,2.77-2.24,5.01-5.01,5.01s-5.01-2.24-5.01-5.01v-20.09h-25.84v-13.23l-13.55,6.84v6.38h-3.8v9.76h3.86v12.23c0,3.88.38,6.69,1.13,8.42.75,1.73,1.92,3.02,3.49,3.87,1.57.85,4.02,1.28,7.33,1.28,2.86,0,5.94-.36,9.23-1.08l-.98-9.2c-1.77.57-3.14.85-4.13.85-1.09,0-1.86-.37-2.29-1.11-.28-.48-.42-1.46-.42-2.94v-12.32h12.22v8.8c0,10.25,8.31,18.56,18.56,18.56h0c10.25,0,18.56-8.31,18.56-18.56v-18.56h-13.36Z"/></svg>`;
}

function footer() {
  return `<footer class="sf">
    <div>${logoSvg()}<div class="ftl">Creamos experiencias visuales</div><div class="fcp">Querétaro, México · pstudio.com.mx · © 2025</div></div>
    <div class="fc">
      <a href="https://wa.me/522281059335" class="fl" target="_blank"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>228 105 9335</a>
      <a href="mailto:hola@pstudio.com.mx" class="fl"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 6l-10 7L2 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>hola@pstudio.com.mx</a>
    </div>
  </footer>`;
}

function renderMessage(title, body) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="robots" content="noindex, nofollow"/>
<title>${escapeHtml(title)} · Pineapple Studio</title>
<style>${baseStyles()}</style>
</head>
<body>
<div class="msg-wrap">
  <div>
    ${logoSvg()}
    <div class="msg-title" style="margin-top:32px;">${escapeHtml(title)}</div>
    <div class="msg-body">${escapeHtml(body)}</div>
    <a href="https://wa.me/522281059335" class="fl" style="justify-content:center;">Escríbenos por WhatsApp</a>
  </div>
</div>
</body>
</html>`;
}

function renderPortal({ nombre, tipo, fase, status }) {
  const faseIdx = Math.max(0, FASES.indexOf(fase));
  const statusColor = STATUS_COLOR[status] || STATUS_COLOR['Prospecto'];
  const statusLabel = STATUS_LABEL[status] || status;

  const stepsHtml = FASES.map((f, i) => {
    const cls = i < faseIdx ? 'done' : i === faseIdx ? 'current' : '';
    const num = i < faseIdx ? '✓' : String(i + 1).padStart(2, '0');
    return `<div class="step ${cls}">
      <div class="step-line"></div>
      <div class="step-dot">${num}</div>
      <div class="step-body">
        <div class="step-name">${escapeHtml(f.slice(3))}</div>
        <div class="step-desc">${escapeHtml(FASE_DESC[f] || '')}</div>
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="robots" content="noindex, nofollow"/>
<title>Portal de ${escapeHtml(nombre)} · Pineapple Studio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;700;900&display=swap" rel="stylesheet">
<style>${baseStyles()}</style>
</head>
<body>
<nav><a href="/">${logoSvg()}</a></nav>
<section class="hero">
  <div class="ey">Portal de Proyecto · Pineapple Studio</div>
  <h1 class="title">Hola,<br><em>${escapeHtml(nombre)}.</em></h1>
  <p class="sub">${tipo ? 'Tu proyecto de ' + escapeHtml(tipo) + ' va avanzando. Aquí puedes ver en qué fase estamos.' : 'Aquí puedes ver en qué fase está tu proyecto.'}</p>
  <span class="badge" style="background:${statusColor.bg};color:${statusColor.fg};">${escapeHtml(statusLabel)}</span>
</section>
<section class="steps">
  <div class="steps-h">Tu avance</div>
  <div class="steps-sub">Fase actual: ${escapeHtml(fase.slice(3))}</div>
  <div class="step-list">${stepsHtml}</div>
</section>
${footer()}
</body>
</html>`;
}
