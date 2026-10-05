import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import NodeCache from "node-cache";

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
  const cacheKey = `city:${key}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const { lat, lon, name } = CITIES[key];

  const [weatherRes, aqiRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,weather_code&hourly=temperature_2m&forecast_days=1`
    ),
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`
    ),
  ]);
  const weather = await weatherRes.json();
  const aqi = await aqiRes.json();

  const result = {
    key,
    name,
    temperature: weather.current?.temperature_2m,
    windSpeed: weather.current?.wind_speed_10m,
    aqi: aqi.current?.us_aqi,
    hourlyTemps: weather.hourly?.temperature_2m?.slice(0, 12) ?? [],
    hourlyTimes: weather.hourly?.time?.slice(0, 12) ?? [],
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
    res.status(502).json({ error: err.message });
  }
});

app.get("/api/cities/:key", async (req, res) => {
  if (!CITIES[req.params.key]) return res.status(404).json({ error: "Unknown city" });
  try {
    res.json(await fetchCity(req.params.key));
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`Weather backend on :${PORT}`));
