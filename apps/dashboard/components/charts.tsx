"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#5B3DFF", "#16C7E8", "#10B981", "#F59E0B", "#E11D48", "#64748B"];

export function AreaMetricChart({ data, dataKey, stroke = "#5B3DFF", threshold, thresholdLabel }: { data: object[]; dataKey: string; stroke?: string; threshold?: number; thresholdLabel?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor={stroke} stopOpacity={0.28} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
        <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
        <Tooltip />
        {threshold !== undefined ? (
          <ReferenceLine
            y={threshold}
            stroke="#F59E0B"
            strokeDasharray="5 4"
            label={thresholdLabel ? { value: thresholdLabel, position: "insideTopRight", fill: "#92400E", fontSize: 10 } : undefined}
          />
        ) : null}
        <Area type="monotone" dataKey={dataKey} stroke={stroke} fill={`url(#fill-${dataKey})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLineChart({ data, keys }: { data: object[]; keys: { key: string; color: string; name: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
        <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
        <Tooltip />
        {keys.map((item) => <Line key={item.key} dataKey={item.key} name={item.name} stroke={item.color} dot={false} strokeWidth={2} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarMetricChart({ data, dataKey }: { data: object[]; dataKey: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
        <YAxis tick={{ fontSize: 11 }} stroke="#64748B" />
        <Tooltip />
        <Bar dataKey={dataKey} radius={[5, 5, 0, 0]} fill="#5B3DFF" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={2}>
          {data.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
