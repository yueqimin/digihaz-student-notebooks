from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path

from flask import Flask, Response, jsonify, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

app = Flask(__name__, static_folder="static", static_url_path="/static")


def load_geojson(filename: str) -> dict:
    with (DATA_DIR / filename).open("r", encoding="utf-8") as handle:
        return json.load(handle)


@app.get("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")


@app.get("/data/<path:filename>")
def data_file(filename: str):
    return send_from_directory(DATA_DIR, filename)


@app.get("/api/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "service": "DIGIHAZ Module 08 WebGIS",
            "time_utc": datetime.now(timezone.utc).isoformat(),
        }
    )


@app.get("/api/sensors")
def sensors():
    payload = load_geojson("sensors.geojson")
    payload["server_meta"] = {
        "served_at_utc": datetime.now(timezone.utc).isoformat(),
        "note": "Demonstration sensor data for DIGIHAZ coursework.",
    }
    return jsonify(payload)


@app.get("/api/hazards")
def hazards():
    return jsonify(load_geojson("hazard_zones.geojson"))


@app.get("/api/sensor-history")
def sensor_history():
    csv_text = (DATA_DIR / "sensor_history.csv").read_text(encoding="utf-8")
    return Response(csv_text, mimetype="text/csv")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
