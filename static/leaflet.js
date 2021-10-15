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
renderLeaflet();

// Define function to render map:
function renderLeaflet() {
    console.log("Executing function renderLeaflet...");

    // Create a map object:
    // Note that 'L' is an abbrv. for 'Leaflet' (defined in HTML script tag) 
    // & view is set Bay Area, CA
    const map = L.map('activities-map').setView([37.487846, -122.236115], 12);

    // Tiles are the images of the map itself.
    // OpenStreetMap requires an attribution for using its tiles:
    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tiles = L.tileLayer(tileUrl, {attribution});

    // Add tiles to map:
    tiles.addTo(map);

    // jQuery syntax -> Making AJAX call to server:
    $.get('/athlete_data.json', res => {
        // Get API data:
        const all_activities = res;

        // Iterate through all Strava data:
        for (const activities_array of all_activities) {
            for (const activity of activities_array) {
                // Get polyline (for those activities that have one) & decode:
                // 'polyline.decode' is a helper function from leaflet_util.js (edited for accurate lat/long order)
                let activity_polyline = activity['map']['summary_polyline']; 
                if (activity_polyline != null) {
                    activity_polyline = polyline.decode(activity_polyline);

                    // Add each decoded polyline to map:
                    L.polyline(
                        activity_polyline,
                        {color: "red",
                        weight: 4,
                        opacity: .7,
                        lineJoin: 'round'}
                    ).addTo(map)
                    // Add pop-up of activity details to route:
                    .bindPopup(() => {
                        const activity_date = (activity['start_date_local'].substring(0, 10));
                        const activity_name = activity['name'];
                        const activity_type = activity['type'];
                        const activity_duration = toHHMMSS(activity['elapsed_time']);
                        const activity_distance = (activity['distance'] * 0.000621).toFixed(2);
                        const activity_link = "https://www.strava.com/activities/" + activity['id'];
                        
                        return (`
                        <ul class="styled-popup">
                            <li>${activity_date}</li>    
                            <li>${activity_name}</li>
                            <li>${activity_type}</li>
                            <li>${activity_duration}</li>
                            <li>${activity_distance} mi</li>
                            <li><a href=${activity_link} target="_blank">See this on Strava</a></li>
                        </ul>
                        `);
                    });
                }
            }
        }
    });
}

// Helper function to format Strava activity duration:
function toHHMMSS(activitySeconds) {
    const sec_num = parseInt(activitySeconds, 10);
    const hours   = Math.floor(sec_num / 3600);
    const minutes = Math.floor(sec_num / 60) % 60;
    const seconds = sec_num % 60;

    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
        .join(":");
}