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
            console.log("Calling API...")
            
            // Assign each activity from API result a display on map attribute:
            for (const activity of res) {
                activity['displayOnMap'] = true;
            }

            // Push API result to global variable allActivites (so filter function can access all activities)
            allActivities.push.apply(allActivities, res);

            // Render activities on map:
            const filter = false;
            renderActivities(allActivities, filter);
        },
        error: (res) => {
            alert("Oops! Sorry, something went wrong when loading your data!") 
        }
    });

    // If filtered request, sort activities by type / date:
    function filterActivities(filterByType=null, filterByDate=null, filterOutDate=false) {
        // Copy API result with new attr to filteredActivities, so that it can be manipulated w/o affecting API results:
        let filteredActivities = allActivities;

        // If filterByType value given:
        if (filterByType != null) {
            // Look at all activities:
            for (const activity of filteredActivities) {
                // If activity currently displayed and is not of requested type:
                if (activity['displayOnMap'] == true && activity['type'].toLowerCase() != filterByType) {
                    // Hide activity / set display to false:
                    activity['displayOnMap'] = false;
                }
            }
        }

        // If filterByDate value given && request is to hide given Date:
        if (filterByDate != null && filterOutDate == true) {
            // Look at all activities:
            for (const activity of filteredActivities) {
                // If activity currently displayed and is of requested date / year:
                if (activity['displayOnMap'] == true && activity['start_date_local'].substring(0, 4) == filterByDate) {
                    // Hide activity / set display to false:
                    activity['displayOnMap'] = false;
                }
            }
        }

        // If filterByDate value given && request is to show given Date:
        if (filterByDate != null && filterOutDate == false) {
            // Look at all activities:
            for (const activity of filteredActivities) {
                // If activity currently not displayed and is of requested date / year:
                if (activity['displayOnMap'] == false && activity['start_date_local'].substring(0, 4) == filterByDate) {
                    // Show activity / set display to true:
                    activity['displayOnMap'] = true;
                }
            }
        }

        // Return activities with attr 'displayOnMap' = true:
        filteredActivities = filteredActivities.filter(activity => activity['displayOnMap'] == true);

        return filteredActivities;
    }

    // Create map & render activities:
    function renderActivities(displayActivities, filter=false) {
        // If filtered request, remove existing routes then repopulate:
        if (filter) {
            routesLayer.eachLayer((route) => {
                // console.log(route);
                route.remove();
            });
        }        

        // Iterate through Strava data, decode & add to routes layer:
        for (const activity of displayActivities) {
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
    $('#all').click(() => {
        // Keep filter as true, so that activities are not duplicated when all activites are added back:
        const filter = true;
        // Render map with filtered activities:
        renderActivities(allActivities, filter);
    });

    $('#run').click(() => {
        // Filter activities:
        const filter = true;
        const filterByType = 'run';
        const filterByDate = null;
        const filterOutDate = false;
        let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
        // Render map with filtered activities:
        renderActivities(filteredActivities, filter);
    });

    $('#ride').click(() => {
        // Filter activities:
        const filter = true;
        const filterByType = 'ride';
        const filterByDate = null;
        const filterOutDate = false;
        let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
        // Render map with filtered activities:
        renderActivities(filteredActivities, filter);
    });

    $('#swim').click(() => {
        // Filter activities:
        const filter = true;
        const filterByType = 'swim';
        const filterByDate = null;
        const filterOutDate = false;
        let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
        // Render map with filtered activities:
        renderActivities(filteredActivities, filter);
    });

    $('#walk').click(() => {
        // Filter activities:
        const filter = true;
        const filterByType = 'walk';
        const filterByDate = null;
        const filterOutDate = false;
        let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
        // Render map with filtered activities:
        renderActivities(filteredActivities, filter);
    });

    $('#2021').click((evt) => {
        // If switch toggled off:
        if (evt.target.checked == false) {
            // Filter activities:
            const filter = true;
            const filterByType = null;
            const filterByDate = '2021';
            const filterOutDate = true;
            let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
            // Render map with filtered activities:
            renderActivities(filteredActivities, filter);
        }
        // If switch toggled back on:
        else {
            // Filter activities:
            const filter = true;
            const filterByType = null;
            const filterByDate = '2021';
            const filterOutDate = false;
            let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
            // Render map with filtered activities:
            renderActivities(filteredActivities, filter);
        }
    });

    $('#2020').click((evt) => {
        // If switch toggled off:
        if (evt.target.checked == false) {
            // Filter activities:
            const filter = true;
            const filterByType = null;
            const filterByDate = '2020';
            const filterOutDate = true;
            let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
            // Render map with filtered activities:
            renderActivities(filteredActivities, filter);
        }
        // If switch toggled back on:
        else {
            // Filter activities:
            const filter = true;
            const filterByType = null;
            const filterByDate = '2020';
            const filterOutDate = false;
            let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
            // Render map with filtered activities:
            renderActivities(filteredActivities, filter);
        }
    });

    $('#2019').click((evt) => {
        // If switch toggled off:
        if (evt.target.checked == false) {
            // Filter activities:
            const filter = true;
            const filterByType = null;
            const filterByDate = '2019';
            const filterOutDate = true;
            let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
            // Render map with filtered activities:
            renderActivities(filteredActivities, filter);
        }
        // If switch toggled back on:
        else {
            // Filter activities:
            const filter = true;
            const filterByType = null;
            const filterByDate = '2019';
            const filterOutDate = false;
            let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
            // Render map with filtered activities:
            renderActivities(filteredActivities, filter);
        }
    });

    $('#2018').click((evt) => {
        // If switch toggled off:
        if (evt.target.checked == false) {
            // Filter activities:
            const filter = true;
            const filterByType = null;
            const filterByDate = '2018';
            const filterOutDate = true;
            let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
            // Render map with filtered activities:
            renderActivities(filteredActivities, filter);
        }
        // If switch toggled back on:
        else {
            // Filter activities:
            const filter = true;
            const filterByType = null;
            const filterByDate = '2018';
            const filterOutDate = false;
            let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
            // Render map with filtered activities:
            renderActivities(filteredActivities, filter);
        }
    });

    $('#2017').click((evt) => {
        // If switch toggled off:
        if (evt.target.checked == false) {
            // Filter activities:
            const filter = true;
            const filterByType = null;
            const filterByDate = '2017';
            const filterOutDate = true;
            let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
            // Render map with filtered activities:
            renderActivities(filteredActivities, filter);
        }
        // If switch toggled back on:
        else {
            // Filter activities:
            const filter = true;
            const filterByType = null;
            const filterByDate = '2017';
            const filterOutDate = false;
            let filteredActivities = filterActivities(filterByType, filterByDate, filterOutDate);
            // Render map with filtered activities:
            renderActivities(filteredActivities, filter);
        }
    });
}