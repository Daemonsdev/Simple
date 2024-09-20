const axios = require('axios');

module.exports = {
  config: {
    name: "gemini",
    description: "Interact with the Gemini AI",
    usage: "gemini [custom prompt] (attach image or not)",
    cooldown: 3,
    role: 0,
    prefix: false
  },
  run: async (api, event, args, reply, react) => {
    const attachment = event.messageReply?.attachments[0] || event.attachments[0];
    const customPrompt = args.join(' ');

    if (!customPrompt && !attachment) {
      return reply('Please provide a prompt or attach a photo for the Gemini to analyze.', event);
    }

    let apiUrl = 'https://deku-rest-api-3jvu.onrender.com/gemini?';

    if (attachment && attachment.type === 'photo') {
      const prompt = customPrompt || 'answer this photo';
      const imageUrl = attachment.url;
      apiUrl += `prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`;
    } else {
      apiUrl += `prompt=${encodeURIComponent(customPrompt)}`;
    }

    react('⏳', event);

    const initialMessage = await new Promise((resolve, reject) => {
      api.sendMessage({
        body: '⏳ Searching...',
      }, event.threadID, (err, info) => {
        if (err) return reject(err);
        resolve(info);
      });
    });

    try {
      const response = await axios.get(apiUrl);
      const aiResponse = response.data.gemini;

      const formattedResponse = `\n✦ 𝗚𝗘𝗠𝗜𝗡𝗜 𝗔𝗜\n━━━━━━━━━━━━━━━━━━\n${aiResponse.trim()}\n━━━━━━━━━━━━━━━━━━\n◉ 𝙷𝚎𝚛𝚞
      `;

      react('✅', event);
      await api.editMessage(formattedResponse.trim(), initialMessage.messageID);

    } catch (error) {
      react('⚠️', event);
      await api.editMessage('Opsss!! something went wrong!, please check your code or api.', initialMessage.messageID);
    }
  }
};
