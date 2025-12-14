import React from "react";

export const StatBlock = ({ label, value, trend, trendUp }: { label: string, value: string, trend?: string, trendUp?: boolean }) => (
  <div className="flex flex-col justify-between h-full p-5">
    <div className="flex justify-between items-start">
      <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">{label}</span>
      {trend && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="mt-2">
      <span className="text-3xl font-display font-medium tracking-tight text-white">{value}</span>
    </div>
  </div>
);
