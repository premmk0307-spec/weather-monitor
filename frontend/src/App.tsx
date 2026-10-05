import { useEffect, useState } from "react";
import CityTable, { CityReading } from "./components/CityTable";
import TrendChart from "./components/TrendChart";

interface FullCity extends CityReading {
  hourlyTimes: string[];
  hourlyTemps: number[];
  fetchedAt: string;
}

export default function App() {
  const [cities, setCities] = useState<FullCity[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    let pending = false;
    let controller: AbortController | undefined;
    async function load() {
      if (pending) return;
      pending = true;
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller?.abort(), 20000);
      setLoading(true);
      try {
        const res = await fetch("/api/cities", { signal: controller.signal });
        if (!res.ok) throw new Error("Weather request failed");
        const data: FullCity[] = await res.json();
        if (!Array.isArray(data) || !data.length || data.some(city =>
          !city.key || !city.name || !Number.isFinite(Date.parse(city.fetchedAt)) ||
          !Array.isArray(city.hourlyTimes) || !Array.isArray(city.hourlyTemps)
        )) throw new Error("Incomplete response");
        if (active) {
          setCities(data);
          setSelectedKey(key => data.some(city => city.key === key) ? key : data[0].key);
          setError("");
        }
      } catch {
        if (active) setError("Unable to refresh weather data. Check your connection and try again.");
      } finally {
        window.clearTimeout(timeout);
        pending = false;
        if (active) setLoading(false);
      }
    }
    void load();
    const interval = window.setInterval(load, 5 * 60 * 1000);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(interval);
    };
  }, [attempt]);

  const selected = cities.find(city => city.key === selectedKey);
  const updated = cities.length ? new Date(Math.min(...cities.map(city => Date.parse(city.fetchedAt)))) : null;

  return (
    <main className="container">
      <h1>🌦 UK Weather + Air Quality Monitor</h1>
      <p>Click a city to see its hourly forecast. Click a column heading to sort.</p>
      <div className="status-bar">
        <p role="status">{loading ? "Loading weather…" : updated ? <>Last updated: <time dateTime={updated.toISOString()}>{updated.toLocaleString("en-GB", { timeZone: "Europe/London" })}</time> (UK time) · Refreshes every 5 minutes</> : "No readings available yet."}</p>
        <button disabled={loading} onClick={() => setAttempt(value => value + 1)}>{loading ? "Refreshing…" : error ? "Try again" : "Refresh"}</button>
      </div>
      {error && <p role="alert" className="error">{error}{cities.length > 0 && " Showing the last successfully loaded readings."}</p>}
      {cities.length > 0 && <div className="table-scroll"><CityTable cities={cities} onSelect={setSelectedKey} /></div>}
      {selected && (
        <section style={{ marginTop: 24 }}>
          <h2>{selected.name} — 12-hour forecast</h2>
          <p>From the current hour · Times shown in UK local time.</p>
          <TrendChart times={selected.hourlyTimes} temps={selected.hourlyTemps} />
        </section>
      )}
      <footer>Weather data: <a href="https://open-meteo.com/">Open-Meteo</a>. Air quality: <a href="https://open-meteo.com/en/docs/air-quality-api">CAMS via Open-Meteo</a>.</footer>
    </main>
  );
}
