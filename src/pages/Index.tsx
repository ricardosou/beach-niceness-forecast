
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeatherChart } from "@/components/WeatherChart";
import { BeachSelector } from "@/components/BeachSelector";
import { fetchWeatherData, calculateNicenessIndex } from "@/utils/weatherUtils";
import { Beach, WeatherData } from "@/types/weather";

const beaches: Beach[] = [
  { name: 'Praia de Matosinhos', coordinates: { lat: '41.175981', lon: '-8.692661' } },
  { name: 'Praia da Memória', coordinates: { lat: '41.231479', lon: '-8.722214' } },
  { name: 'Praia da Agudela', coordinates: { lat: '41.237390', lon: '-8.724200' } },
  { name: 'Praia Pedras do corgo', coordinates: { lat: '41.246540', lon: '-8.726222' } },
  { name: 'Praia Pedras brancas', coordinates: { lat: '41.253149', lon: '-8.724599' } },
  { name: 'Praia Angeiras', coordinates: { lat: '41.267244', lon: '-8.727593' } }
];

const Index = () => {
  const [selectedBeach, setSelectedBeach] = useState<Beach>(beaches[3]); // Default to Praia Pedras do corgo
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeatherData = async (beach: Beach) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching weather data for ${beach.name}`, beach.coordinates);
      const rawWeatherData = await fetchWeatherData(beach.coordinates.lat, beach.coordinates.lon);
      const processedData = calculateNicenessIndex(rawWeatherData);
      setWeatherData(processedData);
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData(selectedBeach);
  }, [selectedBeach]);

  const handleBeachChange = (beach: Beach) => {
    setSelectedBeach(beach);
  };

  const handleRefresh = () => {
    loadWeatherData(selectedBeach);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f1f5f9' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl lg:text-7xl font-light text-slate-900 mb-6 tracking-tight">
              Beach
              <span className="block font-extralight text-slate-600">Weather Index</span>
            </h1>
            <p className="text-xl lg:text-2xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
              Discover the perfect coastal conditions with our intelligent niceness algorithm that combines temperature and wind data for optimal beach experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* Main Chart Area */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl lg:text-4xl font-light text-slate-900 mb-3">
              {selectedBeach.name}
            </h2>
            <p className="text-lg text-slate-600 font-light">
              24-hour weather niceness forecast
            </p>
          </div>

          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
            <CardContent className="p-8 lg:p-12">
              {error && (
                <div className="text-red-600 text-center p-8 bg-red-50 rounded-lg mb-8 font-light">
                  {error}
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-24">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200 border-t-slate-900 mx-auto"></div>
                  <p className="mt-6 text-slate-600 font-light">Loading weather data...</p>
                </div>
              ) : weatherData.length > 0 ? (
                <WeatherChart data={weatherData} />
              ) : (
                <div className="text-center py-24 text-slate-500 font-light">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* About the Index Section */}
        <div className="mb-16">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-slate-50 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h4 className="text-lg font-medium text-slate-900 mb-4">About the Index</h4>
              <p className="text-slate-600 leading-relaxed font-light">
                Our niceness index combines temperature (18-36°C optimal) and wind conditions (0-14 km/h) to create a comprehensive beach comfort score from 0-100%.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Select Location Section */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-light text-slate-900 mb-6 text-center">Select Location</h3>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
            <CardContent className="p-8">
              <BeachSelector
                beaches={beaches}
                selectedBeach={selectedBeach}
                onBeachChange={handleBeachChange}
              />
              <Button 
                onClick={handleRefresh} 
                className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white py-3 text-base font-normal rounded-none"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-400 font-light">
            Powered by Open-Meteo weather data
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
