const fs = require('fs');
const mineflayer = require('mineflayer');
const express = require('express');

// Load config
const cfg = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Keep-alive server for Render
const app = express();
app.get('/', (req, res) => res.send('Skyforge bot is running!'));
app.listen(process.env.PORT || 3000, () => {
  console.log('Render keep-alive server started.');
});

// Start bot function
function startBot() {
  const bot = mineflayer.createBot({
    host: cfg.server.ip,
    port: cfg.server.port,
    username: cfg["bot-account"].username,
    auth: 'offline', // cracked server
    version: false   // auto-detect server version
  });

  bot.on('spawn', () => {
    console.log('Bot connected to server!');

    // Anti-AFK: small movements
    if (cfg.utils["anti-afk"].enabled) {
      setInterval(() => {
        bot.setControlState('forward', true);
        setTimeout(() => bot.setControlState('forward', false), 500);
      }, 30000);
    }

    // Repeating chat messages
    if (cfg.utils["chat-messages"].enabled && cfg.utils["chat-messages"].repeat) {
      let msgs = cfg.utils["chat-messages"].messages;
      let delay = cfg.utils["chat-messages"]["repeat-delay"] * 1000;
      let index = 0;
      setInterval(() => {
        bot.chat(msgs[index % msgs.length]);
        index++;
      }, delay);
    }
  });

  bot.on('end', () => {
    console.log('Bot disconnected. Reconnecting...');
    setTimeout(startBot, cfg.utils["auto-reconnect-delay"]);
  });

  bot.on('error', (err) => console.log('Bot error:', err));
}

startBot();
