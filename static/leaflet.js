/*
*   Render JavaScript Leaflet with Strava activities
*/

console.log("Connected to leaflet.js!");
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
import polyline from './leaflet_poly_util.js';

// Customize appearance of map:
let myFilter = [
    'contrast: 130%',
    'grayscale: 80%',
    'hue: 200deg',
    'invert: 100%',
    'saturate: 175%'
]

// Create tiles (tiles are the images of the map itself):
const tileLayer = L.tileLayer.colorFilter('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                                    {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                                    filter: myFilter});

const routesLayer = L.layerGroup();

// Populate routeLayer with all or filtered activities:
// Keep this code as a function since it is called from 1+ event:
function renderActivities(allActivities, filter) {
    // If filtered request, remove existing routes then repopulate:
    if (filter) {
        routesLayer.eachLayer((layer) => {
            layer.remove();
        });
    }
    
    // Iterate through all Strava data:
    for (const activity of allActivities) {
        // 'polyline.decode' is a helper function from leaflet_util.js
        let activityPolyline = activity['map']['summary_polyline']; 
        
        // If activity has a polyline, decode & add to layer:
        if (activityPolyline != null) {
            const coordinates = polyline.decode(activityPolyline);

            // Customize appreance of route line:
            const decodedRoute = L.polyline(
                coordinates,
                {color: "red",
                weight: 4,
                opacity: .7,
                lineJoin: 'round'}
            );

            // Add pop-up of activity details to route:
            decodedRoute.bindPopup(() => {
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

            // Add route to layer group:
            routesLayer.addLayer(decodedRoute);

            // If filtered request, adjust zoom to route:
            if (filter) {
                map.fitBounds(decodedRoute.getBounds());
                map.zoomOut(2);
                // map.flyToBounds(decodedRoute.getBounds()); // OUTPUT = Did not zoom to activity? (bike)
            }
        }
    }
}

// Create map object:
// 'L' is an abbrv. for 'Leaflet' (defined in HTML script tag)
const map = new L.map('activities-map', {
    center: [37.487846, -122.236115], // Center to Bay Area, CA
    zoom: 12,
    zoomControl: false, // Override default placement of zoom controls
    layers: [tileLayer, routesLayer]
});

// Move map zoom controls (to allow room for navbar/sidebar):
L.control.zoom({ position: 'topright' }).addTo(map);

// Create layer controls:
const baseMap = {
    "Base Map": tileLayer
};
const overlayMap = {
    "Strava Routes": routesLayer
}

L.control.layers(baseMap, overlayMap).addTo(map);

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

// On window load, make call to server to get all API data:
$.post({
    url: '/athlete_data.json',
    // data: {},
    success: (res) => {
        $('.loader-wrapper').fadeOut('slow');
        const filter = false;
        renderActivities(res, filter);
    },
    error: (res) => {
        alert("Oops! Sorry, something went wrong when loading your data!") 
    }
});

// Add event handlers to 'sort activities' emojis:
$('#run').click((res) => {
    // Display loader:
    $('.loader-wrapper').fadeIn('slow');
    // Make call to server for filtered API data:
    $.post({
        url: '/athlete_data.json',
        data: {activityType: 'run'},
        success: (res) => {
            // Fade loader out:
            $('.loader-wrapper').fadeOut('slow');
            // Render filtered routes on map:
            const filter = true;
            renderActivities(res, filter);
        },
        error: (res) => {
            alert("Oops! Sorry, something went wrong when loading your data!") 
        }
    });
});

$('#ride').click((res) => {
    // Display loader:
    $('.loader-wrapper').fadeIn('slow');
    // Make call to server for filtered API data:
    $.post({
        url: '/athlete_data.json',
        data: {activityType: 'ride'},
        success: (res) => {
            // Fade loader out:
            $('.loader-wrapper').fadeOut('slow');
            // Render filtered routes on map:
            const filter = true;
            renderActivities(res, filter);
        },
        error: (res) => {
            alert("Oops! Sorry, something went wrong when loading your data!") 
        }
    });
});

$('#swim').click((res) => {
    // Display loader:
    $('.loader-wrapper').fadeIn('slow');
    // Make call to server for filtered API data:
    $.post({
        url: '/athlete_data.json',
        data: {activityType: 'swim'},
        success: (res) => {
            // Fade loader out:
            $('.loader-wrapper').fadeOut('slow');
            // Render filtered routes on map:            
            const filter = true;
            renderActivities(res, filter);
        },
        error: (res) => {
            alert("Oops! Sorry, something went wrong when loading your data!") 
        }
    });
});

$('#walk').click((res) => {
    // Display loader:
    $('.loader-wrapper').fadeIn('slow');
    // Make call to server for filtered API data:
    $.post({
        url: '/athlete_data.json',
        data: {activityType: 'walk'},
        success: (res) => {
            // Fade loader out:
            $('.loader-wrapper').fadeOut('slow');
            // Render filtered routes on map:
            const filter = true;
            renderActivities(res, filter);
        },
        error: (res) => {
            alert("Oops! Sorry, something went wrong when loading your data!") 
        }
    });
});

// function updateDateSlider() {
//     const slider = document.getElementById('slider');
//     const output = document.getElementById('output');

//     slider.oninput = () => {
//         output.innerHTML = slider.value;
//     }

//     slider.addEventListener("mousemove", () => {
//         const percent = slider.value;
//         const slidingColor = 'linear-gradient(90deg, orange' + percent + '%, grey' + percent + '%)';
//         slider.style.background = slidingColor;
//     });
// }