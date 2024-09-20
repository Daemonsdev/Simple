const login = require('fca-kaito');
const fs = require('fs');
const axios = require('axios');
const path = require("path");
require("./utils/index");
const config = require('./config.json');
const readline = require('readline');
let appstate;

// Try to load appstate.json, or prompt login if it doesn't exist
try {
  appstate = require('./appstate.json');
} catch (err) {
  console.log("No appstate detected. Please sign in to generate a new session.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter Facebook Email: ', (email) => {
    rl.question('Enter Facebook Password: ', (password) => {
      rl.close();
      
      login({ email: email, password: password }, (err, api) => {
        if (err) {
          console.error('Login failed:', err);
          return;
        }
        
        console.log('Login successful! Saving session to appstate.json...');
        
        // Save the appstate (session) to appstate.json
        fs.writeFileSync('./appstate.json', JSON.stringify(api.getAppState(), null, 2));
        
        startBot(api);  // Start the bot with the new session
      });
    });
  });
  return; // Exit after login attempt
}

const logger = require('./utils/logger');

global.heru = {
    ENDPOINT: "https://deku-rest-api.gleeze.com",
    admin: config.ADMINBOT,
    prefix: config.PREFIX,
    botName: config.BOTNAME
};

// Load commands from the "src/cmds" directory
const commands = {};
const commandPath = path.join(__dirname, "src", "cmds");

try {
  const files = fs.readdirSync(commandPath);
  files.forEach(file => {
    if (file.endsWith(".js")) {
      try {
        const script = require(path.join(commandPath, file));
        commands[script.config.name] = script;
        logger.logger(`Loaded command: ${script.config.name}`);
      } catch (e) {
        logger.warn(`Failed to load command: ${file}\nReason: ${e.message}`);
      }
    }
  });
} catch (err) {
  logger.warn(`Error reading command directory: ${err.message}`);
}

// Log in using appstate
login({ appState: appstate }, (err, api) => {
    if (err) {
        console.error('Error logging in:', err);
        return;
    }

    startBot(api);  // Start the bot when logged in successfully
});

function startBot(api) {
    console.log('Successfully logged in!');

    api.listenMqtt(async (err, event) => {
        if (err) {
            console.error('Error in MQTT listener:', err);
            return;
        }

        if (event.type === "message" || event.type === "message_reply") {
            const message = event.body;
            const uid = event.senderID;

            const dateNow = Date.now();
            let commandName = message.split(' ')[0].toLowerCase();
            const args = message.split(' ').slice(1);

            const isPrefixed = commandName.startsWith(global.heru.prefix);
            if (isPrefixed) {
                commandName = commandName.slice(global.heru.prefix.length).toLowerCase();
            }

            const command = commands[commandName];

            const react = (emoji, event) => {
                api.setMessageReaction(emoji, event.messageID, () => {}, true);
            };

            const reply = (text, event) => {
                api.sendMessage(text, event.threadID, event.messageID);
            };

            if (!command) {
                if (message === "prefix") {
                    return reply(
                        `⚙️ My prefix is:  》 ${global.heru.prefix} 《`,
                        event
                    );
                }

                if (message === global.heru.prefix) {
                    return reply(
                        `Type ${global.heru.prefix}help to view available commands.`,
                        event
                    );
                }
            }

            if (command) {
                if (command.config.prefix !== false && !isPrefixed) {
                    react("⚠️", event);
                    return reply(`⚒️ Command "${commandName}" needs a prefix.`, event);
                }

                if (command.config.prefix === false && isPrefixed) {
                    react("⚠️", event);
                    return reply(`⚒️ Command "${commandName}" doesn't need a prefix.`, event);
                }

                if (command.config.role === 1 && !global.heru.admin.has(event.senderID)) {
                    react("⚠️", event);
                    return reply(`❗ You don't have permission to use the command "${commandName}".`, event);
                }

                if (!global.handle) global.handle = {};
                if (!global.handle.cooldown) global.handle.cooldown = new Map();

                if (!global.handle.cooldown.has(commandName)) {
                    global.handle.cooldown.set(commandName, new Map());
                }

                const timeStamps = global.handle.cooldown.get(commandName);
                const expiration = command.config.cooldown * 1000 || 3000;

                if (timeStamps.has(event.senderID) && dateNow < timeStamps.get(event.senderID) + expiration) {
                    const cooldownTime = (timeStamps.get(event.senderID) + expiration - dateNow) / 1000;
                    return reply(`⏳ Command is still on cooldown for ${cooldownTime.toFixed(1)} second(s).`, event);
                }

                timeStamps.set(event.senderID, dateNow);

                try {
                    await command.run(api, event, args, reply, react);
                } catch (error) {
                    react("⚠️", event);
                    reply(`Error executing command '${commandName}': ${error.message}`, event);
                }
            }
        } else if (event.type === "event" && event.logMessageType === "log:subscribe") {
            const { threadID } = event;
            const threadInfo = await api.getThreadInfo(threadID);
            let { threadName, participantIDs } = threadInfo;

            if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
                api.changeNickname(
                    `${global.heru.botName} • » ${global.heru.prefix} «`,
                    event.threadID,
                    api.getCurrentUserID()
                );

                api.shareContact(
                    `✅ Connected successfully. Type "${global.heru.prefix}help" to see all commands.`,
                    api.getCurrentUserID(),
                    event.threadID
                );
            }
        }
    });
}
