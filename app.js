const BEACHES = [
  { name: 'Praia de Matosinhos', lat: '41.175981', lon: '-8.692661' },
  { name: 'Praia da Memória', lat: '41.231479', lon: '-8.722214' },
  { name: 'Praia da Agudela', lat: '41.237390', lon: '-8.724200' },
  { name: 'Praia Pedras do corgo', lat: '41.246540', lon: '-8.726222' },
  { name: 'Praia Pedras brancas', lat: '41.253149', lon: '-8.724599' },
  { name: 'Praia Angeiras', lat: '41.267244', lon: '-8.727593' },
];

const LINE_COLORS = ['#0f172a','#dc2626','#059669','#7c3aed','#ea580c','#0284c7','#be185d','#4338ca'];

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

  const result = [];
  for (let i = startIdx; i < Math.min(startIdx + 24, times.length); i++) {
    const temp = raw.hourly.temperature_2m[i];
    const wind = raw.hourly.wind_speed_10m[i];
    result.push({
      label: new Date(times[i]).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      temperature: temp,
      windSpeed: wind,
      niceness: calculateNiceness(temp, wind),
    });
  }
  return result;
}

function renderChart(data) {
  const container = document.getElementById('chart-container');
  const W = 800, H = 400;
  const pad = { top: 20, right: 20, bottom: 70, left: 55 };
  const cW = W - pad.left - pad.right;
  const cH = H - pad.top - pad.bottom;
  const n = data.length;

  const xScale = i => pad.left + (i / (n - 1)) * cW;
  const yScale = v => pad.top + (1 - v) * cH;

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(v => `
    <line x1="${pad.left}" y1="${yScale(v)}" x2="${pad.left + cW}" y2="${yScale(v)}" stroke="#f1f5f9" stroke-width="1"/>
    <text x="${pad.left - 8}" y="${yScale(v) + 4}" text-anchor="end" font-size="11" fill="#64748b">${(v * 100).toFixed(0)}%</text>
  `).join('');

  const xLabels = data.map((d, i) => {
    if (i % 4 !== 0) return '';
    const x = xScale(i);
    return `<text x="${x}" y="${pad.top + cH + 15}" text-anchor="end" transform="rotate(-45,${x},${pad.top + cH + 15})" font-size="11" fill="#64748b">${d.label}</text>`;
  }).join('');

  const pathD = `M ${data.map((d, i) => `${xScale(i)},${yScale(d.niceness)}`).join(' L ')}`;

  const dots = data.map((d, i) => `
    <circle cx="${xScale(i)}" cy="${yScale(d.niceness)}" r="4" fill="${lineColor}"/>
  `).join('');

  const hoverTargets = data.map((d, i) => {
    const x = xScale(i);
    return `<line x1="${x}" y1="${pad.top}" x2="${x}" y2="${pad.top + cH}" stroke="transparent" stroke-width="20" data-idx="${i}" class="hover-target" style="cursor:crosshair"/>`;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:100%;overflow:visible">
      ${gridLines}
      <path d="${pathD}" stroke="${lineColor}" stroke-width="3" fill="none"/>
      ${dots}
      ${xLabels}
      ${hoverTargets}
      <line id="hover-line" x1="0" y1="${pad.top}" x2="0" y2="${pad.top + cH}" stroke="${lineColor}" stroke-width="1" stroke-dasharray="4" opacity="0" pointer-events="none"/>
      <circle id="hover-dot" r="7" fill="white" stroke="${lineColor}" stroke-width="2" opacity="0" pointer-events="none"/>
    </svg>
  `;

  const tooltip = document.getElementById('tooltip');
  const hoverLine = container.querySelector('#hover-line');
  const hoverDot = container.querySelector('#hover-dot');

  container.querySelectorAll('.hover-target').forEach(el => {
    el.addEventListener('mouseenter', e => {
      const idx = parseInt(el.dataset.idx);
      const d = data[idx];
      const x = xScale(idx);
      const y = yScale(d.niceness);

      hoverLine.setAttribute('x1', x); hoverLine.setAttribute('x2', x); hoverLine.setAttribute('opacity', '0.4');
      hoverDot.setAttribute('cx', x); hoverDot.setAttribute('cy', y); hoverDot.setAttribute('opacity', '1');

      tooltip.innerHTML = `<div class="tooltip-time">${d.label}</div>
        <div>Niceness: ${(d.niceness * 100).toFixed(1)}%</div>
        <div>Temp: ${d.temperature.toFixed(1)}°C</div>
        <div>Wind: ${d.windSpeed.toFixed(1)} km/h</div>`;
      tooltip.classList.remove('hidden');
    });

    el.addEventListener('mousemove', e => {
      tooltip.style.left = (e.pageX + 14) + 'px';
      tooltip.style.top = (e.pageY - 10) + 'px';
    });

    el.addEventListener('mouseleave', () => {
      hoverLine.setAttribute('opacity', '0');
      hoverDot.setAttribute('opacity', '0');
      tooltip.classList.add('hidden');
    });
  });
}

function showLoading() {
  document.getElementById('chart-container').innerHTML = `
    <div class="loading"><div class="spinner"></div><p>Loading weather data...</p></div>`;
}

function showError(msg) {
  document.getElementById('chart-container').innerHTML = `<div class="error">${msg}</div>`;
}

async function loadWeather() {
  showLoading();
  document.getElementById('beach-name').textContent = selectedBeach.name;
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.textContent = 'Loading...';

  try {
    const raw = await fetchWeather(selectedBeach);
    renderChart(processData(raw));
  } catch {
    showError('Failed to fetch weather data. Please try again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Refresh Data';
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

initBeachButtons();
loadWeather();
document.getElementById('refresh-btn').addEventListener('click', loadWeather);
