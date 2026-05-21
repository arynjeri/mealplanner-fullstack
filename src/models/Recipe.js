const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        required: true
    },
    ingredients: {
        type: [String],
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    image : {
        type: String,
        default: ''
    }
});


module.exports = mongoose.model('Recipe', recipeSchema);