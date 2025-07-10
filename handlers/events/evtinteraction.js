import { Events, MessageFlags } from 'discord.js'; // Import necessary classes from discord.js

export default {
	name: Events.InteractionCreate,
	async execute(interactionMetadata) {
		if (!interactionMetadata.isChatInputCommand()) return;

		const command = interactionMetadata.client.commands.get(interactionMetadata.commandName);

		if (!command) {
			console.error(`No command matching ${interactionMetadata.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interactionMetadata);
		} catch (error) {
			console.error(error);
			if (interactionMetadataMetadata.replied || interactionMetadata.deferred) {
				await interactionMetadata.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			} else {
				await interactionMetadata.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	},
};
	