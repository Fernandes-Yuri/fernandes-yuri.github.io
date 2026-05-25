/**
 * slides.js — Busca os dados dos slides via API e renderiza o DOM dinamicamente.
 *
 * Fluxo:
 *   1. guardRoute() valida o token JWT
 *   2. fetchSlides() busca os dados de /api/slides (ou mock local)
 *   3. renderAllSlides() constrói o HTML e injeta em #slide-wrap
 *   4. initNavigation() conecta a navegação (setas, teclado, swipe)
 *   5. initInteractivity() conecta botões de Kill Switch, modal Faraday etc.
 */

// ──────────────────────────────────────────────
// 1. BOOTSTRAP
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Protege a rota; redireciona para login se sem token
  if (!guardRoute()) return;

  try {
    const data = await fetchSlides();
    renderAllSlides(data.slides);
    initNavigation(data.slides.length);
    initInteractivity();
    initIntroScreen();
  } catch (err) {
    console.error('Erro ao carregar slides:', err);
    showLoadError();
  }
});

// ──────────────────────────────────────────────
// 2. BUSCA DE DADOS
// ──────────────────────────────────────────────

/**
 * Busca os dados dos slides do backend.
 * Em modo mock (MOCK_MODE=true), lê o content.json diretamente.
 * @returns {Promise<Object>} dados do content.json
 */
async function fetchSlides() {
  if (window.MOCK_MODE) {
    // Modo desenvolvimento: lê o JSON local (requer servidor local ou GitHub Pages)
    const res = await fetch('../backend/data/content.json');
    if (!res.ok) throw new Error('Falha ao carregar mock JSON');
    return res.json();
  }

  // Modo produção: requisita a API com o token JWT
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/slides`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (res.status === 401) {
    redirectToLogin();
    throw new Error('Token expirado');
  }
  if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
  return res.json();
}

function showLoadError() {
  document.getElementById('slide-wrap').innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;padding:24px;text-align:center">
      <i class="fa-solid fa-circle-exclamation" style="font-size:32px;color:var(--red)"></i>
      <div style="font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--text)">Falha ao carregar</div>
      <div style="font-size:12px;color:var(--muted)">Não foi possível buscar os dados da apresentação. Verifique sua conexão ou tente novamente.</div>
      <button onclick="location.reload()" class="btn btn-primary" style="margin-top:8px">
        <i class="fa-solid fa-rotate-right"></i> Tentar novamente
      </button>
    </div>`;
}

// ──────────────────────────────────────────────
// 3. RENDERIZAÇÃO DOS SLIDES
// ──────────────────────────────────────────────

/**
 * Renderiza todos os slides e injeta em #slide-wrap.
 * @param {Array} slides - array de objetos slide do content.json
 */
function renderAllSlides(slides) {
  const wrap = document.getElementById('slide-wrap');
  wrap.innerHTML = slides.map((s, i) => renderSlide(s, i === 0)).join('');
}

/** Dispatcher — chama o renderer correto conforme o tipo do slide */
function renderSlide(s, isActive) {
  const active = isActive ? ' active' : '';
  const tag    = renderTag(s.tag);

  let body = '';
  switch (s.type) {
    case 'hero':         body = renderHero(s);        break;
    case 'flow':         body = renderFlow(s);        break;
    case 'table':        body = renderTable(s);       break;
    case 'killswitch':   body = renderKillSwitch(s);  break;
    case 'threats':      body = renderThreats(s);     break;
    case 'compare':      body = renderCompare(s);     break;
    case 'layers':       body = renderLayers(s);      break;
    case 'compare2col':  body = renderCompare2Col(s); break;
    case 'requirements': body = renderRequirements(s);break;
    case 'timeline':     body = renderTimeline(s);    break;
    case 'carsharing':   body = renderCarsharing(s);  break;
    case 'roadmap':      body = renderRoadmap(s);     break;
    case 'author':       body = renderAuthor(s);      break;
    case 'conclusion':   body = renderConclusion(s);  break;
    case 'animation':    body = renderAnimation(s);   break;
    default:             body = `<p style="color:var(--muted)">Tipo desconhecido: ${s.type}</p>`;
  }

  return `<section class="slide${active}" id="${s.id}" data-label="${s.label}">${tag}${body}</section>`;
}

