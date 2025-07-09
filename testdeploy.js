import { REST, Routes } from 'discord.js';
import fs from 'node:fs'; // Import the file system module to read files and directories
import path from 'node:path'; // Import the path module to handle file paths
import config from './config.json' assert {type: "json"}; // Import the token and application ID from the config file
import prompt from 'readline-sync'; // Import prompt-sync for user input in the terminal

const token = config.token; // Set the token variable to the token from config file
const appid = config.appid; // Set the application ID variable to the app ID from config file

const commands = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Grab all the command files from the commands directory you created earlier
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

let guildid = prompt.question("Please Enter the Guild Id you want to use on test: ");

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands. [TEST MODE]`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(appid, guildid),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands. [TEST MODE]`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();