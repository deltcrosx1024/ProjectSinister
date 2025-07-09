import OpenAI from 'openai'; // Import the OpenAI library to interact with the OpenAI API
import 'dotenv/config'; // Import dotenv to load environment variables from .env file

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

async function aiListener(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== process.env.CHANNEL_ID) return;

    try {
      //setup the basic response for OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "user", content: "Setup your first word to interact with our bot" }
        ],
      });

      const reply = response.choices[0].message.content;
      await message.reply(reply);
    } catch (err) {
      console.error('OpenAI error:', err);
      message.reply('Sorry, I had trouble getting a response from OpenAI.');
    }
  });
};

export default aiListener;