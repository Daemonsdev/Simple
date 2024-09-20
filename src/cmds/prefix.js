const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "prefix",
    description: "Shows the current prefix, current date and time, and shares contact.",
    prefix: false,
    role: 0,
  },
  run: async (api, event, args, reply, react) => {
    const currentDateTime = moment().tz('Asia/Manila').format('YYYY-MM-DD HH:mm:ss');
    const response = `⚙️ My prefix is: 》 ${global.heru.prefix} 《\nType ${global.heru.prefix}help to view all commands.\n📅 Date and Time:\n${currentDateTime}`;

    reply(response, event, async () => {
      try {
        await api.shareContact(api.getCurrentUserID(), api.getCurrentUserID(), event.threadID);
      } catch (err) {
        console.error('Error sharing contact:', err);
      }
    });
  },
};
