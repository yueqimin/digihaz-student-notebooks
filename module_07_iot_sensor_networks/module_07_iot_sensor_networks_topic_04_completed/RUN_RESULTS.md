# Topic 4 execution results

| Notebook | Result |
|---|---|
| 01 Sensor simulation | 2,880 samples / 48 h; max tilt **10.74°**; min pressure **997.35 hPa**; min pressure trend **-4.13 hPa/h**; max soil **96.49%** at 25.75 h; first storm threshold **17.82 h**; no YELLOW/RED conjunction occurred. |
| 02 Vibe coding | B satisfies the stated linear+clamped requirement; A and C are partial; D's unsupported polynomial maps the wet calibration endpoint to 50%. |
| 03 Dashboard/EWS | Synthetic fallback: **1,152 rows**, 4 sites. Fixed AND rule produced 0 YELLOW/RED samples. OR experiment: site_beta **69**, site_delta **148** YELLOW-like samples. |
| 04 Alerting | 288 readings / 24 h; full loop produced **12 transitions** (6 firing + 6 resolved), all storm-pressure events in the deterministic scenario. Extension B silencing suppressed alerts during 10:00–10:05, then fired after a fresh 120 s persistence period at 10:07:30 and resolved at 10:08:00. |

## Source-model observations
Two source narratives do not match their deterministic parameters exactly: Notebook 1 describes a storm alert preceding a later landslide alert, but the generated tilt/soil peaks do not overlap enough to trigger YELLOW/RED; Notebook 4's 30-second state-machine example reaches a 120-second persistence window at +150 s because the condition first becomes true at +30 s. The completed notebooks preserve the actual computed results rather than changing the model silently.
