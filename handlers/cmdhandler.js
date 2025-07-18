import fs from 'node:fs';
import { AttachmentBuilder } from 'discord.js'; // Import AttachmentBuilder to create attachments for Discord messages
import path from 'node:path'; // Import path to handle file paths
import { Client, Collection, Events } from 'discord.js'; // Import necessary classes from discord.js

const client = new Client({ intents: [3276799] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interactionMetadata => {
	if (!interactionMetadata.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interactionMetadata.commandName);

	if (!command) {
		console.error(`No command matching ${interactionMetadata.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interactionMetadata);
	} catch (error) {
		console.error(error);
		if (interactionMetadata.replied || interactionMetadata.deferred) {
			await interactionMetadata.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interactionMetadata.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});