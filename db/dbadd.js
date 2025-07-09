 // saveToMongo.js
import mongoose from 'mongoose';
import Joi from 'joi';
import { Collection } from 'mongodb';
import dbconnect from './db/dbconnect.js'; // Import the database connection function
import serversetupinput from './db/models/serversetupinput.js'; // Import the Mongoose model

// The function to be called from your slash command
async function SaveServerInput({ guildid, channelid }) {
    try {
        await dbconnect();
        console.log('mongoose.connection.readyState:', mongoose.connection.readyState);
        const inputs = new serversetupinput({
            guildid,
            channelid,
            timestamp: Date.now(),
        });
        await inputs.findOneAndUpdate(
        
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