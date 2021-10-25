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

// Open form on click:
$('#open-form').click((res) => {
    openForm();
})

// Close form on click:
$('#form-cancel').click((res) => {
    closeForm();
})

// Handle form data on submit:
$('#form-submit').click((res) => {
    console.log("Form submitted!");
    // On form submission, prevent default (page refresh):
    res.preventDefault();

    // Get select radio btn value & date value:
    const goalName = document.querySelector('input[name="trng-goal"]:checked').value;
    const goalDate = document.querySelector('input[name="trng-goal-date"]').value;

    // Send data to server for db manipulation:
    $.post({
        url: '/training',
        data: {
            name: goalName,
            date: goalDate
        },
        success: (res) => {
            console.log(res);
            
            renderCalendar(res.map(obj => {
                return {
                    id: obj.day,
                    title: obj.trng_item,
                    start: new Date(obj.date),
                    allDay: true,
                    extendedProps: {
                        custom_plan_id: obj.custom_plan_id
                    }
                }
            }));

        // // If form successfully submitted, render custom training plan:
        // // This process is exclusive to initial rendering! (Steps do not apply to rendering saved custom plans!)
        // success: (res) => {
            // // Count days until trng goal:
            // goalDate = new Date(goalDate);
            // const today = new Date();      
            // // Start by calculating the time difference of the two dates:
            // const timeDifference = goalDate.getTime() - today.getTime();          
            // // Then use that to calculate the no. of days between the two dates:
            // const daysUntil = Math.ceil(timeDifference / (1000 * 3600 * 24));
            // console.log(`daysUntil = ${daysUntil}`)
            // // Calculate total num of workouts in plan:
            // const totalNumWorkouts = res.length;
            // // Subtract daysUntil from totalWorkouts to see how many workouts are left to render:
            // const renderNum = totalNumWorkouts - daysUntil;

            // // Assign each workout a date, beginning with today:
            // let activityDate = new Date();
            // // Loop through workouts:
            // res.forEach((obj) => {
            //     // Limit date assignment to fit number of days between today & goal date: 
            //     if (obj.day >= renderNum) {               
            //         // Add date to obj for later access:
            //         obj.date = new Date(activityDate) // JS assigns obj's value by reference, not assign by copy value (e.g. obj.date = activityDate, like with primitive variables)
            //         // Remove time stamp from date (so that it displays as an all-day event in calendar):
            //         obj.date = obj.date.toISOString().split('T')[0];
            //         // Add 1 to date for next day's activity:
            //         activityDate.setDate(activityDate.getDate()+1);
            //     }
            // });

            // // Save date assignment to database:
            // // saveChangesToDB(res);

            // renderCalendar(res.map(obj => {
            //     return {
            //         id: obj.day, // NOTE: This changes the JS object / 'Python dict key names'!
            //         title: obj.trng_item,
            //         start: obj.date,
            //         // allDay: true // This also works, but perhaps editing this first will give a cleaner UI later when user can modify time?
            //         // TESTING:
            //         extendedProps: {
            //             goal_id: obj.goal_id
            //         }
            //     }
            // }));
        },
        error: (res) => {
            alert("Uh-oh! Something went wrong...");
        }
    });

    // Close form after submission:
    closeForm();
})


// Render plan in calendar:
function renderCalendar(customPlan) {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev, next, today',
            center: 'title',
            right: 'dayGridMonth, timeGridWeek, timeGridDay'
        },
        events: customPlan,
        editable: true,
        eventDrop: function(calendarItem) { // Save drag & drop date changes to database
            saveChangesToDB(calendarItem.event.toPlainObject());
        },
        eventClick: function(calendarItem) { // Save trng_item changes to database
            console.log("Click occured!")
            console.log(calendarItem);
        }
    });
    calendar.render();
}

// Save changes to databse:
function saveChangesToDB(modifiedActivity) {
    console.log("Saving changes to database...");

    $.post({
        url: "/save_changes",
        data: {modifiedActivity: JSON.stringify(modifiedActivity)},
        success: (res) => {
            console.log("Yay, it worked!");
        },
        error: (res) => {
            alert("Uh-oh! Something went wrong...");
        }
        });
}