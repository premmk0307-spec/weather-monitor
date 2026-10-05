# UK Weather + Air Quality Monitor

Live weather and air-quality readings across five UK cities, in a sortable data grid with
per-city trend charts. Uses Open-Meteo — completely free, no API key required — so this is the
quickest of the five projects to get to a polished, deployed MVP.

## Setup

1. Backend:
   ```
   cd backend
   npm install
   npm run dev     # :4002
   ```
2. Frontend:
   ```
   cd frontend
   npm install
   npm run dev      # :5173
   ```

## Architecture notes

- The backend caches each city's combined weather+AQI response for 5 minutes with `node-cache`,
  so refreshing the frontend doesn't re-hit Open-Meteo on every load — worth mentioning as a
  simple but real rate-limit/cost-control decision.
- `@tanstack/react-table` powers the sortable grid — click a column header to sort, click a row
  to load its 12-hour trend chart below. This directly matches the CV's "interactive grids"
  skill line.
- Cities are hardcoded server-side (`CITIES` map) for simplicity; swapping to a searchable list
  is a natural first extension (see below).

## Ideas to extend

- Add a city search (any UK postcode/place via Open-Meteo's geocoding endpoint) instead of a
  fixed list.
- Persist historical readings in MongoDB on each fetch, so trend charts can show real history
  instead of just the next 12 hours' forecast.
- Add a 2–3 city comparison view (small multiples of the trend chart).
