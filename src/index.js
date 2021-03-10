const Discord = require("discord.js");
const config = require("../config.json");
const client = new Discord.Client({
  ws: { intents: Discord.Intents.ALL },
  disableMentions: "everyone",
  messageCacheLifetime: 180,
  messageCacheMaxSize: 200,
  messageEditHistoryMaxSize: 200,
  messageSweepInterval: 180,
});
const temp = new Map();

const alterCheck = () => {
  const mainUser = client.users.cache.get(config.MAIN_USER_ID);
  if (!mainUser)
    throw new Error("The MAIN_USER_ID you provided is not a valid User!");
  if (
    !mainUser.presence.activities[0] ||
    mainUser.presence.activities[0].emoji.animated !== undefined
  )
    return;
  const emoji = mainUser.presence.activities[0].emoji;
  if (config.ALTERS.filter((em) => em.emoji == emoji.name)[0]) {
    if (
      temp.has("currentAlter") ||
      temp.get("currentAlter") !==
        config.ALTERS.filter((em) => em.emoji == emoji.name)[0]
    ) {
      temp.set(
        "currentAlter",
        config.ALTERS.filter((em) => em.emoji == emoji.name)[0]
      );
      return updateAlter();
    }
  } else return;
};

const updateAlter = async () => {
  const currentAlter = temp.get("currentAlter");
  const ch = client.channels.cache.get(config.CURRENT_ALTER_CHANNEL_ID);
  if (
    ch &&
    ch.name !==
      `${currentAlter.name}-${currentAlter.pronouns.replace("/", "-")}`
  ) {
    ch.setName(
      `${currentAlter.name}-${currentAlter.pronouns.replace("/", "-")}`
    );
  }
  if (
    currentAlter.adviseFriends &&
    temp.get(`currentNotifiedAlter`) !== currentAlter.name
  ) {
    client.guilds.cache
      .get(config.GUILD_ID)
      .roles.cache.get(config.ROLE_ID)
      .members.map(async (mem) => {
        const user = client.users.cache.get(mem.user.id);
        const mainUser = client.users.cache.get(config.MAIN_USER_ID);
        if (!user) return;
        await user
          .send(
            new Discord.MessageEmbed({
              title: `Notification about ${mainUser.username}`,
              description: `Hey ${user.username}!\nI am DM'ing you to let you know that ${mainUser.username}'s alter has changed\n Alter: \`${currentAlter.name}\`\nPronouns: \`${currentAlter.pronouns}\`\n**This is not a good time to contact them, or they are not in a fit state to be contacted in, so please do not.**\n\nThanks, AlterBot`,
              color: "RED",
            })
          )
          .catch((e) => {
            return true;
          });
        return temp.set(`currentNotifiedAlter`, currentAlter.name);
      });
  }
};
client.on("ready", async () => {
  console.log("[AlterBot] Online!");
  client.user.setActivity("around - created by fnionn");
  setInterval(alterCheck, 10000);
});

client.login(config.TOKEN);
