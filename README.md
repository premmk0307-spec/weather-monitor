# UK Weather + Air Quality Monitor

A React and Node.js dashboard for London, Manchester, Leicester, Birmingham and Edinburgh, with sortable weather and air-quality readings and a 12-hour temperature forecast.

## Run locally

Use Node.js 24 LTS. Open two command windows in this repository.

Backend:
```sh
cd backend
npm ci
npm run dev
```

Frontend, in the second window:
```sh
cd frontend
npm ci
npm run dev
```

Open the Local address shown by Vite (normally http://localhost:5173). Keep both windows open. The backend listens on port 4002 and the frontend proxies `/api` requests to it.

## Behaviour

- The chart starts at the current hour and includes 12 hourly readings across midnight. Axis labels and tooltip dates use Europe/London time, including daylight-saving changes.
- Data is cached for five minutes on the backend, with a fresh cache window at each hour boundary. The dashboard refreshes every five minutes. Manual refresh may reuse cached readings.
- Last updated shows when the oldest displayed city response was fetched, not the weather station observation time.
- Loading, timeout and error messages explain unavailable data. Failed refreshes preserve earlier readings and offer a retry.
- Click a city to select its forecast; sort using the column headings.

## Checks

From `backend`, run `npm test`. From `frontend`, run `npm run build`. Run `npm audit` in each folder to check dependency advisories. Commit both package-lock.json files to keep installations reproducible.

## Data and hosting

Weather is supplied by [Open-Meteo](https://open-meteo.com/). Air quality is supplied by [CAMS through Open-Meteo](https://open-meteo.com/en/docs/air-quality-api). No API key is required by this code.

Uploading the source to GitHub does not deploy the app. A live deployment needs a Node.js backend and frontend hosting configured to forward `/api` requests to that backend; the development proxy is not part of the production build.
