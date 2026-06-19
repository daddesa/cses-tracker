const map = L.map('map').setView([20.0, 0.0], 2);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO'
}).addTo(map);

const saaCoordinates = [
    [-10, -90], [2, -45], [2, -15], [-15, 15], 
    [-45, 15], [-50, -20], [-50, -60], [-30, -90]
];
const saaPolygon = L.polygon(saaCoordinates, {
    color: '#e43f5a', weight: 1.5, fillColor: '#e43f5a', fillOpacity: 0.08, dashArray: '4, 4'
}).addTo(map).bindPopup("<b>South Atlantic Anomaly (SAA)</b><br>Low magnetic intensity zone.");

const groundStations = [
    { name: "Kiruna (Sweden) - Polar Station", lat: 67.8557, lon: 20.2252, marker: null },
    { name: "Fucino Space Centre / ASI Matera (Italy)", lat: 41.9772, lon: 13.6014, marker: null },
    { name: "Miyun / Beijing (China)", lat: 40.45, lon: 116.86, marker: null },
    { name: "Mudanjiang (China)", lat: 44.55, lon: 129.60, marker: null },
    { name: "Kashgar (China)", lat: 39.47, lon: 75.99, marker: null },
    { name: "Kunming (China)", lat: 25.04, lon: 102.70, marker: null },
    { name: "Sanya (China)", lat: 18.25, lon: 109.51, marker: null }
];

groundStations.forEach(station => {
    station.marker = L.circleMarker([station.lat, station.lon], {
        color: '#797a93', radius: 4, fillColor: '#3b3b4f', fillOpacity: 1, weight: 2, className: 'station-marker'
    }).addTo(map).bindPopup(`<b>${station.name}</b><br>Status: Waiting...`);
});

const cses01Marker = L.circleMarker([0, 0], { color: '#00adb5', radius: 6, fillColor: '#00adb5', fillOpacity: 1 }).addTo(map);
const cses02Marker = L.circleMarker([0, 0], { color: '#ff5722', radius: 6, fillColor: '#ff5722', fillOpacity: 1 }).addTo(map);

const footprintInfo = "<b>Coverage Area (Footprint)</b><br>Useful visual radius (~2,400 km).<br>The satellite can only download data to stations within this circle.";
const cses01Footprint = L.circle([0, 0], { radius: 2400000, color: '#00adb5', weight: 1, fillOpacity: 0.03 }).addTo(map).bindTooltip("Footprint CSES-01").bindPopup(footprintInfo);
const cses02Footprint = L.circle([0, 0], { radius: 2400000, color: '#ff5722', weight: 1, fillOpacity: 0.03 }).addTo(map).bindTooltip("Footprint CSES-02").bindPopup(footprintInfo);

const cses01FutureLine = L.polyline([], { color: '#00adb5', weight: 1.5, dashArray: '5, 5', opacity: 0.4 }).addTo(map);
const cses02FutureLine = L.polyline([], { color: '#ff5722', weight: 1.5, dashArray: '5, 5', opacity: 0.4 }).addTo(map);

const cses01PastLine = L.polyline([], { color: '#00adb5', weight: 2, opacity: 0.5 }).addTo(map);
const cses02PastLine = L.polyline([], { color: '#ff5722', weight: 2, opacity: 0.5 }).addTo(map);

let historicalPoints01 = [];
let historicalPoints02 = [];

function toggleLayer(type) {
    const chkSaa = document.getElementById('chk-saa').checked;
    const chkPred = document.getElementById('chk-pred').checked;
    const chkFoot = document.getElementById('chk-footprint').checked;

    if (type === 'saa') chkSaa ? saaPolygon.addTo(map) : map.removeLayer(saaPolygon);
    if (type === 'pred') {
        chkPred ? (cses01FutureLine.addTo(map), cses02FutureLine.addTo(map)) : (map.removeLayer(cses01FutureLine), map.removeLayer(cses02FutureLine));
    }
    if (type === 'footprint') {
        chkFoot ? (cses01Footprint.addTo(map), cses02Footprint.addTo(map)) : (map.removeLayer(cses01Footprint), map.removeLayer(cses02Footprint));
    }
}

function cleanTLEString(str) {
    let cleanStr = "";
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        cleanStr += (code >= 32 && code <= 126) ? str.charAt(i) : " ";
    }
    return cleanStr.padEnd(69, ' ').substring(0, 69);
}