// ── Componentes comuns ──────────────────────

function renderTag(tag) {
  if (!tag) return '';
  const colorClass = tag.color && tag.color !== 'green' ? ` ${tag.color}` : '';
  return `<div class="slide-tag${colorClass}"><i class="fa-solid ${tag.icon}"></i>${tag.text}</div>`;
}

function renderTitleSub(s) {
  return `
    <h2 class="slide-title">${s.title}</h2>
    ${s.subtitle ? `<p class="slide-sub">${s.subtitle}</p>` : ''}`;
}

function renderCard(c) {
  const badge = c.badge ? `<span class="new-badge"><i class="fa-solid fa-sparkles"></i>novo</span>` : '';
  return `
    <div class="card ${c.variant}">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="card-icon ${c.icon.class}"><i class="fa-solid ${c.icon.fa}"></i></div>
        <div class="card-title">${c.title}${badge}</div>
      </div>
      <div class="card-body">${c.body}</div>
    </div>`;
}

function renderInfoBox(box) {
  if (!box) return '';
  const colorClass = box.color && box.color !== 'green' ? ` ${box.color}` : '';
  return `
    <div class="info-box${colorClass}">
      <i class="fa-solid ${box.icon}" style="color:var(--${box.color === 'green' ? 'accent' : box.color});margin-right:6px"></i>
      ${box.text}
    </div>`;
}

// ── Renderers por tipo ──────────────────────

function renderHero(s) {
  const cards = (s.cards || []).map(renderCard).join('');
  const hint  = s.swipeHint ? `<div class="swipe-hint" style="margin-top:16px"><i class="fa-solid fa-chevron-right"></i> deslize para avançar</div>` : '';
  return `
    <div class="hero-title">${s.heroTitle}</div>
    <p style="font-size:12.5px;color:var(--muted);margin:10px 0 16px;line-height:1.7;max-width:320px">${s.subtitle}</p>
    <div class="g1">${cards}</div>
    ${hint}`;
}

function renderFlow(s) {
  const steps = (s.flowSteps || []).map(step => `
    <div class="flow-step">
      <div class="flow-num ${step.color !== 'green' ? step.color : ''}">${step.num}</div>
      <div class="flow-title">${step.title}</div>
      <div class="flow-desc">${step.desc}</div>
    </div>`).join('');

  const grid2 = s.grid2 ? `<div class="g2">${s.grid2.map(c => `
    <div class="card">
      <div class="card-icon ${c.icon.class}"><i class="fa-solid ${c.icon.fa}"></i></div>
      <div class="card-title">${c.title}</div>
      <div class="card-body">${c.body}</div>
    </div>`).join('')}</div>` : '';

  return `${renderTitleSub(s)}<div class="flow-wrap">${steps}</div>${grid2}${renderInfoBox(s.infoBox)}`;
}

function renderTable(s) {
  const headerCells = s.tableHeaders.map((h, i) => {
    const icons = ['', '<i class="fa-solid fa-times-circle"></i> ', '<i class="fa-solid fa-check-circle"></i> '];
    const colors = ['', 'color:var(--red);', 'color:var(--accent);'];
    return `<th style="${colors[i] || ''}">${icons[i] || ''}${h}</th>`;
  }).join('');

  const rows = (s.tableRows || []).map(row => `
    <tr>
      <td>${row[0]}</td>
      <td class="${row[1].class}">${row[1].text}</td>
      <td class="${row[2].class}">${row[2].text}</td>
    </tr>`).join('');

  return `${renderTitleSub(s)}
    <div class="table-wrap">
      <table class="data-table">
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${renderInfoBox(s.infoBox)}`;
}

