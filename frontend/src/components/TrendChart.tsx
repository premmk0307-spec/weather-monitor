import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  times: string[];
  temps: number[];
}

export default function TrendChart({ times, temps }: Props) {
  const data = times.map((t, i) => ({
    time: t.slice(11, 16), // HH:MM
    temp: temps[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <XAxis dataKey="time" stroke="#7d8590" fontSize={12} />
        <YAxis stroke="#7d8590" fontSize={12} unit="°C" />
        <Tooltip contentStyle={{ background: "#161b22", border: "1px solid #30363d" }} />
        <Line type="monotone" dataKey="temp" stroke="#58a6ff" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
