
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from '@/types/weather';

interface WeatherChartProps {
  data: WeatherData[];
}

export const WeatherChart = ({ data }: WeatherChartProps) => {
  const formatTooltip = (value: number, name: string) => {
    if (name === 'niceness') {
      return [`${(value * 100).toFixed(1)}%`, 'Niceness Index'];
    }
    return [value, name];
  };

  const formatYAxis = (value: number) => {
    return `${(value * 100).toFixed(0)}%`;
  };

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 60,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
          <XAxis 
            dataKey="formattedTime" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
            stroke="#6b7280"
          />
          <YAxis 
            domain={[0, 1]}
            tickFormatter={formatYAxis}
            fontSize={12}
            stroke="#6b7280"
          />
          <Tooltip 
            formatter={formatTooltip}
            labelStyle={{ color: '#374151' }}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="niceness" 
            stroke="#2563eb" 
            strokeWidth={3}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
