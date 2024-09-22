const axios = require('axios');

module.exports = {
    config: {
        name: "boxai",
        description: "Interact with Blackbox AI",
        usage: "blackbox [question]",
        cooldown: 3,
        role: 0,
        prefix: false
    },
    run: async (api, event, args, reply, react) => {
        const prompt = args.join(' ');

        if (!prompt) {
            react("⚠️", event);
            return reply(global.formatFont("Please provide a question."), event);
        }

        const responseMessage = await new Promise((resolve) => {
            api.sendMessage(global.formatFont("⌛ Answering..."), event.threadID, (err, info) => {
                resolve(info);
            }, event.messageID);
        });

        try {
            const response = await axios.get("https://deku-rest-api.gleeze.com/blackbox", {
                params: { prompt: prompt },
            });
            const result = response.data;
            const responseString = result.data ? result.data : formatFont("No result found.");

            const formattedResponse = `
📦 𝙱𝙻𝙰𝙲𝙺𝙱𝙾𝚇
━━━━━━━━━━━━━━━━━━
${responseString}
━━━━━━━━━━━━━━━━━━
◉ 𝙷𝚎𝚛𝚞 𝙱𝚘𝚝
            `;

            react("✅", event);
            await api.editMessage(global.formatFont(formattedResponse.trim()), responseMessage.messageID);
        } catch (error) {
            react("⚠️", event);
            await api.editMessage(global.formatFont('Error'), responseMessage.messageID);
        }
    }
};
