'use strict';

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

function addTrip() {
    //Get values from form, format into post request, submit, then check status code.
    let tripData = {};
    const rawTripData = $('#js-trip-add-form').serializeArray();
    rawTripData.forEach(trip => {  
        tripData[trip.name] = trip.value;  
    });
    fetch('/trips', {
        method: 'post', 
        body: JSON.stringify(tripData),
        headers: {
            "Content-Type": "application/json"
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
    let tripData = {};
    const rawTripData = $('#js-trip-edit-form').serializeArray();
    rawTripData.forEach(trip => {  
        tripData[trip.name] = trip.value;  
    });
    tripData.id = tripId;
    console.log(JSON.stringify(tripData));
    fetch(`/trips/${tripId}`, {
        method: 'put', 
        body: JSON.stringify(tripData),
        headers: {
            "Content-Type": "application/json"
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
    fetch(`/trips/${tripId}`, {method: 'delete'})
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
    $('.content').html('');
    fetch('/trips')
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
    })
    $('.content').on('submit', '#js-trip-edit-form', function(event) {
        event.preventDefault();
        editTrip($(this).parent().attr('data'));
    });
    $('.options').on('submit', '#js-trip-add-form', function(event) {
        event.preventDefault();
        addTrip();
    });
}

$(eventListener);