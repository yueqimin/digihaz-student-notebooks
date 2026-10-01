# DIGIHAZ Module 08 — Responsive Open-Source WebGIS Server

This project extends the official DIGIHAZ Module 08 Leaflet/Folium examples into a small deployable WebGIS for disaster monitoring.

## What is included

- **Raster layers:** OpenStreetMap and Esri World Imagery raster tile basemaps.
- **Vector layer:** local GeoJSON flood-hazard polygons.
- **Sensor-network layer:** local GeoJSON stations plus CSV time-series observations.
- **WebGIS server:** Flask endpoints for sensors, hazards and sensor history.
- **Responsive client:** Leaflet layout adapts to desktop, tablet and mobile.
- **Open-source deployment:** MIT licensed; runs with Python or Docker.
- **Static fallback:** the same `index.html` can be served by GitHub Pages; when Flask API routes are unavailable the client falls back to local data files.

> The station and hazard values in `data/` are **demonstration data for coursework**, not operational warnings.

## Architecture

```text
Browser (Leaflet)
  ├─ Raster tiles: OSM / Esri
  ├─ Vector hazards: /api/hazards  -> data/hazard_zones.geojson
  └─ Sensors:        /api/sensors  -> data/sensors.geojson
                         |
                    Flask app.py
                         |
                  CSV observation history
```

## Run locally

```bash
cd module_08_webgis_advanced_technologies/topic_04/webgis_server
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
python app.py
```

Open <http://127.0.0.1:8000>.

Health check:

```text
http://127.0.0.1:8000/api/health
```

## Docker deployment

```bash
docker build -t digihaz-webgis .
docker run --rm -p 8000:8000 digihaz-webgis
```

Then open <http://localhost:8000>.

## GitHub Pages (static mode)

GitHub Pages cannot run Flask, but the front end is intentionally compatible with static hosting. Publish the `webgis_server` directory with any static web server (or copy it to a Pages branch/root). The JavaScript first tries the Flask API and automatically falls back to `data/*.geojson` and `data/*.csv`.

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Server status |
| `GET /api/sensors` | Latest sensor GeoJSON |
| `GET /api/hazards` | Flood-hazard GeoJSON |
| `GET /api/sensor-history` | CSV observation history |

## Coursework evidence

The implementation demonstrates the Module 08 requirements by combining raster web tiles, vector GeoJSON and sensor-network observations in one responsive WebGIS, with reproducible open-source server deployment.

## Acknowledgements

The layout and mapping approach were adapted from the official DIGIHAZ Module 08 Leaflet/Folium examples. Leaflet and OpenStreetMap attribution is shown in the map. Esri imagery attribution is included in its tile definition.
