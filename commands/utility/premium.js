import { SlashCommandBuilder, Events, DMChannel } from "discord.js";
import mongoose from "mongoose";
import SaveServerInput from "../../db/dbadd.js"; // Import the model to save server input

export default {
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Set premium status for a user in the server'),

    //command does not requires options, when triggered, it will DM the user with embeds for premium plan payment and check payment status and give the user premium status accordingly to the plan they choose

    async execute(interactionMetadata) {
        let user = interactionMetadata.user;
        let guildid = interactionMetadata.guildId;

        await console.log("GuildId", guildid);
        await console.log("User", user.id);

        // Assuming SaveServerInput is a function that saves the user and guild information
        await SaveServerInput({
            guildid: guildid,
            userid: user.id,
            premiumStatus: 'pending' // Initial status set to pending
        });

        // Send a DM to the user with premium plan payment options
        if (user.dmChannel) {
            await user.dmChannel.send(`Hello ${user.username},\n\nPlease choose a premium plan to proceed with the payment. You will receive further instructions on how to complete the payment and activate your premium status.`);
        } else {
            await user.createDM().then(dmChannel => {
                dmChannel.send(`Hello ${user.username},\n\nPlease choose a premium plan to proceed with the payment. You will receive further instructions on how to complete the payment and activate your premium status.`);
            });
        }

        return interactionMetadata.reply(`A DM has been sent to you with further instructions regarding the premium plans.`);
    }
};