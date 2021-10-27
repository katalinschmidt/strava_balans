/*
*   Handle training goal form and render calendar populated with goal plan
*/

console.log("Connected to training.js!");
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

// Populate existingPlansTable on window load:
renderExistingPlans();

// Open form on click:
$('#open-form').click((res) => {
    openForm();
});

function showPlan() {
    document.getElementById("custom-plan").style.display = "block";
}

// Close form on click:
$('#form-cancel').click((res) => {
    closeForm();
});

// Handle form data on submit:
// Using JS to handle the form instead of Python allows us to prevent a redirect or page refresh.
$('#form-submit').click((res) => {
    // On form submission, prevent default (page refresh):
    res.preventDefault();

    // Get select radio btn value & date value:
    const goalName = document.querySelector('input[name="trng-goal"]:checked').value;
    let goalDate = document.querySelector('input[name="trng-goal-date"]').value;
    
    // Format goalDate (to prevent inaccurate timezone offset by new Date method):
    let formattedDate = "";
    for (let i = 0; i < goalDate.length; i++) {
        if (goalDate[i] !== "-") {
            formattedDate += goalDate[i];
        }
        if (goalDate[i] == "-") {
            formattedDate += "/";
        }
    }
    goalDate = new Date(formattedDate);
    goalDate = goalDate.toUTCString(); // Convert to UTC string for DB

    // Mark user's 'today' for activity assignment calculations:
    let today = new Date();
    today = today.toUTCString(); // Convert to UTC string for DB

    // Send data to server for db manipulation:
    $.post({
        url: '/training',
        data: {
            name: goalName,
            date: goalDate,
            today: today
        },
        // If form successfully submitted, render custom training plan:
        success: (res) => {
            console.log("Form submission result:");
            console.log(res);
            renderCalendar(res.map(obj => {
                return {
                    id: obj.day,
                    title: obj.trng_item,
                    start: new Date(obj.date), // FIXME: Convert GMT/UTC to local datetime!
                    allDay: true,
                    extendedProps: { custom_plan_id: obj.custom_plan_id } // extendedProp necessary for sake of having a unique identifier when passing to CRUD function / modifiedActivity
                }
            }));
            
            // Update existing plans table:
            renderExistingPlans();
        },
        error: (res) => {
            alert("Uh-oh! Something went wrong...");
        }
    });

    // Close form after submission:
    closeForm();
});

function showPlan() {
    document.getElementById("custom-plan").style.display = "block";
}

function openForm() {
    document.getElementById("get-trng-plan").style.display = "block";
}

function closeForm() {
    document.getElementById("get-trng-plan").style.display = "none";
}

function openPopup() {
    document.getElementById("edit-item").style.display = "block";
}

function closePopup() {
    document.getElementById("edit-item").style.display = "none";
}

function renderExistingPlans() {
    // Get data for table:
    $.get({
        url: '/get_goals.json',
        success: (res) => {
            console.log("Populate table result:")
            console.log(res);
            // Identify table:
            const table = document.getElementById("existing-plans")
            // Clear existing table rows:
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
            // Parse results & append to table:
            res.forEach((dict) => {
                // Create table row
                const tr = document.createElement("tr");
                // Append row to table:
                table.appendChild(tr);
                
                // Create a table cell for goal id:
                const td_goal_id = document.createElement("td");
                td_goal_id.textContent = dict.goal_id;
                // Create a table cell for goal name:
                const td_goal_name = document.createElement("td");
                td_goal_name.textContent = dict.goal_name;
                // Create a table cell for goal date:
                const td_goal_date = document.createElement("td");
                td_goal_date.textContent = new Date(dict.goal_date).toDateString(); // Format date so that timestamp does not show
                
                // Append table cells to table:
                tr.appendChild(td_goal_id);
                tr.appendChild(td_goal_name);
                tr.appendChild(td_goal_date);

            });
            // Add event listener to each row:
            rowEventHandler();
        },
        error: (res) => {
            alert("Uh-oh! Something went wrong...");
        }
    });
}

// On existing plan's table row click, render selected plan:
function rowEventHandler() {
    // Identify table:
    const table = document.getElementById("existing-plans")
    // Let i = 1 so that header row is not included:
    for (let i = 1, row; row = table.rows[i]; i++) {
        row.onclick = () => {
            // Remove any previous highlighting on all other rows:
            for (let i = 1, row; row = table.rows[i]; i++) {
                row.style.backgroundColor = "";
            }
            // And highlight current / clicked row:
            row.style.backgroundColor = "orange";
            // Get clicked row's goal ID: 
            const clickedGoalID = row.querySelector('td').innerHTML;
            // Make call to server for custom_plan of given goal_id:
            $.post({
                url: '/training',
                data: {id: clickedGoalID},
                success: (res) => {
                    // Render on calendar:
                    renderCalendar(res.map(obj => {
                        return {
                            id: obj.day,
                            title: obj.trng_item,
                            start: new Date(obj.date),
                            allDay: true,
                            extendedProps: { custom_plan_id: obj.custom_plan_id } // extendedProp necessary for sake of having a unique identifier when passing to CRUD function / modifiedActivity
                        }
                    }));
                },
                error: (res) => {
                    alert("Uh-oh! Something went wrong...");
                }
            });
        }; 
    }
}

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
        }
    });
    calendar.render();
}

// Save changes to databse:
function saveChangesToDB(modifiedActivity) {
    $.post({
        url: "/save_changes",
        data: {modifiedActivity: JSON.stringify(modifiedActivity)},
        success: (res) => {
            console.log("Activity successfully modified in DB!");
        },
        error: (res) => {
            alert("Uh-oh! Something went wrong...");
            console.log("Changes to activity were not saved in DB...")
        }
        });
}