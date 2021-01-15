const Ongaku = require('discord.js');
const client = new Ongaku.Client();
const DisTube = require('distube')
const distube = new DisTube(client, { searchSongs: true }, { leaveOnEmpty: true}, { emitNewSongOnly: true});
const data = {
    token: 'Nzk4NjcwNjcyOTY4Mjg2MjA5.X_4aBw.9Ne2pA5iGUVlKM904ysjaWX6P7E',
    prefix: 'on!'
}
const Database = require("./db");
const database = new Database();

const status = (queue) => `*Music Volume: \`${queue.volume}%\` - Filters: \`${queue.filter || "Off"}\` - Looping: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` - Autoplaying: \`${queue.autoplay ? "On" : "Off"}\`*`;

    distube
    .on("playSong", (message, queue, song) => message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`〉**Playing \`${song.name}\` - \`${song.formattedDuration}\`**\n*Requested by: ${song.user}*\n${status(queue)}`)
      
    ))
    .on("addSong", (message, queue, song) => message.channel.send(
        new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`〉**Added ${song.name} - \`${song.formattedDuration}\` to the queue**\n *Requested by: ${song.user}*`)
      
        
    ))
    .on("playList", (message, queue, playlist, song) => message.channel.send(
        new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(` **Playing \`${playlist.name}\` - All songs ${playlist.songs.length}**\n*Requested by: ${song.user}*\n\n〉**Now playing \`${song.name}\` - \`${song.formattedDuration}\`**\n${status(queue)}`)
      
        
    ))
    .on("addList", (message, queue, playlist) => message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`〉**Added \`${playlist.name}\` - All songs ${playlist.songs.length} to queue\n${status(queue)}`)
      
        
    ))
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
        let i = 0;
        message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`〉**Choose a number from the list below**\n${result.map(song => `**${++i}:** ***\`${song.name}\` - \`${song.formattedDuration}\`***`).join("\n")}\n\n〉*Enter anything else to cancel*`)
      );
    })
    .on("initQueue", queue => {
    queue.autoplay = false;
    queue.volume = 70;
    })
    // DisTubeOptions.searchSongs = true
    .on("searchCancel", (message) => message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`〉Searching canceled`)
      ))
    .on("error", (message, e) => {
        console.error(e)
        message.channel.send("An error encountered: " + e);
    });


    client.on('ready', () => {
    client.setInterval(() => {
        for(let i in client.muted) {
            let time = client.muted[i].time;
            let guildId = client.muted[i].guild;
            let guild = client.guilds.cache.get(guildId);
            let member = guild.members.cache.get(i);
            let mutedRole = guild.roles.cache.get(mR => mR.name === "Muted");
            if(!mutedRole) continue;

            if(Date.now() > time) {
                member.removeRole(mutedRole);
                delete client.muted[i];

                fs.writeFile("./muted.json", JSON.stringify(client.muted), err => {
                    if(err) throw err;
                });
            }
        }
    }, 5000);

client.user.setActivity("your playlist!", {
  type: "STREAMING",
  url: "https://www.twitch.tv/wowitsmoon",
  status: "dnd"
});
  console.log(`Prefix is: ${data.prefix}`)
  console.log(`Name is: ${client.user.username}`)

  statcord.autopost();
});