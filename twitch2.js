const Discord = require('discord.js');
const { ApiClient } = require('twitch');
const { ClientCredentialsAuthProvider } = require('twitch-auth');
const fs = require('fs');
const config = require('./config.json'); // Load config file

const client = new Discord.Client();
let twitchChannels = [];
let twitchAuth;
let twitchClient;
let lastNotificationTimes = {};
let liveMessageIds = {};
let live = []

client.once('ready', () => {
  console.log('Bot is online!');
  initializeTwitchClient();
});

client.on('message', message => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;
const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'setnotifychannel') {
    if (message.member.hasPermission('ADMINISTRATOR')) {
      const channelId = message.content.slice(`${config.prefix}setnotifychannel`.length).trim();

      if (isValidChannelId(channelId)) {
        config.discordChannelId = channelId;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2), 'utf-8');
        message.channel.send(`Notify channel has been updated to <#${channelId}>.`);
      } else {
        message.channel.send('Invalid channel ID format. Please provide a valid channel ID.');
      }
    } else {
      message.channel.send('You need to have administrator permission to use this command.');
    }
  }

  if (command === 'setprefix') {
    if (message.member.hasPermission('ADMINISTRATOR')) {
      const newPrefix = message.content.slice(`${config.prefix}setprefix`.length).trim();

      if (newPrefix) {
        config.prefix = newPrefix;
        fs.writeFileSync('./config.json', JSON.stringify(config, null, 2), 'utf-8');
        message.channel.send(`Prefix has been updated to \`${newPrefix}\`.`);
      } else {
        message.channel.send('Please provide a new prefix.');
      }
    } else {
      message.channel.send('You need to have administrator permission to use this command.');
    }
  }

if (command === 'addchannel') {
    const channelName = message.content.slice('*addchannel'.length).trim().toLowerCase();

    if (addChannel(channelName)) {
      message.channel.send(`Added ${channelName} to the Twitch channel list.`)
        .then(() => {
          console.log(`Added ${channelName} to the Twitch channel list.`);
        })
        .catch((error) => {
          console.error(`Error adding ${channelName} to the Twitch channel list:`, error);
        });
    } else {
      message.channel.send('That Twitch channel is already in the list.')
        .then(() => {
          console.log(`Twitch Channel ${channelName} is already in the list.`);
        })
        .catch((error) => {
          console.error(`Error sending message for existing Twitch channel ${channelName}:`, error);
        });
    }
  }

  if (command === 'removechannel') {
    const channelName = message.content.slice('*removechannel'.length).trim().toLowerCase();

    if (removeChannel(channelName)) {
      message.channel.send(`Removed ${channelName} from the Twitch channel list.`)
        .then(() => {
          console.log(`Removed ${channelName} from the Twitch channel list.`);
        })
        .catch((error) => {
          console.error(`Error removing ${channelName} from the Twitch channel list:`, error);
        });
    } else {
      message.channel.send('That Twitch channel is not in the list.')
        .then(() => {
          console.log(`Channel ${channelName} is not in the list.`);
        })
        .catch((error) => {
          console.error(`Error sending message for non-existing channel ${channelName}:`, error);
        });
    }
  }

  if (command === 'listchannels') {
    if (twitchChannels.length === 0) {
      message.channel.send('The Twitch channel list is empty.')
        .then(() => {
          console.log('The Twitch channel list is empty.');
        })
        .catch((error) => {
          console.error('Error sending empty Twitch channel list message:', error);
        });
    } else {
      const channels = twitchChannels.join(', ');
      message.channel.send(`Twitch Channels in the list: ${channels}`)
        .then(() => {
          console.log(`Listed Twitch channels: ${channels}`);
        })
        .catch((error) => {
          console.error('Error sending Twitch channel list message:', error);
        });
    }
  }

  if (command === 'live') {
    if (live.length === 0) {
      message.channel.send('No channels are currently live.')
        .then(() => {
          console.log('No channels are currently live.');
        })
        .catch((error) => {
          console.error('Error sending empty live channel list message:', error);
        });
    } else {
      const liveChannels = live.join(', ');
      message.channel.send(`Currently live channels: ${liveChannels}`)
        .then(() => {
          console.log(`Listed live channels: ${liveChannels}`);
        })
        .catch((error) => {
          console.error('Error sending live channel list message:', error);
        });
    }
  }
});

client.login(config.discordToken);

async function initializeTwitchClient() {
  try {
    const clientId = config.twitchClientId;
    const clientSecret = config.twitchClientSecret;

    twitchAuth = new ClientCredentialsAuthProvider(clientId, clientSecret);
    twitchClient = new ApiClient({ authProvider: twitchAuth });

    const channelData = fs.readFileSync('./channels.json', 'utf-8');
    twitchChannels = JSON.parse(channelData);

    setInterval(checkStreams, 10 * 1000);
  } catch (error) {
    console.error('Error initializing Twitch client:', error);
  }
}

