import mongoose from 'mongoose';
import Client from 'mongodb' ;
import config from '../config.json' with {type: "json"}; // Import config file for MongoDB URI
const mongodb_uri = config.mongodb_uri; // Get MongoDB URI from config file

let db; // Variable to hold the database connection

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

export default dbconnect;