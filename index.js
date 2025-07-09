import {Client, GatewayIntentBits, Collection, messageLink} from 'discord.js'; //import certain classes from Discord.js to use
import serversetupinput from './db/models/serversetupinput.js';
const discord_clients = new Client({ intents: [3276799] }); //set up intents for bot to run flawlessly with administrative permissions
import fs from 'fs'; //setup file system module
import path from 'path' //setup path module
const dbsearch = import('./db/dbsearch.js'); //connect database
const dbconnect = import('./db/dbconnect.js'); //import database connection
const mongoose = import('mongoose'); //import mongoose for database operations

//setup the token of both Discord Bot and OpenAI API Key
import config from './config.json' assert {type: "json"}; //import the token and API key from config file
import error from 'console';
import { Db, ServerOpeningEvent } from 'mongodb'; //import mongodb classes for database operations

const token = config.token; //set the token variable to the token from config file
const openai_api_key = config.openai_api_key; //set the OpenAI API key variable to the key from config file

dbconnect();

//this line of code will be starting point for interaction part
discord_clients.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
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
	const event = require(filePath);
	if (event.once) {
		discord_clients.once(event.name, (...args) => event.execute(...args));
	} else {
		discord_clients.on(event.name, (...args) => event.execute(...args));
	}
}

require('./ai/aiListener.js')(discord_clients);

//command Interaction
discord_clients.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
});

//AI Interactions
discord_clients.on('messageCreate', async message => {


	try {
		await dbconnect();

		let guildid = message.guild.id;
		Db.collection('serverinputs').findone({ guildid: guildid }, async (error, result) => {
			if (error) {
				console.error(`Error retrieving channel ID for guild ${guildid}:`, error);
				return { success: false, message: 'Database error', error: error.message };
			}
		});

		if (!result) {
			result = await serversetupinput.findOne({ guildid: guildid });
		}

		await result;

		if (!result) {
			return { success: false, message: 'No record found for this guild.', error: error.message } && console.error(`No record found for guild ${guildid} \n Error: ${error.message}`);
		}

		else{
			try {
				if (message.author.bot) return { success: false, message: 'Message from bot ignored.' } && console.log(`Ignoring message from bot in guild ${guildid}`);
				if (!message.guild) return { success: false, message: 'Message not from a guild.' } && console.log(`Ignoring non-guild message in guild ${guildid}`);
    			if (message.channel.id !== result.channelid ) return { success: false, message: 'Message not in the specified channel.' } && console.log(`Ignoring message in wrong channel for guild ${guildid}`);
				return { success: true, channelid: result.channelid, messag: 'Channel ID retrieved successfully.' } && console.log(`Channel ID for guild ${guildid} is ${result.channelid}`);
			} catch (err) {
				console.error('Error processing message:', err);
				return { success: false, message: 'Error processing message', error: err.message } && console.error(`Error processing message in guild ${guildid}:`, err);
			}
		}

	} catch (err) {
		console.error('Error retrieving channel ID:', err);
		return { success: false, message: 'Database error', error: err.message };
	}
});

discord_clients.login(token);