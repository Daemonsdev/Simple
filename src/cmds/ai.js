const axios = require('axios');

module.exports = {
  config: {
    name: "ai",
    description: "Talk to AI.",
    usage: "ai <your query>",
    cooldown: 6,
    role: 0,
    prefix: false
  },
  run: async (api, event, args, reply, react) => {
    const query = args.length > 0 ? args.join(" ") : null;
    if (!query) {
      react("⚠️", event);
      return reply("Please provide a query.", event);
    }

    try {
      react("⏳", event);

      const searchingMessage = await new Promise(resolve => {
        api.sendMessage("⏳ Searching...", event.threadID, (err, info) => {
          resolve(info);
        });
      });

      const apiUrl = `https://markdevs69.vercel.app/api/adobo/gpt?query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const answer = response.data?.result || "I couldn't fetch a response from the AI.";

      react("✅", event);
      await api.editMessage(
        `🌟 𝙰𝙸 𝙰𝚂𝚂𝙸𝚂𝚃𝙰𝙽𝚃 \n━━━━━━━━━━━━━━━\n${answer}`,
        searchingMessage.messageID
      );

    } catch (error) {
      react("⚠️", event);
      return reply("There was an error fetching data from the AI. Please try again later.", event);
    }
  }
};
