/*
* 
*   Render JavaScript Leaflet with Strava activities
*
*/

console.log("Connected to leaflet.js!")
// import { testConnection } from "./leaflet_util.js";
// testConnection()
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// const activity = document.querySelectorAll('.activity-name');
// const polyline = document.querySelectorAll('.activity-polyline');

// console.log(activity) // OUTPUT = Good! NodeList of activity names
// console.log(polyline) // OUTPUT = Good! NodeList of polylines
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
import polyline from './leaflet_util.js';

// Call function render map:
renderLealet();

// Define function to render map:
function renderLealet() {
    console.log("Executing function renderLeaflet...");

    // Create a map object:
    // Note that 'L' is an abbrv. for 'Leaflet' (defined in HTML script tag) 
    // & view is set Bay Area, CA
    const map = L.map('activities-map').setView([37.487846, -122.236115], 12);

    // Tiles are the images of the map itself.
    // OpenStreetMap requires an attribution for using its tiles:
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tiles = L.tileLayer(tileUrl, { attribution });

    // Add tiles to map:
    tiles.addTo(map);

    // Iterate through polylines & decode:
    const all_polylines = document.querySelectorAll('.activity-polyline');
    for (let activity_line of all_polylines) {   
        // Get innerHTML & strip whitespace:
        activity_line = activity_line.innerHTML.trim()
        
        // 'polyline.decode' is a helper function from leaflet_util.js (edited for accurate lat/long order)
        // Req: polyline string, percision num. Returns: array of lat/long coordinates
        activity_line = polyline.decode(activity_line, 5);

        // Add lat/longs for each activity to map:
        L.polyline(
            activity_line,
            {color: "red",
            weight: 4,
            opacity: .7,
            lineJoin: 'round'}
        ).addTo(map);
    }
}