function renderKillSwitch(s) {
  const cards = (s.cards || []).map(renderCard).join('');
  return `${renderTitleSub(s)}
    <div class="kill-switch-demo" style="margin-bottom:14px">
      <div style="font-family:var(--font-head);font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Painel do Gestor — PÁTIO 360</div>
      <button class="ks-btn" onclick="animateKill()"><i class="fa-solid fa-power-off"></i> KILL SWITCH — Bloquear Todos</button>
      <div class="ks-status" id="ks-status">Todos os dispositivos ativos · 12 veículos liberados</div>
    </div>
    <div class="g1">${cards}</div>`;
}

function renderThreats(s) {
  const items = (s.threats || []).map(t => {
    const iconColor = t.badge === 'tb-high' ? 'red' : (t.badge === 'tb-med' ? 'amber' : 'accent');
    return `
      <div class="threat-card">
        <div class="threat-header">
          <div class="threat-badge ${t.badge}">${t.badgeText}</div>
          <div class="card-title" style="font-size:12px">
            <i class="fa-solid ${t.icon.fa}" style="color:var(--${iconColor});margin-right:5px"></i>${t.title}
          </div>
        </div>
        <div class="card-body">${t.body}</div>
      </div>`;
  }).join('');

  const balance = s.balanceBox ? `
    <div style="background:var(--accent-dim);border:1px solid rgba(0,229,160,.2);border-radius:10px;padding:14px">
      <div style="font-family:var(--font-head);font-size:10px;font-weight:700;color:var(--accent);margin-bottom:6px">
        <i class="fa-solid fa-scale-balanced"></i> Balanço de Risco
      </div>
      <div style="font-size:12px;color:var(--muted);line-height:1.6">${s.balanceBox.text}</div>
    </div>` : '';

  return `${renderTitleSub(s)}<div class="g1">${items}${balance}</div>`;
}

function renderCompare(s) {
  const cols = (s.compareColumns || []).map(col => {
    const dotColor = col.color === 'accent' ? 'var(--accent)' : `var(--${col.color})`;
    const bgColor  = col.color === 'accent' ? 'var(--accent-dim)' : `var(--${col.color}-dim)`;
    const borderC  = col.color === 'accent' ? 'rgba(0,229,160,.2)' : `rgba(${col.color === 'red' ? '255,77,109' : '0,229,160'},.2)`;

    const items = col.items.map((item, i) => `
      <div class="compare-item" ${i === col.items.length - 1 ? 'style="border-bottom:none"' : ''}>
        <div class="ci-dot" style="background:${dotColor}"></div>
        <div style="font-size:12px;color:var(--muted)">${item}</div>
      </div>`).join('');

    return `
      <div style="background:${bgColor};border:1px solid ${borderC};border-radius:10px;padding:14px">
        <div class="compare-col-title" style="color:${dotColor}">
          <i class="fa-solid ${col.icon}"></i> ${col.title}
        </div>
        ${items}
      </div>`;
  }).join('');

  return `${renderTitleSub(s)}<div class="flex-col" style="gap:10px">${cols}</div>${renderInfoBox(s.infoBox)}`;
}

