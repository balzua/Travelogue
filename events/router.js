const express = require('express');
const bodyParser = require('body-parser');
const {Event} = require('./models');
const {Trip} = require('../trips');

const jsonParser = bodyParser.json();
const router = express.Router();


router.get('/', (req, res) => {
    const tripId = req.query.trip;
    Event.find({user: req.user.username, trip: tripId})
    .then(events => {
        res.status(200).send(events.map(event => event.serialize()));
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    });
});

router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['name', 'location', 'trip'];
    let missingFields = [];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            missingFields.push(field);
        }
    }); 
    if (missingFields.length > 0) {
        return res.status(400).json({message: `Missing fields: ${missingFields.join(' ')}`});
    }
    Trip.findOne({_id: req.body.trip})
    .then(trip => {
        if (trip.user != req.user.username) { 
            return res.status(401).json({message: 'Unauthorized: trip does not belong to you'});
        }
        else {
            const newEvent = req.body;
            newEvent.user = req.user.username;
            Event.create(newEvent)
            .then((newEvent) => {
                res.status(201).json(newEvent.serialize());
            });
        }
    })
    .catch(err => {
        res.status(500).send(`Internal Server Error`);
    });

});

router.put('/:id', jsonParser, (req, res) => {
    if (req.params.id !== req.body.id) {
        const message = `Request path id ${req.params.id} and body id ${req.body.id} must match`;
        console.error(message);
        return res.status(400).json({message: message});
    }
    const updated = {};
    const updateableFields = ['name', 'location', 'description', 'image', 'dateTime'];
    updateableFields.forEach(field => {
      if (field in req.body) {
        updated[field] = req.body[field];
      }
    });
    Event.findOneAndUpdate({_id: req.params.id, user: req.user.username}, {$set: updated})
    .then(() => {
        res.status(204).end();
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    });
});

router.delete('/:id', (req, res) => {
    Event.findOneAndRemove({_id: req.params.id, user: req.user.username})
    .then(res.status(204).end())
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    });
});

router.get('*', (req, res) => {
    res.status(404).json({message: 'Page not found'});
});

module.exports = {router};

