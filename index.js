const Ongaku = require('discord.js');
const client = new Ongaku.Client();
const DisTube = require('distube')
const distube = new DisTube(client, { searchSongs: true }, { leaveOnEmpty: true}, { emitNewSongOnly: true});
const Database = require("./data/db");
const database = new Database();
client.muted = require("./data/muted.json");
const main = require("./data/config.json")
const fs = require('fs');
const db = require('quick.db');
const moment = require('moment');
require("moment-duration-format");
const cooldowns = new Map();
const humanizeDuration = require('humanize-duration');



const status = (queue) => `*Music Volume: \`${queue.volume}%\` - Filters: \`${queue.filter || "Off"}\` - Looping: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` - Autoplaying: \`${queue.autoplay ? "On" : "Off"}\`*`;

    distube
    .on("playSong", (message, queue, song) => message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`〉Playing \`${song.name}\` - \`${song.formattedDuration}\`\n*Requested by: ${song.user}*\n${status(queue)}`)
      
    ))
    .on("addSong", (message, queue, song) => message.channel.send(
        new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`〉Added ${song.name} - \`${song.formattedDuration}\` to the queue\n *Requested by: ${song.user}*`)
      
        
    ))
    .on("playList", (message, queue, playlist, song) => message.channel.send(
        new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(` Playing \`${playlist.name}\` - All songs ${playlist.songs.length}\n*Requested by: ${song.user}*\n\n〉Now playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`)
      
        
    ))
    .on("addList", (message, queue, playlist) => message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`〉Added \`${playlist.name}\` - All songs ${playlist.songs.length} to queue\n${status(queue)}`)
      
        
    ))
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
        let i = 0;
        message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`〉Choose a number from the list below\n${result.map(song => `${++i}: *\`${song.name}\` - \`${song.formattedDuration}\`*`).join("\n")}\n\n〉*Enter anything else to cancel*`)
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

                fs.writeFile("./data/muted.json", JSON.stringify(client.muted), err => {
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
  console.log(`Name is: ${client.user.username}`)
});






const usersMap = new Map();

const LIMIT = 20;
const TIME = 25000;
const DIFF = 9500;






client.on("message", async message => {


    
    if(message.author.bot) return;
const data = {
    prefix: "on!"
}

let prefix = data.prefix
    var nonos = [
    'fuck','pussy','bitch','hoe','whore','slut','cunt','piss','shit','damn','nigga','nigger','retard','dickhead','dipshit','ass','asshat','motherfucker','bitchass','bitch ass','Fuck','Pussy','Bitch','Hoe','Whore','Slut','Cunt','Piss','Shit','Damn','Nigga','Nigger','Retard','Dickhead','Dipshit','Ass','Asshat','Motherfucker','Bitchass','bitch ass'
]

    let links = [
    'discord.gg',
    'discord.com/invite',
    'discord.io',
    'discord.st',
    'discord.me',
    'https://discord.gg',
    'https://discord.com/invite',
    'https://discord.io',
    'https://discord.st',
    'https://discord.me'
]

if (nonos.some(word => message.content.startsWith(word))) {
        if(!db.get(`modbadword_${message.guild.id}`)) return; 

         let whitelist = await db.fetch(`whitelist_${message.guild.id}`);

if(message.member.roles.cache.has(whitelist)) return;

        if(!message.member.roles.cache.has(whitelist)) {
             message.delete()
             message.channel.send({ embed: { color: ('RANDOM'), description: ('Badword Detected:\nCuss words are not permitted on this server') } }).then(message => message.delete({ timeout: 5000 }));
     } 
}

if (message.content.includes(links)) {
        if(!db.get(`modinvite_${message.guild.id}`)) return; 

         let whitelist = await db.fetch(`whitelist_${message.guild.id}`);

if(message.member.roles.cache.has(whitelist)) return;

        if(!message.member.roles.cache.has(whitelist)) {
             message.delete()
             message.channel.send({ embed: { color: ('RANDOM'), description: (' | Link Deleted:\nInvite links are not permitted on this server') } }).then(message => message.delete({ timeout: 5000 }));
     } 
}

  if (message.content.indexOf(prefix) !== 0) return;

  const args = message.content.slice(prefix.length).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === "ping") {

    const m = await message.channel.send({ embed: { color: ('RANDOM'), description: (`Ping?`) } });
    m.edit(new  Ongaku.MessageEmbed()
      .setColor("RANDOM")
      .setFooter("pong command info")
      .setDescription(`Message Latency \n 🟢 ${Date.now() - message.createdTimestamp}ms.\nAPI Latency \n 🟢 ${Math.round(client.ws.ping)}ms`)
      .setAuthor(message.author.username, message.author.displayAvatarURL())
             .setTimestamp())
  }
  if (command == "play") {
      if (!message.member.voice.channel) return message.channel.send(` You're not in a voice channel !`);
      let song = args.join(' ')
      if(!song) return message.channel.send('plase enter a songs url/name');
        distube.play(message, song);
        }
        

    if (command === "loop") {
        let mode = distube.setRepeatMode(message, parseInt(args[0]));
        mode = mode ? mode == 2 ? "Repeat queue" : "Repeat song" : "Off";
        message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`Set looping to \`${mode}\``)
      )
     }

    if (command == "stop") {
        distube.stop(message);
        message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`Destroyed the music player and left the vc!`)
      )
    }

    if (command == "skip")
        distube.skip(message);

    if (command == "queue") {
        let queue = distube.getQueue(message);
        message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription('Current queue:\n' + queue.songs.map((song, id) =>
            `${id + 1}. [${song.name}](song.url) - \`${song.formattedDuration}\``
        ).slice(0, 10).join("\n"))
      );
    }

        if (message.content.startsWith([`3d`, `bassboost`, `echo`, `karaoke`, `nightcore`, `vaporwave`])) {
        let filter = distube.setFilter(message);
        message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription("Current queue filter: " + (filter || "Off"))
      )
    }
    if(command === "autoplay") {
        let mode = distube.toggleAutoplay(message);
        message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription("Set autoplay mode to `" + (mode ? "On" : "Off") + "`")
      )
    }
    if(command === "volume") {
        let vol = args.join(" ")
         distube.setVolume(message, vol);
         message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`Changed the volume to ${vol}%`)
      )
    }
    if(command === "pause") {
         distube.pause(message);
         message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`Paused the music!`)
      )
    }
    if(command === "resume") {
         distube.resume(message);
         message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`Resumed the music!`)
      )
    }

    //music ends here

    if(command === "warn") {
      if (!message.member.hasPermission("ADMINISTRATOR", "MANAGE_MESSAGES")) return message.channel.send("You need to be an admin or mod to use this command.");

      let embed = new Ongaku.MessageEmbed()
      .setColor('RANDOM')
      .setDescription(`Command: ${prefix}warn\n\nDescription: warns a member\nUsage: ${prefix}warn [user] [reason]\nExample: ${prefix}warn @shivaco broke a rule\nCooldown: None`)
      

        let userid = (message.mentions.members.first());
        if(userid === message.author) return;
        if(!userid) return message.channel.send(embed);
        let reason = args.join(" ").slice(22)
        if(!reason) reason = 'No reason provided';
        let issuer = message.author.id;
            database.addWarning(message.guild.id, userid, d, reason, issuer)

            message.channel.send({ embed: { color: ('RANDOM'), description: (` <@${userid.id}> (${userid.id}) has been warned`) } });
  }
  if(command === "unwarn") {
      if (!message.member.hasPermission("ADMINISTRATOR", "MANAGE_MESSAGES")) return message.channel.send("You need to be an admin or mod to use this command.");

    // Remove last warning made in the guild.
    if (args[1] == "last") {
        database.removeWarning(message.guild.id)
            message.channel.send({ embed: {
                color: `RANDOM`,
                description: ` the last user has been unwarned`
            }})
            .catch(() => {
            message.channel.send({ embed: {
                color: `RANDOM`,
                description: "   Failed to remove warning..."
            }});
        });
    }
    // Remove a specific warning from a user
        let userId = (message.mentions.members.first());
        if(userId === message.author) return;
        let warningNum = (args[2]) ? parseInt(args[2]) : 1;
        database.removeWarning(message.guild.id, userId, warningNum)
            message.channel.send({ embed: {
                color: `RANDOM`,
                description: `  <@${userId.id}> (${userId.id}) has been unwarned`
            }})
        .catch(() => {
            message.channel.send({ embed: {
                color: `RANDOM`,
                description: `  Failed to remove warning... Double check the user and warning number. (e.x: ${prefix}unwarn [warn number] @user)`
            }});
        });
    }
    if(command === "warnings") {
        var userid = (message.mentions.members.first()) || message.author;
        var page = (args[2]) ? args[2] : "1";
        if (!isNaN(page)) {
            page = parseInt(page) - 1;
            database.getWarnings(message.guild.id, userid)
            .then(warnings => {
                if (warnings.length == 0) return message.channel.send("", { embed: {
                    color: `RANDOM`,
                    description: "<:RosesNo:783481473176436768> | User has no warnings."
                }});
                var array_chunks = Array(Math.ceil(warnings.length / 15)).fill().map((_, index) => index * 15).map(begin => warnings.slice(begin, begin + 15));
                if (page > -1 && array_chunks.length > page) {
                    message.channel.send({ embed: {
                        color: `RANDOM`,
                        description:` <:RosesYes:783481474337865729> Warnings for <@${userid.id}>  (${userid.id})\n\n Total warnings:  ${warnings.length} | Page: ${page + 1}/${array_chunks.length}\n\n${array_chunks[page].map((warning, index) => `${index + 1})‎ Timestamp: ${warning.d}‎ | Moderator: <@${warning.issuer}>\n *Reason for the warning: ${warning.reason}*`).join("\n\n")}`
                    }});
                }
            });
        }
         }
         if (command === "unban") {
    const rgx = /^(?:<@!?)?(\d+)>?$/;
    if (!message.member.hasPermission("ADMINISTRATOR", "BAN_MEMBERS")) return message.channel.send("You need to be an admin to use this command.");
    
    const id = args[0];
    if (!rgx.test(id)) return message.reply('Please provide a valid user ID');
    const bannedUsers = await message.guild.fetchBans();
    const user = bannedUsers.get(id).user;
    if (!user) return message.reply('Unable to find user, please check the provided ID');

    let reason = args.slice(1).join(' ');
    if (!reason) reason = '`None`';
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    await message.guild.members.unban(user, reason);

    await message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`<@${user.id}> has been unbanned`))
  }
  if (command === "kick") {
      const cooldown = cooldowns.get(message.author.id);
if (cooldown) {
  const remaining = humanizeDuration(cooldown - Date.now(), { round: true });
      let timeEmbed = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You have already used this command recently\n\nTry again in ${remaining}`);
      message.channel.send(timeEmbed)
    } else {
      let embed = new Ongaku.MessageEmbed()
      .setColor('RANDOM')
      .setDescription(`Command: ${prefix}kick\n\nDescription: kicks a member\nUsage: ${prefix}kick [user] [reason]\nExample: ${prefix}kick @shivaco hurt my feelings\nCooldown: 3 seconds`)
      

    let reason = args.slice(1).join(' ');
    if (!reason) reason = "No reason provided";

    if (!message.member.hasPermission("ADMINISTRATOR", "KICK_MEMBERS")) return message.channel.send("You need to be an admin to use this command.");

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if(member === message.author) return;
    if (!member)
      return message.reply(embed)
    if (!member.kickable)
      return message.reply(embed)

    await member.kick(reason)
      .catch(error => message.reply({ embed: { color: ('RANDOM'), description: (`Sorry ${message.author} I couldn't kick because of : ${error}`) } }));

    message.reply({ embed: { color: ('RANDOM'), description: (`${member} has been kicked succesfully`) } });
    cooldowns.set(message.author.id, Date.now() + 3000)
      setTimeout(() => cooldowns.delete(message.author.id), 3000);
    }
  };

  if (message.content.startsWith(prefix + 'ban')) {
      const cooldown = cooldowns.get(message.author.id);
if (cooldown) {
  const remaining = humanizeDuration(cooldown - Date.now(), { round: true });
      let timeEmbed = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You have already used this command recently\n\nTry again in ${remaining}`);
      message.channel.send(timeEmbed)
    } else {

      let embed = new Ongaku.MessageEmbed()
      .setColor('RANDOM')
      .setDescription(`Command: ${prefix}ban\n\nDescription: bans a member\nUsage: ${prefix}ban [user] [reason]\nExample: ${prefix}ban @shivaco not pog champ\nCooldown: 3 seconds`)
      

    let reason = args.slice(1).join(' ');
    if (!reason) reason = "No reason provided";

    if (!message.member.hasPermission("ADMINISTRATOR", "BAN_MEMBERS")) return message.channel.send("You need to be an admin to use this command.");

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0])
    if(member === message.author) return;
    if (!member)
      return message.reply(embed)
    if (!member.bannable)
      return message.reply(embed)

    await member.ban({ days: 7, reason: `${(reason)}` })
      .catch(error => message.reply({ embed: { color: ('RANDOM'), description: (`Sorry ${message.author} I couldn't ban because of : ${error}`) } }));
    message.reply({ embed: { color: ('RANDOM'), description: (`${member} has been banned succesfully`) } });

    cooldowns.set(message.author.id, Date.now() + 3000)
      setTimeout(() => cooldowns.delete(message.author.id), 3000);
    }
  }
  if (command === "clear") {
    if (!message.member.hasPermission("ADMINISTRATOR", "MANAGE_MESSAGES")) return message.channel.send("You need to be an admin or mod to use this command.");


    const deleteCount = parseInt(args[0], 10);

    if (!deleteCount || deleteCount < 2 || deleteCount > 100)
      return message.reply({ embed: { color: ('RANDOM'), description: ("Please provide a number between 2 and 100 for the number of messages to delete") } });

    const fetched = await message.channel.messages.fetch({ limit: deleteCount });

    let msgDel = fetched.array().length;
    message.channel.bulkDelete(fetched)
      .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
    message.channel.send({ embed: { color: ('RANDOM'), description: (`Cleared ${msgDel} messages.`) } }).then(message => message.delete({ timeout: 5000 }));
  }
  if(command === "addrole"){
    if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send('You do not have permission.')
        //next we define some variables
        const target = message.mentions.members.first() //member = mentions
        if(!target) return message.channel.send('No member specified') //when no member is pinged
        const role = message.mentions.roles.first() // roles = mentions
        if(!role) return message.channel.send('No role specified') //when no role is specified or pinged
        //now the code!
        await target.roles.add(role) // adding the role to the user
        message.channel.send(`${target.user.username} has obtained ${role}`)
}
if(command === "removerole") {
     if(!message.member.hasPermission("MANAGE_ROLES")) return message.channel.send('You do not have permission.')
        //next we define some variables
        const target = message.mentions.members.first() //member = mentions
        if(!target) return message.channel.send('No member specified') //when no member is pinged
        const role = message.mentions.roles.first() // roles = mentions
        if(!role) return message.channel.send('No role specified') //when no role is specified or pinged
        //now the code!
        await target.roles.remove(role) // removeing the role to the user
        message.channel.send(`${target.user.username} roles has been removed from ${role}`)
}

//end of moderation commands

});
client.login(main.token)