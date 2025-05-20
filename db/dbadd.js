 // saveToMongo.js
const mongoose = require('mongoose');

// Define the schema
const ServerConfigSchema = new mongoose.Schema({
    guildid: int,
    channelid: int,
    timestamp: { type: Date, default: Date.now },
});

const AdditionalSchema = new mongoose.Schema({
    userId: int,
    username: String,
    userpermission: int,
    timestamp: { type: Date, default: Date.now }
});

// Create the model
const serversetupinput = mongoose.model('ServerInput', ServerConfigSchema);
const userpermissioninput = mongoose.model('UserPerm', AdditionalSchema);

// The function to be called from your slash command
async function SaveServerInput({ guildid, channelid }) {
    try {
        const entry = new serversetupinput.findOneAndUpdate(
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
        return { success: false, message: 'Failed to save data.', data: entry };
    }
};

async function SaveUserPermission({ userId, username, userpermission }) {
    try {
        const entry = new userpermissioninput.findOneAndUpdate(
            { userId },
            { 
                username,
                userpermission,
                timestamp: Date.now()
            },
            { new: true, upsert: true }
        );
        return { success: true, message: 'Permission Updated'}
    } catch (error) {
        console.error('MongoDB Save or Update Error', error);
        return { success: false, message: 'Failed to save data.', data: entry };
    }
}

module.exports = SaveServerInput;
module.exports = SaveUserPermission;