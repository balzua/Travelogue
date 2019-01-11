const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const EventSchema = mongoose.Schema({

    //events: [eventSchema]
});



EventSchema.methods.serialize = function () {
    return {
    };
}

const Event = mongoose.model('Event', EventSchema);

module.exports = {Trip};