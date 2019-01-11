'use strict';
let token = localStorage.getItem('authToken');

//Creates an object from a form where the keys are the form input names and the values are the respective values
//Pass the form ID as an argument
function formToObject(form) {
    let formData = {};
    const rawForm = $(`${form}`).serializeArray();
    rawForm.forEach(input => {  
        formData[input.name] = input.value;  
    });
    return formData;
}

function removeModal() {
    $('.modal').addClass('hidden');
}

function displayModal() {
    $('.modal').removeClass('hidden');
}

//TODO: Implement This
function displayTripDetails(tripId) {
    $('.content').html('');
}

function displayEditTrip(tripId) {
    $(`.trip-content[data=${tripId}]`).html(`
    <form id="js-trip-edit-form" data="${tripId}">
        <input type="text" placeholder="Trip Name" name="name"><br>
        <input type="text" placeholder="Location(s)" name="location"><br>
        <input type="datetime" value="Start Date" name="startDate"><input type="datetime" value="End Date" name="endDate"><br>
        <input type="submit">
    </form>
    `);
}

function displayAddForm() {
    $('.options').append(`
    <form id="js-trip-add-form">
        <input type="text" placeholder="Trip Name" name="name"><br>
        <input type="text" placeholder="Location(s)" name="location"><br>
        <input type="datetime" value="Start Date" name="startDate"><input type="datetime" value="End Date" name="endDate"><br>
        <input type="text" value="Image URL" name="background"><br>
        <input type="submit">
    </form>
    `);
}

function displayLogin() {
    $('.modal-content').html(`<form id="js-login">
        <label for="username">Username: <input type="text" placeholder="Username" name="username" id="username"></label><br>
        <label for="password">Password: <input type="password" placeholder="Password" name="password" id="password"></label><br>
        <input type="submit">
    </form>
    `);
    displayModal();
}

function displaySignUpForm() {
    $('.modal-content').html(`<form id="js-signup">
        <label for="username">Username:</label><br>
        <input type="text" placeholder="Username" name="username" id="username"><br>
        <label for="password">Password:</label><br>
        <input type="password" placeholder="Password" name="password" id="password"><br>
        <input type="submit">
    </form>
    `);
    displayModal();
}

function login() {
    const loginData = formToObject('#js-login');
    fetch('/auth/login', {
        method: 'post',
        body: JSON.stringify(loginData),
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(res => res.json())
    .then(responseJson => {
        localStorage.setItem('authToken', responseJson.authToken);
        //TODO: Add error feedback
        removeModal();
        displayTrips();
    })
    .catch(err => {
        //TODO: error handling
        console.log(err);
    });
}

function signUp() {
    const loginData = formToObject('#js-signup');
    fetch('/users', {
        method: 'post',
        body: JSON.stringify(loginData),
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(response => {
        if (response.ok) {
            //TODO: feedback
            removeModal();
        }
        else {
            //TODO: error handling
            throw new Error();
        }
    })
    .catch(err => {
        //TODO: error handling
        console.log(err);
    });
}

function addTrip() {
    //Get values from form, format into post request, submit, then check status code.
    let tripData = formToObject('#js-trip-add-form')
    fetch('/trips', {
        method: 'post', 
        body: JSON.stringify(tripData),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.ok) {
            //TODO: Post successful - display feedback
            displayTrips();
        } 
        else {
            //TODO: Error handling
            throw new Error(res.statusText);
        }
    })
    .catch('An error occurred');
}

function editTrip(tripId) {
    let tripData = formToObject('#js-trip-edit-form')
    console.log(JSON.stringify(tripData));
    fetch(`/trips/${tripId}`, {
        method: 'put', 
        body: JSON.stringify(tripData),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.ok) {
            //TODO: Post successful - display feedback
            displayTrips();
        } 
        else {
            //TODO: Error handling
            throw new Error(res.statusText);
        }
    })
    .catch('An error occurred');
}

function deleteTrip(tripId) {
    //TODO: Add user confirmation behavior...
    fetch(`/trips/${tripId}`, {method: 'delete', headers: {"Authorization": `Bearer ${token}`}})
    .then(res => {
        if (res.ok) {
            //Delete successful - display feedback
            displayTrips();
        }
        else {
            //TODO: Better error handling
            throw new Error(res.statusText);
        }
    })
    .catch('An error occurred');
}

function displayTrips() {
    console.log(token);
    $('.content').html('');
    fetch('/trips', {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(trips => {
        trips.forEach(trip => {
            $('.content').append(`
            <div class="grid-item">
                <div class="trip-content" data="${trip.id}">
                    <span class="trip-name">${trip.name}</span><br>
                    <span class="trip-location">${trip.location}</span><br>
                    <span class="trip-dates">${trip.startDate} - ${trip.endDate}</span><br>
                    <button class="js-edit-trip">Edit</button>
                    <button class="js-delete-trip">Delete</button>
                </div>
            </div>
            `);
            $('.content').children().last().css("background-image", "url('" + trip.background + "')");
        });
    });
}

function eventListener() {
    displayTrips();
    $('.content').on('click', '.js-edit-trip', function(event) {
        event.preventDefault();
        displayEditTrip($(this).parent().attr('data'));
    });
    $('.content').on('click', '.js-delete-trip', function(event) {
        event.preventDefault();
        deleteTrip($(this).parent().attr('data'));
    });
    $('.options').on('click', '.add-trip', function(event) {
        event.preventDefault();
        displayAddForm();
    });
    $('.options').on('click', '.login', function(event) {
        event.preventDefault();
        displayLogin();
    });
    $('.options').on('click', '.sign-up', function(event) {
        event.preventDefault();
        displaySignUpForm();
    });
    $('.content').on('submit', '#js-trip-edit-form', function(event) {
        event.preventDefault();
        editTrip($(this).parent().attr('data'));
    });
    $('.options').on('submit', '#js-trip-add-form', function(event) {
        event.preventDefault();
        addTrip();
    });
    $('.modal').on('click', function(event) {
        //Only close the modal if the closest target is NOT "modal-content" (i.e. clicked inside the content box)
        if (!$(event.target).closest('.modal-content').length) {
            removeModal();
        }
    });
    $('.modal-content').on('submit', '#js-login', function(event) {
        event.preventDefault();
        login();
    });
    $('.modal-content').on('submit', '#js-signup', function(event) {
        event.preventDefault();
        signUp();
    });
}

$(eventListener);