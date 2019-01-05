'use strict';

const MOCK_TRIPS = [
    {
        id: 1,
        name: 'Visiting Home',
        location: 'New York, NY',
        startDate: '3/20/2015',
        endDate: '3/30/2015',
        background: 'https://cdn.vox-cdn.com/thumbor/YQVObtsv5vFSxMWPZOxyzPnT3ZE=/0x0:2000x1333/1200x900/filters:focal(840x507:1160x827)/cdn.vox-cdn.com/uploads/chorus_image/image/58405263/171109_08_17_25_5DSR4719.0.jpg'
    },
    {
        id: 2,
        name: 'Vacation 2017',
        location: 'Tokyo, Japan',
        startDate: '5/13/2017',
        endDate: '5/27/2017',
        background: 'https://cdn-image.travelandleisure.com/sites/default/files/styles/1600x1000/public/1488208675/tokyo-japan-FDEALS0217.jpg?itok=VpaGmPRS'
    },
    {
        id: 3,
        name: 'Road Trip Out West',
        location: 'Colorado, USA & 3 more',
        startDate: '6/28/2017',
        endDate: '7/15/2017',
        background: 'https://www.taketours.com/images/destination/USA%20Grand%20Canyon%20South%20Rim.jpg'
    }, 
    {
        id: 4,
        name: 'The Big Island',
        location: 'Hawaii',
        startDate: '2/12/2014',
        endDate: '2/15/2014',
        background: 'https://imagesvc.timeincapp.com/v3/mm/image?url=https%3A%2F%2Fcdn-image.travelandleisure.com%2Fsites%2Fdefault%2Ffiles%2Fstyles%2F1600x1000%2Fpublic%2F1502722460%2Fhanauma-bay-nature-preserve-oahu-hawaii-HAWAIIFLIGHTDEAL0817.jpg%3Fitok%3D5RHXufdE&w=1000&c=sc&poi=face&q=70'
    }
];

function displayTrips() {
    MOCK_TRIPS.forEach(trip => {
        $('.content').append(`
        <div class="grid-item">
            <div class="trip-content">
                <span class="trip-name">${trip.name}</span><br>
                <span class="trip-location">${trip.location}</span><br>
                <span class="trip-dates">${trip.startDate} - ${trip.endDate}</span>
            </div>
        </div>
        `);
        $('.content').children().last().css("background-image", "url('" + trip.background + "')");
    });
}

$(displayTrips);