function renderLayers(s) {
  const colorMap = {
    accent: { bg: 'rgba(0,229,160,.08)', border: 'rgba(0,229,160,.15)', cssVar: 'var(--accent)' },
    blue:   { bg: 'rgba(59,158,255,.06)',  border: 'rgba(59,158,255,.12)',  cssVar: 'var(--blue)' },
    amber:  { bg: 'rgba(245,166,35,.06)',  border: 'rgba(245,166,35,.12)',  cssVar: 'var(--amber)' },
    red:    { bg: 'rgba(255,77,109,.06)',   border: 'rgba(255,77,109,.12)',  cssVar: 'var(--red)' },
  };

  const items = (s.layers || []).map(l => {
    const c = colorMap[l.color] || colorMap.accent;
    return `
      <div class="layer-item" style="background:${c.bg};border:1px solid ${c.border}">
        <div class="layer-num" style="color:${c.cssVar}">${l.num}</div>
        <div>
          <div class="layer-label"><i class="fa-solid ${l.icon}" style="color:${c.cssVar};margin-right:6px"></i>${l.label}</div>
          <div class="layer-desc">${l.desc}</div>
        </div>
      </div>`;
  }).join('');

  return `${renderTitleSub(s)}<div class="layer-stack">${items}</div>${renderInfoBox(s.infoBox)}`;
}

function renderCompare2Col(s) {
  const renderCol = (col, isAfter) => {
    const cssColor = col.color === 'accent' ? 'var(--accent)' : `var(--${col.color})`;
    const icon     = isAfter ? 'fa-check-circle' : 'fa-times-circle';
    const variant  = `${col.color}-l`;
    const cards    = col.cards.map(c => `
      <div class="card ${variant}">
        <div class="card-title">${c.title}</div>
        <div class="card-body">${c.body}</div>
      </div>`).join('');
    return `
      <div class="flex-col" style="gap:8px;margin-bottom:12px">
        <div style="font-family:var(--font-head);font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${cssColor}">
          <i class="fa-solid ${icon}"></i> ${col.label}
        </div>
        ${cards}
      </div>`;
  };

  return `${renderTitleSub(s)}
    ${renderCol(s.colBefore, false)}
    ${renderCol(s.colAfter, true)}`;
}

function renderRequirements(s) {
  const blocks = (s.reqBlocks || []).map(b => {
    const rows = b.rows.map(r => `
      <div class="req-row">
        <i class="fa-solid fa-circle-dot req-icon" style="color:var(--${b.color === 'green' ? 'accent' : b.color})"></i>
        <div class="req-text">${r}</div>
      </div>`).join('');
    return `
      <div class="req-block">
        <div class="req-header ${b.color}"><i class="fa-solid ${b.icon}"></i> ${b.label}</div>
        ${rows}
      </div>`;
  }).join('');

  return `${renderTitleSub(s)}${blocks}`;
}

function renderTimeline(s) {
  const items = (s.timelineItems || []).map(item => `
    <div class="tl-item">
      <div class="tl-line">
        <div class="tl-num ${item.color !== 'green' ? item.color : ''}">${item.num}</div>
        <div class="tl-bar"></div>
      </div>
      <div class="tl-content">
        <div class="tl-title">${item.title}</div>
        <div class="tl-desc">${item.desc}</div>
      </div>
    </div>`).join('');

  return `${renderTitleSub(s)}<div class="timeline">${items}</div>`;
}

function renderCarsharing(s) {
  const steps = (s.csSteps || []).map(step => `
    <div class="cs-step">
      <div class="cs-step-num">${step.num}</div>
      <div class="cs-step-title">${step.title}</div>
      <div class="cs-step-desc">${step.desc}</div>
    </div>`).join('');

  const stats = (s.stats || []).map(st => `
    <div class="stat">
      <div class="stat-val" style="color:var(--${st.color})">${st.val}</div>
      <div class="stat-lbl">${st.lbl}</div>
    </div>`).join('');

  return `${renderTitleSub(s)}
    ${renderInfoBox(s.infoBox)}
    <div class="flex-col" style="gap:10px;margin-bottom:12px">${steps}</div>
    <div class="g2">${stats}</div>`;
}

function renderRoadmap(s) {
  const cols = (s.roadmapCols || []).map(col => {
    const items = col.items.map(item => `
      <div class="roadmap-item">
        <i class="fa-solid fa-circle-check ${item.color !== 'green' ? item.color : ''}"></i>
        ${item.text}
      </div>`).join('');
    return `
      <div class="roadmap-col">
        <div class="roadmap-phase ${col.phase}">${col.phaseLabel}</div>
        <div class="roadmap-col-title">${col.title}</div>
        ${items}
      </div>`;
  }).join('');

  return `${renderTitleSub(s)}<div class="g1">${cols}</div>${renderInfoBox(s.infoBox)}`;
}

