const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.CHANNEL_ID) return;

    try {
      //setup the basic response for OpenAI
      const response = await openai_clients.responses.create({
        model:"chatgpt-4o-latest",
        input:"Setup your first word to interact with our bot"
      });

      const reply = response.choices[0].message.content;
      await message.reply(reply);
    } catch (err) {
      console.error('OpenAI error:', err);
      message.reply('Sorry, I had trouble getting a response from OpenAI.');
    }
  });
};