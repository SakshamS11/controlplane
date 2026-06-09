"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["#00d1b2", "#7c5cff", "#b8f35a", "#35c8ff", "#ff6b57", "#ffb84d"];

export function AreaMetricChart({ data, dataKey, stroke = "#00d1b2" }: { data: object[]; dataKey: string; stroke?: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`fill-${dataKey}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor={stroke} stopOpacity={0.28} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#dce6df" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6f8f88" />
        <YAxis tick={{ fontSize: 11 }} stroke="#6f8f88" />
        <Tooltip />
        <Area type="monotone" dataKey={dataKey} stroke={stroke} fill={`url(#fill-${dataKey})`} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLineChart({ data, keys }: { data: object[]; keys: { key: string; color: string; name: string }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dce6df" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6f8f88" />
        <YAxis tick={{ fontSize: 11 }} stroke="#6f8f88" />
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
        <CartesianGrid strokeDasharray="3 3" stroke="#dce6df" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#6f8f88" />
        <YAxis tick={{ fontSize: 11 }} stroke="#6f8f88" />
        <Tooltip />
        <Bar dataKey={dataKey} radius={[5, 5, 0, 0]} fill="#00d1b2" />
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
