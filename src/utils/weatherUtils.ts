import { WeatherData } from '@/types/weather';

// Weather thresholds (same as Python code)
const WIND_MIN_THRESHOLD = 0;
const WIND_MAX_THRESHOLD = 14;
const WIND_MID_THRESHOLD = (WIND_MAX_THRESHOLD - WIND_MIN_THRESHOLD) / 2;
const WIND_RATIO = 0.7;

const TEMP_MIN_THRESHOLD = 20;
const TEMP_MAX_THRESHOLD = 36;
const TEMP_MID_THRESHOLD = (TEMP_MAX_THRESHOLD - TEMP_MIN_THRESHOLD);
const TEMP_RATIO = 0.3;

interface OpenMeteoResponse {
  hourly: {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    wind_speed_80m: number[];
    apparent_temperature: number[];
  };
}

export const fetchWeatherData = async (lat: string, lon: string): Promise<OpenMeteoResponse> => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m,wind_speed_80m,apparent_temperature&forecast_days=3`;
  
  console.log('Fetching weather data from:', url);
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  console.log('Weather data received:', data);
  
  return data;
};

export const calculateNicenessIndex = (weatherData: OpenMeteoResponse): WeatherData[] => {
  const result: WeatherData[] = [];
  const now = new Date();

  // Always process the next 24 hours starting from the current hour
  const times = weatherData.hourly.time;
  const startIndex = times.findIndex((t) => new Date(t) >= now);
  if (startIndex === -1) {
    console.warn('No future hours found in weather data.');
    return result;
  }
  const endIndex = Math.min(startIndex + 24, times.length);

  for (let i = startIndex; i < endIndex; i++) {
    const time = times[i];
    const temp = weatherData.hourly.temperature_2m[i];
    const wind = weatherData.hourly.wind_speed_10m[i];

    // Calculate wind rate (same logic as Python)
    const hourlyWindRate = (wind >= WIND_MIN_THRESHOLD && wind <= WIND_MAX_THRESHOLD)
      ? 1 - ((wind - WIND_MIN_THRESHOLD) / WIND_MAX_THRESHOLD)
      : 0;

    // Calculate temperature rate (same logic as Python)
    const hourlyTempRate = (temp >= TEMP_MIN_THRESHOLD && temp <= TEMP_MAX_THRESHOLD)
      ? ((temp - TEMP_MIN_THRESHOLD) / TEMP_MID_THRESHOLD)
      : 0;

    // Calculate niceness index
    const nicenessIndex = Math.max(0, hourlyWindRate * WIND_RATIO + hourlyTempRate * TEMP_RATIO);

    // Format time for display
    const dateObj = new Date(time);
    const formattedTime = dateObj.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    result.push({
      time,
      formattedTime,
      temperature: temp,
      windSpeed: wind,
      windRate: hourlyWindRate,
      tempRate: hourlyTempRate,
      niceness: nicenessIndex
    });
  }

  console.log('Processed weather data:', result);
  return result;
};
