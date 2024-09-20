const axios = require('axios');
const fs = require('fs');
const request = require('request');

module.exports = {
  config: {
    name: "shoti",
    description: "Generate a random Shoti TikTok video.",
    usage: "shoti",
    cooldown: 0,
    role: 0,
    prefix: false
  },
  run: async (api, event, args, reply, react) => {
    react("⏳", event);
    api.sendTypingIndicator(event.threadID, true);

    const { messageID, threadID } = event;

    if (!args.length) {
      reply("Downloading...", event);
    }

    try {
      const response = await axios.get('https://shoti.kenliejugarap.com/getvideo.php?apikey=shoti-da6141827dcb43aeaf5c825c16c473deaf3ed6d8ea9b393106c1df2baa2558a151876010799a3ccd78f6b6f41e7a1cb9b572aa02138c589d4c944086b34149f663833fae2df2f8f12a1ce4fd7e941b7705fd14c8a8');

      if (response.data.status) {
        const { title, tiktokUrl, videoDownloadLink } = response.data;
        const path = __dirname + `/cache/shoti.mp4`;
        const file = fs.createWriteStream(path);
        const rqs = request(encodeURI(videoDownloadLink));
        rqs.pipe(file);

        file.on('finish', () => {
          setTimeout(function() {
            react("✅", event);
            return api.sendMessage({
              body: `Downloaded Successfully.\n\nTitle: ${title}\nTikTok URL: ${tiktokUrl}`,
              attachment: fs.createReadStream(path)
            }, threadID);
          }, 1000);
        });

        file.on('error', (err) => {
          reply(`Error: ${err.message}`, event);
        });
      } else {
        reply("Failed to fetch video.", event);
      }
    } catch (err) {
      reply(`Error: ${err.message}`, event);
    }
  }
};
