const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const TripSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String, 
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    background: {
        type: String,
        default: '/assets/defaultimg.png'
    },
    user: {
        type: String,
        required: true
    }
});



TripSchema.methods.serialize = function () {
    return {
        id: this._id,
        name: this.name,
        location: this.location,
        startDate: this.startDate.toDateString(),
        endDate: this.endDate.toDateString(),
        background: this.background,
        user: this.user
    };
}

const Trip = mongoose.model('Trip', TripSchema);

module.exports = {Trip};