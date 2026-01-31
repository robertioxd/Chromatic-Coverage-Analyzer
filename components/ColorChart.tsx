import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie } from 'recharts';
import { ColorCluster } from '../types';

interface ColorChartProps {
  clusters: ColorCluster[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 rounded shadow-lg text-sm">
        <div className="flex items-center gap-2 mb-1">
          <div 
            className="w-4 h-4 rounded shadow-sm"
            style={{ backgroundColor: data.hex }}
          />
          <span className="font-bold text-slate-700">{data.hex}</span>
        </div>
        <p className="text-slate-500">Coverage: <span className="text-indigo-600 font-semibold">{data.percentage.toFixed(1)}%</span></p>
      </div>
    );
  }
  return null;
};

const ColorChart: React.FC<ColorChartProps> = ({ clusters }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Distribution Bar</h4>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={clusters}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="hex" 
                tick={{ fontSize: 12, fill: '#64748b' }} 
                width={70} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={32}>
                {clusters.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.hex} stroke="rgba(0,0,0,0.1)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Composition Pie</h4>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={clusters}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="percentage"
              >
                {clusters.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.hex} 
                    stroke="rgba(0,0,0,0.05)"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ColorChart;