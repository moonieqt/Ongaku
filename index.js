const Ongaku = require('discord.js');
const client = new Ongaku.Client();
const DisTube = require('distube')
const distube = new DisTube(client, { searchSongs: true }, { leaveOnEmpty: true}, { emitNewSongOnly: true});
const Database = require("./src/config/db");
const database = new Database();
client.muted = require("./src/config/muted.json");
const main = require("./src/config/config.json")
const fs = require('fs');
const db = require('quick.db');
const moment = require('moment');
require("moment-duration-format");
const cooldowns = new Map();
const humanizeDuration = require('humanize-duration');
const superagent = require('superagent');

const got = require('got');

require('http').createServer((req, res) => res.end()).listen(5030)


const StarboardsManager = require('discord-starboards');

// Initialise it
const manager = new StarboardsManager(client, {
    storage: './src/config/mdsc/starboards.json',
    messages: {
        selfstar: 'You cannot star your own messages.',
        starbot: 'You cannot star messages from a bot.',
        emptyMsg: 'You cannot star an empty message.',
    }
});

// We now have a starboardsManager property to access the manager everywhere!
client.starboardsManager = manager;


const Enmap = require('enmap');


client.modmail = new Enmap({
  name: "modmail",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});
// Just setting up a default configuration object here, to have something to insert.

let role = db.get('support')
if(!role) role = 'None';

const settings = {
  support: `${role}`,
  message: 'Hello and welcome to your support ticket\n\n you can get started by asking your question so when they arrive they can help you ASAP!'
}


client.prefix = new Enmap({
  name: "prefixes",
  fetchAll: false,
  autoFetch: true,
  cloneLevel: 'deep'
});
const configs = {
  prefix: "o!",
  urprefix: "o!"
}

//npm above

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

//moosic stuff above

client.on('messageDelete', async (message) => {
    db.set(`snipemsg_${message.channel.id}_${message.guild.id}`, message.content)
    db.set(`snipesender_${message.channel.id}_${message.guild.id}`, message.author.id)
})

//snipe stuff

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

                fs.writeFile("./src/config/muted.json", JSON.stringify(client.muted), err => {
                    if(err) throw err;
                });
            }
        }
    }, 5000);

client.user.setActivity("over you | o!", {
  type: "WATCHING",
  status: "dnd"
});


  console.log(`Name is: ${client.user.username}`)
});



// bot categorys: [ music, mod, fun, eco ]


const usersMap = new Map();

const LIMIT = 20;
const TIME = 25000;
const DIFF = 9500;


client.on("channelDelete", (channel) => {
    
    if(channel.parentID == channel.guild.channels.cache.find((x) => x.name == "Ongaku-ModMail").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if(!person) return;

        let yembed = new Ongaku.MessageEmbed()
        .setAuthor("MAIL DELETED", client.user.displayAvatarURL())
        .setColor('RANDOM')
        .setThumbnail(client.user.displayAvatarURL())
        .setDescription("Your mail is deleted by moderator and if you have any problem with that than you can open mail again by sending message here.")
    return person.send(yembed)
    
    }


});

client.on("guildDelete", guild => {
  // When the bot leaves or is kicked, delete settings to prevent stale entries.
  client.modmail.delete(guild.id);
  client.prefix.delete(guild.id);
});




client.on("message", async message => {
    

const mail = client.modmail.ensure(message.guild.id, settings)
const con = client.prefix.ensure(message.guild.id, configs)

    const Modlog = message.guild.channels.cache
    .get("ongaku-logs")
    
    if(message.author.bot) return;

const data = {
    prefix: con.prefix,
    uspre: con.urprefix
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

  if (message.content.indexOf([prefix, data.urpre]) !== 0) return;

  const args = message.content.slice([ prefix, data.urpre ].length).trim().split(' ');
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
                    description: "User has no warnings."
                }});
                var array_chunks = Array(Math.ceil(warnings.length / 15)).fill().map((_, index) => index * 15).map(begin => warnings.slice(begin, begin + 15));
                if (page > -1 && array_chunks.length > page) {
                    message.channel.send({ embed: {
                        color: `RANDOM`,
                        description:` ** Warnings for <@${userid.id}>  (${userid.id})**\n\n Total warnings:  ${warnings.length} | Page: ${page + 1}/${array_chunks.length}\n\n${array_chunks[page].map((warning, index) => `${index + 1})‎ Timestamp: ${warning.d}‎ | Moderator: <@${warning.issuer}>\n *Reason for the warning: ${warning.reason}*`).join("\n\n")}`
                    }})
                }
            })
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
if(command === "mute") {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have Permission to mute!");
    let toMute = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if(!toMute) return message.channel.send("You did not specify a user mention or ID!");
    if(toMute.id === message.author.id) return message.channel.send("You can not mute yourself!");
    if(toMute.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("You can not mute a member that is equal to or higher than yourself!");

    // Check if the user has the mutedRole
    let mutedRole = message.guild.roles.cache.find(mR => mR.name === "Muted");

    // If the mentioned user does not have the muted role execute the following
    if(!mutedRole) {
        try {
            // Create a role called "Muted"
            mutedRole = await message.guild.roles.create({ data: { name: 'Muted', color: ('#000001'), permissions: [] } })
             await message.guild.channels.cache.forEach(async (channel, id) => {
          await channel.updateOverwrite(mutedRole, {
            SEND_MESSAGES: false,
            ADD_message: false,
            CONNECT: false
          });
        });
        const why = await message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`Updating channel permissions .  .  .`)
      )

             why.edit(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`Updated all channels!`)
      )

        } catch(e) {
            // If err print
            console.log(e.stack);
        }
    }

    // If the mentioned user already has the "mutedRole" then that can not be muted again
    if(toMute.roles.cache.has(mutedRole.id)) return message.channel.send("This user is already muted!");

    // TODO: Check they they have entered a valid number or even entered one

    // Check current time and add muted time to it, then convert to seconds from milliseconds
    client.muted[toMute.id] = {
        guild: message.guild.id,
        time: Date.now() + parseInt(args[1]) * 1000
    }

    // Add the mentioned user to the "mutedRole" and notify command sender
    await toMute.roles.add(mutedRole);
    
    

    fs.writeFile("./src/config/muted.json", JSON.stringify(client.muted, null, 4), err => {
        if(err) throw err;

        message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`I have Muted ${toMute.user.username} (${toMute.user.id})`)
      )
    });
  }
  if(command === "unmute") {
     if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("You do not have Permission to unmute!");
    let toMute = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if(!toMute) return message.channel.send("You did not specify a user mention or ID!");
    if(toMute.roles.highest.position >= message.member.roles.highest.position) return message.channel.send("You can not unmute a member that is equal to or higher than yourself!");

    // Check if the user has the mutedRole
    let mutedRole = message.guild.roles.cache.find(mR => mR.name === "Muted");

    // If the mentioned user or ID does not have the "mutedRole" return a message
    if(!mutedRole || !toMute.roles.cache.has(mutedRole.id)) return message.channel.send("This user is not muted!");

    // Remove the mentioned users role "mutedRole", "muted.json", and notify command sender
    await toMute.roles.remove(mutedRole);

    toMute.roles.remove(mutedRole);
    delete client.muted[toMute.id];

    fs.writeFile("./src/config/muted.json", JSON.stringify(client.muted), err => {
        if(err) throw err;
        message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`I have Unmuted ${toMute.user.username} (${toMute.user.id})`)
      )
    });
  }

//end of moderation commands

