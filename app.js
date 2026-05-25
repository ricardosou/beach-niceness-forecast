const BEACHES = [
  { name: 'Praia de Matosinhos', lat: '41.175981', lon: '-8.692661' },
  { name: 'Praia da Memória', lat: '41.231479', lon: '-8.722214' },
  { name: 'Praia da Agudela', lat: '41.237390', lon: '-8.724200' },
  { name: 'Praia Pedras do corgo', lat: '41.246540', lon: '-8.726222' },
  { name: 'Praia Pedras brancas', lat: '41.253149', lon: '-8.724599' },
  { name: 'Praia Angeiras', lat: '41.267244', lon: '-8.727593' },
];

const LINE_COLORS = ['#0ea5e9','#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316'];

let selectedBeach = BEACHES[3];
const lineColor = LINE_COLORS[Math.floor(Math.random() * LINE_COLORS.length)];

function calculateNiceness(temp, wind) {
  const windRate = (wind >= 0 && wind <= 14) ? 1 - (wind / 14) : 0;
  const tempRate = (temp >= 20 && temp <= 36) ? (temp - 20) / 16 : 0;
  return Math.max(0, windRate * 0.7 + tempRate * 0.3);
}

async function fetchWeather(beach) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${beach.lat}&longitude=${beach.lon}&hourly=temperature_2m,wind_speed_10m&forecast_days=3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function processData(raw) {
  const now = new Date();
  const times = raw.hourly.time;
  const startIdx = times.findIndex(t => new Date(t) >= now);
  if (startIdx === -1) return [];

  return Array.from({ length: Math.min(24, times.length - startIdx) }, (_, k) => {
    const i = startIdx + k;
    const temp = raw.hourly.temperature_2m[i];
    const wind = raw.hourly.wind_speed_10m[i];
    const d = new Date(times[i]);
    return {
      labelFull: d.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      labelShort: d.toLocaleString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      temperature: temp,
      windSpeed: wind,
      niceness: calculateNiceness(temp, wind),
    };
  });
}

function updateStats(data) {
  const statsRow = document.getElementById('stats-row');
  if (!data.length) { statsRow.innerHTML = ''; return; }
  const current = data[0];
  const maxNiceness = Math.max(...data.map(d => d.niceness));
  statsRow.innerHTML = `
    <div class="stat-card"><div class="stat-label">Now</div><div class="stat-value">${(current.niceness * 100).toFixed(0)}%</div></div>
    <div class="stat-card"><div class="stat-label">Best</div><div class="stat-value">${(maxNiceness * 100).toFixed(0)}%</div></div>
    <div class="stat-card"><div class="stat-label">Temp</div><div class="stat-value">${current.temperature.toFixed(0)}°</div></div>
    <div class="stat-card"><div class="stat-label">Wind</div><div class="stat-value">${current.windSpeed.toFixed(0)}<span style="font-size:0.7rem;font-weight:400;color:#64748b"> km/h</span></div></div>
  `;
}