async function checkStreams() {
  try {
    for (const channel of twitchChannels) {
      const user = await twitchClient.helix.users.getUserByName(channel);

      if (user) {
        const stream = await twitchClient.helix.streams.getStreamByUserId(user.id);

        if (stream) {
          const channelName = stream.userDisplayName;
          const streamTitle = stream.title;
          const streamURL = `https://twitch.tv/${channelName}`;
          const profilePictureURL = user.profilePictureUrl;
          const game = stream.gameName;
          const gameID = stream.gameId;

          const gameDetails = await twitchClient.helix.games.getGameById(gameID);
          const boxArtURL = gameDetails ? gameDetails.boxArtUrl.replace('{width}', '285').replace('{height}', '380') : '';

          const currentTime = Date.now();
          const lastNotificationTime = lastNotificationTimes[channel] || 0;
          const notificationCooldown = 60 * 1000;

          if (currentTime - lastNotificationTime > notificationCooldown) {
            const embed = new Discord.MessageEmbed()
              .setColor('#6441A4')
              .setTitle(`${channelName} is now live!`)
              .setDescription(`Title: ${streamTitle}`)
              .setURL(streamURL)
              .setAuthor(channelName, profilePictureURL)
              .setThumbnail(boxArtURL)
              .setImage(stream.thumbnailUrl.replace('{width}', '1280').replace('{height}', '720'))
              .addField('Game', game)
              .setTimestamp();

            const channelToPost = client.channels.cache.get(config.discordChannelId);
            const lastMessageId = liveMessageIds[channel];

            if (lastMessageId) {
              const lastMessage = await channelToPost.messages.fetch(lastMessageId);
              if (lastMessage && lastMessage.author.id === client.user.id) {
                lastMessage.edit('', embed)
                  .then(() => {
                    console.log(`Updated stream notification for ${channel}`);
                  })
                  .catch((error) => {
                    console.error(`Error updating stream notification for ${channel}:`, error);
                  });
              }
            } else {
              channelToPost.send(embed)
                .then((sentMessage) => {
                  liveMessageIds[channel] = sentMessage.id;
                  console.log(`Posted new stream notification for ${channel}`);
                  if (!live.includes(channel)) {
                    live.push(channel);
                  }
                })
                .catch((error) => {
                  console.error(`Error posting stream notification for ${channel}:`, error);
                });
            }

            lastNotificationTimes[channel] = currentTime;
          }
        } else {
          const lastNotificationTime = lastNotificationTimes[channel];
          if (lastNotificationTime) {
            const channelToPost = client.channels.cache.get(config.discordChannelId);
            const lastMessageId = liveMessageIds[channel];
            if (lastMessageId) {
              const lastMessage = await channelToPost.messages.fetch(lastMessageId);
              if (lastMessage && lastMessage.author.id === client.user.id) {
                const embed = new Discord.MessageEmbed()
                  .setColor('#6441A4')
                  .setTitle(`${channel} stream ended`)
                  .setDescription('The stream has ended.')
                  .setTimestamp();
                lastMessage.edit('', embed)
                  .then(() => {
                    console.log(`Updated stream end notification for ${channel}`);
                  })
                  .catch((error) => {
                    console.error(`Error updating stream end notification for ${channel}:`, error);
                  });
              }
            } else {
              const embed = new Discord.MessageEmbed()
                .setColor('#6441A4')
                .setTitle(`${channel} stream ended`)
                .setDescription('The stream has ended.')
                .setTimestamp();
              channelToPost.send(embed)
                .then((sentMessage) => {
                  liveMessageIds[channel] = sentMessage.id;
                  console.log(`Posted new stream end notification for ${channel}`);
                  const index = live.indexOf(channel);
                  if (index !== -1) {
                    live.splice(index, 1);
                  }
                })
                .catch((error) => {
                  console.error(`Error posting stream end notification for ${channel}:`, error);
                });
            }

            delete lastNotificationTimes[channel];
            delete liveMessageIds[channel];
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking Twitch streams:', error);
  }
}

function addChannel(channelName) {
  if (!twitchChannels.includes(channelName)) {
    twitchChannels.push(channelName);
    saveChannels();
    return true;
  }
  return false;
}

function removeChannel(channelName) {
  const channelIndex = twitchChannels.indexOf(channelName);
  if (channelIndex !== -1) {
    twitchChannels.splice(channelIndex, 1);
    saveChannels();
    return true;
  }
  return false;
}

function saveChannels() {
  const channelData = JSON.stringify(twitchChannels, null, 2);
  fs.writeFileSync('./channels.json', channelData, 'utf-8');
}

function isValidChannelId(channelId) {
 
  return channelId && /^\d+$/.test(channelId);
}
