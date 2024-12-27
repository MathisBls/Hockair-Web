const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    difficulty: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    description: {
        type: String,
        required: true
    },
    map: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skin',
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
