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
    const event = {
        id: this._id,
        name: this.name,
        location: this.location,
        description: this.description,
        image: this.image,
        trip: this.trip
    };
    if (this.dateTime) {
        event.dateTime = this.dateTime.toDateString();
    }
    return event;
}

const Event = mongoose.model('Event', EventSchema);

module.exports = {Event};