function renderAuthor(s) {
  const a     = s.authorCard;
  const cards = (s.cards || []).map(renderCard).join('');
  const quote = s.quoteBox ? `
    <div style="background:var(--accent-dim);border:1px solid rgba(0,229,160,.2);border-radius:10px;padding:14px">
      <div style="font-family:var(--font-head);font-size:10px;font-weight:700;color:var(--accent);margin-bottom:6px">
        <i class="fa-solid fa-quote-left"></i> ${s.quoteBox.label}
      </div>
      <div style="font-size:12px;color:var(--muted);line-height:1.6">${s.quoteBox.text}</div>
    </div>` : '';

  return `${renderTitleSub(s)}
    <div style="background:var(--surface2);border:1px solid var(--border2);border-radius:12px;padding:16px;display:flex;gap:14px;align-items:center;margin-bottom:12px">
      <div style="width:48px;height:48px;border-radius:50%;background:var(--accent-dim2);border:2px solid rgba(0,229,160,.3);display:flex;align-items:center;justify-content:center;font-family:var(--font-head);font-size:16px;font-weight:800;color:var(--accent);flex-shrink:0">${a.initials}</div>
      <div>
        <div style="font-family:var(--font-head);font-size:15px;font-weight:800;color:var(--text);letter-spacing:-.01em">${a.name}</div>
        <div style="font-size:11px;color:var(--muted);margin-top:2px">${a.role}</div>
        <div style="font-size:11px;color:var(--muted)">${a.program}</div>
      </div>
    </div>
    <div class="g1">${cards}${quote}</div>`;
}

function renderConclusion(s) {
  const points = (s.approvalPoints || []).map(p => `
    <div style="font-size:12px;color:var(--muted);display:flex;gap:8px;align-items:flex-start">
      <i class="fa-solid fa-circle-dot" style="color:var(--${p.color === 'green' ? 'accent' : p.color});margin-top:3px;font-size:9px;flex-shrink:0"></i>
      ${p.text}
    </div>`).join('');

  return `${renderTitleSub(s)}
    <div class="final-quote" style="margin-bottom:14px">${s.finalQuote}</div>
    <div class="card" style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="card-icon ci-green"><i class="fa-solid fa-check-double"></i></div>
        <div class="card-title">Por que aprovar?</div>
      </div>
      <div class="flex-col" style="gap:5px;margin-top:2px">${points}</div>
    </div>
    <div style="background:var(--accent);border-radius:10px;padding:14px 18px;display:flex;align-items:center;gap:14px">
      <i class="fa-solid fa-comments" style="color:var(--bg);font-size:18px;flex-shrink:0"></i>
      <div style="font-family:var(--font-head);font-size:12px;font-weight:700;color:var(--bg);line-height:1.45">
        ${s.ctaBox.text}<br>
        <span style="font-weight:400;font-size:11px">${s.ctaBox.sub}</span>
      </div>
    </div>
    ${s.pdfUrl ? `
    <a href="${s.pdfUrl}" target="_blank" rel="noopener" download
      style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:10px;padding:13px 18px;background:var(--surface2);border:1px solid var(--border2);border-radius:10px;text-decoration:none;cursor:pointer">
      <i class="fa-solid fa-file-pdf" style="color:var(--red);font-size:16px"></i>
      <div>
        <div style="font-family:var(--font-head);font-size:12px;font-weight:700;color:var(--text)">Baixar proposta em PDF</div>
        <div style="font-size:10px;color:var(--muted);margin-top:1px">Documento completo para leitura offline</div>
      </div>
      <i class="fa-solid fa-arrow-down" style="color:var(--muted);font-size:12px;margin-left:auto"></i>
    </a>` : ''}
    `;
}

