const express = require('express');
const bodyParser = require('body-parser');
const {Trip} = require('./models');

const jsonParser = bodyParser.json();
const router = express.Router();

router.get('/', (req, res) => {
    Trip.find()
    .then(trips => {
        res.status(200).json({
            trips: trips.map(trip => trip.serialize())
        })
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal Server Error'});
    })
});

router.get('/:id', (req, res) => {
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
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            res.status(400).send({message: `Missing field: ${field}`});
        }
    });
    Trip.create(req.body)
    .then(() => {
        res.status(201).json(req.body);
    })
    .catch(err => {
        console.error(err);
        res.status(500).send({message: `Internal Server Error`});
    });
});

router.put('/:id', jsonParser, (req, res) => {
    if (req.params.id !== req.body.id) {
        const message = `Request path id ${req.params.id} and body id ${req.body.id} must match`;
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
    Trip.deleteOne({_id: req.params.id})
    .then(res.status(204).end())
    .catch(res.status(500).json({message: 'Internal Server Error'}));
});

router.get('*', (req, res) => {
    res.status(404).json({message: 'Page not found'});
});

module.exports = {router};