if(command === "eval") {
const { runInNewContext } = require("vm");
const chalk = require("chalk");
const { inspect } = require("util");
const fetch = require("node-fetch");

const options = {
	callback: false,
	stdout: true,
	stderr: true
};

if (!args[0]) return await message.channel.send(":x: You must provide code to execute!");

const script = parseCodeblock(args.join(" "));

if (!(
  await confirmation(
    message,
    new Ongaku.MessageEmbed()
      .setTitle(":warning: Are you sure you would like to execute the following code:")
      .setDescription("```js\n" + script + "```")
      .setColor("RANDOM"),
    {
      deleteAfterReaction: true
    }
  )
)) return;

const context = {
  client,
  message,
  args,
  Ongaku,
  console,
  require,
  process,
  global,
  database,
  db,
  data,
  main
};

const scriptOptions = {
  filename: `${message.author.tag}@${message.guild.name}`,
  timeout: 60000,
  displayErrors: true
};

let start = Date.now();
let result = execute(`"use strict"; (async () => { ${script} })()`, context, scriptOptions);
let end = Date.now();

if (((await result) && !(await result).stdout) && ((await result) && !(await result).callbackOutput) && ((await result) && !(await result).stderr)) {
  if (!(
    await confirmation(
      message,
      ":warning: Nothing was returned. Would you like to run the code again with implicit return?",
      {
        deleteAfterReaction: true
      }
    )
  )) return;
  else {
    start = Date.now();
    result = execute(`"use strict"; (async () => ${script} )()`, context, scriptOptions);
    end = Date.now();
  }
}

result
  .then(async (res) => {
    if (
      (options.stdout && res && res.stdout) ||
    (options.stderr && res && res.stderr) ||
    (options.callback && res && res.callbackOutput)
    ) {
      console.log(chalk`{red {strikethrough -}[ {bold Eval Output} ]{strikethrough ---------}}`);
      if (options.callback && res.callbackOutput) console.log(res.callbackOutput);

      if (options.stdout && res.stdout) {
        console.log(chalk`{red {strikethrough -}[ {bold stdout} ]{strikethrough --------------}}`);
        console.log(res.stdout);
      }
      if (options.stderr && res.stderr) {
        console.log(chalk`{red {strikethrough -}[ {bold stderr} ]{strikethrough --------------}}`);
        console.error(res.stderr);
      }
      console.log(chalk`{red {strikethrough -}[ {bold End} ]{strikethrough -----------------}}`);
    }

    if (
      res.callbackOutput && (typeof res.callbackOutput === "string" ? res.callbackOutput : inspect(res.callbackOutput)).includes(client.token) ||
      res.stdout && res.stdout.includes(client.token) ||
      res.stderr && res.stderr.includes(client.token)
    ) {
      if (!(
        await confirmation(
          message,
          ":bangbang: The bot token is likely located somewhere in the output of your code. Would you like to display the output?",
          {
            deleteAfterReaction: true
          }
        )
      )) return;
    }
    const embed = await generateEmbed(script, res, { start, end });
    const msg = await message.channel.send({ embed: embed });

    if (!(
      await confirmation(
        message,
        ":information_source: Would you like to post the output of this command on hastebin?",
        {
          deleteAfterReaction: true
        }
      )
    )) return;

    const evalOutput = [];

    if (res.callbackOutput) {
      evalOutput.push(
        "-[ Eval Output ]---------",
        typeof res.callbackOutput === "string" ? res.callbackOutput : inspect(res.callbackOutput)
      );
    }

    if (res.stdout) {
      evalOutput.push(
        "-[ stdout ]--------------",
        typeof res.stdout === "string" ? res.stdout : inspect(res.stdout)
      );
    }

    if (res.stderr) {
      evalOutput.push(
        "-[ stderr ]--------------",
        typeof res.stderr === "string" ? res.stderr : inspect(res.stderr)
      );
    }

    const body = await fetch("https://hastebin.com/documents", {
      method: "post",
      body: evalOutput.join("\n")
    })
      .then(async (res) => await res.json());

    await msg.edit({ embed: embed.addField(":notepad_spiral: Hastebin", `https://hastebin.com/${body.key}`) });
  });


async function execute (code, context, options) {
	return await new Promise((resolve) => {
		try {
			captureOutput(() => runInNewContext(code, context, options))
				.then(resolve)
				.catch(resolve);
		} catch (err) {
			resolve(err);
		}
	});
}

async function generateEmbed (code, outs, { start, end }) {
	const output = typeof outs && outs.callbackOutput && outs.callbackOutput.then === "function" ? await outs && outs.callbackOutput : outs && outs.callbackOutput;
	const stdout = outs && outs.stdout;
	const stderr = outs && outs.stderr;

	const embed = new Ongaku.MessageEmbed()
		.setFooter(`Execution time: ${end - start}ms`)
		.setTimestamp();

	if (output) {
		embed
			.setTitle(":outbox_tray: Output:")
			.setDescription("```js\n" + ((typeof output === "string" ? output : inspect(output)) || "undefined").substring(0, 2000) + "```");
	}

	if (stdout) embed.addField(":desktop: stdout", "```js\n" + ((typeof stdout === "string" ? stdout : inspect(stdout)) || "undefined").substring(0, 1000) + "```");

	if (stderr) embed.addField(":warning: stderr", "```js\n" + ((typeof stderr === "string" ? stderr : inspect(stderr)) || "undefined").substring(0, 1000) + "```");

	if (!embed.fields.length && !embed.description) embed.setTitle("Nothing was returned.");

	if ((stdout && !isError(outs && outs.callbackOutput)) || (stdout && !output) || (!stdout && !output && !stderr)) embed.setColor("GREEN");
	else if (!stdout && !output && stderr) embed.setColor("YELLOW");
	else embed.setColor(isError(output) ? "RED" : "GREEN");

	embed.addField(":inbox_tray: Input", "```js\n" + code.substring(0, 1000) + "```");

	return embed;
}

function isError (object) {
	const name = object && object.constructor && object.constructor.name;
	if (!name) return true;
	return /.*Error$/.test(name);
}

// Code from: https://github.com/lifeguardbot/lifeguard/blob/a31f57b5164d95d16f0dd961c10a5b77dc9e7bd4/src/plugins/dev/eval.ts#L6-L13
function parseCodeblock (script) {
	const cbr = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm;
	const result = cbr.exec(script);
	if (result) {
		return result[4];
	}
	return script;
}

/**
 * Ask for confirmation before proceeding
 * @param {Message} message Ongaku.js message object
 * @param {string} confirmationMessage Ask for confirmation
 * @param {ConfirmationOptions} [options] Options
 * @param {string} [options.confirmMessage] Edit the message upon confirmation
 * @param {string | MessageEmbed} [options.denyMessage] Edit the message upon denial
 * @param {number} options.time Timeout
 * @param {boolean} [options.keepReactions] Keep reactions after reacting
 * @param {boolean} [options.deleteAfterReaction] Delete the message after reaction (takes priority over all other messages)
 * @example
 * const confirmationMessage: string = "Are you sure you would like to stop the bot?"
 * const options = {
 *   confirmMessage: "Shutting down...",
 *   denyMessage: "Shutdown cancelled."
 * }
 *
 * const proceed = await confirmation(message, confirmationMessage, options)
 *
 * if (proceed) process.exit(0)
 */
async function confirmation (message, confirmationMessage = {}, options = {}) {
	const yesReaction = "✔️";
	const noReaction = "✖️";

	const filter = ({ emoji: { name } }, { id }) => (name === yesReaction || name === noReaction) && id === message.author.id;

	const msg = await message.channel.send(confirmationMessage);

	await msg.react(yesReaction);
	await msg.react(noReaction);

	const e = (await msg.awaitReactions(filter, { max: 1, time: options && options.time || 300000 })).first();

	if (options && options.deleteAfterReaction) msg.delete();
	else if (!options && options.keepReactions) msg.reactions.removeAll();

	if (e && e.emoji && e.emoji.name === yesReaction) {
		if (options && options.confirmMessage && !options.deleteAfterReaction) await msg.edit(options && options.confirmMessage instanceof Ongaku.MessageEmbed ? { embed: options && options.confirmMessage, content: null } : { embed: null, content: options && options.confirmMessage });
		return true;
	} else {
		if (options && options.denyMessage && !options.deleteAfterReaction) await msg.edit(options && options.denyMessage instanceof Ongaku.MessageEmbed ? { embed: options && options.denyMessage, content: null } : { embed: null, content: options && options.denyMessage });
		return false;
	}
}

/**
 * Capture stdout and stderr while executing a function
 * @param {Function} callback The callback function to execute
 * @returns {Promise<CapturedOutput>} stdout, stderr and callback outputs
 */
async function captureOutput (callback) {
	return await new Promise((resolve, reject) => {
		const oldProcess = { ...process };
		let stdout = "";
		let stderr = "";

		// overwrite stdout write function
		process.stdout.write = (str) => {
			stdout += str;
			return true;
		};

		// overwrite stderr write function
		process.stderr.write = (str) => {
			stderr += str;
			return true;
		};

		try {
			const c = callback();

			delete process.stdout.write;
			process.stdout.write = oldProcess.stdout.write;

			delete process.stderr.write;
			process.stderr.write = oldProcess.stderr.write;

			return c
				.catch((c) => reject({ stdout, stderr, callbackOutput: c })) // eslint-disable-line prefer-promise-reject-errors
				.then((callbackOutput) => resolve({ stdout, stderr, callbackOutput }));
		} catch (error) {
			delete process.stdout.write;
			process.stdout.write = oldProcess.stdout.write;

			delete process.stderr.write;
			process.stderr.write = oldProcess.stderr.write;
			return reject({ stdout, stderr, callbackOutput: error }); // eslint-disable-line prefer-promise-reject-errors
		}
	});
}
}

