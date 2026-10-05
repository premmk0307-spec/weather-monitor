import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import NodeCache from "node-cache";
import { nextHours } from "./forecast.js";

const app = express();
app.use(cors());
const cache = new NodeCache({ stdTTL: 300 }); // 5 min cache — Open-Meteo free tier friendly

const CITIES = {
  london: { lat: 51.5072, lon: -0.1276, name: "London" },
  manchester: { lat: 53.4808, lon: -2.2426, name: "Manchester" },
  leicester: { lat: 52.6369, lon: -1.1398, name: "Leicester" },
  birmingham: { lat: 52.4862, lon: -1.8904, name: "Birmingham" },
  edinburgh: { lat: 55.9533, lon: -3.1883, name: "Edinburgh" },
};

async function fetchCity(key) {
  const cacheKey = `city:${key}:${Math.floor(Date.now() / 3600000)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { lat, lon, name } = CITIES[key];

  const [weatherRes, aqiRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m&forecast_days=2&timeformat=unixtime`,
      { signal: AbortSignal.timeout(15000) }
    ),
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`,
      { signal: AbortSignal.timeout(15000) }
    ),
  ]);
  if (!weatherRes.ok || !aqiRes.ok) throw new Error("Weather provider unavailable");
  const weather = await weatherRes.json();
  const aqi = await aqiRes.json();

  if (![weather.current?.temperature_2m, weather.current?.wind_speed_10m, aqi.current?.us_aqi].every(Number.isFinite)) {
    throw new Error("Incomplete current readings");
  }
  const result = {
    key,
    name,
    temperature: weather.current?.temperature_2m,
    windSpeed: weather.current?.wind_speed_10m,
    aqi: aqi.current?.us_aqi,
    ...nextHours(weather.hourly),
    fetchedAt: new Date().toISOString(),
  };
  cache.set(cacheKey, result);
  return result;
}

app.get("/api/cities", async (req, res) => {
  try {
    const results = await Promise.all(Object.keys(CITIES).map(fetchCity));
    res.json(results);
  } catch (err) {
    res.status(502).json({ error: "Weather data is temporarily unavailable. Please try again." });
  }
});

app.get("/api/cities/:key", async (req, res) => {
  if (!Object.hasOwn(CITIES, req.params.key)) return res.status(404).json({ error: "Unknown city" });
  try {
    res.json(await fetchCity(req.params.key));
  } catch (err) {
    res.status(502).json({ error: "Weather data is temporarily unavailable. Please try again." });
  }
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`Weather backend on :${PORT}`));
