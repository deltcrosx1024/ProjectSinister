 // saveToMongo.js
const mongoose = require('mongoose');
const Joi = require('joi');
const dbconnect = require('./dbconnect');

// Define the schema
const ServerConfigSchema = new mongoose.Schema({
    guildid: { type: String, required: true },
    channelid: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

// Create the model
let serversetupinput = mongoose.model('ServerInput', ServerConfigSchema);

// The function to be called from your slash command
async function SaveServerInput({ guildid, channelid }) {
    try {
        await dbconnect();
        console.log('mongoose.connection.readyState:', mongoose.connection.readyState);
        await serversetupinput.findOneAndUpdate(
        
            { guildid },
            { 
                channelid,
                timestamp: Date.now(),
            },
            { new: true, upsert: true }
        );
        return { success: true, message: 'Data saved successfully.' };
    } catch (error) {
        console.error('MongoDB Save or Update Error', error);
        return { success: false, message: 'Failed to save data.'};
    }
};

module.exports = SaveServerInput;