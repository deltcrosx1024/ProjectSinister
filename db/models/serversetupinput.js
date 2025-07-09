import mongoose from "mongoose";
import Joi from "joi";

const serverSetupInputSchema = new mongoose.Schema({
    guildid: { type: String, required: true },
    channelid: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

let serversetupinput = mongoose.model('ServerInput', serverSetupInputSchema);

export default serversetupinput;