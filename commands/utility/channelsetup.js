import { SlashCommandBuilder } from 'discord.js'; // Import necessary classes from discord.js
import mongoose from 'mongoose';
import SaveServerInput from '../../db/dbadd.js'; // Import the model to save server input

module.exports = {
    data: new SlashCommandBuilder()
    .setName('channelsetup')
    .setDescription('setup channel for AI Response')
    .addStringOption(option =>
        option.setName('channelid')
        .setDescription('ChannelId that you want the AI to take response of')
        .setRequired(true)
    ),
    async execute(interaction) {
        
        let channelid = interaction.options.getString('channelid');
        let guildid = interaction.guildId;

        await console.log("GuildId", guildid);
        await console.log("ChannelId", channelid);

        await SaveServerInput({
            guildid: guildid,
            channelid: channelid
        });
        return interaction.reply(`Successfully set the channel for AI \nGuild ID: ${guildid} \nChannel ID: ${channelid}`);
    }
}