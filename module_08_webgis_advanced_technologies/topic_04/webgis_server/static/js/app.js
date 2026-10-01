const map = L.map("map", { zoomControl: true }).setView([10.04, 105.78], 11);

const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const esri = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 18,
    attribution: "Tiles &copy; Esri and contributors"
  }
);

L.control.scale({ imperial: false }).addTo(map);

const hazardLayer = L.geoJSON(null, {
  style: feature => ({
    color: "#296a9b",
    weight: 2,
    fillColor: feature.properties.level === "High" ? "#d95d58" : "#4a97c8",
    fillOpacity: feature.properties.level === "High" ? 0.24 : 0.18
  }),
  onEachFeature: (feature, layer) => {
    const p = feature.properties;
    layer.bindPopup(`<strong>${p.name}</strong><br>Hazard level: ${p.level}<br>${p.note}`);
  }
}).addTo(map);

const sensorLayer = L.layerGroup().addTo(map);

L.control.layers(
  { "OpenStreetMap (raster)": osm, "Esri World Imagery (raster)": esri },
  { "Flood hazard zones (vector)": hazardLayer, "Sensor network": sensorLayer },
  { collapsed: false }
).addTo(map);

let historyRows = [];
let historyChart = null;

function sensorColor(status) {
  if (status === "alert") return "#d64b4b";
  if (status === "watch") return "#e1a120";
  return "#2d9d78";
}

async function fetchWithFallback(apiUrl, staticUrl, parser = r => r.json()) {
  try {
    const response = await fetch(apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return { data: await parser(response), mode: "server" };
  } catch (_) {
    const response = await fetch(staticUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Fallback failed: ${response.status}`);
    return { data: await parser(response), mode: "static" };
  }
}

function setServerMode(mode) {
  const dot = document.getElementById("status-dot");
  const label = document.getElementById("server-status");
  dot.classList.remove("online", "static");
  if (mode === "server") {
    dot.classList.add("online");
    label.textContent = "Flask API online";
  } else {
    dot.classList.add("static");
    label.textContent = "Static data mode";
  }
}

function parseCsv(text) {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  return lines.filter(Boolean).map(line => {
    const cells = line.split(",");
    return Object.fromEntries(headers.map((h, i) => [h, cells[i]]));
  });
}

function updateSummary(features) {
  const alerts = features.filter(f => f.properties.status === "alert").length;
  const maxLevel = Math.max(...features.map(f => Number(f.properties.water_level_m)));
  document.getElementById("metric-stations").textContent = features.length;
  document.getElementById("metric-alerts").textContent = alerts;
  document.getElementById("metric-level").textContent = maxLevel.toFixed(2);
}

function updateStationPanel(feature) {
  const p = feature.properties;
  document.getElementById("station-details").innerHTML = `
    <div><strong>Station</strong> ${p.station_id}</div>
    <div><strong>Name</strong> ${p.name}</div>
    <div><strong>Water level</strong> ${p.water_level_m.toFixed(2)} m</div>
    <div><strong>Rainfall (1 h)</strong> ${p.rainfall_mm_1h.toFixed(1)} mm</div>
    <div><strong>Status</strong> ${p.status.toUpperCase()}</div>
    <div><strong>Updated</strong> ${p.observed_at}</div>
  `;
  drawHistory(p.station_id);
}

function drawHistory(stationId) {
  const rows = historyRows.filter(r => r.station_id === stationId);
  const labels = rows.map(r => r.timestamp.replace("2026-10-01T", "").replace("+08:00", ""));
  const values = rows.map(r => Number(r.water_level_m));

  if (historyChart) historyChart.destroy();
  const ctx = document.getElementById("history-chart");
  historyChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Water level (m)",
        data: values,
        borderWidth: 2,
        tension: 0.25,
        pointRadius: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: false } }
    }
  });
}

function renderSensors(featureCollection) {
  sensorLayer.clearLayers();
  const features = featureCollection.features || [];
  updateSummary(features);

  features.forEach(feature => {
    const [lng, lat] = feature.geometry.coordinates;
    const p = feature.properties;
    const marker = L.circleMarker([lat, lng], {
      radius: 8,
      color: "#ffffff",
      weight: 2,
      fillColor: sensorColor(p.status),
      fillOpacity: 0.95
    });

    marker.bindTooltip(`${p.station_id}: ${p.water_level_m.toFixed(2)} m`);
    marker.bindPopup(
      `<strong>${p.name}</strong><br>
       Water level: ${p.water_level_m.toFixed(2)} m<br>
       Rainfall (1 h): ${p.rainfall_mm_1h.toFixed(1)} mm<br>
       Status: ${p.status.toUpperCase()}`
    );
    marker.on("click", () => updateStationPanel(feature));
    marker.addTo(sensorLayer);
  });
}

async function loadAll() {
  const [sensorsResult, hazardsResult, historyResult] = await Promise.all([
    fetchWithFallback("/api/sensors", "data/sensors.geojson"),
    fetchWithFallback("/api/hazards", "data/hazard_zones.geojson"),
    fetchWithFallback("/api/sensor-history", "data/sensor_history.csv", r => r.text())
  ]);

  setServerMode(sensorsResult.mode);
  hazardLayer.addData(hazardsResult.data);
  historyRows = parseCsv(historyResult.data);
  renderSensors(sensorsResult.data);
}

loadAll().catch(error => {
  document.getElementById("server-status").textContent = "Data load error";
  console.error(error);
});

setInterval(async () => {
  try {
    const result = await fetchWithFallback("/api/sensors", "data/sensors.geojson");
    setServerMode(result.mode);
    renderSensors(result.data);
  } catch (error) {
    console.error("Sensor refresh failed", error);
  }
}, 30000);

window.addEventListener("resize", () => map.invalidateSize());
