
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from '@/types/weather';

interface WeatherChartProps {
  data: WeatherData[];
  lineColor?: string;
}

export const WeatherChart = ({ data, lineColor = '#0f172a' }: WeatherChartProps) => {
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
    <div className="w-full h-96 lg:h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 5,
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="1 1" stroke="#f1f5f9" strokeWidth={1} />
          <XAxis 
            dataKey="formattedTime" 
            angle={-45}
            textAnchor="end"
            height={60}
            fontSize={12}
            stroke="#64748b"
            fontFamily="system-ui"
            fontWeight={300}
          />
          <YAxis 
            domain={[0, 1]}
            tickFormatter={formatYAxis}
            fontSize={12}
            stroke="#64748b"
            fontFamily="system-ui"
            fontWeight={300}
          />
          <Tooltip 
            formatter={formatTooltip}
            labelStyle={{ color: '#1e293b', fontWeight: 400 }}
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              fontFamily: 'system-ui',
              fontWeight: 300
            }}
          />
          <Line 
            type="monotone" 
            dataKey="niceness" 
            stroke={lineColor} 
            strokeWidth={3}
            dot={{ fill: lineColor, strokeWidth: 0, r: 5 }}
            activeDot={{ r: 7, stroke: lineColor, strokeWidth: 2, fill: 'white' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
