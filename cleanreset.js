const { REST, Routes } = require('discord.js');
const { appid, token } = require('./config.json');

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('🔁 Deleting global commands...');
        const commands = await rest.get(Routes.applicationCommands(appid));

        for (const command of commands) {
            await rest.delete(Routes.applicationCommand(appid, command.id));
            console.log(`🗑 Deleted command ${command.name}`);
        }

        // Now re-register your updated commands here...
    } catch (error) {
        console.error('❌ Failed to delete commands:', error);
    }
})();