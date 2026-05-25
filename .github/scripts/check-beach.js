// Daily beach niceness check — mirrors the logic in app.js
// Runs in Node.js 18+ (built-in fetch, no dependencies)

const { appendFileSync } = require('fs');

const BEACH = { name: 'Praia Pedras do Corgo', lat: '41.246540', lon: '-8.726222' };
const PAGE_URL = 'https://ricardosou.github.io/beach-niceness-forecast/';

function calculateNiceness(temp, wind) {
  const windRate = (wind >= 0 && wind <= 14) ? 1 - (wind / 14) : 0;
  const tempRate = (temp >= 20 && temp <= 36) ? (temp - 20) / 16 : 0;
  return Math.max(0, windRate * 0.7 + tempRate * 0.3);
}

async function main() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${BEACH.lat}&longitude=${BEACH.lon}&hourly=temperature_2m,wind_speed_10m&forecast_days=2&timezone=Europe%2FLisbon`;

  console.log(`Fetching weather for ${BEACH.name}…`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
  const data = await res.json();

  // Get today's date string in Lisbon time (YYYY-MM-DD)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Lisbon' });
  console.log(`Checking hours for ${today} between 08:00 and 19:00…`);

  const goodHours = [];
  for (let i = 0; i < data.hourly.time.length; i++) {
    const [date, timeStr] = data.hourly.time[i].split('T');
    if (date !== today) continue;

    const hour = parseInt(timeStr);
    if (hour < 8 || hour >= 19) continue;

    const temp     = data.hourly.temperature_2m[i];
    const wind     = data.hourly.wind_speed_10m[i];
    const niceness = calculateNiceness(temp, wind);

    console.log(`  ${timeStr}  temp=${temp}°C  wind=${wind}km/h  niceness=${(niceness * 100).toFixed(0)}%`);

    if (niceness >= 0.5) goodHours.push({ timeStr, niceness, temp, wind });
  }

  const outputFile = process.env.GITHUB_OUTPUT;

  if (goodHours.length > 0) {
    console.log(`\n✅ ${goodHours.length} good hour(s) found — sending alert.`);

    const rows = goodHours.map(h =>
      `  ${h.timeStr}  →  ${(h.niceness * 100).toFixed(0)}%  (${h.temp}°C, ${h.wind} km/h wind)`
    ).join('\n');

    const body = [
      `Good news! ${BEACH.name} looks promising today. 🏖️`,
      ``,
      `Hours with niceness ≥ 50% (between 08:00–19:00):`,
      rows,
      ``,
      `See the full forecast: ${PAGE_URL}`,
    ].join('\n');

    if (outputFile) {
      appendFileSync(outputFile, `beach_alert=true\n`);
      appendFileSync(outputFile, `email_body<<BODY\n${body}\nBODY\n`);
    }
  } else {
    console.log(`\nℹ️  No hours above 50% niceness today. No alert needed.`);
    if (outputFile) appendFileSync(outputFile, `beach_alert=false\n`);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
