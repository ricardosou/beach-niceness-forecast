
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Beach Weather Niceness Index</h1>
          <p className="text-lg text-gray-600">
            Discover the perfect beach conditions for the next 24 hours
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Beach</CardTitle>
                <CardDescription>
                  Choose a beach to view its weather conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BeachSelector
                  beaches={beaches}
                  selectedBeach={selectedBeach}
                  onBeachChange={handleBeachChange}
                />
                <Button 
                  onClick={handleRefresh} 
                  className="w-full mt-4"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Refresh Data'}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>{selectedBeach.name}</CardTitle>
                <CardDescription>
                  Niceness index based on temperature and wind conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                
                {loading ? (
                  <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading weather data...</p>
                  </div>
                ) : weatherData.length > 0 ? (
                  <WeatherChart data={weatherData} />
                ) : (
                  <div className="text-center p-8 text-gray-500">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
