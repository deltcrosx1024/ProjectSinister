const mongoose = require('mongoose');
const { Client } = require('mongodb');
const {mongodb_uri} = require('../config.json');

let isConnected = false;

const dbconnect = async () => {
    if (isConnected) return mongoose;

    await mongoose.connect(mongodb_uri);

    isConnected = true;
    console.log("Connected to Database");
    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    return mongoose;
};

module.exports = dbconnect;