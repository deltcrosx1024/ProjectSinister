const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('chanelsetup')
    .setDescription('setup channel for AI Response')
    .addStringOption(option =>
        option.setName('channelid')
        .setDescription('ChannelId that you want the AI to take response of')
        .setRequired(true)
    ),
    async execute(interaction) {
        let channelid = interaction.option.getString('channelid');
        let guildid = interaction.guildId;

        await console.log("GuildId", guildid);
    }
}