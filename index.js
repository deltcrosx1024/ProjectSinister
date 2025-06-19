const {Client, GatewayIntentBits, Collection, messageLink} = require('discord.js'); //import certain classes from Discord.js to use
const discord_clients = new Client({ intents: [3276799] }); //set up intents for bot to run flawlessly with administrative permissions
const fs = require('fs'); //setup file system module
const path = require('path'); //setup path module
const dbsearch = require('./db/dbsearch'); //connect database
const dbconnect = require('./db/dbconnect.js');
const mongoose = require('mongoose');

//setup the token of both Discord Bot and OpenAI API Key
const { token } = require('./config.json');

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

const ServerInputSchema = new mongoose.Schema({
  guildid: { type: String, required: true },
  channelid: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Model = mongoose.model('ServerFetch', ServerInputSchema);

//AI Interactions
discord_clients.on('messageCreate', async message => {
	try {
		await dbconnect();

		let guildid = message.guild.id;

		const collections = database.collection('ServerInputs');

		// Find the document where guildid matches, return only channelid
		const result = await dbconnect(collections).findOne(
			{ guildid: guildid },
			{ channelid: 1, _id: 0 } // projection: only return channelid
		);

		if (!result) {
			return { success: false, message: 'No record found for this guild.' };
			}

		return { success: true, channelid: result.channelid };
	} catch (err) {
		console.error('Error retrieving channel ID:', err);
		return { success: false, message: 'Database error', error: err.message };
	}
});

discord_clients.login(token);