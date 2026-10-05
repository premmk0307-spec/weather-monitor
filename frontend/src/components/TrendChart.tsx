import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  times: string[];
  temps: number[];
}

export default function TrendChart({ times, temps }: Props) {
  const data = times.map((t, i) => ({
    time: t,
    temp: temps[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <XAxis dataKey="time" stroke="#aab4bf" fontSize={12} tickFormatter={time => new Date(time).toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit" })} />
        <YAxis stroke="#7d8590" fontSize={12} unit="°C" />
        <Tooltip labelFormatter={time => new Date(String(time)).toLocaleString("en-GB", { timeZone: "Europe/London", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZoneName: "short" })} contentStyle={{ background: "#161b22", border: "1px solid #30363d", color: "#e6edf3" }} />
        <Line type="monotone" dataKey="temp" name="Temperature" unit="°C" stroke="#58a6ff" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
