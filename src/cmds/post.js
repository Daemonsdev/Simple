const axios = require('axios');
const cron = require('node-cron');

module.exports = {
  config: {
    name: "motibible",
    description: "Sends daily motivation and Bible verses",
    usage: "",
    role: 1,
    cooldown: 0,
    prefix: false,
  },
  run: async (api, event, args, reply) => {
    const messagedThreads = new Set();
    let isMotivationEnabled = true;
    let isBibleVerseEnabled = true;

    async function sendMessage(body, threadID) {
      try {
        await api.sendMessage({ body }, threadID);
        messagedThreads.add(threadID);
      } catch (error) {
        console.error("Error sending a message:", error);
      }
    }

    async function sendMotivation() {
      if (!isMotivationEnabled) return;
      try {
        const response = await axios.get("https://raw.githubusercontent.com/JamesFT/Database-Quotes-JSON/master/quotes.json");
        const quotes = response.data;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];
        const quote = `🔔 𝖣𝖺𝗂𝗅𝗒 𝖬𝗈𝗍𝗂𝗏𝖺𝗍𝗂𝗈𝗇:\n\n${randomQuote.quoteText}\n\n- ${randomQuote.quoteAuthor}`;
        const threads = await api.getThreadList(25, null, ['INBOX']);
        let i = 0, j = 0;
        while (j < 20 && i < threads.length) {
          const thread = threads[i];
          if (thread.isGroup && thread.name !== thread.threadID && !messagedThreads.has(thread.threadID)) {
            await sendMessage(quote, thread.threadID);
            j++;
            const currentThreadID = thread.threadID;
            setTimeout(() => {
              messagedThreads.delete(currentThreadID);
            }, 1000);
          }
          i++;
        }
      } catch (error) {
        console.error("Error sending motivation:", error);
      }
    }

    async function sendBibleVerse() {
      if (!isBibleVerseEnabled) return;
      try {
        const verseResponse = await axios.get('https://labs.bible.org/api/?passage=random&type=json');
        const verse = verseResponse.data[0];
        const formattedVerseMessage = `
🔔 𝖣𝖺𝗂𝗅𝗒 𝖡𝗂𝖻𝗅𝖾 𝖵𝖾𝗋𝗌𝖾:

${verse.text}

- ${verse.bookname} ${verse.chapter}:${verse.verse}
`;
        const threads = await api.getThreadList(25, null, ['INBOX']);
        let i = 0, j = 0;
        while (j < 20 && i < threads.length) {
          const thread = threads[i];
          if (thread.isGroup && thread.name !== thread.threadID && !messagedThreads.has(thread.threadID)) {
            await sendMessage(formattedVerseMessage, thread.threadID);
            j++;
            const currentThreadID = thread.threadID;
            setTimeout(() => {
              messagedThreads.delete(currentThreadID);
            }, 1000);
          }
          i++;
        }
      } catch (error) {
        console.error("Error sending Bible verse:", error);
      }
    }

    function toggleFeature(feature, status) {
      if (feature === 'motivation') isMotivationEnabled = status;
      if (feature === 'bible') isBibleVerseEnabled = status;
    }

    const command = args[0];
    if (command === 'enable') {
      const feature = args[1];
      toggleFeature(feature, true);
      reply(`${feature} enabled`, event);
    } else if (command === 'disable') {
      const feature = args[1];
      toggleFeature(feature, false);
      reply(`${feature} disabled`, event);
    }

    cron.schedule('0 */2 * * *', sendMotivation, {
      scheduled: false,
      timezone: "Asia/Manila"
    });

    cron.schedule('0 */2 * * *', sendBibleVerse, {
      scheduled: true,
      timezone: "Asia/Manila"
    });
  },
};