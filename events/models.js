const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const EventSchema = mongoose.Schema({
    trip: tripSchema,
    time: {},
    name: {},
    location: {},
    description: {},
    image: {}
});

EventSchema.methods.serialize = function () {
    return {
    };
}

const Event = mongoose.model('Event', EventSchema);

module.exports = {Trip};