function renderChart(data) {
  const container = document.getElementById('chart-container');
  const mobile = window.innerWidth < 640;

  // Separate configs so text stays readable at any screen width
  const W       = mobile ? 420  : 800;
  const H       = mobile ? 340  : 400;
  const pad     = mobile
    ? { top: 20, right: 14, bottom: 52, left: 46 }
    : { top: 24, right: 24, bottom: 70, left: 52 };
  const fs      = mobile ? 19   : 11;    // font-size in viewBox units
  const every   = mobile ? 6    : 4;     // label every N points
  const dotR    = mobile ? 5    : 3.5;
  const sw      = mobile ? 3    : 2.5;
  const hoverW  = mobile ? 32   : 22;
  const getLabel = d => mobile ? d.labelShort : d.labelFull;

  const cW = W - pad.left - pad.right;
  const cH = H - pad.top  - pad.bottom;
  const n  = data.length;

  const xScale = i => pad.left + (i / (n - 1)) * cW;
  const yScale = v => pad.top  + (1 - v) * cH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(v => `
    <line x1="${pad.left}" y1="${yScale(v)}" x2="${pad.left + cW}" y2="${yScale(v)}" stroke="#f1f5f9" stroke-width="${mobile ? 2 : 1.5}"/>
    <text x="${pad.left - 8}" y="${yScale(v) + fs * 0.38}" text-anchor="end" font-size="${fs}" fill="#94a3b8" font-family="Inter,system-ui,sans-serif">${(v * 100).toFixed(0)}%</text>
  `).join('');

  const xLabels = data.map((d, i) => {
    if (i % every !== 0) return '';
    const x = xScale(i);
    if (mobile) {
      return `<text x="${x}" y="${pad.top + cH + fs + 8}" text-anchor="middle" font-size="${fs}" fill="#94a3b8" font-family="Inter,system-ui,sans-serif">${getLabel(d)}</text>`;
    }
    return `<text x="${x}" y="${pad.top + cH + 14}" text-anchor="end" transform="rotate(-40,${x},${pad.top + cH + 14})" font-size="${fs}" fill="#94a3b8" font-family="Inter,system-ui,sans-serif">${getLabel(d)}</text>`;
  }).join('');

  const linePts = data.map((d, i) => `${xScale(i)},${yScale(d.niceness)}`);
  const pathD   = `M ${linePts.join(' L ')}`;
  const fillD   = `M ${xScale(0)},${yScale(0)} L ${linePts.join(' L ')} L ${xScale(n - 1)},${yScale(0)} Z`;

  const dots = data.map((d, i) =>
    `<circle cx="${xScale(i)}" cy="${yScale(d.niceness)}" r="${dotR}" fill="${lineColor}" opacity="0.75"/>`
  ).join('');

  const hoverTargets = data.map((d, i) => {
    const x = xScale(i);
    return `<line x1="${x}" y1="${pad.top}" x2="${x}" y2="${pad.top + cH}" stroke="transparent" stroke-width="${hoverW}" data-idx="${i}" class="hover-target"/>`;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:100%;overflow:visible;display:block">
      <defs>
        <linearGradient id="fill-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${lineColor}" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="${lineColor}" stop-opacity="0.01"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${fillD}" fill="url(#fill-grad)"/>
      <path d="${pathD}" stroke="${lineColor}" stroke-width="${sw}" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
      ${xLabels}
      ${hoverTargets}
      <line id="hover-line" x1="0" y1="${pad.top}" x2="0" y2="${pad.top + cH}" stroke="${lineColor}" stroke-width="1.5" stroke-dasharray="3 3" opacity="0" pointer-events="none"/>
      <circle id="hover-dot" r="${dotR + 2.5}" fill="white" stroke="${lineColor}" stroke-width="2.5" opacity="0" pointer-events="none"/>
    </svg>
  `;

  const tooltip   = document.getElementById('tooltip');
  const hoverLine = container.querySelector('#hover-line');
  const hoverDot  = container.querySelector('#hover-dot');

  function showPoint(idx) {
    const d = data[idx];
    const x = xScale(idx);
    const y = yScale(d.niceness);
    hoverLine.setAttribute('x1', x); hoverLine.setAttribute('x2', x); hoverLine.setAttribute('opacity', '0.5');
    hoverDot.setAttribute('cx', x);  hoverDot.setAttribute('cy', y);  hoverDot.setAttribute('opacity', '1');
    tooltip.innerHTML = `
      <div class="tooltip-time">${d.labelFull}</div>
      <div>Niceness &nbsp;<strong>${(d.niceness * 100).toFixed(1)}%</strong></div>
      <div>Temp &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>${d.temperature.toFixed(1)}°C</strong></div>
      <div>Wind &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>${d.windSpeed.toFixed(1)} km/h</strong></div>`;
    tooltip.classList.remove('hidden');
  }

  function hidePoint() {
    hoverLine.setAttribute('opacity', '0');
    hoverDot.setAttribute('opacity', '0');
    tooltip.classList.add('hidden');
  }

  let touchHideTimer;

  container.querySelectorAll('.hover-target').forEach(el => {
    const idx = parseInt(el.dataset.idx);

    // Mouse events (desktop)
    el.addEventListener('mouseenter', () => showPoint(idx));
    el.addEventListener('mousemove', e => {
      tooltip.style.left = (e.pageX + 14) + 'px';
      tooltip.style.top  = (e.pageY - 10) + 'px';
    });
    el.addEventListener('mouseleave', hidePoint);

    // Touch events (mobile)
    el.addEventListener('touchstart', e => {
      e.preventDefault();
      clearTimeout(touchHideTimer);
      showPoint(idx);
      const t = e.touches[0];
      const tx = Math.min(t.pageX - 74, window.innerWidth - 170);
      tooltip.style.left = Math.max(8, tx) + 'px';
      tooltip.style.top  = (t.pageY - 130) + 'px';
    }, { passive: false });

    el.addEventListener('touchend', () => {
      touchHideTimer = setTimeout(hidePoint, 2000);
    });
  });
}

function showLoading() {
  document.getElementById('chart-container').innerHTML =
    `<div class="loading"><div class="spinner"></div><p>Loading weather data…</p></div>`;
}

function showError(msg) {
  document.getElementById('chart-container').innerHTML = `<div class="error">${msg}</div>`;
}

async function loadWeather() {
  showLoading();
  document.getElementById('beach-name').textContent = selectedBeach.name;
  const btn   = document.getElementById('refresh-btn');
  const label = document.getElementById('refresh-label');
  btn.disabled = true;
  label.textContent = 'Loading…';

  try {
    const raw  = await fetchWeather(selectedBeach);
    const data = processData(raw);
    updateStats(data);
    renderChart(data);
  } catch {
    showError('Failed to fetch weather data. Please try again.');
  } finally {
    btn.disabled = false;
    label.textContent = '↻ Refresh Data';
  }
}

function initBeachButtons() {
  const container = document.getElementById('beach-buttons');
  container.innerHTML = BEACHES.map((b, i) =>
    `<button class="beach-btn${b === selectedBeach ? ' active' : ''}" data-idx="${i}">${b.name}</button>`
  ).join('');

  container.querySelectorAll('.beach-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedBeach = BEACHES[parseInt(btn.dataset.idx)];
      container.querySelectorAll('.beach-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadWeather();
    });
  });
}

// Re-render chart on resize to pick up mobile/desktop config change
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(loadWeather, 250);
});

initBeachButtons();
loadWeather();
document.getElementById('refresh-btn').addEventListener('click', loadWeather);
