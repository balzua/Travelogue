const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const {Trip} = require('./models');

const jsonParser = bodyParser.json();
const router = express.Router();

const {UNSPLASH_ACCESS_KEY} = require('../config');

router.get('/', (req, res) => {
    Trip.find({user: req.user.username || ""})
    .then(trips => {
        res.status(200).send(trips.map(trip => trip.serialize()));
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    })
});

router.get('/:id', (req, res) => {
    //Fix to only allow user
    Trip.findById(req.params.id)
    .then(trip => {
        res.status(200).json(trip.serialize());
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    })
});

router.post('/', jsonParser, (req, res) => {
    //Validate request
    const requiredFields = ['name', 'location', 'startDate', 'endDate'];
    let missingFields = [];
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            missingFields.push(field);
        }
    }); 
    if (missingFields.length > 0) {
        return res.status(400).send(`Missing fields: ${missingFields.join(' ')}`);
    }
    const newTrip = req.body;
    newTrip.user = req.user.username;
    //If a background image was not supplied, search Unsplash for one.
    if (!newTrip.background) {
        axios.get(`https://api.unsplash.com/search/photos/?client_id=${UNSPLASH_ACCESS_KEY}&page=1&query=${newTrip.location}&per_page=1`)
        .then(response => {
            newTrip.background = response.data.results[0].urls.regular;
        })
        .then(function () {
            return Trip.create(newTrip);
        })
        .then((created) => {
            res.status(201).json(created.serialize());
        })
        .catch(err => {
            console.error(err);
        });
    } 
    else {
        Trip.create(newTrip)
        .then((newTrip) => {
            res.status(201).json(newTrip.serialize());
        })
        .catch(err => {
            console.error(err);
            res.status(500).send({message: `Internal Server Error`});
        });
    }
});

router.put('/:id', jsonParser, (req, res) => {
    if (req.params.id !== req.body.id) {
        const message = `Request path id ${req.params.id} and body id ${req.body.id} must match`;
        console.error(message);
        return res.status(400).json({message: message});
    }
    const updated = {};
    const updateableFields = ['name', 'location', 'startDate', 'endDate', 'background'];
    updateableFields.forEach(field => {
      if (field in req.body) {
        updated[field] = req.body[field];
      }
    });
    Trip.findByIdAndUpdate(req.params.id, {$set: updated})
    .then(trip => res.status(204).end())
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    });
});

router.delete('/:id', (req, res) => {
    Trip.findByIdAndDelete(req.params.id)
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
