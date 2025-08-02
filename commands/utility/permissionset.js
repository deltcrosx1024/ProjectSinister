import { SlashCommandBuilder, PermissionFlagsBits, PermissionOverwriteManager, PermissionsBitField, PermissionOverwrites, ApplicationCommandPermissionType } from 'discord.js';
import mongoose from 'mongoose';
import SaveServerInput from '../../db/dbadd.js'; // Import the model to save server input

export default {
    data: new SlashCommandBuilder()
    .setName('permissionset')
    .setDescription('Set permissions for a specific role in the server')
    .addRoleOption(option =>
        option.setName('role')
        .setDescription('The role to set permissions for')
        .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('permissions')
        .setDescription('Permissions to set (bitwise value)')
        .setRequired(true)
    ),
    async execute(interactionMetadata) {
        
        let role = interactionMetadata.options.getRole('role');
        let permissions = interactionMetadata.options.getInteger('permissions');
        let guildid = interactionMetadata.guildId;

        await console.log("GuildId", guildid);
        await console.log("Role", role.id);
        await console.log("Permissions", permissions);

        // Assuming SaveServerInput is a function that saves the role and permissions
        await SaveServerInput({
            guildid: guildid,
            roleid: role.id,
            permissions: permissions
        });

        return interactionMetadata.reply(`Successfully set permissions for the role \nGuild ID: ${guildid} \nRole ID: ${role.id} \nPermissions: ${permissions}`);
    }
}