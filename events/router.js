const express = require('express');
const bodyParser = require('body-parser');
const {Event} = require('./models');

const jsonParser = bodyParser.json();
const router = express.Router();

module.exports = {router};