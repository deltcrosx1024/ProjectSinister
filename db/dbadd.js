 // saveToMongo.js
import mongoose from 'mongoose';
import dbconnect from './dbconnect.js'; // Import the database connection function
import serversetupinput from './models/serversetupinput.js'; // Import the Mongoose model

// The function to be called from your slash command
async function SaveServerInput({ guildid, channelid }) {
    try {
        await dbconnect();
        console.log('mongoose.connection.readyState:', mongoose.connection.readyState);
        await serversetupinput.findOneAndUpdate(
            
            { guildid: guildid }, // Find the document by guildid
            { 
                channelid: channelid, // Update the channelid
                timestamp: Date.now(),
            },
            { new: true, upsert: true, setDefaultsOnInsert: true } // Update or insert the document
        );
        return { success: true, message: 'Data saved successfully.' };
    } catch (error) {
        console.error('MongoDB Save or Update Error', error);
        return { success: false, message: 'Failed to save data.'};
    }
};

export default SaveServerInput;