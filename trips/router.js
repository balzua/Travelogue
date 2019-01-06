const express = require('express');
const bodyParser = require('body-parser');
const {Trip} = require('./models');

const jsonParser = bodyParser.json();
const router = express.Router();

router.get('/', (req, res) => {

});

router.get('/:id', (req, res) => {

});

router.post('/', (req, res) => {

});

router.put('/:id', (req, res) => {

});

router.delete('/:id', (req, res) => {

});

router.get('*', (req, res) => {
    res.status(404).json({message: 'Page not found'});
});

module.exports = router;
