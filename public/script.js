'use strict';
let token = localStorage.getItem('authToken');

function parseJSON(response) {
    return new Promise((resolve) => response.json()
      .then((json) => resolve({
        status: response.status,
        ok: response.ok,
        json,
      })));
  }

//Creates an object from a form where the keys are the form input names and the values are the respective values
//Pass the form ID as an argument
function formToObject(form, tripId) {
    let formData = {};
    let rawForm;
    if (tripId) {
        rawForm = $(`${form}[data=${tripId}]`).serializeArray();
    }
    else {
        rawForm = $(`${form}`).serializeArray();
    }
    rawForm.forEach(input => {  
        if (input.value != '') {
            formData[input.name] = input.value;  
        }
    });
    return formData;
}

function removeModal() {
    $('.modal').addClass('hidden');
}

function displayModal() {
    $('.modal').removeClass('hidden');
}

function randomPageImage() {
    const path = '/assets/panes';
    const images = ['china', 'japan', 'new-york', 'palm-trees', 
    'paris', 'rio', 'savannah', 'sydney', 'travel', 'venice'];
    const random = Math.floor(Math.random() * (images.length));
    return `${path}/${images[random]}.jpg`;
}

/****************************
 * USER SIGNUP/LOGIN FUNCTIONS
 ****************************/

function login() {
    const loginData = formToObject('#js-login');
    fetch('/auth/login', {
        method: 'post',
        body: JSON.stringify(loginData),
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(res => {
        if (res.ok) {
            return res.json();
        }
        throw new Error('Invalid username/password combination.');
    })
    .then(responseJson => {
        localStorage.setItem('authToken', responseJson.authToken);
        localStorage.setItem('user', responseJson.user);
        location.reload();
    })
    .catch(err => {
        $('.modal-error').text(err.message);
    });
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    location.reload();
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
    .then(parseJSON)
    .then(res => {
        if (res.ok) {
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
                location.reload();
            })
        }
        else {
            throw new Error(res.json.message);
        }
    })
    .catch(err => {
        $('.modal-error').text(err.message);
    });
}