let satrec01 = null;
let satrec02 = null;

const chartOptions = {
    responsive: true, maintainAspectRatio: false, 
    scales: { x: { display: true, grid: { display: false }, ticks: { color: '#797a93', font: { size: 9 }, maxTicksLimit: 5 } }, y: { grid: { color: '#2a2a3d' }, ticks: { color: '#797a93', font: { size: 10 } } } }, 
    plugins: { legend: { labels: { color: '#fff', boxWidth: 10, font: { size: 10 } } } }
};

const altitudeChart = new Chart(document.getElementById('chartAltitudine').getContext('2d'), {
    type: 'line', data: { labels: [], datasets: [ { label: 'CSES-01 Altitude', data: [], borderColor: '#00adb5', borderWidth: 1.5, pointRadius: 0, fill: false }, { label: 'CSES-02 Altitude', data: [], borderColor: '#ff5722', borderWidth: 1.5, pointRadius: 0, fill: false } ] }, options: chartOptions
});

const distanceChart = new Chart(document.getElementById('chartDistanza').getContext('2d'), {
    type: 'line', data: { labels: [], datasets: [{ label: 'Inter-Node Distance (km)', data: [], borderColor: '#e43f5a', borderWidth: 1.5, pointRadius: 0, fill: false }] }, options: chartOptions
});

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

function calculateDynamicPosition(satrec, time) {
    try {
        const pv = satellite.propagate(satrec, time);
        if (pv.position && pv.velocity) {
            const gd = satellite.eciToGeodetic(pv.position, satellite.gstime(time));
            return {
                lat: satellite.degreesLat(gd.latitude), lon: satellite.degreesLong(gd.longitude),
                alt: gd.height, vel: Math.sqrt(Math.pow(pv.velocity.x, 2) + Math.pow(pv.velocity.y, 2) + Math.pow(pv.velocity.z, 2)) * 3600
            };
        }
    } catch (e) {} return null;
}

function estimateMagneticField(lat, alt) {
    const r = 1 + (alt / 6371); 
    const B0 = 31200; 
    const latRad = lat * (Math.PI / 180);
    return (B0 / Math.pow(r, 3)) * Math.sqrt(1 + 3 * Math.pow(Math.sin(latRad), 2));
}

function generateOrbitSegments(satrec, startTime) {
    let segments = [], currentSegment = [], lastLon = null;
    for (let i = 1; i <= 45; i += 2) {
        const fData = calculateDynamicPosition(satrec, new Date(startTime.getTime() + i * 60000));
        if (fData && !isNaN(fData.lat)) {
            if (lastLon !== null && Math.abs(fData.lon - lastLon) > 180) { segments.push(currentSegment); currentSegment = []; }
            currentSegment.push([fData.lat, fData.lon]);
            lastLon = fData.lon;
        }
    }
    if (currentSegment.length > 0) segments.push(currentSegment);
    return segments;
}

let secondCounter = 0;

