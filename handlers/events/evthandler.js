const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(discord_clients) {
		console.log(`Logged into Discord as ${discord_clients.user.tag}`); //show the username and tag of the bot in console to confirm bot is online

        //this line will be set up the bot activities that shown on bot profiles for more good looks
        discord_clients.user.setPresence({
            activities: [{ name: `OpenAI Backend`, type: ActivityType.Listening }],
            status: `online`,
        });
	},
};
