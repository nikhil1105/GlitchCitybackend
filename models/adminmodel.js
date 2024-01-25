const mongoose = require('mongoose');

const admin = new mongoose.Schema({
    username:{type:String,require:true,unique:true},
    password:{type:String,require:true},
})

const Admin = mongoose.model('admin',admin)

module.exports = Admin