function processPositions() {
    try {
        const now = new Date();
        
        let d01 = satrec01 ? calculateDynamicPosition(satrec01, now) : null;
        let d02 = satrec02 ? calculateDynamicPosition(satrec02, now) : null;

        if (d01 && !isNaN(d01.lat)) {
            document.getElementById('cses01-coords').innerText = `${d01.lat.toFixed(2)}° / ${d01.lon.toFixed(2)}°`;
            document.getElementById('cses01-alt').innerText = Math.round(d01.alt);
            document.getElementById('cses01-vel').innerText = Math.round(d01.vel).toLocaleString();
            document.getElementById('cses01-mag').innerText = Math.round(estimateMagneticField(d01.lat, d01.alt)).toLocaleString();
            
            cses01Marker.setLatLng([d01.lat, d01.lon]);
            cses01Footprint.setLatLng([d01.lat, d01.lon]);
            cses01FutureLine.setLatLngs(generateOrbitSegments(satrec01, now));

            if (historicalPoints01.length > 0 && Math.abs(d01.lon - historicalPoints01[historicalPoints01.length - 1][1]) > 180) {
                historicalPoints01 = [];
            }
            historicalPoints01.push([d01.lat, d01.lon]);
            if (historicalPoints01.length > 200) historicalPoints01.shift();
            cses01PastLine.setLatLngs(historicalPoints01);
        }

        if (d02 && !isNaN(d02.lat)) {
            document.getElementById('cses02-coords').innerText = `${d02.lat.toFixed(2)}° / ${d02.lon.toFixed(2)}°`;
            document.getElementById('cses02-alt').innerText = Math.round(d02.alt);
            document.getElementById('cses02-vel').innerText = Math.round(d02.vel).toLocaleString();
            document.getElementById('cses02-mag').innerText = Math.round(estimateMagneticField(d02.lat, d02.alt)).toLocaleString();
            
            cses02Marker.setLatLng([d02.lat, d02.lon]);
            cses02Footprint.setLatLng([d02.lat, d02.lon]);
            cses02FutureLine.setLatLngs(generateOrbitSegments(satrec02, now));

            if (historicalPoints02.length > 0 && Math.abs(d02.lon - historicalPoints02[historicalPoints02.length - 1][1]) > 180) {
                historicalPoints02 = [];
            }
            historicalPoints02.push([d02.lat, d02.lon]);
            if (historicalPoints02.length > 200) historicalPoints02.shift();
            cses02PastLine.setLatLngs(historicalPoints02);
        }

        groundStations.forEach(station => {
            let inRange = false;
            if (d01 && calculateHaversineDistance(d01.lat, d01.lon, station.lat, station.lon) <= 2400) inRange = true;
            if (d02 && calculateHaversineDistance(d02.lat, d02.lon, station.lat, station.lon) <= 2400) inRange = true;

            if (inRange) {
                station.marker.setStyle({ color: '#00ff00', fillColor: '#00ff00', radius: 8, fillOpacity: 0.8 });
                station.marker.setPopupContent(`<b>${station.name}</b><br><span style="color:#00ff00;font-weight:bold;">DOWNLINK ACTIVE</span>`);
            } else {
                station.marker.setStyle({ color: '#797a93', fillColor: '#3b3b4f', radius: 4, fillOpacity: 1 });
                station.marker.setPopupContent(`<b>${station.name}</b><br>Waiting for pass...`);
            }
        });

        if (d01 && d02 && secondCounter % 2 === 0) {
            const dist = calculateHaversineDistance(d01.lat, d01.lon, d02.lat, d02.lon);
            document.getElementById('live-distance').innerText = Math.round(dist).toLocaleString() + " km";
            const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            altitudeChart.data.labels.push(timeLabel);
            altitudeChart.data.datasets[0].data.push(d01.alt);
            altitudeChart.data.datasets[1].data.push(d02.alt);
            if (altitudeChart.data.labels.length > 20) { altitudeChart.data.labels.shift(); altitudeChart.data.datasets[0].data.shift(); altitudeChart.data.datasets[1].data.shift(); }
            altitudeChart.update('none');

            distanceChart.data.labels.push(timeLabel);
            distanceChart.data.datasets[0].data.push(dist);
            if (distanceChart.data.labels.length > 20) { distanceChart.data.labels.shift(); distanceChart.data.datasets[0].data.shift(); }
            distanceChart.update('none');
        }
        secondCounter++;
    } catch (err) {}
}

function switchTab(event, tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
}

async function fetchLiveTLE() {
    const URL_01 = "https://celestrak.org/NORAD/elements/gp.php?CATNR=43194&FORMAT=TLE";
    const URL_02 = "https://celestrak.org/NORAD/elements/gp.php?CATNR=64393&FORMAT=TLE";

    try {
        const [res1, res2] = await Promise.all([fetch(URL_01), fetch(URL_02)]);
        if (!res1.ok || !res2.ok) throw new Error("Network error or invalid response from Celestrak");
        
        const txt1 = await res1.text();
        const txt2 = await res2.text();

        const lines1 = txt1.trim().split('\n');
        const lines2 = txt2.trim().split('\n');

        satrec01 = satellite.twoline2satrec(cleanTLEString(lines1[1]), cleanTLEString(lines1[2]));
        satrec02 = satellite.twoline2satrec(cleanTLEString(lines2[1]), cleanTLEString(lines2[2]));

        processPositions();
        setInterval(processPositions, 1000);
        
    } catch (e) {
        console.error("CRITICAL ERROR: Failed to fetch live TLE data from Celestrak.", e);
        document.getElementById('cses01-coords').innerText = "ERROR FETCHING DATA";
        document.getElementById('cses02-coords').innerText = "ERROR FETCHING DATA";
    }
}

fetchLiveTLE();