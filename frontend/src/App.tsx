import { useEffect, useState } from "react";
import CityTable, { CityReading } from "./components/CityTable";
import TrendChart from "./components/TrendChart";

interface FullCity extends CityReading {
  hourlyTimes: string[];
  hourlyTemps: number[];
}

export default function App() {
  const [cities, setCities] = useState<FullCity[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/cities");
      const data = await res.json();
      setCities(data);
      if (!selectedKey && data.length) setSelectedKey(data[0].key);
    }
    load();
    const interval = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  const selected = cities.find((c) => c.key === selectedKey);

  return (
    <div className="container">
      <h1>🌦 UK Weather + Air Quality Monitor</h1>
      <p style={{ opacity: 0.6 }}>Click a row to see its hourly trend below.</p>

      <CityTable cities={cities} onSelect={setSelectedKey} />

      {selected && (
        <div style={{ marginTop: 24 }}>
          <h3>{selected.name} — next 12 hours</h3>
          <TrendChart times={selected.hourlyTimes} temps={selected.hourlyTemps} />
        </div>
      )}
    </div>
  );
}
