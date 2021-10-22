/*
*   Handle training goal form
*/

console.log("Connected to training.js!");
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function closeForm() {
    document.getElementById("get-trng-plan").style.display = "none";
}

function openForm() {
    document.getElementById("get-trng-plan").style.display = "block";
}

function showPlan() {
    document.getElementById("custom-plan").style.display = "block";
}

// Close form on click:
$('#form-cancel').click((res) => {
    console.log("Closing form...");
    closeForm();
})

// Handle form data on submit:
$('#form-submit').click((res) => {
    console.log("Form submitted!");
    // On form submission, prevent default (page refresh):
    res.preventDefault();

    // Get select radio btn value & date value:
    const goalName = document.querySelector('input[name="trng-goal"]:checked').value;
    let goalDate = document.querySelector('input[name="trng-goal-date"]').value;

    // Send data to server for db manipulation:
    $.ajax({
        url: '/training',
        type: 'POST',
        data: {
            name: goalName,
            date: goalDate
        },
        // If form successfully submitted, render custom training plan:
        success: (res) => {
            showPlan();

            // Count days until trng goal:
            goalDate = new Date(goalDate);
            const today = new Date();           
            // Start by calculating the time difference of the two dates:
            const timeDifference = goalDate.getTime() - today.getTime();          
            // Then use that to calculate the no. of days between the two dates:
            const daysUntil = Math.ceil(timeDifference / (1000 * 3600 * 24));

            // Calculate total num of workouts in plan:
            const totalNumWorkouts = res.length;
            // Subtract daysUntil from totalWorkouts to see how many workouts to render:
            const renderNum = totalNumWorkouts - daysUntil;

            // Loop through workouts:
            res.forEach((dict) => {  
                // And limit rendering to fit number of days between today & goal date: 
                if (dict.day >= renderNum) {
                    // Identify table:
                    const table = document.getElementById("custom-plan")
                    // Create table row
                    const tr = document.createElement("tr");
                    // Append row to table:
                    table.appendChild(tr);
                    
                    // Create a table cell for workout day:
                    const td_day = document.createElement("td");
                    td_day.textContent = dict.day;
                    // Create a table cell for workout item:
                    const td_item = document.createElement("td");
                    td_item.textContent = dict.trng_item;              
                    
                    // Append table cells to table:
                    tr.appendChild(td_day);
                    tr.appendChild(td_item);
                }             
            });
        },
        error: (res) => {
            alert("Uh-oh! Something went wrong...");
        }
    });

    // Close form after submission:
    closeForm();

    // Render calendar:
    // renderCalendar("test");
})


// Calendar:
function renderCalendar(customPlan) {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev, next, today',
            center: 'title',
            right: 'dayGridMonth, timeGridWeek, timeGridDay'
        },
        events: [
            {
                title: 'My Test Activity',
                start: '2021-10-22'
                // end: '2021-10-23T16:00:00'
            }
        ]
    });
    calendar.render();
}