function renderAnimation(s) {
  const id = s.id;
  return `
    ${renderTitleSub(s)}
    <div style="display:flex;flex-direction:column;gap:10px">

      <!-- Cenário A -->
      <div class="anim-scenario" id="${id}-scA">
        <div class="anim-scenario-label red">
          <i class="fa-solid fa-triangle-exclamation"></i> ${s.scenarioA.label}
        </div>
        <div class="anim-stage" id="${id}-stageA">
          <!-- operador central sobrecarregado -->
          <div class="anim-operator overloaded" id="${id}-opA">
            <div class="anim-avatar red-av">
              <i class="fa-solid fa-user"></i>
            </div>
            <div class="anim-key-cloud" id="${id}-cloud">
              <i class="fa-solid fa-key"></i><i class="fa-solid fa-key"></i>
              <i class="fa-solid fa-key"></i><i class="fa-solid fa-key"></i>
              <i class="fa-solid fa-key"></i><i class="fa-solid fa-key"></i>
            </div>
            <div class="anim-label">${s.scenarioA.operatorLabel}</div>
          </div>
          <!-- 4 operadores aguardando -->
          <div class="anim-waiting-row">
            ${[1,2,3,4].map(n => `
              <div class="anim-waiting-op" id="${id}-wop${n}">
                <div class="anim-avatar muted-av"><i class="fa-solid fa-user"></i></div>
                <div class="anim-wait-dot"></div>
              </div>`).join('')}
          </div>
          <div class="anim-label muted" style="text-align:center;margin-top:4px">${s.scenarioA.waitLabel}</div>
        </div>
      </div>

      <!-- Cenário B -->
      <div class="anim-scenario" id="${id}-scB">
        <div class="anim-scenario-label green">
          <i class="fa-solid fa-circle-check"></i> ${s.scenarioB.label}
        </div>
        <div class="anim-stage" id="${id}-stageB">
          <div class="anim-ops-row">
            ${[1,2,3,4,5].map(n => `
              <div class="anim-free-op" id="${id}-fop${n}">
                <div class="anim-avatar green-av"><i class="fa-solid fa-user"></i></div>
                <div class="anim-phone" id="${id}-ph${n}">
                  <i class="fa-solid fa-mobile-screen"></i>
                  <div class="anim-scan-line" id="${id}-scan${n}"></div>
                </div>
                <div class="anim-plate" id="${id}-pl${n}">
                  <i class="fa-solid fa-car"></i>
                </div>
              </div>`).join('')}
          </div>
          <div class="anim-label" style="text-align:center;color:var(--accent);margin-top:4px">${s.scenarioB.freeLabel}</div>
        </div>
      </div>

    </div>

    <style>
      .anim-scenario { background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px 14px; }
      .anim-scenario-label { font-family:var(--font-head);font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;display:flex;align-items:center;gap:6px; }
      .anim-scenario-label.red { color:var(--red); }
      .anim-scenario-label.green { color:var(--accent); }
      .anim-stage { display:flex;flex-direction:column;align-items:center;gap:8px; }
      .anim-avatar { width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0; }
      .red-av { background:var(--red-dim);color:var(--red);border:2px solid rgba(255,77,109,.3); }
      .muted-av { background:var(--surface);color:var(--muted2);border:2px solid var(--border); }
      .green-av { background:var(--accent-dim2);color:var(--accent);border:2px solid rgba(0,229,160,.3); }
      .anim-label { font-size:10px;color:var(--muted);font-family:var(--font-head);font-weight:600;letter-spacing:.04em; }
      .anim-label.muted { color:var(--muted2); }

      /* Cenário A */
      .anim-operator { display:flex;flex-direction:column;align-items:center;gap:4px; }
      .anim-key-cloud { display:flex;flex-wrap:wrap;gap:4px;justify-content:center;max-width:80px;margin:2px 0; }
      .anim-key-cloud i { font-size:10px;color:var(--red);opacity:.7;animation:key-wobble 1.4s ease-in-out infinite; }
      .anim-key-cloud i:nth-child(2) { animation-delay:.15s; }
      .anim-key-cloud i:nth-child(3) { animation-delay:.3s; }
      .anim-key-cloud i:nth-child(4) { animation-delay:.45s; }
      .anim-key-cloud i:nth-child(5) { animation-delay:.6s; }
      .anim-key-cloud i:nth-child(6) { animation-delay:.75s; }
      @keyframes key-wobble {
        0%,100% { transform:rotate(-10deg) scale(1); opacity:.7; }
        50% { transform:rotate(10deg) scale(1.15); opacity:1; }
      }
      .anim-waiting-row { display:flex;gap:12px;justify-content:center;align-items:flex-end; }
      .anim-waiting-op { display:flex;flex-direction:column;align-items:center;gap:4px; }
      .anim-wait-dot { width:6px;height:6px;border-radius:50%;background:var(--amber);animation:wait-pulse 1.2s ease-in-out infinite; }
      .anim-waiting-op:nth-child(2) .anim-wait-dot { animation-delay:.3s; }
      .anim-waiting-op:nth-child(3) .anim-wait-dot { animation-delay:.6s; }
      .anim-waiting-op:nth-child(4) .anim-wait-dot { animation-delay:.9s; }
      @keyframes wait-pulse {
        0%,100% { opacity:.3;transform:scale(1); }
        50% { opacity:1;transform:scale(1.4); }
      }

      /* Cenário B */
      .anim-ops-row { display:flex;gap:8px;justify-content:center;align-items:flex-end; }
      .anim-free-op { display:flex;flex-direction:column;align-items:center;gap:3px; }
      .anim-phone { position:relative;font-size:16px;color:var(--accent);line-height:1; }
      .anim-scan-line {
        position:absolute;top:20%;left:0;right:0;height:2px;
        background:linear-gradient(90deg,transparent,var(--accent),transparent);
        animation:scan 1.6s ease-in-out infinite;
        border-radius:1px;
      }
      .anim-free-op:nth-child(2) .anim-scan-line { animation-delay:.32s; }
      .anim-free-op:nth-child(3) .anim-scan-line { animation-delay:.64s; }
      .anim-free-op:nth-child(4) .anim-scan-line { animation-delay:.96s; }
      .anim-free-op:nth-child(5) .anim-scan-line { animation-delay:1.28s; }
      @keyframes scan {
        0% { top:10%;opacity:0; }
        20% { opacity:1; }
        80% { opacity:1; }
        100% { top:80%;opacity:0; }
      }
      .anim-plate { font-size:10px;color:var(--muted);animation:plate-flash 1.6s ease-in-out infinite; }
      .anim-free-op:nth-child(2) .anim-plate { animation-delay:.32s; }
      .anim-free-op:nth-child(3) .anim-plate { animation-delay:.64s; }
      .anim-free-op:nth-child(4) .anim-plate { animation-delay:.96s; }
      .anim-free-op:nth-child(5) .anim-plate { animation-delay:1.28s; }
      @keyframes plate-flash {
        0%,40% { color:var(--muted);transform:scale(1); }
        60% { color:var(--accent);transform:scale(1.2); }
        100% { color:var(--muted);transform:scale(1); }
      }
    </style>`;
}

