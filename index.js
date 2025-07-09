import {Client, GatewayIntentBits, Collection, messageLink} from 'discord.js'; //import certain classes from Discord.js to use
import serversetupinput from './db/models/serversetupinput.js';
const discord_clients = new Client({ intents: [3276799] }); //set up intents for bot to run flawlessly with administrative permissions
import fs from 'fs'; //setup file system module
import path from 'path' //setup path module
import dbsearch from './db/dbsearch.js'; //connect database
import dbconnect from './db/dbconnect.js'; //import database connection function
import mongoose from 'mongoose';//import mongoose for database operations
//setup the token of both Discord Bot and OpenAI API Key
import config from './config.json' with {type: "json"}; //import the token and API key from config file
import error from 'console';
import { Db, ServerOpeningEvent } from 'mongodb'; //import mongodb classes for database operations
import { fileURLToPath, pathToFileURL } from 'url';
import OpenAI from 'openai'; // Import the OpenAI library to interact with the OpenAI API
import 'dotenv/config'; // Import dotenv to load environment variables from .env file

const token = config.token; //set the token variable to the token from config file
const openai_key = process.env.OPENAI_KEY; // Get the OpenAI API key from environment variables
			
function maskPartialKey(key) {
	if (!key || key.length <= 8) return '***'; // fallback for short keys
	const visibleStart = key.slice(0, 3);
	const maskedPart = '*'.repeat(key.length - 3);
	return visibleStart + maskedPart;
}

console.log('Loading OpenAI key:', openai_key ? 'Yes' : 'No'); // Log whether the OpenAI key is loaded
console.log('OpenAI key:', maskPartialKey(openai_key)); // Log the OpenAI key with masking for security

const openai = new OpenAI({
	apiKey: openai_key,
});

dbconnect();

//this line of code will be starting point for interaction part
discord_clients.commands = new Collection();
const __filename = fileURLToPath(import.meta.url); //get the current file name for path operations
const __dirname = path.dirname(__filename); //get the current directory name for path operations

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const fileUrl = pathToFileURL(filePath); // Convert file path to URL format for dynamic import
		const command = (await import(fileUrl)).default; // Use dynamic import to load the command module
		// Check if the command has the required properties
		// 'data' for command data and 'execute' for the function to execute
		if (command && 'data' in command && 'execute' in command) {
			discord_clients.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, './handlers/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const fileUrl = pathToFileURL(filePath); // Convert file path to URL format for dynamic import
	// Dynamically import the event file
	// Assuming each event file exports a default object with 'name' and 'execute' properties
	// 'once' property indicates if the event should be registered as a one-time listener
	const event = (await import(fileUrl)).default;
	if (event.once) {
		discord_clients.once(event.name, (...args) => event.execute(...args));
	} else {
		discord_clients.on(event.name, (...args) => event.execute(...args));
	}
}

import './ai/aiListener.js'; //import AI listener module to handle AI interactions
// import aiListener from './ai/aiListener.js';

//command Interaction
discord_clients.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
});

//AI Interactions
discord_clients.on('messageCreate', async message => {
	console.log(`Received message in guild ${message.guild ? message.guild.id : 'DM'}: ${message.content}`); // Log the message content and guild ID

	try {
		await dbconnect();
		const Db = mongoose.connection.db; //get the database connection

		let guildid = message.guild.id;
		const result = await Db.collection('serverinputs').findOne({ guildid: guildid });

		if (!result) {
			result = await serversetupinput.findOne({ guildid: guildid });
		}

		await result;

		if (!result) {
			return { success: false, message: 'No record found for this guild.', error: error.message } && console.error(`No record found for guild ${guildid} \n Error: ${error.message}`);
		}

		else{
				
			if (message.author.bot) return { success: false, message: 'Message from bot ignored.' } && console.log(`Ignoring message from bot in guild ${guildid}`);
			if (!message.guild) return { success: false, message: 'Message not from a guild.' } && console.log(`Ignoring non-guild message in guild ${guildid}`);
			if (message.channel.id !== result.channelid ) return { success: false, message: 'Message not in the specified channel.' } && console.log(`Ignoring message in wrong channel for guild ${guildid}`);
			console.log(`Processing message in guild ${guildid}...`); // Log the guild ID being processed
		
			try {
				//setup the basic response for OpenAI
				const response = await openai.chat.completions.create({
					model: "gpt-4o",
					messages: [
						{ role: "user", content: message.content }
					],
				});
		
				const reply = response.choices[0].message.content || 'No response from AI.'; // Ensure there's a fallback if no content is returned
				console.log(`AI response: ${reply}`); // Log the AI response for debugging purposes
		
				// Send the AI response back to the Discord channel
				// Using message.reply to send a reply directly to the user
				// If you want to send a normal message, use message.channel.send(reply);
				await message.channel.send("test reply");
			} catch (err) {
				console.error('OpenAI error:', err);
				message.reply('Sorry, I had trouble getting a response from OpenAI.');
			}
		} // Call the AI listener function with the Discord client
	} catch (err) {
			console.error('Error processing message:', err);
			return { success: false, message: 'Error processing message', error: err.message } && console.error(`Error processing message in guild ${guildid}:`, err);
	}
});

discord_clients.login(token);