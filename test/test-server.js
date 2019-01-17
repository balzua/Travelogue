'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
mongoose.Promise = global.Promise;

const { Trip } = require('../trips');
const { User } = require('../users');
const { Event } = require('../events');
const { app, runServer, closeServer } = require('../server');
const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);

function seedEvents() {
    let seedData = [];
    return Trip.findOne()
    .then(trip => {
        return trip._id;
    })
    .then(tripId => {
        for (let i = 0; i < 2; i++) {
            seedData.push({
                name: faker.lorem.words(),
                location: faker.address.country(),
                description: faker.lorem.sentences(),
                dateTime: faker.date.past(2),
                user: 'testUser',
                trip: tripId
            })
        }
        return Event.insertMany(seedData);
    });
}

function seedTrips() {
    let seedData = [];
    for (let i = 0; i < 10; i++) {
        seedData.push(generateTrip());
    }
    return Trip.insertMany(seedData);
}

function generateTrip() {
    return {
        name: faker.lorem.words(),
        location: faker.address.country(),
        startDate: faker.date.past(2),
        endDate: faker.date.past(1),
        background: 'fakeUrl',
        user: 'testUser'
    }
}

function tearDownDb() {
    return mongoose.connection.dropDatabase();
}

describe('Test Server', function () {

    const user = {username: 'testUser'};
    const password = 'testPass';
    let token = jwt.sign({user}, JWT_SECRET, {
        subject: user.username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });

    before(function () {
        return runServer(TEST_DATABASE_URL);
    });

    beforeEach(function () {
        return seedTrips();
    });

    beforeEach(function () {
        return seedEvents();
    })

    beforeEach(function () {
        return User.hashPassword(password).then(password => {
            User.create({username: user.username, password});
        })
    });
    
    afterEach(function () {
        return tearDownDb();
    });

    after(function () {
        return closeServer();
    });

    describe('Trip API', function () {

        describe('GET endpoints', function () {
            it('should get all trips successfully', function () {
                let res;
                return chai.request(app)
                .get('/trips')
                .set('authorization', `Bearer ${token}`)
                .then(function (_res) {
                    //Set res equal to the response for use later.
                    res = _res;
                    expect(res).to.have.status(200);
                    expect(res.body).to.have.lengthOf.at.least(1);
                    //Now we return a promise that we will count the blogposts in the test db
                    return Trip.count();
                })
                //When the promise completes, check if it's equal to the length of our response body.
                .then(function (count) {
                    expect(res.body).to.have.lengthOf(count);
                });
            });
        
            it('should retrieve trips with specific structure and fields', function () {
                let resTrip;
                const expectedKeys = ['id', 'name', 'location', 'startDate', 'endDate'];
                return chai.request(app)
                .get('/trips')
                .set('authorization', `Bearer ${token}`)
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res.body).to.be.a('array');
                    expect(res.body).to.have.lengthOf.at.least(1);
                    res.body.forEach(function (post) {
                        expect(post).to.be.a('object');
                        expect(post).to.include.keys(expectedKeys);
                    });
                    //Now get a specific trip so we can check if the values are equal:
                    //This returns a promise to use below:
                    resTrip = res.body[0];
                    return Trip.findById(resTrip.id);
                })
                .then(function (dbPost) {
                    expect(resTrip.name).to.equal(dbPost.name);
                    expect(resTrip.location).to.equal(dbPost.location);
                    expect(resTrip.startDate).to.equal(dbPost.startDate.toDateString());
                    expect(resTrip.endDate).to.equal(dbPost.endDate.toDateString());
                });
            });
        
            it('should get a single trip successfully', function () {
                let toGetTrip;
                return Trip.findOne()
                .then(function (_toGetTrip) {
                    toGetTrip = _toGetTrip;
                    return chai.request(app).get(`/trips/${toGetTrip.id}`).set('authorization', `Bearer ${token}`);
                })
                .then(function (res) {
                    expect(res).to.have.status(200);
                    expect(res).to.be.a('object');
                    expect(res.body.name).to.be.equal(toGetTrip.name);
                    expect(res.body.location).to.be.equal(toGetTrip.location);
                    expect(res.body.startDate).to.be.equal(toGetTrip.startDate.toDateString());
                    expect(res.body.endDate).to.be.equal(toGetTrip.endDate.toDateString());
                });
            });
        });

        describe('POST endpoints', function () {

            it('should post a new trip successfully', function () {
                const newTrip = generateTrip();
                return chai.request(app)
                .post('/trips')
                .set('authorization', `Bearer ${token}`)
                .send(newTrip)
                .then(function (res) {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res.body).to.include.keys(['name', 'location', 'startDate', 'endDate']);
                    expect(res.body.name).to.equal(newTrip.name);
                    expect(res.body.location).to.equal(newTrip.location);
                    expect(res.body.startDate).to.equal(newTrip.startDate.toDateString());
                    expect(res.body.endDate).to.equal(newTrip.endDate.toDateString());
                    expect(res.body.user).to.equal('testUser');
                    expect(res.body.id).to.not.be.null;
                    return Trip.findById(res.body.id);
                })
                .then(function (dbPost) {
                    dbPost = dbPost.serialize();
                    expect(dbPost.name).to.equal(newTrip.name);
                    expect(dbPost.location).to.equal(newTrip.location);
                    expect(dbPost.startDate).to.equal(newTrip.startDate.toDateString());
                    expect(dbPost.endDate).to.equal(newTrip.endDate.toDateString());
                });
            });
        
            it('should reject trips lacking a required field', function () {
                const newTrip = generateTrip();
                delete newTrip.name;
                return chai.request(app)
                .post('/trips')
                .set('authorization', `Bearer ${token}`)
                .send(newTrip)
                .then(function (res) {
                    expect(res).to.have.status(400);
                });
            });

        });
    
        describe('PUT endpoints', function () {

            it('should reject PUT requests for trips where the ID does not match the URL', function () {
                const updateData = {
                    name: faker.lorem.words(),
                    location: faker.address.country()
                };
                return Trip.findOne()
                .then(function (toUpdateTrip) {
                    return chai.request(app).put(`/trips/${toUpdateTrip._id}`)
                    .set('authorization', `Bearer ${token}`)
                    .send(updateData);
                })
                .then(function(res) {
                    expect(res).to.have.status(400);
                })
            });
        
            it('should update trips where all fields are updated', function () {
                const updateData = {
                    name: faker.lorem.words(),
                    location: faker.address.country(),
                    startDate: faker.date.past(),
                    endDate: faker.date.past(),
                    background: faker.lorem.words()
                };
                return Trip.findOne()
                .then(function (toUpdateTrip) {
                    updateData.id = toUpdateTrip._id;
                    return chai.request(app).put(`/trips/${updateData.id}`)
                    .set('authorization', `Bearer ${token}`)
                    .send(updateData);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    return Trip.findById(updateData.id);
                })
                .then(function(updatedTrip) {
                    expect(updateData.name).to.equal(updatedTrip.name);
                    expect(updateData.location).to.equal(updatedTrip.location);
                    expect(updateData.startDate.toDateString()).to.equal(updatedTrip.startDate.toDateString());
                    expect(updateData.endDate.toDateString()).to.equal(updatedTrip.endDate.toDateString());
                    expect(updateData.background).to.equal(updatedTrip.background);
                });
            });
        
            it('should correctly ignore non-updateable fields', function () {
                const updateData = {
                    name: faker.lorem.words(),
                    location: faker.address.country(),
                    cost: faker.random
                };
                return Trip.findOne()
                .then(function (toUpdatePost) {
                    updateData.id = toUpdatePost._id;
                    return chai.request(app).put(`/trips/${updateData.id}`)
                    .set('authorization', `Bearer ${token}`)
                    .send(updateData);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    return Trip.findById(updateData.id);
                })
                .then(function(updatedTrip) {
                    expect(updateData.name).to.equal(updatedTrip.name);
                    expect(updateData.location).to.equal(updatedTrip.location);
                    expect(updatedTrip.cost).to.be.undefined;
                });
            });

        });
    
        describe('DELETE endpoints', function () {
            it('should delete a trip successfully', function () {
                let deleteTrip;
                return Trip.findOne()
                .then(function(_deleteTrip) {
                    deleteTrip = _deleteTrip;
                    return chai.request(app)
                    .delete(`/trips/${deleteTrip._id}`)
                    .set('authorization', `Bearer ${token}`);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    Trip.findById(deleteTrip._id);
                });
            });
        });
    });

    describe('Event API', function () {

        describe('GET endpoints', function () {
            it('should retrieve all events given a trip ID', function () {
                Trip.findOne()
                .then(trip => {
                    let res;
                    return chai.request(app)
                    .get(`/events/?trip=${trip._id}`)
                    .set('authorization', `Bearer ${token}`)
                    .then(_res => {
                        res = _res;
                        expect(res).to.have.status(200);
                        return Event.count({trip: trip._id});
                    })
                    .then(function (count) {
                        expect(res.body).to.have.lengthOf(count);
                    });
                });
            });
        });

        describe('POST endpoints', function () {

            it('should create an event for a given trip ID', function () {
                let newEvent;
                return Trip.findOne()
                .then(trip => {
                    return newEvent = {
                        name: faker.lorem.words(),
                        location: faker.address.country(),
                        dateTime: faker.date.past(2),
                        image: 'fakeUrl',
                        description: faker.lorem.sentences(),
                        trip: trip._id
                    }
                })
                .then(createdEvent => {
                    return chai.request(app)
                    .post('/events')
                    .set('authorization', `Bearer ${token}`)
                    .send(createdEvent)
                })
                .then(res => {
                    expect(res).to.have.status(201);
                    expect(res).to.be.json;
                    expect(res).to.be.a('object');
                    expect(res.body).to.include.keys(['name', 'location', 'dateTime', 'image', 'description', 'trip', 'id']);
                    expect(res.body.name).to.equal(newEvent.name);
                    expect(res.body.location).to.equal(newEvent.location);
                    expect(res.body.dateTime).to.equal(newEvent.dateTime.toDateString());
                    expect(res.body.description).to.equal(newEvent.description);
                    expect(res.body.id).to.not.be.null;
                    return Event.findById(res.body.id);
                })
                .then(dbPost => {
                    dbPost = dbPost.serialize();
                    expect(dbPost.name).to.equal(newEvent.name);
                    expect(dbPost.location).to.equal(newEvent.location);
                    expect(dbPost.dateTime).to.equal(newEvent.dateTime.toDateString());
                    expect(dbPost.description).to.equal(newEvent.description);
                });
            });
        });

        describe('PUT endpoints', function () {

            it('should update an event when supplied with editable data', function () {
                const updateData = {
                    name: faker.lorem.words(),
                    location: faker.address.country()
                };
                return Event.findOne()
                .then(function (toUpdateEvent) {
                    updateData.id = toUpdateEvent._id;
                    return chai.request(app).put(`/events/${updateData.id}`)
                    .set('authorization', `Bearer ${token}`)
                    .send(updateData);
                })
                .then(res => {
                    expect(res).to.have.status(204);
                    return Event.findById(updateData.id);
                })
                .then(updatedEvent => {
                    expect(updateData.name).to.equal(updatedEvent.name);
                    expect(updateData.location).to.equal(updatedEvent.location);
                });
            });
        });
 
        describe('DELETE endpoints', function () {

            it('should delete an event for a given event ID', function () {
                let deleteEvent;
                return Event.findOne()
                .then(_deleteEvent => {
                    deleteEvent = _deleteEvent;
                    return chai.request(app)
                    .delete(`/events/${deleteEvent._id}`)
                    .set('authorization', `Bearer ${token}`);
                })
                .then(function(res) {
                    expect(res).to.have.status(204);
                    Event.findById(deleteEvent._id);
                });
            });
        });

    });
});