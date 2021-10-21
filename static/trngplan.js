/*
*   Handle training goal form
*/

console.log("Connected to trngplans.js!");
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function closeForm() {
    document.getElementById("get-trng-plan").style.display = "none";
}

function openForm() {
    document.getElementById("get-trng-plan").style.display = "block";
}

// Close form on click:
document.getElementById("form-cancel").addEventListener("click", () => {
    console.log("Closing form...");
    closeForm(); // This function will be called twice so the function is defined outside of this scope.
});

// Get form input on submit:
const goalForm = document.querySelector('form');
goalForm.addEventListener('submit', (res) => {
    console.log("goalForm was submitted!");
    // On form submission, prevent default (page refresh):
    res.preventDefault();
  
    // Construct a FormData object, which fires the formdata event:
    new FormData(goalForm);
});

goalForm.addEventListener('formdata', (res) => {
    console.log('formdata event fired!');

    // Get the form data from the formdata event object & print:
    const data = res.formData;
    for (const value of data.values()) {
        console.log(value);
        
        $.ajax({
            url: '/training',
            type: 'POST',
            data: {
                value: value
            },
            success: (res) => {
                console.log(res);
            },
            error: (res) => {
                console.log(res);
            }
        });
    }
});