
export interface Beach {
  name: string;
  coordinates: {
    lat: string;
    lon: string;
  };
}

export interface WeatherData {
  time: string;
  formattedTime: string;
  temperature: number;
  windSpeed: number;
  windRate: number;
  tempRate: number;
  niceness: number;
}
