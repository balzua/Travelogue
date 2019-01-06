const express = require('express');
const bodyParser = require('body-parser');
const {Trip} = require('./models');


const jsonParser = bodyParser.json();
const router = express.Router();

