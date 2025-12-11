# NYC EatsAI

A Create React App single-page experience for NYC restaurant discovery, paired with an Express API that enriches results with external data providers.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set your API keys in a `.env` file at the project root:

```
XAI_API_KEY=your_xai_key
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
YELP_API_KEY=your_optional_yelp_key
PORT=5000
```

3. Run the client and API together:

```bash
npm run dev
```

The React client runs on [http://localhost:3000](http://localhost:3000) and proxies `/api/tea` to the Express server on port 5000.

## Production Build

```bash
npm run build
npm start
```

`npm start` serves the compiled React build and the `/api/tea` endpoint from the same Express server.

### Offline defaults

If you have not set API keys, `/api/tea` will return a small set of sample NYC restaurants from `data/restaurants.json` so the UI remains usable in development and preview deployments.
