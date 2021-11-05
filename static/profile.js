/*
*   Render JavaScript Leaflet with Strava activities
*/

console.log("Connected to leaflet.js!");
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
import polyline from './leaflet_poly_util.js';


window.onload = () => {
    // Create map:
    // Customize appearance of map:
    let myFilter = [
        'contrast: 130%',
        'grayscale: 80%',
        'hue: 200deg',
        'invert: 100%',
        'saturate: 175%'
    ]

    // Create tile layer (tiles are the images of the map itself):
    const tileLayer = L.tileLayer.colorFilter(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        filter: myFilter}
    );
    // Create routes layer:
    const routesLayer = L.layerGroup();

    // Default center:
    let mapCenter = [37.487846, -122.236115];
    // Client's personalized center:
    if (window.navigator.geolocation) {
        const updateCenter = (position) => {
            mapCenter = [position.coords.latitude, position.coords.longitude];
        }
        // Request permission to access client's location:
        window.navigator.geolocation.getCurrentPosition(updateCenter, console.log);
    } 

    // Create map object (to which layers can be added):
    // 'L' is an abbrv. for 'Leaflet' (defined in HTML script tag)
    const map = new L.map('activities-map', {
        center: mapCenter,
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

    // Add layer controls to map:
    L.control.layers(baseMap, overlayMap).addTo(map);

    // Get Strava activities from API:
    let allActivities = new Array();
    $.post({
        url: '/athlete_data.json',
        success: (res) => {
            // Fade out loader animation:
            $('.loader-wrapper').fadeOut('slow');
            
            // Push API result to global variable allActivities (so filter function can access it):
            allActivities.push(...res);

            // Render allActivities on map:
            renderOnMap(allActivities);
        },
        error: (res) => {
            alert("Oops! Sorry, something went wrong when loading your data!") 
        }
    });

    // Create helper variables & functions for filtering allActivities:
    const allTypes = ['run', 'ride', 'swim', 'walk'];
    const allYears = ['2021', '2020', '2019', '2018', '2017'];

    let currentTypesSelected = ['run', 'ride', 'swim', 'walk']; // Start with all types displayed
    let currentYearsSelected = ['2021', '2020', '2019', '2018', '2017']; // Start with all years displayed

    function getByType(activities, types) {
        return activities.filter(activity => types.includes(activity['type'].toLowerCase()));
    }
    function getByYear(activities, years) {
        return activities.filter(activity => years.includes(activity['start_date_local'].substring(0, 4)));
    }

    function handleFilterChange(isAdd, filter) {
        // Update global variables:
        if (isAdd) {
            if (allTypes.includes(filter)) {
                currentTypesSelected.push(filter);
            }
            if (allYears.includes(filter)) {
                currentYearsSelected.push(filter);
            }
        } 
        else {
            if (allTypes.includes(filter)) {
                currentTypesSelected = currentTypesSelected.filter(currentType => currentType != filter);
            }
            if (allYears.includes(filter)) {
                currentYearsSelected = currentYearsSelected.filter(year => year != filter);
            }
        }

        // Call helper filter functions & render results on map:
        return renderOnMap(getByYear(getByType(allActivities, currentTypesSelected), currentYearsSelected));
    }

    // Create map & render activities:
    // function renderActivities(displayActivities, filter=false) {
    function renderOnMap(activities) {
        // Remove any existing routes then repopulate:
        routesLayer.eachLayer((route) => {
            // console.log(route);
            route.remove();
        });      

        // Iterate through Strava data, decode & add to routes layer:
        for (const activity of activities) {
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
            }
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
    }

    // Create event listeners / handlers for filters:
    $('.activity-filter').click((evt) => {
        handleFilterChange(evt.target.checked, evt.target.id);
    });
}