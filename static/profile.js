/*
*   Render JavaScript Leaflet with Strava activities
*/

console.log("Connected to leaflet.js!");
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
import polyline from './leaflet_poly_util.js';

// PLANNING:
// window.onload = () => {
    // Render map (w/o activities):

    // Re-render map w/activities:

    // Re-render map w/new tile filter:

    // CATALYSTS FOR RE-RENDERING MAP:
    // Get Strava API data:

    // Handle activities filter:

    // Handle tile filter:

    // THUS, GLOBAL VARS MUST BE:
    // map =>
        // tileLayer
            // defaultTileFilter
            // currTileFilter
        // routesLayer
            // allActivities
            // allTypes
            // allYears
            // currTypes
            // currYears
// }

window.onload = () => {
    /* * * * * * * * * * * * * * * * */
    // Render map (w/o activities):

    // Establish map's center point:
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
    
    // Customize map appearance:
    const defaultCustomFilter = [
        'contrast: 130%',
        'grayscale: 80%',
        'hue: 200deg',
        'invert: 100%',
        'saturate: 175%'
    ]

    // Create tiles layer (tiles are the images of the map itself):
    const tilesLayer = L.layerGroup();
    
    // Create default custom tiles:
    const defaultCustomTiles = L.tileLayer.colorFilter(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        filter: defaultCustomFilter}
    );

    // Add default custom tiles to layer group:
    tilesLayer.addLayer(defaultCustomTiles);

    // Create routes layer:
    const routesLayer = L.layerGroup();

    // Create map object (to which center point & layers can be added):
    // 'L' is an abbrv. for 'Leaflet' (defined in HTML script tag)
    const map = new L.map('activities-map', {
        center: mapCenter,
        zoom: 12,
        zoomControl: false, // Override default placement of zoom controls
        layers: [tilesLayer, routesLayer]
    });

    // Move map zoom controls (to allow room for navbar/sidebar):
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Create layer controls:
    const baseMap = {
        "Base Map": tilesLayer
    };
    const overlayMap = {
        "Strava Routes": routesLayer
    };

    // Add layer controls to map:
    L.control.layers(baseMap, overlayMap).addTo(map);    

    /* * * * * * * * * * * * * * * * */
    // Re-render map w/activities:
    function addActivitiesToMap(activities) {
        // Remove any existing routes then repopulate:
        routesLayer.eachLayer((route) => {
            route.remove();
        });      

        // Iterate through Strava data, decode & add to routes layer:
        for (const activity of activities) {
            // If activity has a polyline, decode & add to layer:
            if (activity['map']['summary_polyline'] != null) {
                // 'polyline.decode' is a helper function from leaflet_util.js
                const coordinates = polyline.decode(activity['map']['summary_polyline']);

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

            return [hours, minutes, seconds]
                .map(val => val < 10 ? "0" + val : val)
                .filter((val, decimal) => val !== "00" || decimal > 0)
                .join(":");
        }
    }
    
    /* * * * * * * * * * * * * * * * */
    // Re-render map w/new tile filter:
    function customizeTiles(userCustomizedVal) {
        // Re-customize appearance of map:
        const userCustomFilter = [
            `contrast: ${userCustomizedVal}`,
            'grayscale: 80%',
            'hue: 200deg',
            'invert: 100%',
            'saturate: 175%'
        ]

        // Create user custom tiles:
        const userCustomTiles = L.tileLayer.colorFilter(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            filter: userCustomFilter}
        );

        // Add user custom tiles to layer group:
        tilesLayer.addLayer(userCustomTiles)
    }

    /* * * * * * * * * * * * * * * * */
    // CATALYSTS FOR RE-RENDERING MAP:
    // Get Strava API data:
    let allActivities = new Array();
    console.log("Calling API...")
    $.post({
        url: '/athlete_data.json',
        success: (res) => {
            // Fade out loader animation:
            $('.loader-wrapper').fadeOut('slow');
            
            // Push API result to global variable allActivities (so filter functions can access it):
            allActivities.push(...res);

            // Render allActivities on map:
            addActivitiesToMap(allActivities);
        },
        error: (res) => {
            alert("Oops! Sorry, something went wrong when loading your data!") 
        }
    });
    /* * * * * * * * * * * * * * * * */
    // Handle activities filter:
    $('.activity-filter').click((evt) => {
        // Mark if filter added or removed, and type:
        handleActivityFilterChange(evt.target.checked, evt.target.id);
    });

    // Create helper variables & functions for filtering allActivities:
    const allTypes = ['run', 'ride', 'swim', 'hike', 'walk'];
    const allYears = ['2021', '2020', '2019', '2018', '2017'];

    let currentTypesSelected = ['run', 'ride', 'swim', 'hike', 'walk']; // Start with all types displayed
    let currentYearsSelected = ['2021', '2020', '2019', '2018', '2017']; // Start with all years displayed

    function getByType(activities, types) {
        return activities.filter(activity => (typeof activity['type'] !== 'undefined' && types.includes(activity['type'].toLowerCase())));
    }

    function getByYear(activities, years) {
        return activities.filter(activity => (years.includes(activity['start_date_local'].substring(0, 4))));
    }

    function handleActivityFilterChange(isAdd, filter) {
        // Update global variables (so that next filter call remembers prev filter state):
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
        return addActivitiesToMap(getByYear(getByType(allActivities, currentTypesSelected), currentYearsSelected));
    }
    /* * * * * * * * * * * * * * * * */
    // Handle tile filter:
    $('#contrast-slider').on('input', () => {
        // Get new contrast value:
        $('#custom-contrast').html($('#contrast-slider').val());
        let userCustomizedVal = `${$('#custom-contrast').text()}%`;
        // Create new tile layer:
        customizeTiles(userCustomizedVal);
    });
}