const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const EventSchema = mongoose.Schema({
    trip: {type: mongoose.Schema.Types.ObjectId, ref: 'Trip'},
    name: {
        type: 'String',
        required: true
    },
    dateTime: {
        type: 'Date'
    },
    location: {
        type: 'String'
    },
    description: {
        type: 'String'
    },
    image: {
        type: 'String'
    },
    user: {
        type: 'String',
        required: true
    }
});

EventSchema.methods.serialize = function () {
    return {
        id: this._id,
        name: this.name,
        dateTime: this.dateTime.toDateString(),
        location: this.location,
        description: this.description,
        image: this.image,
        trip: this.trip
    };
}

const Event = mongoose.model('Event', EventSchema);

module.exports = {Event};