//end of massive eval commmand

if(command === "snipe") {
     let msg = db.get(`snipemsg_${message.channel.id}_${message.guild.id}`)
        let senderid = db.get(`snipesender_${message.channel.id}_${message.guild.id}`)
        if(!msg) {
            return message.channel.send(`There is nothing to snipe.`)
        }
        let embed = new Ongaku.MessageEmbed()
        .setTitle(client.users.cache.get(senderid).username, client.users.cache.get(senderid).displayAvatarURL({ format: "png", dynamic: true }))
        .setDescription(`Sniped message: ${msg}\n\nMesage Sender: ${client.users.cache.get(senderid).username}`)
        .setColor("RANDOM")
        .setTimestamp()

        message.channel.send(embed)
}

//end of snipe


 if(command === "hug") {
          if (!message.mentions.users.first()) return message.reply("You need to mention someone to hug them"); //if no one is mentions , lets reply as
    const { body } = await superagent
    .get("https://nekos.life/api/hug"); //lets see wut we went
    
    const embed = new Ongaku.MessageEmbed() //onec Discordjs is updated to 12.2.0 , richembed is removed ! they replaced now as MessageEmbed
    .setColor("RANDOM") // you can set it as you went
    .setDescription(`${message.author} hugged ${message.mentions.users.first()}`) // lets reply like this if we mentions
    .setImage(body.url) // hug gif well showing here
    message.channel.send({embed})
  }
  if(command === "kiss") {
      if (!message.mentions.users.first()) return message.reply("You need to mention someone to kiss them");
    const { body } = await superagent
    .get("https://nekos.life/api/kiss");
    
    const embed = new Ongaku.MessageEmbed() //RichEmbed is changed to MessageEmbed because the newest update is remove `RichEmbed` Method
    .setColor("RANDOM") // you can set it random color
    .setDescription(` ${message.author} kissed ${message.mentions.users.first()}`) 
    .setImage(body.url)
    message.channel.send({embed})
  }
  if(command === "pet") {
      if (!message.mentions.users.first()) return message.reply("you almost mention someone to pet them");
    const { body } = await superagent
    .get("https://nekos.life/api/pat");
    
    const embed = new Ongaku.MessageEmbed() 
    .setColor("RANDOM") //you can set it as you went
    .setDescription(`${message.author} etted ${message.mentions.users.first()}`) //lets reply as 
    .setImage(body.url) // lets showing pat (GIF)
    message.channel.send({embed})
  }
  if(command === "poke") {
      if (!message.mentions.users.first()) return message.reply(":x: | i see anything is wrong ,You need to mention someone to pat them"); //lets reply as this if you didnt mention anyone
    if (message.mentions.users.first().id === "782929865636446229") return message.channel.send('<a:kith:790731483576139777>'); //lets reply as this if you mentions
    const { body } = await superagent
    .get("https://nekos.life/api/poke"); //lets check wut we need
    
    const embed = new Ongaku.MessageEmbed() // RichEmbed is renamed as MessageEmbed onec discordjs is updated to newest version
    .setColor("RANDOM") 
    .setDescription(`${message.author} wants ${message.mentions.users.first()} attention`) // lets reply as a funny reply
    .setImage(body.url)
    message.channel.send({embed})
  }
  if(command === "slap") {
       if (!message.mentions.users.first()) return message.reply("You need to mention someone to slap them"); //if no one is mentions , lets reply as
    const { body } = await superagent
    .get("https://nekos.life/api/slap"); //wut we need 
    
    const embed = new Ongaku.MessageEmbed() //once discordjs is updated to 12.2.0 , richembed is removed , they replaced as MessageEmbed Method
    .setColor("RANDOM") // you can set it as you went
    .setDescription(`${message.mentions.users.first()} has been slapped by ${message.author}`) //lets reply as a some fun reply
    .setImage(body.url) //lets show slap image (GIF)
    message.channel.send({embed})
  }
  if(command === "smug") {
      const { body } = await superagent
    .get("https://neko-love.xyz/api/v1/smug"); //wut we need
    
    const embed = new Ongaku.MessageEmbed() // once discordjs is updated to 12.2.0 , richembed method is renamed to MessageEmbed
    .setTitle('----') // i make it empty , change it as you went
    .setColor("RANDOM") //its personnel , you can change it
    .setImage(body.url) //here well shozing Smug Image
    message.channel.send({embed})
  }
  if(command === "cry") {
      const { body } = await superagent
    .get("https://neko-love.xyz/api/v1/cry"); //wut we need
    
    const embed = new Ongaku.MessageEmbed() // once discordjs is updated to 12.2.0 , richembed method is renamed to MessageEmbed
    .setDescription(`qwq, ${message.author} is crying`) // i make it empty , change it as you went
    .setColor("RANDOM") //its personnel , you can change it
    .setImage(body.url) //here well shozing Smug Image
    message.channel.send({embed})
  }
  if(command === "punch") {
       if (!message.mentions.users.first()) return message.reply("You need to mention someone to punch them");
      const { body } = await superagent
    .get("https://neko-love.xyz/api/v1/punch"); //wut we need
    
    const embed = new Ongaku.MessageEmbed() // once discordjs is updated to 12.2.0 , richembed method is renamed to MessageEmbed
    .setDescription(`${message.author} punches ${message.mentions.users.first()}`) // i make it empty , change it as you went
    .setColor("RANDOM") //its personnel , you can change it
    .setImage(body.url) //here well shozing Smug Image
    message.channel.send({embed})
  }

  //end of roleplay commmands
  var economy = new db.table('economy')

  if (command === "work") {
    let user = message.author;
    let author = await db.fetch(`work_${message.guild.id}_${user.id}`)

    const cooldown = cooldowns.get(message.author.id);
if (cooldown) {
  const remaining = humanizeDuration(cooldown - Date.now());
      let timeEmbed = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You have already worked recently\n\nTry again in ${remaining}`);
      message.channel.send(timeEmbed)
    } else {


      let replies = ['Programmer', 'Builder', 'Waiter', 'Busboy', 'Chief', 'Mechanic', 'Engineer', 'Hitman', 'Hacker']


      let result = Math.floor((Math.random() * replies.length));
      let amount = Math.floor(Math.random() * 80) + 1;
      let embed1 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`You worked as a ${replies[result]} and earned ${amount} coins`);
      await message.channel.send(embed1)

      economy.add(`money_${message.guild.id}_${user.id}`, amount)
      economy.set(`work_${message.guild.id}_${user.id}`, Date.now())

      cooldowns.set(message.author.id, Date.now() + 10000)
      setTimeout(() => cooldowns.delete(message.author.id), 10000);
    } 
  }
  if (command === "bal") {
    let user = message.mentions.members.first() || message.author;

    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)

    if (bal === null) bal = 0;

    let bank = await economy.fetch(`bank_${message.guild.id}_${user.id}`)
    if (bank === null) bank = 0;

    let moneyEmbed = new Ongaku.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(`**${user}'s Balance**\n\nPocket: ${bal}\nBank: ${bank}`);
    message.channel.send(moneyEmbed)
  }
  if (command === "beg") {
    let user = message.author;
    let amount = 14;

    let beg = await economy.fetch(`beg_${message.guild.id}_${user.id}`)

    
      let moneyEmbed = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You've begged and received ${amount} coins`);
      message.channel.send(moneyEmbed)
      economy.add(`money_${message.guild.id}_${user.id}`, amount)
      economy.set(`beg_${message.guild.id}_${user.id}`, Date.now())
  }
  if (command === "deposit") {
    let user = message.author;

    let member = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let member2 = economy.fetch(`bank_${message.guild.id}_${user.id}`)

    if (args[0] == 'all') {
      let money = await economy.fetch(`money_${message.guild.id}_${user.id}`)
      let bank = await economy.fetch(`bank_${message.guild.id}_${user.id}`)

      let embedbank = new Ongaku.MessageEmbed()
        .setColor('RANDOM')
        .setDescription(" You don't have any money to deposit")

      if (money === 0) return message.channel.send(embedbank)

      economy.add(`bank_${message.guild.id}_${user.id}`, money)
      economy.subtract(`money_${message.guild.id}_${user.id}`, money)
      let embed5 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You have deposited all your coins into your bank`);
      message.channel.send(embed5)

    } else {

      let embed2 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` Specify an amount to deposit`);

      if (!args[0]) {
        return message.channel.send(embed2)
          .catch(err)
          console.log(err)
      }
      let embed3 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You can't deposit negative money`);

      if (message.content.includes('-')) {
        return message.channel.send(embed3)
      }
      let embed4 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You don't have that much money`);

      if (member < args[0]) {
        return message.channel.send(embed4)
      }

      let embed5 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You have deposited ${args[0]} coins into your bank`);

      message.channel.send(embed5)
      economy.add(`bank_${message.guild.id}_${user.id}`, args[0])
      economy.subtract(`money_${message.guild.id}_${user.id}`, args[0])
    }
  }
  if (command === "pay") {
    let user = message.mentions.members.first() 

    let member = economy.fetch(`money_${message.guild.id}_${message.author.id}`)


    if (!user) {
        return message.channel.send('you forgot to mention somebody.')
    }
    if (!args[1]) {
        return message.channel.send('Please specify an amount.')
    }
    if (message.content.includes('-')) { // if the message includes "-" do this.
        return message.channel.send('Negative money can not be paid.')
    }

    if (member < args[1]) {
        return message.channel.send(`That's more money than you've got in your balance. try again.`)
    }

    message.channel.send(`${message.author.tag}, You successfully paid ${user.user.username} ${args[1]}$.`)
    economy.add(`money_${message.guild.id}_${user.id}`, args[1])
    economy.subtract(`money_${message.guild.id}_${message.author.id}`, args[1])
  }
  if (command === "gamble") {
    let user = message.author;

    function isOdd(num) {
      if ((num % 2) == 0) return false;
      else if ((num % 2) == 1) return true;
    }

    let colour = args[0];
    let money = parseInt(args[1]);
    let moneydb = await economy.fetch(`money_${message.guild.id}_${user.id}`)

    let random = Math.floor(Math.random() * 37);

    let moneyhelp = new Ongaku.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(` Specify an amount to gamble | ${prefix}gamble <color> <amount>`);

    let moneymore = new Ongaku.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(` You are betting more than you have`);

    let colorbad = new Ongaku.MessageEmbed()
      .setColor("RANDOM")
      .setDescription(` Specify a color | Red [1.5x] Black [2x] Green [15x]`);


    if (!colour) return message.channel.send(colorbad);
    colour = colour.toLowerCase()
    if (!money) return message.channel.send(moneyhelp);
    if (money > moneydb) return message.channel.send(moneymore);

    if (colour == "b" || colour.includes("black")) colour = 0;
    else if (colour == "r" || colour.includes("red")) colour = 1;
    else if (colour == "g" || colour.includes("green")) colour = 2;
    else return message.channel.send(colorbad);



    if (random == 0 && colour == 2) { // Green
      money *= 15
      economy.add(`money_${message.guild.id}_${user.id}`, money)
      let moneyEmbed1 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You won ${money} coins\n\nMultiplier: 15x`);
      message.channel.send(moneyEmbed1)
      console.log(`${message.author.tag} Won ${money} on green`)
    } else if (isOdd(random) && colour == 1) { // Red
      money = parseInt(money * 1.5)
      economy.add(`money_${message.guild.id}_${user.id}`, money)
      let moneyEmbed2 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You won ${money} coins\n\nMultiplier: 1.5x`);
      message.channel.send(moneyEmbed2)
    } else if (!isOdd(random) && colour == 0) { // Black
      money = parseInt(money * 2)
      economy.add(`money_${message.guild.id}_${user.id}`, money)
      let moneyEmbed3 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(`You won ${money} coins\n\nMultiplier: 2x`);
      message.channel.send(moneyEmbed3)
    } else { // Wrong
      economy.subtract(`money_${message.guild.id}_${user.id}`, money)
      let moneyEmbed4 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You lost ${money} coins\n\nMultiplier: 0x`);
      message.channel.send(moneyEmbed4)
    }
  }
  if (command === "withdraw") {
    let user = message.author; (`money_${message.guild.id}_${message.author.id}`)

    let member = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let member2 = economy.fetch(`bank_${message.guild.id}_${user.id}`)

    if (args[0] == 'all') {
      let money = await economy.fetch(`bank_${message.guild.id}_${user.id}`)

      economy.subtract(`bank_${message.guild.id}_${user.id}`, money)
      economy.add(`money_${message.guild.id}_${user.id}`, money)
      let embed5 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You have withdrawn all your coins from your bank`);
      message.channel.send(embed5)

    } else {

      let embed2 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` Specify an amount to withdraw`);

      if (!args[0]) {
        return message.channel.send(embed2)
      }
      let embed3 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You can't withdraw negative money`);

      if (message.content.includes('-')) {
        return message.channel.send(embed3)
      }
      let embed4 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You don't have that much money in the bank`);

      if (member2 < args[0]) {
        return message.channel.send(embed4)
      }

      let embed5 = new Ongaku.MessageEmbed()
        .setColor("RANDOM")
        .setDescription(` You have withdrawn ${args[0]} coins from your bank`);

      message.channel.send(embed5)
      economy.subtract(`bank_${message.guild.id}_${user.id}`, args[0])
      economy.add(`money_${message.guild.id}_${user.id}`, args[0])
    }
  }

  if (command === "lb") {
    
    let money = economy.all().filter(data => data.ID.startsWith(`money`)).sort((a, b) => b.data - a.data)
        money.length = 10;
        let finalLb = "";
        for (var i in money) {
          finalLb += `**${money.indexOf(money[i])+1}.**     <@${money[i].ID.slice(25)}> - \`${money[i].data} $\`\n`;
        }
        if(!finalLb) finalLb = 'nobody to display on the leaderboard';
        
        const embed = new Ongaku.MessageEmbed()
        .setAuthor(`${message.guild.name}`, message.guild.iconURL({ dynamic: true }))
        .setColor("RANDOM")
        .addField(`Money Leaderboard`, finalLb, false)
        .setFooter(message.author.tag, message.author.displayAvatarURL())
    .setTimestamp()
        message.channel.send(embed);
}
if (command === "r-lb") {
    
    let level = db.all().filter(data => data.ID.startsWith(`level`)).sort((a, b) => b.data - a.data)
        level.length = 10;
        let finalLb = "";
        for (var i in level) {
          finalLb += `**${level.indexOf(level[i])+1}.**     <@${level[i].ID.slice(25)}> - \`Level is: ${level[i].data}\`\n`;
        }
        if(!finalLb) finalLb = 'nobody to display on the leaderboard';
        
        const embed = new Ongaku.MessageEmbed()
        .setAuthor(`${message.guild.name}`, message.guild.iconURL({ dynamic: true }))
        .setColor("RANDOM")
        .addField(`Rank Leaderboard`, finalLb, false)
        .setFooter(message.author.tag, message.author.displayAvatarURL())
    .setTimestamp()
        message.channel.send(embed);
}
if(command === "create-item") {
    if (!message.member.hasPermission("ADMINISTRATOR", "MANAGE_MESSAGES")) return message.channel.send("You need to be an admin or mod to use this command.");

      let embed = new Ongaku.MessageEmbed()
      .setColor('RANDOM')
      .setDescription(`**Command: ${prefix}create-item**\n\n**Description**: \`creates item in the shop\`\n**Usage**: \`${prefix}create-item [name] [price] [description]\`\n**Example**: \`${prefix}create-item bow 10 grab a bow to hunt!\`\n**Cooldown**: \`None\``)
      

    let name = args[0]
    if(!name) return message.channel.send(embed);
    let price = args[1]
    if(!price) price = '0';
    let desc = args.slice(2).join(' ')
    if(!desc) desc = 'No description set';

    
    economy.set(`item_${name}_${message.guild.id}`, { name: `${name}`, price: `${price}`, description: `${desc}` });

    message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`***| Created an item for the shop***\n\n**Item info**\n**Name of the item**: \`${name}\`\n**Price of the item**: \`${price}\`\n**Description of the item**: \`${desc}\``)
      )
}
if(command === "delete-item") {
    if (!message.member.hasPermission("ADMINISTRATOR", "MANAGE_MESSAGES")) return message.channel.send("You need to be an admin or mod to use this command.");

      let embed = new Ongaku.MessageEmbed()
      .setColor('RANDOM')
      .setDescription(`**Command: ${prefix}delete-item**\n\n**Description**: \`delete item in the shop\`\n**Usage**: \`${prefix}delete-item [name]\`\n**Example**: \`${prefix}delete-item bow\`\n**Cooldown**: \`None\``)
      

    let name = args[0]
    if(!name) return message.channel.send(embed)
    if(!economy.get(`item_${name}_${message.guild.id}`)) return message.channel.send('no item in the shop with that name');

    economy.delete(`item_${name}_${message.guild.id}`)
    economy.delete(`shop_item_${message.guild.id}`, { name: `${name}` });
    message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`***| Deleted an item from the shop***\n\n**Item info**\n**Name of the item**: \`${name}\``)
      )
}
if(command === "item-info") {
    if (!message.member.hasPermission("ADMINISTRATOR", "MANAGE_MESSAGES")) return message.channel.send("You need to be an admin or mod to use this command.");

      let embed = new Ongaku.MessageEmbed()
      .setColor('RANDOM')
      .setDescription(`**Command: ${prefix}item-info**\n\n**Description**: \`get info of a item in the shop\`\n**Usage**: \`${prefix}item-info [name]\`\n**Example**: \`${prefix}item-info bow\`\n**Cooldown**: \`None\``)
      

    let name = args[0]
    if(!name) return message.channel.send(embed)
    if(!economy.get(`item_${name}_${message.guild.id}`)) return message.channel.send('no item in the shop with that name');

    let iname = economy.get(`item_${name}_${message.guild.id}.name`)
    let iprice = economy.get(`item_${name}_${message.guild.id}.price`)
    let idesc = economy.get(`item_${name}_${message.guild.id}.description`)
     message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`***| Info of item from the shop***\n\n**Item info**\n**Name of the item**: \`${iname}\`\n**Price of the item**: \`${iprice}\`\n**Description of the item**: \`${idesc}\``)
      )

}
if(command === "shop") {

      let embed = new Ongaku.MessageEmbed()
      .setColor('RANDOM')
      .setDescription(`**Command: ${prefix}shop**\n\n**Description**: \`View the servers shop\`\n**Usage**: \`${prefix}shop\`\n**Example**: \`${prefix}shop\`\n**Cooldown**: \`None\`\n**Sub categorys** \`--latest\`, \`--item\` and \`--global\``)
      
             if(args[0] === "--latest") {

            
            let iname = economy.get(`shop_item_${message.guild.id}.name`)
            if(!iname) return message.channel.send('nothing in the shop')
    let iprice = economy.get(`shop_item_${message.guild.id}.price`)
    let idesc = economy.get(`shop_item_${message.guild.id}.description`)
             

        message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
       .setTitle(`Welcome to ${message.guild.name}'s Shop`)
      .setDescription(`Latest items in this servers shop!\n\n*Items display name: \`${iname}\`\nItems current price: \`${iprice}\`\nItems current description: \`${idesc}\`*\n\n`)
      )
        } else if(args[0] === "--item"){
            let name = args[1]
    if(!name) return message.channel.send(embed)
    if(!economy.get(`item_${name}_${message.guild.id}`)) return message.channel.send('no item in the shop with that name');

    let iname = economy.get(`item_${name}_${message.guild.id}.name`)
    let iprice = economy.get(`item_${name}_${message.guild.id}.price`)
    let idesc = economy.get(`item_${name}_${message.guild.id}.description`)
     message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
       .setTitle(`Welcome to ${message.guild.name}'s Shop`)
      .setDescription(`**${iname} is currently in stock!**\n\n**Item info**\n**Name of the item**: \`${iname}\`\n**Price of the item**: \`${iprice}\`\n**Description of the item**: \`${idesc}\``)
      )
        } else if(args[0] === "--global") {
            economy.set(`item_Pistol_${message.guild.id}`, { name: `Pistol`, price: `240`, description: `None` });
            economy.set(`item_AK-14_${message.guild.id}`, { name: `AK-14`, price: `340`, description: `None` });
            economy.set(`item_M14_${message.guild.id}`, { name: `M14`, price: `500`, description: `None` });
            economy.set(`item_RPG_${message.guild.id}`, { name: `RPG`, price: `2390`, description: `None` });
            economy.set(`item_ABAT_${message.guild.id}`, { name: `ABAT`, price: `52003`, description: `None` });
            economy.set(`item_Pistol_rounds_${message.guild.id}`, { name: `Pistol_rounds`, price: `30`, description: `None` });
            economy.set(`item_AK_rounds_${message.guild.id}`, { name: `AK_rounds`, price: `56`, description: `None` });
            economy.set(`item_M14_rounds_${message.guild.id}`, { name: `M14_rounds`, price: `120`, description: `None` });
            economy.set(`item_RPG_rounds_${message.guild.id}`, { name: `RPG_rounds`, price: `300`, description: `None` });
            economy.set(`item_ABAT_rounds_${message.guild.id}`, { name: `ABAT_rounds`, price: `4000`, description: `None` });
            economy.set(`item_Kaiou_${message.guild.id}`, { name: `Kaiou`, price: `130`, description: `None` });
            economy.set(`item_Bonzo_${message.guild.id}`, { name: `Bonzo`, price: `330`, description: `None` });
            economy.set(`item_Neiphi_${message.guild.id}`, { name: `Neiphi`, price: `100`, description: `None` });
            economy.set(`item_Bowo_${message.guild.id}`, { name: `Bowo`, price: `1600`, description: `None` });
            economy.set(`item_Chaoi_${message.guild.id}`, { name: `Chaoi`, price: `1020`, description: `None` });
            economy.set(`item_seeds_${message.guild.id}`, { name: `seeds`, price: `10`, description: `None` });
            economy.set(`item_meat_${message.guild.id}`, { name: `meat`, price: `30`, description: `None` });
            economy.set(`item_bait_${message.guild.id}`, { name: `bait`, price: `20`, description: `None` });
            economy.set(`item_rice_${message.guild.id}`, { name: `rice`, price: `60`, description: `None` });
            economy.set(`item_carrots_${message.guild.id}`, { name: `carrot`, price: `100`, description: `None` });
            economy.set(`item_Bronze_${message.guild.id}`, { name: `bronze`, price: `10000`, description: `None` });
            economy.set(`item_BronzeII_${message.guild.id}`, { name: `bronze2`, price: `15000`, description: `None` });
            economy.set(`item_BronzeIII_${message.guild.id}`, { name: `bronze3`, price: `20000`, description: `None` });

            message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
       .setTitle(`Welcome to ${client.user.username}'s Shop`)
      .setDescription(`${client.user.username}'s Global Shop Items\n\n**Weapons and Ammo**\n---------------\n| Pistol: \`240$\`\n| Ak-14: \`340\`\n| M14: \`500$\`\n| RPG: \`2390$\`\n| ABAT Catapillar 149: \`52003$\`\n---------------\nPistol rounds: \`30$\`\nAk rounds: \`56$\`\nM14 rounds: \`120$\`\nRPG rockets: \`300$\`\nABAT rounds: \`4000$\`\n\n**Pets and Food**\n---------------\nKaiou: \`130$\`\nBonzo: \`330$\`\nNeiphi: \`100$\`\nBowo:\`1600$\`\nChaoi: \`1020\`\n---------------\nSeeds: \`10$\`\nMeat: \`30$\`\nBait: \`20$\`\nRice: \`60$\`\nGM carrots: \`100$\`\n\n**Badges**\n---------------\nBronze I: \`10000$\`\nBronze II: \`15000$\`\nBronze III: \`20000$\``)
      )
            } else {
            message.channel.send(embed)
        }
     }
     if(command === "inv") {
         let user = message.author || message.mentions.members.first()

         let item = economy.get(`inventory_${user.id}_${message.guild.id}_item.name`)
         if(item === null) item = 'None';
         let consu = economy.get(`inventory_${user.id}_${message.guild.id}_food.name`)
         if(consu === null) consu = 'None';
         let pettu = economy.get(`inventory_${user.id}_${message.guild.id}_pets.name`)
         if(pettu === null) pettu = 'None';
         let wepp = economy.get(`inventory_${user.id}_${message.guild.id}_weapons.name`)
         if(wepp === null) wepp = 'None';
         let box = economy.get(`inventory_${user.id}_${message.guild.id}_boxes.name`)
         if(box === null) box = 'None';
         let cra = economy.get(`inventory_${user.id}_${message.guild.id}_crates.name`)
         if(cra === null) cra = 'None';
         let nic = economy.get(`inventory_${user.id}_${message.guild.id}_ranks.name`)
         if(nic === null) nic = 'None';
          let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
          if(bal === null) bal = '0';
           let bank = economy.fetch(`bank_${message.guild.id}_${user.id}`)
           if(bank === null) bank = '0';

         message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
       .setTitle(`Openings ${user.username}'s inventory!`)
      .setDescription(`**Rank**: ${nic}\n---------------------\n\n**Weapons**: ${wepp}\n---------------------\n**Pets**: ${pettu}\n**Food**: ${consu}\n**Items**: ${item}\n\n**Users Balance**\n\n**Pocket**: ${bal}\n**Bank**: ${bank}\n\n**Loot boxes & crates**\n\n**Loot Boxes**: ${box}\n---------------------\n**Crates**: ${cra}`)
      )
     }
     if(command === "buy") {
         let user = message.author;
         let name = args[0]
    if(!name) return message.channel.send('please inter the name of the item you wish to buy')
    if(!economy.get(`item_${name}_${message.guild.id}`)) return message.channel.send('no item in the shop with that name');
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_${name}_${message.guild.id}.price`)

    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {

     message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
       .setAuthor(client.user.username, client.user.displayAvatarURL())
      .setDescription(`\`${name}\` | *You have successfully brought this item!!*`)
      )

             economy.set(`inventory_${user.id}_${message.guild.id}_item`, { name: `${name}` });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
             }


         }
         if(command === "petshop") {
             let embed = new Ongaku.MessageEmbed()
             .setColor('RANDOM')
             .setDescription('Please enter the name of the pet you with to buy!\n\n**[ chaoi | bonzo | kaiou | neiphi | bowo ]**')
             if(args[0] === "chaoi") {
                 let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_Chaoi_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                 let embed = new Ongaku.MessageEmbed()
                 .setColor('#ffe6e6')
                 .setDescription(`**Thank you for buying Chaoi!**`)
                 .setImage('https://cdn.Ongakuapp.com/attachments/791459581124542474/791996569657278464/chaoi-removebg-preview.png')

                 message.channel.send(embed).then((msg) => {
                     msg.react('<:Chaoi:791988931436085248>')
                 });
        }

        economy.set(`inventory_${user.id}_${message.guild.id}_pets`, { name: `Chaoi` });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
             } else if(args[0] === "kaiou") {
                 let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_Kaiou_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                 let embed = new Ongaku.MessageEmbed()
                 .setColor('#e6fffb')
                 .setDescription(`**Thank you for buying Kaiou!**`)
                 .setImage('https://media.Ongakuapp.net/attachments/791459581124542474/791996543015452672/kaiou__1_-removebg-preview.png?width=600&height=113')

                 message.channel.send(embed).then((msg) => {
                     msg.react('<:Kaiou:792242484028637196>')
                 });
            }

            economy.set(`inventory_${user.id}_${message.guild.id}_pets`, { name: `Kaiou` });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
                 } else if(args[0] === "bonzo") {
                     let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_Bonzo_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('#c7e0ff')
                 .setDescription(`**Thank you for buying Bonzo!**`)
                 .setImage('https://media.Ongakuapp.net/attachments/791459581124542474/791997224628125716/bonzo-removebg-preview_1.png?width=600&height=113')

                 message.channel.send(embed).then((msg) => {
                     msg.react('<:Bonzo:791988154936721449>')
                 });
         } 

         economy.set(`inventory_${user.id}_${message.guild.id}_pets`, { name: `Bonzo` });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
                     } else if(args[0] === "neiphi") {
                         let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_Neiphi_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('#b6fcac')
                 .setDescription(`**Thank you for buying Neiphi!**`)
                 .setImage('https://media.Ongakuapp.net/attachments/791459581124542474/791996550942949406/neiphi-removebg-preview.png?width=600&height=113')

                 message.channel.send(embed).then((msg) => {
                     msg.react('<:Neiphi:791988224464519168>')
                 });
                }
                economy.set(`inventory_${user.id}_${message.guild.id}_pets`, { name: `Neiphi` });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
                     } else if(args[0] === "bowo") {
                         let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_Bowo_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('#c9acfc')
                 .setDescription(`**Thank you for buying Bowo!**`)
                 .setImage('https://media.Ongakuapp.net/attachments/791459581124542474/791996541531193394/bowo-removebg-preview.png?width=600&height=113')

                 message.channel.send(embed).then((msg) => {
                     msg.react('<:Bowo:791988324218044456>')
                 });
            }

            economy.set(`inventory_${user.id}_${message.guild.id}_pets`, { name: `Bowo` });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
                     } else {
             message.channel.send(embed)
         }
    }
    if(command === "market") {
        let embed = new Ongaku.MessageEmbed()
             .setColor('RANDOM')
             .setDescription('Please enter the name of the guns or ammo you want to buy!\n\n**[ Pistol | Ak-14 | M14 | RPG | ABAT ]**\n[ Pistol_rounds | Ak_rounds | RPG_rounds | ABAT_rounds]')
             if(args[0] === "Pistol") {
                 let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_Pistol_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**Purchased a pistol!**`)

                 message.channel.send(embed)
        }
        economy.set(`inventory_${user.id}_${message.guild.id}_weapons`, { name: `Pistol`, ammo: [`15`, ], mags: [`1`, ] });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
             economy.set(`gun_${user.id}_${message.guild.id}_pistol`, 1)
             } else if(args[0] === "Ak-14") {
                 let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_AK_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**Purchased a AK-14!**`)

                 message.channel.send(embed)
        }
        economy.set(`inventory_${user.id}_${message.guild.id}_weapons`, { name: `AK-14`, ammo: [`24`, ], mags: [`1`, ] });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
             economy.set(`gun_${user.id}_${message.guild.id}_ak`, 1)
             } else  if(args[0] === "M14") {
                 let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_M14_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**Purchased a M14!**`)

                 message.channel.send(embed)
        }
        economy.set(`inventory_${user.id}_${message.guild.id}_weapons`, { name: `M14`, ammo: [`18`, ], mags: [`1`, ] });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
             economy.set(`gun_${user.id}_${message.guild.id}_m14`, 1)
             } else if(args[0] === "RPG") {
                 let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_RPG_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**Purchased a RPG :0**`)

                 message.channel.send(embed)
        }
        economy.set(`inventory_${user.id}_${message.guild.id}_weapons`, { name: `RPG`, ammo: [`1`,  ], mags: [`1`,] });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
             economy.set(`gun_${user.id}_${message.guild.id}_rpg`, 1)
             } else if(args[0] === "ABAT") {
                 let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_ABAT_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**Purchased a ABAT :0**`)

                 message.channel.send(embed)
        }
        economy.set(`inventory_${user.id}_${message.guild.id}_weapons`, { name: `ABAT`, ammo: [`5`, ], mags: [`1`, ] });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
             economy.set(`gun_${user.id}_${message.guild.id}_abat`, 1 )
             } else if(args[0] === "Pistol_rounds") {
                 let user = message.author;
                 let gun = economy.fetch(`gun_${user.id}_${message.guild.id}_pistol`)
                 if(!gun) return message.channel.send('you dont own a pistol')
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_Pistol_rounds_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**Purchased ammunition for a pistol!**`)

                 message.channel.send(embed)
        }

        economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
        economy.push(`inventory_${user.id}_${message.guild.id}_weapons.name`, { name: `Pistol`, ammo: `15`, mags: `2`})
             } else if(args[0] === "Ak_rounds") {
                 let user = message.author;
                 let gun = economy.fetch(`gun_${user.id}_${message.guild.id}_ak`)
                 if(!gun) return message.channel.send('you dont own a Ak-14')
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_AK_rounds_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**Purchased ammunition for a AK!**`)

                 message.channel.send(embed)
        }
        conomy.subtract(`money_${message.guild.id}_${user.id}`, pric)
        economy.push(`inventory_${user.id}_${message.guild.id}_weapons.name`, { name: `AK-14`, ammo: `24`, mags: `2`})
             } else  if(args[0] === "M14_rounds") {
                 let user = message.author;
                 let gun = economy.fetch(`gun_${user.id}_${message.guild.id}_m14`)
                 if(!gun) return message.channel.send('you dont own a M14')
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_M14_rounds_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**Purchased ammunition for a m14!**`)

                 message.channel.send(embed)
        }
        conomy.subtract(`money_${message.guild.id}_${user.id}`, pric)
        economy.push(`inventory_${user.id}_${message.guild.id}_weapons.name`, { name: `M14`, ammo: `18`, mags: `2`})
             } else if(args[0] === "RPG_rounds") {
                 let user = message.author;
                 let gun = economy.fetch(`gun_${user.id}_${message.guild.id}_rpg`)
                 if(!gun) return message.channel.send('you dont own a RPG')
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_RPG_rounds_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**Purchased rockets for a RPG :0**`)

                 message.channel.send(embed)
        }
        conomy.subtract(`money_${message.guild.id}_${user.id}`, pric)
        economy.push(`inventory_${user.id}_${message.guild.id}_weapons.name`, { name: `RPG`, ammo: `1`, mags: `2`})
             } else if(args[0] === "ABAT_rounds") {
                 let user = message.author;
                 let gun = economy.fetch(`gun_${user.id}_${message.guild.id}_abat`)
                 if(!gun) return message.channel.send('you dont own a ABAT')
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_ABAT_rounds_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this item')
        }

        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**Purchased ammunition for a ABAT :0**`)

                 message.channel.send(embed)
        }
        conomy.subtract(`money_${message.guild.id}_${user.id}`, pric)
        economy.push(`inventory_${user.id}_${message.guild.id}_weapons.name`, { name: `ABAT`, ammo: `4`, mags: `2`})
         } else {
             message.channel.send(embed);
         }
    }
    if(command === "rank") {
        let user = message.author;
    let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
    let pric = economy.fetch(`item_Bronze_${message.guild.id}.price`)
    if(bal < pric) {
        message.channel.send('You cannot afford this rank')
        }
        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**You are now rank \`Bronze I\`**`)

                 message.channel.send(embed)
        }
        economy.set(`inventory_${user.id}_${message.guild.id}_ranks`, { name: [`Bronze I`, ] });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
             economy.set(`rank_${user.id}_${message.guild.id}_bronze`)
    }
    if(command === "upgrade") {
        if(args[0] === "--rank") {
        let user = message.author;
        let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
        let pric = economy.fetch(`item_BronzeII_${message.guild.id}.price`)
        let hm = economy.get(`rank_${user.id}_${message.guild.id}_bronze`)
        if(!hm) return message.channel.send('you do not have the first rank, in order to upgrade your rank you must have a co-existing rank alraedy in your name.')
    if(bal < pric) {
        message.channel.send('You cannot afford this rank')
        }
        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**You are now rank \`Bronze II\`**`)

                 message.channel.send(embed)
        }
        economy.push(`inventory_${user.id}_${message.guild.id}_ranks`, { name: [`Bronze I`, `Bronze II`,  ] });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
              economy.set(`rank_${user.id}_${message.guild.id}_bronzeII`)
     } else {
          let user = message.author;
        let bal = economy.fetch(`money_${message.guild.id}_${user.id}`)
        let pric = economy.fetch(`item_BronzeIII_${message.guild.id}.price`)
        let hm = economy.get(`rank_${user.id}_${message.guild.id}_bronzeII`)
        if(!hm) return message.channel.send('you do not have the second rank, in order to upgrade again you must purchase it first')
    if(bal < pric) {
        message.channel.send('You cannot afford this rank')
        }
        if(bal > pric) {
                     let embed = new Ongaku.MessageEmbed()
                 .setColor('RANDOM')
                 .setDescription(`**You are now rank \`Bronze III\`**`)

                 message.channel.send(embed)
        }
        economy.push(`inventory_${user.id}_${message.guild.id}_ranks`, { name: [`Bronze I`, `Bronze II`,  `Bronze III`] });
             economy.subtract(`money_${message.guild.id}_${user.id}`, pric)
    }
 }

 //end of economy

 if(command === 'starboard') {
     let chan = message.mentions.channels.first();

     if(!chan) return message.channel.send('no channel found')
        client.starboardsManager.create(chan, {
            emoji: "⭐",
            color: "RANDOM",
            starBotMsg: false,
            selfStar: false,
            threshold: 3
        });
        message.channel.send(`${chan} is now activated!!`);
    }

    if (command === 'leaderboard') {
        const starboard = manager.starboards.find(s => s.guildID === message.guild.id && s.options.emoji === '⭐')
        if(!starboard) return message.channel.send('No starboard found.');

        const lb = await starboard.leaderboard();
        const content = lb.map((m, i) => `**${i+1}.**     ${m.stars} ⭐  -  ${m.embeds[0].description || `[Image](${m.embeds[0].image.url})`}`);

        const leaderboard = new Ongaku.MessageEmbed()
            .setTitle(`${message.guild.name}'s starboard`)
            .setDescription(content.join('\n'))
        message.channel.send(leaderboard);
    }

    //end of starboard stuff


        //black jack commands
        if(command === "userinfo") {

        const status = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline/Invisible"
      };
       var permissions = [];
    var acknowledgements = 'None';
   
    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.member;
    const randomColor = "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); }); 
    
    if(message.member.hasPermission("KICK_MEMBERS")){
        permissions.push("Kick Members");
    }
    
    if(message.member.hasPermission("BAN_MEMBERS")){
        permissions.push("Ban Members");
    }
    
    if(message.member.hasPermission("ADMINISTRATOR")){
        permissions.push("Administrator");
    }

    if(message.member.hasPermission("MANAGE_MESSAGES")){
        permissions.push("Manage Messages");
    }
    
    if(message.member.hasPermission("MANAGE_CHANNELS")){
        permissions.push("Manage Channels");
    }
    
    if(message.member.hasPermission("MENTION_EVERYONE")){
        permissions.push("Mention Everyone");
    }

    if(message.member.hasPermission("MANAGE_NICKNAMES")){
        permissions.push("Manage Nicknames");
    }

    if(message.member.hasPermission("MANAGE_ROLES")){
        permissions.push("Manage Roles");
    }

    if(message.member.hasPermission("MANAGE_WEBHOOKS")){
        permissions.push("Manage Webhooks");
    }

    if(message.member.hasPermission("MANAGE_EMOJIS")){
        permissions.push("Manage Emojis");
    }

    if(permissions.length == 0){
        permissions.push("No Key Permissions Found");
    }

    if(member.user.id == message.guild.ownerID){
        acknowledgements = 'Server Owner';
    }

    const embed = new Ongaku.MessageEmbed()
        .setDescription(`<@${member.user.id}>`)
        .setAuthor(`${member.user.tag}`, member.user.displayAvatarURL)
        .setColor(randomColor)
        .setFooter(`ID: ${message.author.id}`)
        .setThumbnail(member.user.displayAvatarURL)
        .setTimestamp()
        .addField("Status",`${status[member.user.presence.status]}`, true)
        .addField('Joined at: ',`${moment(member.joinedAt).format("dddd, MMMM Do YYYY, HH:mm:ss")}`)
        .addField("Created at: ",`${moment(message.author.createdAt).format("dddd, MMMM Do YYYY, HH:mm:ss")}`, true)
        .addField("Permissions: ", `${permissions.join(', ')}`)
        .addField(`Roles [${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `\`${roles.name}\``).length}]`,`${member.roles.cache.filter(r => r.id !== message.guild.id).map(roles => `<@&${roles.id }>`).join(" **|** ") || "No Roles"}`, true)
        .addField("Acknowledgements: ", `${acknowledgements}`)
          .addField("**Status:**", `${member.user.presence.status}`);
        
    message.channel.send({embed});
        }

    if(command === "serverinfo") {
         function checkBots(guild) {
        let botCount = 0;
        guild.members.cache.forEach(member => {
            if(member.user.bot) botCount++;
        });
        return botCount;
    }
    
    function checkMembers(guild) {
        let memberCount = 0;
        guild.members.cache.forEach(member => {
            if(!member.user.bot) memberCount++;
        });
        return memberCount;
    }

    function checkOnlineUsers(guild) {
        let onlineCount = 0;
        guild.members.cache.forEach(member => {
            if(member.user.presence.status === "online")
                onlineCount++; 
        });
        return onlineCount;
    }

    let sicon = message.guild.iconURL;
    let serverembed = new Ongaku.MessageEmbed()
        .setAuthor(`${message.guild.name} - Informations`, message.guild.iconURL)
        .setColor("RANDOM")
        .setThumbnail(message.guild.iconURL())
        .addField('Server owner', message.guild.owner, true)
        .addField('Server region', message.guild.region, true)
        .addField("Server Name", message.guild.name)
        .addField('Verification level', message.guild.verificationLevel, true)
        .addField('Channel count', message.guild.channels.cache.size, true)
        .addField('Total member count', message.guild.memberCount)
        .addField('Humans', checkMembers(message.guild), true)
        .addField('Bots', checkBots(message.guild), true)
        .addField('Online', checkOnlineUsers(message.guild))
      .addField("**All roles**", `${message.guild.roles.cache.map(role => role.toString()).join(' ')}`)
        .setFooter('Guild created at:')
        .setTimestamp(message.guild.createdAt);

    return message.channel.send(serverembed);
    }

    //end of info commmands

    if(command === "meme") {
        const embed = new Ongaku.MessageEmbed();
	got('https://www.reddit.com/r/memes/random/.json')
		.then(response => {
			const [list] = JSON.parse(response.body);
			const [post] = list.data.children;

			const permalink = post.data.permalink;
			const memeUrl = `https://reddit.com${permalink}`;
			const memeImage = post.data.url;
			const memeTitle = post.data.title;
			const memeUpvotes = post.data.ups;
			const memeNumComments = post.data.num_comments;

			embed.setTitle(`${memeTitle}`);
			embed.setURL(`${memeUrl}`);
			embed.setColor('RANDOM');
			embed.setImage(memeImage);
			embed.setFooter(`👍 ${memeUpvotes} 💬 ${memeNumComments}`);

			message.channel.send(embed);
		})
		.catch(console.error);
    }

    //end of meme command
    if (command === "avatar") {

    let member = message.mentions.users.first() || message.author;
    message.channel.send(new Ongaku.MessageEmbed()
    .setColor("RANDOM")
    .setTitle(`${member.username}'s' Avatar`)
      .setImage(member.displayAvatarURL({ dynamic: true, size: 512 })))
  }
  //end of avatar commands

  if(command === "mailconf") {
       let prop = args[0];
       let value = args[1];
    // Example: 
    // prop: "prefix"
    // value: ["+"]
    // (yes it's an array, we join it further down!)

    // We can check that the key exists to avoid having multiple useless, 
    // unused keys in the config:
    if(!client.modmail.has(message.guild.id, prop)) {
      return message.reply("This key is not in the configuration.");
    }

    // Now we can finally change the value. Here we only have strings for values 
    // so we won't bother trying to make sure it's the right type and such. 
    client.modmail.set(message.guild.id, value, prop);

    // We can confirm everything's done to the client.
    message.channel.send(`Guild configuration name:  **${prop}** has been changed to: **\`${value}\`**`);
  }

  if(command === "prefixconf") {
       let prop = 'prefix';
       let value = args[1];
    // Example: 
    // prop: "prefix"
    // value: ["+"]
    // (yes it's an array, we join it further down!)

    // We can check that the key exists to avoid having multiple useless, 
    // unused keys in the config:
    if(!client.prefix.has(message.guild.id, prop)) {
      return message.reply("This key is not in the configuration.");
    }

    // Now we can finally change the value. Here we only have strings for values 
    // so we won't bother trying to make sure it's the right type and such. 
    client.prefix.set(message.guild.id, value, prop);

    // We can confirm everything's done to the client.
    message.channel.send(`Guild Config for: **${prop}** has been changed to: **\`${value}\`**`);
  }

  if(command === "userconf") {
       let prop = 'urprefix';
       let value = args[1];
    // Example: 
    // prop: "prefix"
    // value: ["+"]
    // (yes it's an array, we join it further down!)

    // We can check that the key exists to avoid having multiple useless, 
    // unused keys in the config:
    if(!client.prefix.has(message.author.id, prop)) {
      return message.reply("This key is not in the configuration.");
    }

    // Now we can finally change the value. Here we only have strings for values 
    // so we won't bother trying to make sure it's the right type and such. 
    client.prefix.set(message.author.id, value, prop);

    // We can confirm everything's done to the client.
    message.channel.send(`User Config for: **${prop}** has been changed to: **\`${value}\`**`);
  }

  // end of configs

  if(command === "close") {

      if(message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "Ongaku-ModMail").id) {
            
            const person = message.guild.members.cache.get(message.channel.name)

            if(!person) {
                return message.channel.send("I am Unable to close the channel and this error is coming because probaly channel name is changed.")
            }

            await message.channel.delete()
  }
    }
  if(command === "open") {

       const category = message.guild.channels.cache.find((x) => x.name == "Ongaku-ModMail")
       if(!category) {
           return message.channel.send('please create a category called \`Ongaku-ModMail\`');
       }

          if(!mail.support) {
              return message.channel.send("Moderation system is not setuped in this server, use " + prefix + "mailconf")
          }


          let target = message.author;
          const everyone = "@everyone"

          const channel = await message.guild.channels.create(message.author.id, {
              type: "text",
            parent: category.id,
            topic: "Mail is Direct Opened by **" + target.username + "** to make contact with **server staff**."
          });

          let omfgg = new Ongaku.MessageEmbed()
          .setColor("RANDOM")
          .setDescription(mail.message)

          channel.send(`<@&${mail.support}>`, omfgg)


          let uembed = new Ongaku.MessageEmbed()
          .setAuthor("Direct mail contacted")
          .setColor("RANDOM")
          .setDescription("You have contacted support in** " + message.guild.name + "**, they have been notified and will contact you back shortly.");
          
          const person = message.channel.guild.members.cache.find((x) => x.id == channel.name)
          person.send(uembed);

          let newEmbed = new Ongaku.MessageEmbed()
          .setDescription("Opened The Mail: <#" + channel + ">")
          .setColor("RANDOM");

           message.channel.send(newEmbed);
  }


  

  // end of all commands (adding more in the future)

  if(command === "help") {
  }


}); 
client.login(main.token)