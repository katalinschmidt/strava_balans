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
            // Count days until trng goal:
            goalDate = new Date(goalDate);
            const today = new Date();      
            // Start by calculating the time difference of the two dates:
            const timeDifference = goalDate.getTime() - today.getTime();          
            // Then use that to calculate the no. of days between the two dates:
            const daysUntil = Math.ceil(timeDifference / (1000 * 3600 * 24));

            // Calculate total num of workouts in plan:
            const totalNumWorkouts = res.length;
            // Subtract daysUntil from totalWorkouts to see how many workouts are left to render:
            const renderNum = totalNumWorkouts - daysUntil;

            // Assign each workout a date, beginning with today:
            let activityDate = new Date();
            // Loop through workouts:
            res.forEach((obj) => {
                // And limit assignment to fit number of days between today & goal date: 
                if (obj.day >= renderNum) {               
                    // Add date to obj for later access:
                    obj.date = new Date(activityDate) // JS assigns obj's value by reference, not assign by copy value (e.g. obj.date = activityDate, like with primitive variables)
                    // Remove time stamp from date (so that it displays as an all-day event in calendar):
                    obj.date = obj.date.toISOString().split('T')[0];

                    // Add 1 to date for next day's activity:
                    activityDate.setDate(activityDate.getDate()+1);
                }
            });

            renderCalendar(res.map(obj => {
                return {       
                    title: obj.trng_item,
                    start: obj.date
                }
            }));
        },
        error: (res) => {
            alert("Uh-oh! Something went wrong...");
        }
    });

    // Close form after submission:
    closeForm();
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
        events: customPlan
    });
    calendar.render();
}