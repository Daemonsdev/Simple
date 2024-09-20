const fs = require('fs');

module.exports = {
  config: {
    name: "eval",
    description: "Executes the provided JavaScript code",
    usage: "eval <code>",
    cooldown: 5,
    role: 1,
    prefix: false
  },
  run: async (api, event, args, reply, react) => {
    try {
      // Join args to form the code to be executed
      const code = args.join(" ");

      // Ensure code execution is safe (example, limit certain operations)
      if (code.includes('process') || code.includes('require')) {
        return reply("⚠️ Unsafe code detected. Execution halted.", event);
      }

      // Execute the code
      let result = eval(code);

      // Convert result to string for better handling
      result = typeof result === 'object' ? JSON.stringify(result, null, 2) : result;

      // Respond with the result of the code execution
      reply(result, event);
    } catch (error) {
      // Handle any errors that occur during code execution
      reply(`🔥 Error:\n${error.message}`, event);
    }
  }
};
