import React from 'react';
import { ColorCluster } from '../types';

interface PaletteListProps {
  clusters: ColorCluster[];
}

const PaletteList: React.FC<PaletteListProps> = ({ clusters }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-700">Detailed Breakdown</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {clusters.map((cluster, idx) => {
          const isLight = (cluster.color.r * 0.299 + cluster.color.g * 0.587 + cluster.color.b * 0.114) > 186;
          return (
            <div key={idx} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg shadow-inner border border-black/5 relative overflow-hidden"
                  style={{ backgroundColor: cluster.hex }}
                >
                    {/* Gloss effect */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"></div>
                </div>
                <div>
                  <div className="font-mono text-slate-800 font-medium text-lg">{cluster.hex}</div>
                  <div className="text-xs text-slate-400">RGB({Math.round(cluster.color.r)}, {Math.round(cluster.color.g)}, {Math.round(cluster.color.b)})</div>
                </div>
              </div>
              
              <div className="flex flex-col items-end min-w-[100px]">
                <span className="text-2xl font-bold text-slate-700">
                  {cluster.percentage.toFixed(1)}<span className="text-sm text-slate-400 font-normal">%</span>
                </span>
                <span className="text-xs text-slate-400">Coverage</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaletteList;