'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

export default function PerformanceChart({
    data = [],
    dataKeys = [
        { key: 'total', name: 'Assigned', color: '#8b5cf6' },     // purple
        { key: 'completed', name: 'Completed', color: '#06b6d4' } // cyan
    ],
    xAxisKey = 'name',
    height = 400,
}) {
    if (!data || data.length === 0) {
        return (
            <div className="flex bg-zinc-900/30 items-center justify-center p-8 rounded-xl border border-dashed border-white/5 text-gray-500 text-sm font-mono" style={{ height }}>
                No visualization data available for this cycle.
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black/95 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-md min-w-[160px]">
                    <p className="text-gray-400 text-xs font-mono mb-2 uppercase tracking-wider border-b border-white/5 pb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-6 py-1">
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}
                            </div>
                            <span className="text-sm font-bold" style={{ color: entry.color }}>
                                {entry.value}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <defs>
                        {dataKeys.map(({ key, color }) => (
                            <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                                <stop offset="95%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                        dataKey={xAxisKey}
                        stroke="rgba(255,255,255,0.15)"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.15)"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />
                    <Legend
                        wrapperStyle={{ paddingTop: '16px', fontSize: '11px', fontFamily: 'monospace', opacity: 0.7 }}
                        iconType="circle"
                    />
                    {dataKeys.map(({ key, name, color }) => (
                        <Area
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={name}
                            stroke={color}
                            fillOpacity={1}
                            fill={`url(#gradient-${key})`}
                            strokeWidth={2}
                            activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
                            dot={false}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
