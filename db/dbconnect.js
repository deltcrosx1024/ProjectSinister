const mongoose = require('mongoose');
const {mongodb_uri} = require('../config.json');

let isConnected = false;

const dbconnect = async () => {
    if (isConnected) return mongoose;

    await mongoose.connect(mongodb_uri);

    isConnected = true;
    console.log("Connected to Database");
    return mongoose;
};

module.exports = dbconnect;