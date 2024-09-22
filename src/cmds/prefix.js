const moment = require('moment-timezone');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
module.exports = {
    config: {
        name: "prefix",
        description: "Shows the current prefix, current date and time, and shares contact along with an image or GIF from a URL.",
        prefix: false,
        role: 0,
    },
    run: async (api, event, args, reply, react) => {
        const currentDate = moment().tz('Asia/Manila').format('YYYY-MM-DD');
        const currentTime = moment().tz('Asia/Manila').format('HH:mm:ss');
        const response = global.formatFont(`⚙️ My prefix is: 》 ${global.heru.prefix} 《\n📅 Date: ${currentDate}\n⏰ Time: ${currentTime}`);

        const imageUrl = 'https://i.imgur.com/bxXHnYD.gif';
        const imagePath = path.join(__dirname, 'anime_image.gif');

        reply(response, event, async () => {
            try {
                const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
                const writer = fs.createWriteStream(imagePath);
                imageResponse.data.pipe(writer);

                writer.on('finish', async () => {
                    await api.sendMessage({
                        body: response,
                        attachment: fs.createReadStream(imagePath)
                    }, event.threadID);

                    await api.shareContact(api.getCurrentUserID(), api.getCurrentUserID(), event.threadID);
                });

                writer.on('error', (err) => {
                    console.error('Error writing image file:', err);
                    reply(formatFont("An error occurred while fetching the image."), event);
                });

            } catch (err) {
                console.error('Error sharing contact or sending image/GIF:', err);
                reply(global.formatFont("An error occurred while sharing contact or sending the image/GIF."), event);
            }
        });
    },
};
