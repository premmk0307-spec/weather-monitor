// Epoch timestamps keep filtering correct across midnight and daylight-saving changes.
export function nextHours(hourly, now = Date.now()) {
  const start = Math.floor(now / 3600000) * 3600;
  const points = (hourly?.time ?? []).map((time, i) => ({
    time, temperature: hourly.temperature_2m?.[i],
  })).filter(({ time }) => time >= start).slice(0, 12);
  if (points.length !== 12 || points.some(({ temperature }) => !Number.isFinite(temperature))) {
    throw new Error('Incomplete hourly forecast');
  }
  return {
    hourlyTimes: points.map(({ time }) => new Date(time * 1000).toISOString()),
    hourlyTemps: points.map(({ temperature }) => temperature),
  };
}