// ──────────────────────────────────────────────
// 4. NAVEGAÇÃO
// ──────────────────────────────────────────────

let currentSlide = 0;
let totalSlides  = 0;

function initNavigation(total) {
  totalSlides = total;

  // Atualiza estado inicial
  goTo(0);

  // Botões
  document.getElementById('btn-prev').addEventListener('click', () => go(-1));
  document.getElementById('btn-next').addEventListener('click', () => go(1));

  // Teclado
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') go(-1);
    if (e.key === 'Escape') closeFaradayModal();
  });

  // Touch / swipe
  const wrap = document.getElementById('slide-wrap');
  let touchStartX = 0, touchStartY = 0;
  wrap.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  }, { passive: true });
}

function goTo(n) {
  const slides = document.querySelectorAll('.slide');
  if (!slides.length) return;

  slides[currentSlide].classList.remove('active');
  slides[n].scrollTop = 0;
  currentSlide = n;
  slides[currentSlide].classList.add('active');

  const label = slides[currentSlide].dataset.label || `Slide ${n + 1}`;
  document.getElementById('hdr-counter').textContent = `${currentSlide + 1} / ${totalSlides}`;
  document.getElementById('hdr-label').textContent   = label;
  document.getElementById('footer-label').textContent = label;
  document.getElementById('prog-fill').style.width   = `${(currentSlide + 1) / totalSlides * 100}%`;
  document.getElementById('btn-prev').disabled = currentSlide === 0;

  const btnNext = document.getElementById('btn-next');
  if (currentSlide === totalSlides - 1) {
    btnNext.innerHTML = 'Reiniciar <i class="fa-solid fa-rotate-right"></i>';
  } else {
    btnNext.innerHTML = 'Próximo <i class="fa-solid fa-chevron-right"></i>';
  }
}

