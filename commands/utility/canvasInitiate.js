import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js'; // Import necessary classes from discord.js
import { createCanvas } from 'canvas'; // Import createCanvas from canvas module to create a canvas

import fs from 'fs'; // Import file system module to handle file operations
import path from 'path'; // Import path module to handle file paths

export default {
    data: new SlashCommandBuilder()
        .setName('canvasinitiate')
        .setDescription('Initiate a canvas for drawing or image manipulation.')
        .addStringOption(option =>
            option.setName('canvasname')
                .setDescription('Name of the canvas to create.')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('width')
                .setDescription('Width of the canvas in pixels.')   
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('height')
                .setDescription('Height of the canvas in pixels.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('background')
                .setDescription('Background color of the canvas (e.g., #FFFFFF for white).')
                .setRequired(false)),
    async execute(interaction) {
        const canvasName = interaction.options.getString('canvasname');
        const width = interaction.options.getInteger('width');
        const height = interaction.options.getInteger('height');
        const backgroundColor = interaction.options.getString('background') || '#FFFFFF';

        // Create a new canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        //set fonts family
        const file = path.join(__dirname, '../assets/fonts/HornetDisplay-Regular.ttf');
        ctx.registerFont(file, { family: 'Hornet Display Regular' });
        // Set the background color
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        // Draw a border around the canvas
        ctx.strokeStyle = '#000000'; // Black border
        ctx.lineWidth = 5;
        ctx.strokeRect(0, 0, width, height);

        // Optionally, you can add text to the canvas
        ctx.fillStyle = '#000000';
        ctx.registerFont(file, '42px');
        ctx.font = '42px Hornet Display Regular';
        ctx.fontWeight = 'bold';
        ctx.fillText(`Canvas: ${canvasName}`, 10, 50);
        // Save the canvas to a file
        const filePath = path.join(__dirname, `${canvasName}.png`);
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(filePath, buffer);

        // Create an attachment for the canvas image
        const attachment = new AttachmentBuilder(filePath); 
        // Create an embed to display the canvas
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Canvas Created: ${canvasName}`)
            .setDescription(`Canvas of size ${width}x${height} created with background color ${backgroundColor}.`)
            .setImage(`attachment://${canvasName}.png`)
            .setTimestamp();
        // Send the embed and attachment in the interaction response
        await interaction.reply({ embeds: [embed], files: [attachment] });  
        // Optionally, delete the file after sending
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Failed to delete file ${filePath}:`, err);
            } else {
                console.log(`File ${filePath} deleted successfully.`);
            }
        });
    }
};
// Note: Ensure that the necessary permissions are set for the bot to send messages and attachments in the channel where this command is used.
