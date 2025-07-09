import { REST, Routes } from 'discord.js'; // Import necessary classes from discord.js to interact with Discord's API
import config from './config.json' with {type: "json"}; // Import the bot token and application ID from the config file

const token = config.token; // Set the token variable to the token from config file
const appid = config.appid; // Set the application ID variable to the app ID from config file   

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('🔁 Deleting global commands...');
        const commands = await rest.get(Routes.applicationCommands(appid));

        for (const command of commands) {
            await rest.delete(Routes.applicationCommand(appid, command.id));
            await rest.delete(Routes.applicationGuildCommand(appid));
            console.log(`🗑 Deleted command ${command.name}`);
        }

        // Now re-register your updated commands here...
    } catch (error) {
        console.error('❌ Failed to delete commands:', error);
    }
})();