function go(dir) {
  const next = currentSlide + dir;
  if (next < 0) return;
  if (next >= totalSlides) { goTo(0); return; }
  goTo(next);
}

// ──────────────────────────────────────────────
// 5. INTERATIVIDADE
// ──────────────────────────────────────────────

function initInteractivity() {
  // Modal Faraday — fechar ao clicar fora ou no X
  const overlay = document.getElementById('faraday-modal');
  overlay.addEventListener('click', e => { if (e.target === overlay) closeFaradayModal(); });
  document.getElementById('modal-close-btn').addEventListener('click', closeFaradayModal);
}

function closeFaradayModal() {
  document.getElementById('faraday-modal').classList.remove('open');
}

// Exporta openFaradayModal para uso inline nos slides renderizados
window.openFaradayModal = function() {
  document.getElementById('faraday-modal').classList.add('open');
};

/**
 * Animação do Kill Switch (slide 6).
 * Chamada pelo onclick do botão .ks-btn gerado no HTML.
 */
window.animateKill = function() {
  const btn    = document.querySelector('.ks-btn');
  const status = document.getElementById('ks-status');
  if (!btn || !status) return;

  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Bloqueando...';
  btn.style.background = 'var(--amber)';

  setTimeout(() => {
    btn.innerHTML = '<i class="fa-solid fa-lock"></i> BLOQUEADO — 12 Veículos';
    btn.style.background = '#444';
    status.innerHTML = '<span style="color:var(--red)"><i class="fa-solid fa-circle" style="font-size:8px;margin-right:4px"></i>Todos os acessos revogados · 0 sessões ativas</span><br>Restauração exige re-autenticação individual pelo gestor.';
  }, 1500);

  setTimeout(() => {
    btn.innerHTML = '<i class="fa-solid fa-power-off"></i> KILL SWITCH — Bloquear Todos';
    btn.style.background = 'var(--red)';
    status.textContent   = 'Todos os dispositivos ativos · 12 veículos liberados';
  }, 5000);
};

// ──────────────────────────────────────────────
// 6. INTRO SCREEN
// ──────────────────────────────────────────────

function initIntroScreen() {
  const introBtn = document.getElementById('intro-cta-btn');
  if (introBtn) introBtn.addEventListener('click', startPresentation);
}

function startPresentation() {
  const intro = document.getElementById('intro-screen');
  const app   = document.getElementById('app');
  intro.classList.add('hiding');
  setTimeout(() => {
    intro.style.display = 'none';
    app.classList.add('visible');
  }, 600);
}
