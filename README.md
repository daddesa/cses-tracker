# CSES Real-Time Orbital Tracker



![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-success) *https://daddesa.github.io/cses-tracker/*



## Project Overview

This repository contains a real-time, client-side web application designed to track the orbits and telemetry of the **CSES-01** and **CSES-02** (China Seismo-Electromagnetic Satellite) missions. 



Built as an independent project, the application calculates satellite positions, altitudes, and kinematic data dynamically using SGP4/SDP4 propagation models, relying on live Two-Line Element (TLE) sets fetched directly from public CelesTrak APIs. The goal is to provide a lightweight, accessible tool to visualize the satellite's journey across the globe and its interaction with the near-Earth environment.



##  The CSES Mission Context

**CSES** is a constellation of scientific satellites developed through a collaboration between the China National Space Administration (CNSA) and the Italian Space Agency (ASI). The mission investigates the near-Earth electromagnetic environment and its potential correlation with seismic and volcanic activity.



Operating in a sun-synchronous Low Earth Orbit (LEO) at an altitude of approximately 500 km, the satellites continuously monitor the ionosphere, magnetosphere, and the Van Allen radiation belts. 

The satellites are equipped with a suite of highly sensitive instruments, including search-coil magnetometers, electric field detectors, plasma analyzers, and the **High-Energy Particle Detector (HEPD)**. By mapping perturbations in plasma density, electromagnetic waves, and particle fluxes, the CSES mission aims to identify pre-seismic anomalies, advancing our understanding of lithosphere-atmosphere-ionosphere coupling mechanisms.



## Core Features & Physics Engine



### Orbital & Telemetry Tracking

* **Real-Time TLE Processing:** Fetches the latest orbital elements directly from CelesTrak without intermediate proxy servers.

* **Kinematic Propagation:** Uses `satellite.js` to compute geodetic coordinates (latitude, longitude, altitude) and velocity at a 1 Hz refresh rate.

* **Geomagnetic Approximation:** Implements a dipole magnetic field model to estimate the local magnetic intensity ($nT$) based on the current coordinates and altitude of the spacecraft.



### Environment & Network Mapping

* **SAA Visualization:** Renders the boundary geometry of the South Atlantic Anomaly (SAA), a crucial region where the Earth's inner Van Allen belt dips close to the surface, affecting onboard instruments.

* **Dynamic Footprint:** Visualizes an approximate 2,400 km line-of-sight radius, representing the constraints for telemetry downlink.

* **Ground Station Logic:** Continuously calculates the haversine distance between the satellites and global ground stations (e.g., Fucino, Kiruna, Beijing).



## Local Setup & Execution

Due to modern browser security restrictions, running the `index.html` file directly from your filesystem will result in CORS errors, preventing the application from fetching live TLE data. A local HTTP server is required.



1. Clone the repository:

```bash

git clone https://github.com/daddesa/cses-tracker.git

cd cses-tracker

```



2.Initialize a local server (example using Python):

   ```bash

python -m http.server 8000

 ```



3. Open your browser and navigate to http://localhost:8000.



## Legal Disclaimer & Terms of Use



**Non-Affiliation:** This project is an independent, non-commercial endeavor created solely for educational, informational, and portfolio purposes by a space and physics enthusiast. It is **not** officially affiliated, associated, authorized, endorsed by, or in any way officially connected with the **China National Space Administration (CNSA)**, the **Italian Space Agency (ASI)**, the official CSES collaboration, or any of their subsidiaries or affiliates. 



**Data Accuracy & Liability:** The orbital data is sourced dynamically from public CelesTrak TLEs. The developer assumes no responsibility or liability for any errors, omissions, or inaccuracies in the content, calculations, or rendering of this application. The information and tools contained herein are provided on an "as is" basis with no guarantees of completeness, accuracy, usefulness, or timeliness. This tool must not be used for actual mission control, professional tracking, or scientific publications.

