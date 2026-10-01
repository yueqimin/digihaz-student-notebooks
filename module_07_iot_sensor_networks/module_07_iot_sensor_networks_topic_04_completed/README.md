# Module 07 — Topic 04: Grafana / IoT Dashboard, Alerts and Simulation — Completed

This package was prepared from the current DigiHaz GitHub source for **Module 7 → Topic 4**. The four Topic 4 notebooks were executed in the modes supported by the source material:

- `01_sensor_simulation_mqtt.ipynb` — deterministic sensor simulation; MQTT payload generation in offline/mock mode.
- `02_vibe_coding_lab.ipynb` — all four candidate functions tested; diagnosis, prompt, code review and final reflection completed.
- `03_dashboard_ews_integration.ipynb` — source-approved **synthetic fallback** used because no InfluxDB token was supplied; local dashboard and EWS threshold experiment executed.
- `04_alerting_exercise.ipynb` — alert state machine executed; Telegram/ntfy kept in mock mode; **Extension B (planned-maintenance silencing)** implemented and tested.
- `exercise.ipynb` — completed dashboard/EWS notebook, provided under the student-repo template filename.

## Grafana / field-deployment files
`dashboard/digihaz_dashboard.json` is importable into Grafana after choosing the InfluxDB datasource. `alerts/grafana_alert_rules.json` contains RED, YELLOW, storm-pressure and sensor-offline rules. `dashboard/mqtt_to_influx_bridge.py` forwards `digihaz/+/all` MQTT messages to InfluxDB, and `dashboard/digihaz-bridge.service` provides an always-on Raspberry Pi/systemd deployment template.

## Important execution limitation
The execution sandbox had no outbound network access and no user credentials. Therefore it would be inaccurate to claim that public MQTT, live InfluxDB, Telegram, ntfy.sh, or Grafana Cloud were contacted. The Topic 4 source notebooks themselves explicitly support synthetic/mock operation for these cases. Local numerical logic, plots, state-machine behavior, assignments and threshold experiments were executed successfully.
