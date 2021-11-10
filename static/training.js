/*
*   Handle training goal form and render calendar populated with goal plan
*/

console.log("Connected to training.js!");
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

window.onload = () => {
    // Populate existingPlansTable & FullCalendar on window load:
    renderExistingPlans();
    renderCalendar();

    // Handle form data on submit:
    // Using JS to handle the form instead of Python allows us to prevent a redirect or page refresh.
    $('#form-submit').click((res) => {
        // Validate form input:
        const goalName = $('input[name="trng-goal"]:checked').val();
        let goalDate = $('input[name="trng-goal-date"]').val();

        if (goalName == null) {
            alert("Please select a goal!");
            return;
        }
        if (goalDate == '') {
            alert("Please select a date!");
            return;
        }

        // If form successfully submitted, pass data to server:
        // Format goalDate for database:
        let formattedDate = "";
        for (let i = 0; i < goalDate.length; i++) {
            if (goalDate[i] !== "-") {
                formattedDate += goalDate[i];
            }
            if (goalDate[i] == "-") {
                formattedDate += "/";
            }
        }
        goalDate = new Date(formattedDate);  // String manipulation required to prevent inaccurate timezone offset by new Date method
        goalDate = goalDate.toUTCString();

        // Mark user's 'today' / timezone for activity assignment calculations:
        let today = new Date();
        today = today.toUTCString();

        $.post({
            url: '/training',
            data: {
                name: goalName,
                date: goalDate,
                today: today
            },
            success: (res) => {
                // Close form:
                $('#get-trng-plan').modal('toggle');
                $('#trng-goal-form').trigger('reset');

                // Render on calendar:
                renderCalendar(res.map(obj => {
                    return {
                        id: obj.day,
                        title: obj.trng_item,
                        start: new Date(obj.date),
                        allDay: true,
                        // extendedProp necessary for sake of having a unique identifier when passing modified activities to CRUD function
                        extendedProps: { custom_plan_id: obj.custom_plan_id, goal_id: obj.goal_id }
                    }
                }));
                
                // Update existing plans table:
                const isFormSubmit = true;
                renderExistingPlans(isFormSubmit);
            },
            error: (res) => {
                alert("Uh-oh! Something went wrong...");
            }
        });
    });

    function renderExistingPlans(isFormSubmit) {
        // Get data for table:
        $.get({
            url: '/get_goals.json',
            success: (res) => {
                // Identify table:
                const table = document.getElementById('existing-plans');
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
                    
                    // Create a hidden table cell for goal id:
                    let td_goal_id = document.createElement("td");
                    td_goal_id.style.display = 'none';
                    td_goal_id.textContent = dict.goal_id;
                    // Create a table cell for goal name:
                    const td_goal_name = document.createElement("td");
                    td_goal_name.textContent = dict.goal_name;
                    // Create a table cell for goal date:
                    const td_goal_date = document.createElement("td");
                    td_goal_date.textContent = new Date(dict.goal_date).toDateString(); // Format date so that timestamp does not show
                    // Create table cells for event handling:
                    const td_view = document.createElement("td");
                    td_view.textContent = "🔍";
                    td_view.style.cursor = "pointer";
                    const td_delete = document.createElement("td");
                    td_delete.textContent = "🗑️";
                    td_delete.style.cursor = "pointer";

                    // Append table cells to table:
                    tr.appendChild(td_goal_id);
                    tr.appendChild(td_goal_name);
                    tr.appendChild(td_goal_date);
                    tr.appendChild(td_view);
                    tr.appendChild(td_delete);
                });
                // Add event listener to each row:
                rowEventHandler(isFormSubmit);
            },
            error: (res) => {
                alert("Uh-oh! Something went wrong...");
            }
        });
    }

    // On existing plans table row click and form-submit, highlight table row & render selected plan:
    function rowEventHandler(isFormSubmit) {
        // Identify table:
        const table = document.getElementById('existing-plans');
        // Let i = 1 so that header row is not included:
        for (let i = 1, row; row = table.rows[i]; i++) {
            // Highlight last row in table (only upon form submit, not initial window load):
            if (isFormSubmit) {
                $('#existing-plans tr').last().css('backgroundColor', '#3588D8');
            }

            // Create event listener for magnifying glass / trash bin:
            // Identify magnifying glass in row:
            const viewPlan = $(row).find("td:nth-last-child(2)");
            // When magnifying glass clicked, render plan:
            viewPlan.click((res) => {
                // Remove any previous highlighting on all other rows:
                for (let i = 1, row; row = table.rows[i]; i++) {
                    row.style.backgroundColor = "";
                }
                // And highlight current / clicked row:
                row.style.backgroundColor = "#3588D8";

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
                                // extendedProp necessary for sake of having a unique identifier when passing modified activities to CRUD function
                                extendedProps: { custom_plan_id: obj.custom_plan_id, goal_id: obj.goal_id }
                            }
                        }));
                    },
                    error: (res) => {
                        alert("Uh-oh! Something went wrong...");
                    }
                });
            });

            // Identify trash can icon in row:
            const deletePlan = $(row).find("td:nth-last-child(1)");
            // When trash can icon clicked, delete goal & plan:
            deletePlan.click((res) => {
                // Get clicked row's goal ID: 
                const clickedGoalID = row.querySelector('td').innerHTML;
                
                // Make call to server to delete custom_plan of given goal_id:
                $.post({
                    url: '/delete_plan',
                    data: {id: clickedGoalID},
                    success: (res) => {
                        // Re-render calendar:
                        renderCalendar(res);
                        // Update table:
                        renderExistingPlans();
                    },
                    error: (res) => {
                        alert("Uh-oh! Something went wrong...");
                    }
                });
            });
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
            eventClick: function(calendarItem) {
                // On click, show pop-up populated with existing training item name:
                $('#curr_trng_item').empty().append(calendarItem.event.title);
                $('#edit-trng-plan').modal('show');

                // On submit, get user input:
                $('#edit-submit').click(() => {
                    calendarItem.new_item = $('#edited-item').val();
                    // Save changes to DB:
                    saveChangesToDB(calendarItem); 
                });
            }
        });
        calendar.render();
    }

    // Save changes to database:
    function saveChangesToDB(calendarItem) {
        $.post({
            url: "/save_changes",
            data: {modifiedActivity: JSON.stringify(calendarItem)},
            success: (res) => {
                console.log("Activity successfully modified in DB!");
                // Re-render calendar with saved changed:
                $.post({
                    url: "/training",
                    data: {id: JSON.stringify(calendarItem.event.extendedProps.goal_id)},
                    success: (res) => {
                        renderCalendar(res.map(obj => {
                            return {
                                id: obj.day,
                                title: obj.trng_item,
                                start: new Date(obj.date),
                                allDay: true,
                                // extendedProp necessary for sake of having a unique identifier when passing modified activities to CRUD function
                                extendedProps: { custom_plan_id: obj.custom_plan_id, goal_id: obj.goal_id }
                            }
                        }));
                    },
                    error: (res) => {
                        alert("Failed to automatically refresh the page. Please refresh manually.")
                    }
                })
            },
            error: (res) => {
                alert("Uh-oh! Something went wrong...");
            }
        });
    }
}