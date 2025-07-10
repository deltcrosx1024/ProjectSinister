import {Client, GatewayIntentBits, Collection, messageLink} from 'discord.js'; //import certain classes from Discord.js to use
import serversetupinput from './db/models/serversetupinput.js';
const discord_clients = new Client({ intents: [3276799] }); //set up intents for bot to run flawlessly with administrative permissions
import fs from 'fs'; //setup file system module
import path from 'path' //setup path module
import dbsearch from './db/dbsearch.js'; //connect database
import dbconnect from './db/dbconnect.js'; //import database connection function
import mongoose, { model } from 'mongoose';//import mongoose for database operations
//setup the token of both Discord Bot and OpenAI API Key
import config from './config.json' with {type: "json"}; //import the token and API key from config file
import error from 'console';
import { Db, ServerOpeningEvent } from 'mongodb'; //import mongodb classes for database operations
import { fileURLToPath, pathToFileURL } from 'url';
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config'; // Import dotenv to load environment variables from .env file
import pkg from '@google-cloud/aiplatform/build/protos/protos.js'; // Import Google Cloud AI Platform protos
const { google } = pkg; // Destructure google from the imported protos

const token = config.token; //set the token variable to the token from config file
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT; // Get Google Cloud project ID from environment variable
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION; // Get Google Cloud
const googleApiKey = process.env.GOOGLE_API_KEY; // Get Google Cloud API key from environment variable

function maskPartialKey(key) {
	if (!key || key.length <= 8) return '***'; // fallback for short keys
	const visibleStart = key.slice(0, 3);
	const maskedPart = '*'.repeat(key.length - 3);
	return visibleStart + maskedPart;
}

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
discord_clients.on('interactionCreate', async interactionMetadata => {
    if (!interactionMetadata.isCommand()) return;
});

//AI Interactions
discord_clients.on('messageCreate', async message => {
	console.log(`Received message in guild ${message.guild ? message.guild.id : 'DM'}: ${message.content}`); // Log the message content and guild ID

	try {
		await dbconnect();
		const Db = mongoose.connection.db; //get the database connection

		let guildid = message.guild.id;
		const result = await Db.collection('serverinputs').findOne({ guildid: guildid,}, { projection: { channelid: 1 } }); //search for the guild ID in the database

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
				async function generateContent(textInput) {
					const ai = new GoogleGenAI({
						vertexai: true,
						project: GOOGLE_CLOUD_PROJECT,
						location: GOOGLE_CLOUD_LOCATION,
						googleAuthOptions: {
							googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Path to your Google Application Credentials JSON file
						},						
					})

					try {
						const response = await ai.models.generateContent({
							model: 'gemini-2.5-flash',
							contents: [ // Changed from 'messages' to 'contents'
								{
									role: 'user',
									parts: [{ text: textInput }], // Changed from 'content' to 'parts' with 'text'
								},
							],
						});

						console.log(`gemini replied: ${response.text} `);
						// Assuming 'message' is accessible in this scope for 'message.channel.send'
						return message.channel.send(response.text);
					} catch (error) {
						console.error('Error generating content from Gemini:', error);
						message.channel.send(`Sorry, I encountered an error while generating content: \n ${error.message}`);
						// Handle the error, perhaps send an error message to the user
						// return message.channel.send("Sorry, I encountered an error trying to process your request.");
					}
				}

				console.log(`user input: ${message.content}`); // Log the user input for debugging
				generateContent(message.content); // Call the function to generate content using Google GenAI
			} catch (err) {
				console.error('error:', err);
				message.channel.send(`Sorry I had problem with Google Vertex API. \n${err.message}`); // Send an error message to the channel
			}
		} // Call the AI listener function with the Discord client
	} catch (err) {
			console.error('Error processing message:', err);
			return { success: false, message: 'Error processing message', error: err.message } && console.error(`Error processing message in guild ${guildid}:`, err);
	}
});

discord_clients.login(token);
