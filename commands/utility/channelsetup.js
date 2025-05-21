const { SlashCommandBuilder } = require('discord.js');
const mongoose = require('mongoose');
const SaveServerInput = require('../../db/dbadd');

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