function displayLogin() {
    $('.modal-content').html(`
    <div class="pane"><img src="${randomPageImage()}"></div>
    <h2>Login</h2>
    <form id="js-login" action="javascript:login()">
        <div class="modal-error">
        </div>
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
        <div class="modal-error">
        </div>
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

/****************************
 * PAGE DISPLAY FUNCTIONS
 ****************************/

function displayTrips() {
    //If user is not logged-in, immediately return to prevent trips from being reloaded.
    if (!token) {
        return;
    }
    $('.content').html('<div class="trip-grid" aria-live="polite"></div>');
    $('.options').html('<h2>My Trips</h2><a href="javascript:displayAddTripForm()">Add Trip</a>');
    fetch('/trips', {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(trips => {
        trips.forEach(trip => {
            $('.trip-grid').append(`
            <div class="grid-item">
                <div class="trip-content" data="${trip.id}" aria-live="polite">
                    <div class="panel-text">
                        <span class="trip-name"><a href="javascript:displayEvents('${trip.id}')">${trip.name} →</a></span><br>
                        <span class="trip-location">${trip.location}</span><br>
                        <span class="trip-dates">${trip.startDate} - ${trip.endDate}</span><br>
                    </div>
                    <div class="panel-controls">
                        <button class="js-show-edit-trip-form"><img src="/assets/icons8-edit-16.png"> Edit</button>
                        <button class="js-delete-trip"><img src="/assets/icons8-trash-can-16.png"> Delete</button>
                    </div>
                </div>
            </div>
            `);
            $('.trip-grid').children('.grid-item').last().css("background-image", "url('" + trip.background + "')");
        });
    });
}

function displayEvents(tripId) {
    $('.content').html('<div class="event-grid" aria-live="polite"></div>');
    const eventPromise = fetch(`/events?trip=${tripId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }).then(res => res.json());
    const tripPromise = fetch(`/trips/${tripId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }).then(res => res.json());
    Promise.all([eventPromise, tripPromise])
    .then(data => {
        const events = data[0];
        const trip = data[1];
        $('.options').html(`
            <h2>${trip.name}</h2>
            <span class="event-trip-location">${trip.location}</span><br><br>
            <a href="javascript:displayAddEventForm('${trip.name}', '${trip.id}')">Add Event</a>
            <a href="javascript:displayTrips()">All Trips</a>
        `);
        if (events.length === 0) {
            $('.options').append('<br>No events yet. <a href="javascript:displayAddEventForm()">Add One?</a>');
        }
        events.forEach(event => {
            $('.event-grid').append(`
            <div class="event-item" data="${event.id}" aria-live="polite">
            </div>
            `);
            if (event.image) {
                $(`.event-item[data="${event.id}"]`).append(`
                <div class="event-image">
                    <img src="${event.image}">
                </div>
                `);
            }
            else {
                $(`.event-item[data="${event.id}"]`).append(`
                <div class="event-image">
                    <img src="${trip.background}">
                </div>
                `);
            }
            $(`.event-item[data="${event.id}"]`).append(`
                <div class="event-content">
                    <div class="event-text">
                        <span class="event-name">${event.name}</a></span><br>
                        <span class="event-location">${event.location}</span><br>
                    </div>
                    <div class="event-controls">
                        <button class="js-show-edit-event-form"><img src="/assets/icons8-edit-16.png">Edit</button>
                        <button class="js-delete-event"><img src="/assets/icons8-trash-can-16.png">Delete</button>
                    </div>
                </div>
            `);
            if (event.dateTime) {
                $(`.event-item[data="${event.id}"]`).find('.event-text').append(event.dateTime);
            }
            if (event.description) {
                $(`.event-item[data="${event.id}"]`).find('.event-text').append(`<p>${event.description}</p>`);
            }
        });
        $('.content').attr('data', trip.id);
    });
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

function displayEditForm(tripId, panel) {
    fetch(`/trips/${tripId}`, {
        method: 'get', 
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(resJson => {
        $(`.trip-content[data=${tripId}]`).children('.panel-text').html(`
            <form class="js-edit-trip-form" data="${tripId}" aria-live="polite">
                <input type="text" placeholder="Name" name="name" value="${resJson.name}"><br>
                <input type="text" placeholder="Location" name="location" value="${resJson.location}"><br>
                <input type="datetime" placeholder="Start Date" name="startDate" value="${resJson.startDate}">
                <input type="datetime" placeholder="End Date" name="endDate" value="${resJson.endDate}"><br>
            </form>
        `);
        panel.parent().css('visibility', 'visible');
        panel.parent().html(`
            <button class="js-edit-trip"><img src="/assets/icons8-edit-16.png"> Edit</button>
            <button class="cancel-edit"><img src="/assets/icons8-delete-16.png"> Cancel</button>
        `); 
    });
}

function displayEditEventForm(eventId, panel) {
    fetch(`/events/${eventId}`, {
        method: 'get', 
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => res.json())
    .then(resJson => {
        $(`.event-item[data=${eventId}]`).find('.event-text').html(`
            <form class="js-edit-event-form" data="${eventId}" aria-live="polite">
                <input type="text" placeholder="Name" name="name" value="${resJson.name}"><br>
                <input type="text" placeholder="Location" name="location" value="${resJson.location}"><br>
                <input type="datetime" placeholder="Date/Time" name="dateTime" value="${resJson.dateTime || ''}"><br>
                <textarea placeholder="Description" name="description" value="${resJson.description || ''}"></textarea><br>
                <input type="text" placeholder="Image URL" name="image" value="${resJson.image || ''}">
            </form>
        `);
        panel.parent().css('visibility', 'visible');
        panel.parent().html(`
            <button class="js-edit-event"><img src="/assets/icons8-edit-16.png"> Edit</button>
            <button class="cancel-event-edit"><img src="/assets/icons8-delete-16.png"> Cancel</button>
        `); 
    });
}

function displayAddTripForm() {
    $('.modal-content').html(`
    <div class="pane"><img src="/assets/panes/new-trip.jpg"></div>
    <h2>Add Trip</h2>
    <form id="js-trip-add-form" action="javascript:addTrip()" aria-live="polite">
        <div class="modal-error">
        </div>
        <div class="form-line">
            <label for="name">Trip Name</label>
            <input type="text" placeholder="e.g. My Summer Vacation" name="name" id="name" required>
        </div>
        <div class="form-line">
            <label for="location">Location</label>
            <input type="text" placeholder="e.g. Florida" name="location" id="location" required>
        </div>
        <div class="form-line">
            <label for="startDate">Start Date</label>
            <input type="datetime" placeholder="e.g. 1/5/2018" name="startDate" id="startDate" required>
        </div>
        <div class="form-line">
            <label for="endDate">End Date</label> 
            <input type="datetime" placeholder="e.g. 1/12/2018" name="endDate" id="endDate" required>
        </div>
        <div class="form-line">
            <label for="background">Image URL</label>
            <input type="text" placeholder="optional" name="background" id="background">
        </div>
        <br>
        <input type="submit">
    </form>
    `);
    displayModal();
}

function displayAddEventForm(tripName, tripId) {
    $('.modal-content').html(`
    <div class="pane"><img src="/assets/panes/new-event.jpg"></div>
    <h2>Add Event</h2>
    Adding event to ${tripName}<br>
    <form id="js-add-event-form" action="javascript:addEvent('${tripId}')" aria-live="polite">
        <div class="modal-error">
        </div>
        <div class="form-line">
            <label for="name">Event Name</label>
            <input type="text" placeholder="e.g. Dinner" name="name" id="name" required>
        </div>
        <div class="form-line">
            <label for="location">Location</label>
            <input type="text" placeholder="e.g. Eiffel Tower" name="location" id="location" required>
        </div>
        <div class="form-line">
            <label for="dateTime">Date</label>
            <input type="text" placeholder="10/29/2014" name="dateTime" id="dateTime">
        </div>
        <div class="form-line">
            <label for="image">Image URL</label>
            <input type="text" placeholder="optional" name="image" id="image">
        </div>
        <div class="form-line">
            <label for="description">Description</label>
            <textarea placeholder="optional" name="description" id="description"></textarea>
        </div>
        <br>
        <input type="submit">
    </form>
    `);
    displayModal();
}

function displayDeleteConfirmation(panel) {
    panel.parent().css('visibility', 'visible');
    panel.parent().html(`
        <button class="delete-trip"><img src="/assets/icons8-trash-can-16.png"> Delete</button>
        <button class="cancel-delete"><img src="/assets/icons8-delete-16.png"> Cancel</button>
    `);
}

function displayEventDeleteConfirmation(panel) {
    panel.parent().css('visibility', 'visible');
    panel.parent().html(`
        <button class="delete-event"><img src="/assets/icons8-trash-can-16.png"> Delete</button>
        <button class="cancel-event-delete"><img src="/assets/icons8-delete-16.png"> Cancel</button>
    `);
}

/**************************************************
 * PAGE FUNCTIONS - ADD, DELETE, EDIT (TRIPS)
 **************************************************/

function addTrip() {
    //Get values from form, format into post request, submit, then check status code.
    let tripData = formToObject('#js-trip-add-form');
    fetch(`/trips`, {
        method: 'post', 
        body: JSON.stringify(tripData),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(parseJSON)
    .then(res => {
        if (res.ok) {
            removeModal();
            displayTrips();
        } 
        else {
            throw new Error(res.json.message);
        }
    })
    .catch(err => {
        console.log(err.message);
        $('.modal-error').text(err.message);
    });
}

function editTrip(tripId) {
    let tripData = formToObject('.js-edit-trip-form', tripId);
    tripData.id = tripId;
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
            displayTrips();
        } 
        else {
            throw new Error(res.statusText);
        }
    })
    .catch('An error occurred');
}

function deleteTrip(tripId) {
    fetch(`/trips/${tripId}`, {method: 'delete', headers: {"Authorization": `Bearer ${token}`}})
    .then(res => {
        if (res.ok) {
            displayTrips();
        }
        else {
            throw new Error(res.statusText);
        }
    })
    .catch(console.log(`An error occurred: ${err.message}`));
}

function cancelDelete(panel) {
    panel.parent().css('visibility', '');
    panel.parent().html(`
        <button class="js-edit-trip"><img src="/assets/icons8-edit-16.png"> Edit</button>
        <button class="js-delete-trip"><img src="/assets/icons8-trash-can-16.png"> Delete</button>
    `);
}

/**************************************************
 * PAGE FUNCTIONS - ADD, DELETE, EDIT (EVENTS)
 **************************************************/

function addEvent(tripId) {
    let tripData = formToObject('#js-add-event-form');
    tripData.trip = tripId;
    fetch(`/events?trip=${tripId}`, {
        method: 'post', 
        body: JSON.stringify(tripData),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(parseJSON)
    .then(res => {
        if (res.ok) {
            removeModal();
            displayEvents(tripId);
        } 
        else {
            throw new Error(res.json.message);
        }
    })
    .catch(err => {
        console.log(err.message);
        $('.modal-error').text(err.message);
    });
}

function editEvent(eventId) {
    let eventData = formToObject('.js-edit-event-form', eventId);
    eventData.id = eventId;
    fetch(`/events/${eventId}`, {
        method: 'put', 
        body: JSON.stringify(eventData),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.ok) {
            const tripId = $('.content').attr('data');
            displayEvents(tripId);
        } 
        else {
            throw new Error(res.statusText);
        }
    })
    .catch('An error occurred');

}

function deleteEvent(eventId) {
    fetch(`/events/${eventId}`, {method: 'delete', headers: {"Authorization": `Bearer ${token}`}})
    .then(res => {
        if (res.ok) {
            //Delete successful - display feedback
            const tripId = $('.content').attr('data');
            displayEvents(tripId);
        }
        else {
            throw new Error(res.statusText);
        }
    });
}

function cancelEventDelete(panel) {
    panel.parent().css('visibility', '');
    panel.parent().html(`
        <button class="js-edit-trip"><img src="/assets/icons8-edit-16.png"> Edit</button>
        <button class="js-delete-trip"><img src="/assets/icons8-trash-can-16.png"> Delete</button>
    `);
}

/*******************
 * EVENT LISTENER
 *******************/

function eventListener() {
    displayUserInfo();
    displayTrips();

    $('.content').on('click', '.js-show-edit-trip-form', function(event) {
        event.preventDefault();
        displayEditForm($(this).parents('.trip-content').attr('data'), $(this));
    });
    $('.content').on('click', '.js-show-edit-event-form', function(event) {
        event.preventDefault();
        displayEditEventForm($(this).parents('.event-item').attr('data'), $(this));
    });
    $('.content').on('click', '.delete-trip', function(event) {
        event.preventDefault();
        deleteTrip($(this).parents('.trip-content').attr('data'));
    });
    $('.content').on('click', '.js-delete-trip', function(event) {
        event.preventDefault();
        displayDeleteConfirmation($(this));
    });
    $('.content').on('click', '.cancel-delete', function(event) {
        event.preventDefault();
        cancelDelete($(this));
    });
    $('.options').on('click', '.add-trip', function(event) {
        event.preventDefault();
        displayAddTripForm();
    });
    $('.content').on('click', '.js-edit-trip', function(event) {
        event.preventDefault();
        editTrip($(this).parents('.trip-content').attr('data'));
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
    $('.content').on('click', '.cancel-edit', function(event) {
        event.preventDefault();
        displayTrips();
    });
    $('.content').on('click', '.cancel-event-edit', function(event) {
        event.preventDefault();
        const tripId = $('.content').attr('data');
        displayEvents(tripId);
    });
    $('.content').on('click', '.js-delete-event', function(event) {
        event.preventDefault();
        displayEventDeleteConfirmation($(this));
    });
    $('.content').on('click', '.delete-event', function(event) {
        event.preventDefault();
        deleteEvent($(this).parents('.event-item').attr('data'));
    });
    $('.content').on('click', '.cancel-event-delete', function(event) {
        event.preventDefault();
        cancelEventDelete($(this));
    });
    $('.content').on('click', '.js-edit-event', function(event) {
        event.preventDefault();
        editEvent($(this).parents('.event-item').attr('data'));
    });
}

$(eventListener);
