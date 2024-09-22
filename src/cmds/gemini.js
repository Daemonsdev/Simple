const axios = require('axios');

module.exports = {
    config: {
        name: "gemini",
        description: "Interact with the Gemini AI",
        usage: "gemini (attach image or not)",
        cooldown: 3,
        role: 0,
        prefix: false
    },
    run: async (api, event, args, reply, react) => {
        const attachment = event.messageReply?.attachments[0] || event.attachments[0];
        const prompt = args.join(' ');

        if (!prompt && !attachment) {
            react("⚠️", event);
            return reply(formatFont("Please provide a question and attach a photo."), event);
        }

        let apiUrl = 'https://deku-rest-api-3jvu.onrender.com/gemini?';

        if (attachment && attachment.type === 'photo') {
            const imageUrl = attachment.url;
            apiUrl += `prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`;
        } else {
            apiUrl += `prompt=${encodeURIComponent(prompt)}`;
        }

        react('⏳', event);

        const initialMessage = await new Promise((resolve, reject) => {
            api.sendMessage(global.formatFont({
                body: '⏳ Searching...',
            }, event.threadID, (err, info) => {
                if (err) return reject(err);
                resolve(info);
            }));
        });

        try {
            const response = await axios.get(apiUrl);
            const aiResponse = response.data.gemini;

            const formattedResponse = global.formatFont(`\n✦ GEMINI AI\n━━━━━━━━━━━━━━━━━━\n${aiResponse.trim()}\n━━━━━━━━━━━━━━━━━━\n◉ 𝙷𝚎𝚛𝚞`);

            react('✅', event);
            await api.editMessage(global.formatFont(formattedResponse.trim(), initialMessage.messageID));

        } catch (error) {
            react('⚠️', event);
            await api.editMessage(global.formatFont("Opsss!! something went wrong!, please check your code or API."), initialMessage.messageID);
        }
    }
};