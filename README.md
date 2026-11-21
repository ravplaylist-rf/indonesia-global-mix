# Indonesia + Global Mix (NuvioTV catalog addon)

This is a metadata/catalog addon only. It does **not** provide streams or links to watch copyrighted media.

Catalogs included:
- 🇮🇩 Film Indonesia Trending
- 🇮🇩 Film Indonesia Terbaru
- 🇮🇩 Film Indonesia Rating Tertinggi
- 🇮🇩 Series Indonesia Trending
- 🌍 Film Global Trending
- 🌍 Series Global Trending
- ⭐ Film Global Rating Tertinggi
- ⭐ Series Global Rating Tertinggi

## Deploy to Cloudflare Workers
1. Create a Cloudflare account and a Worker.
2. Paste `worker.js` into the Worker editor and deploy.
3. In Worker **Settings → Variables and Secrets**, add secret `TMDB_READ_TOKEN` with your TMDB API Read Access Token (Bearer token).
4. Open `https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/manifest.json` to verify.
5. Add the manifest URL in NuvioTV Addons.

TMDB credentials are not included in the code. Get a token from your TMDB account/API settings. This addon makes catalog requests against TMDB API v3.


## Note on catalog IDs
Catalog preview IDs are `tmdb:<numeric-id>`. Depending on your NuvioTV build and installed metadata addons, detail pages may require a compatible TMDB metadata addon for full detail resolution.
