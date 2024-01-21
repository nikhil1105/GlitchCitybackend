const mongoose = require('mongoose');

const uploadschema = new mongoose.Schema({
    photo:{
        type:String,
        required:true,
    },


},{timestamps:true});

const Upload = mongoose.model('photos',uploadschema)

module.exports = Upload