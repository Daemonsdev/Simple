const axios = require('axios');

module.exports = {
  config: {
    name: "llama",
    description: "Talk to LLaMA AI.",
    usage: "llama <your query>",
    cooldown: 5,
    role: 0,
    prefix: false
  },
  run: async (api, event, args, reply, react) => {
    // Validate query input
    const query = args.length > 0 ? args.join(" ") : null;
    if (!query) {
      react("⚠️", event);
      return reply("Please provide a query.", event);
    }

    try {
      // React to show the query is being processed
      react("⏳", event);

      // Show the user that a search is in progress
      const searchingMessage = await new Promise(resolve => {
        api.sendMessage("⏳ Searching...", event.threadID, (err, info) => {
          resolve(info); // Save the messageID for later editing
        });
      });

      // Call the LLaMA AI API
      const apiUrl = `https://deku-rest-api.gleeze.com/api/llama-3-70b?q=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const answer = response.data?.result || "I couldn't fetch a response from LLaMA.";
      react("✅", event);
      await api.editMessage(
        `🦙 𝗟𝗹𝗮𝗺𝗮 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲\n━━━━━━━━━━━━━━━\n${answer}`,
        searchingMessage.messageID
      );

    } catch (error) {
      // Handle API error and inform the user
      react("⚠️", event);
      return reply("There was an error fetching data from the LLaMA API. Please try again later.", event);
    }
  }
};
