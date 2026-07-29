# CSES Real-Time Orbital Tracker



![Live Demo](https://img.shields.io/badge/Live%20Demo-Online-success) *https://daddesa.github.io/cses-tracker/*



## Project Overview

This repository contains a real-time, client-side web application designed to track the orbits and telemetry of the **CSES-01** and **CSES-02** (China Seismo-Electromagnetic Satellite) missions. 



Built as an independent project, the application calculates satellite positions, altitudes, and kinematic data dynamically using a SGP4 propagation model, using live Two-Line Element (TLE) sets fetched directly from public CelesTrak APIs. 



##  The CSES Mission Context

**CSES** is a constellation of scientific satellites developed through a collaboration between the China National Space Administration (CNSA) and the Italian Space Agency (ASI). The mission investigates the near-Earth electromagnetic environment and its potential correlation with seismic and volcanic activity.

Operating in a sun-synchronous Low Earth Orbit (LEO) at an altitude of approximately 500 km, the satellites are equipped with a suite of highly sensitive instruments, including search-coil magnetometers, electric field detectors, plasma analyzers, and the **High-Energy Particle Detector (HEPD)**. By mapping perturbations in plasma density, electromagnetic waves, and particle fluxes, the CSES mission aims to identify pre-seismic anomalies.



## Core Features & Physics Engine



### Orbital & Telemetry Tracking

* **Real-Time TLE Processing:** Fetches the latest orbital elements directly from CelesTrak without intermediate proxy servers.

* **Kinematic Propagation:** Uses `satellite.js` to compute geodetic coordinates (latitude, longitude, altitude) and velocity at a 1 Hz refresh rate.


### Environment & Network Mapping

* **SAA Visualization:** Renders the boundary geometry of the South Atlantic Anomaly (SAA), a crucial region where the Earth's inner Van Allen belt dips close to the surface, affecting onboard instruments.

* **Dynamic Footprint:** Visualizes an approximate 2,400 km line-of-sight radius, representing the constraints for telemetry downlink.

* **Ground Stations:** Continuously calculates the haversine distance between the satellites and global ground stations, as to infer when downlink can be expected.

## Approximations

To keep computations lightweight this project implements several mathematical and physical simplifications. 

### 1. Magnetic Field Estimation
* **Ideal Dipole Model:** Calculates intensity using a perfect dipole formula:
  <div align="center">

  $$B(r, \lambda) = \frac{B_0}{r^3} \sqrt{1 + 3\sin^2(\lambda)}$$

  </div>
It completely ignores higher order harmonics and local anomalies.
* **Geographic vs. Geomagnetic Axis:** Uses geographic latitude, ignoring the tilt and offset of Earth's true geomagnetic axis.
* **Static Field:** Uses a fixed value ($B_0 = 31,200 \text{ nT}$), ignoring latitude, dynamic Space Weather events, long-term variations or SAA region.

### 2. Distance and Geometry
* **Spherical Earth Assumption:** Uses a constant Earth radius of 6,371 km for both magnetic calculations and the Haversine distance formula.
* **2D Ground Track Distance:** The distance between CSES-01 and CSES-02 is calculated as the great-circle distance along Earth's surface.

### 3. Visibility and Footprints
* **Fixed Radius Footprint:** Footprint is hardcoded to be a 2,400 km radius circle on the ground. In reality true visibility dynamically depends on the satellite's instantaneous altitude and the specific minimum elevation angle required by the receiving antenna.
* **No Topography:** No terrain obstacles such as mountains are taken into account, while in reality they may actively block the signal between the satellite and the ground station.

### 4. Orbital Mechanics & Telemetry
* **Inertial Velocity:** The displayed velocity is the absolute magnitude in the Earth Centered Inertial (ECI) frame. 

## Local Setup & Execution

The web application is hosted on GitHub Pages: https://daddesa.github.io/cses-tracker/. If you want to run it locally, a bit of care is needed as, due to modern browser security restrictions, running the `index.html` file directly from your filesystem will result in CORS errors, preventing the application from fetching live TLE data. A local HTTP server is required.



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

