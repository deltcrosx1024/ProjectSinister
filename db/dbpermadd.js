 // saveToMongo.js
import mongoose from 'mongoose';
import Joi from 'joi';

const AdditionalSchema = new mongoose.Schema({
    userId: Joi.string().min(18).required(),
    username: Joi.string().min(1).required(),
    userpermission: Joi.string().min(1).required(),
    timestamp: Joi.object().default({ type: Date, default: Date.now })
});

let userpermissioninput = mongoose.model('UserPerm', AdditionalSchema);

async function SaveUserPermission({ userId, username, userpermission }) {
    try {
        let entry = await userpermissioninput.findOneAndUpdate(
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
        return { success: false, message: 'Failed to save data.' };
    }
}

export default SaveUserPermission;