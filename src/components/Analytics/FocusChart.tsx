import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DailyStatPoint } from '../../services/types';

interface FocusChartProps {
  data: DailyStatPoint[];
}

export const FocusChart: React.FC<FocusChartProps> = ({ data }) => {
  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    focus: d.focus_minutes,
  }));

  return (
    <div className="w-full h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#64748b"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              borderColor: 'rgba(168, 85, 247, 0.3)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)',
              color: '#f8fafc',
              fontSize: '12px',
            }}
          />
          <Bar
            dataKey="focus"
            name="Focus Minutes"
            fill="#a855f7"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
