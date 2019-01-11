'use strict';
let token = localStorage.getItem('authToken');

//Creates an object from a form where the keys are the form input names and the values are the respective values
//Pass the form ID as an argument
function formToObject(form) {
    let formData = {};
    const rawForm = $(`${form}`).serializeArray();
    rawForm.forEach(input => {  
        if (input.value != '') {
            formData[input.name] = input.value;  
        }
    });
    return formData;
}

function randomPageImage() {
    const path = '/assets/panes';
    const images = ['china', 'japan', 'new-york', 'palm-trees', 
    'paris', 'rio', 'savannah', 'sydney', 'travel', 'venice'];
    const random = Math.floor(Math.random() * (images.length));
    console.log(random);
    return `${path}/${images[random]}.jpg`;
}

function displayEvents(tripId) {
    console.log("Switching to Event View");
    $('.content').html('');
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

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    location.reload();
}

function displayUserInfo() {
    $('.userinfo').html('');
    const user = localStorage.getItem('user');
    if(user) {
        $('.userinfo').append(`Welcome, ${user} | <a href="javascript:logout()">Logout</a>`);
    }
    else {
        $('.userinfo').append(`Welcome: <a href="javascript:displayLogin()">Login</a> | <a href="javascript:displaySignUpForm()">Signup</a>`);
    }
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
    $('.modal-content').html(`
    <form id="js-trip-add-form" action="javascript:addTrip()">
        <input type="text" placeholder="Trip Name" name="name"><br>
        <input type="text" placeholder="Location(s)" name="location"><br>
        <input type="datetime" value="Start Date" name="startDate"><input type="datetime" value="End Date" name="endDate"><br>
        <input type="text" value="Image URL" name="background"><br>
        <input type="submit">
    </form>
    `);
    displayModal();
}

function displayLogin() {
    $('.modal-content').html(`
    <div class="pane"><img src="${randomPageImage()}"></div>
    <h2>Login</h2>
    <form id="js-login" action="javascript:login()">
        <div class="form-line">
            <label for="username">Username</label>
            <input type="text" placeholder="Username" name="username" id="username" required>
        </div>
        <div class="form-line">
            <label for="password">Password</label>
            <input type="password" placeholder="Password" name="password" id="password" required>
        </div>
        <br>
        <input type="submit">
    </form>
    `);
    displayModal();
}

function displaySignUpForm() {
    $('.modal-content').html(`
    <div class="pane"><img src="${randomPageImage()}"></div>
    <h2>Register</h2>
    <form id="js-signup" action="javascript:signup()">
        <div class="form-line">
            <label for="username">Username</label>
            <input type="text" placeholder="Username" name="username" id="username" required>
        </div>
        <div class="form-line">
            <label for="password">Password</label>
            <input type="password" placeholder="Password" name="password" id="password" required>
        </div>
        <br>
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
        localStorage.setItem('user', responseJson.user);
        //TODO: Add error feedback
        location.reload();
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
            removalModal();
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
                    <span class="trip-name"><a href="javascript:displayEvents('${trip.id}')">${trip.name}</a></span><br>
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
    displayUserInfo();
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
    $('.content').on('submit', '#js-trip-edit-form', function(event) {
        event.preventDefault();
        editTrip($(this).parent().attr('data'));
    });
    $('.modal').on('click', function(event) {
        //Only close the modal if the closest target is NOT "modal-content" (i.e. clicked inside the content box)
        if (!$(event.target).closest('.modal-content').length) {
            removeModal();
        }
    });
    $('.modal-content').on('submit', '#js-signup', function(event) {
        event.preventDefault();
        signUp();
    });
}

$(eventListener);