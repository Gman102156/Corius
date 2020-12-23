const { MessageEmbed } = require('discord.js');

module.exports.run = (bot, message, args, funcs, con) => {
    con.query(`SELECT gc.caseNumber, gs.levelingDisplayMode, gs.logsEnabled, gs.logsChannel, gs.levelingEnabled FROM guildCasenumber AS gc LEFT JOIN guildSettings AS gs ON gs.guildId = gc.guildId WHERE gc.guildId ="${message.guild.id}"`, (e, row) => {
        row = row[0];
        con.query(`SELECT guildMods FROM guildModerators WHERE guildId ="${message.guild.id}"`, (e, rows) => {
            let row1 = rows.map(r => r.guildMods);
            const permissionNeeded = "MANAGE_GUILD";
            if (!message.member.hasPermission(permissionNeeded, false, true, true) && !row1.includes(message.author.id)) return funcs.send(`You do not have the permission to use this command.`, true);
            message.channel.send(`**__What would you like to do?__**\n\`\`\`Enable/Disable leveling (say 1)\nReset levels for guild (say 2)\nConfigure display mode (say 3)\nType exit to cancel\`\`\``).then(() => {
                message.channel.awaitMessages(m => m.author.id === message.author.id, {
                    max: 1,
                    errors: ["time"],
                    time: 30000
                }).then((response) => {
                    if (!response) return;
                    response = response.array()[0];
                    if (response.content === "1") {
                        if (row.levelingEnabled === 'false') {
                            message.channel.send('**__Leveling is disabled would you like to enable it?__**')
                                .then(() => {
                                    message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                        max: 1,
                                        time: 30000,
                                        errors: ['time'],
                                    })
                                        .then((response) => {
                                            if (!response) return;
                                            response = response.array()[0];
                                            if (response.content.toLowerCase() === 'yes') {
                                                con.query(`UPDATE guildSettings SET levelingEnabled = 'true' WHERE guildId = '${message.guild.id}'`);
                                                funcs.send('Leveling has been enabled');
                                                con.query(`UPDATE guildCasenumber SET caseNumber = ${row.caseNumber + 1} WHERE guildId = ${message.guild.id}`);
                                                let finder = message.guild.channels.find(c => c.name == row.logsChannel);
                                                if (!finder) return;
                                                let embed = new MessageEmbed()
                                                    .setTitle(`Leveling Enabled.`)
                                                    .setTimestamp()
                                                    .setThumbnail(bot.user.avatarURL)
                                                    .setColor(funcs.rc())
                                                    .addField(`Enabled by:`, message.author.username)
                                                    .addField(`Enabled at`, message.createdAt.toDateString())
                                                    .addField(`Case number:`, `#${row.caseNumber + 1}`)
                                                    .addField(`Message:`, `[JumpTo](${message.url})`);
                                                message.guild.channels.get(finder.id).send(embed);
                                            } else {
                                                funcs.send('You have decided not to enable, command has been cancelled.');
                                            }
                                        });
                                });
                        } else {
                            message.channel.send('**__Leveling is enabled would you like to disable it?__**')
                                .then(() => {
                                    message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                        max: 1,
                                        time: 30000,
                                        errors: ['time'],
                                    })
                                        .then((response) => {
                                            if (!response) return;
                                            response = response.array()[0];
                                            if (response.content.toLowerCase() === 'yes') {
                                                con.query(`UPDATE guildSettings SET levelingEnabled = 'false' WHERE guildId = '${message.guild.id}'`);
                                                funcs.send('Leveling has been disabled.');
                                                con.query(`UPDATE guildCasenumber SET caseNumber = ${row.caseNumber + 1} WHERE guildId = ${message.guild.id}`);
                                                let finder = message.guild.channels.find(c => c.name == row.logsChannel);
                                                if (!finder) return;
                                                let embed = new MessageEmbed()
                                                    .setTitle(`Leveling Disabled.`)
                                                    .setTimestamp()
                                                    .setThumbnail(bot.user.avatarURL)
                                                    .setColor(funcs.rc())
                                                    .addField(`Disabled by:`, message.author.username)
                                                    .addField(`Disabled at`, message.createdAt.toDateString())
                                                    .addField(`Case number:`, `#${row.caseNumber + 1}`)
                                                    .addField(`Message:`, `[JumpTo](${message.url})`);
                                                message.guild.channels.get(finder.id).send(embed);
                                            } else {
                                                funcs.send('You have decided not to disable command has been cancelled');
                                            }
                                        });
                                }).catch((e) => {
                                    funcs.send(`You ran out of time or an error occured!`);
                                    console.log(`Error: ${e.message} in guild ${message.guild.name} command commandName`);
                                });
                        }
                    } else if (response.content === '2') {
                        message.channel.send(`**__Are you sure you want to reset leveling in this guild?__**`).then(() => {
                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                max: 1,
                                errors: ["time"],
                                time: 30000
                            }).then((response) => {
                                if (!response) return;
                                response = response.array()[0];
                                if (response.content.toLowerCase() === "yes") {
                                    con.query(`DELETE FROM guildLeveling WHERE guildId="${message.guild.id}"`);
                                }
                            });
                        });
                    } else if (response.content == "3") {
                        message.channel.send(`__**What would you like to do?**__\n\`\`\`Set display mode to text (type 1)\nSet display mode to image (type 2) Type exit to cancel. (Display mode will apply to leaderboards, level up messages and the profile command.)\`\`\``).then(() => {
                            message.channel.awaitMessages(m => m.author.id === message.author.id, {
                                max: 1,
                                errors: ["time"],
                                time: 30000
                            }).then((response) => {
                                response = response.array()[0].content;
                                if (response == "1") {
                                    if (row.levelingDisplayMode == "text") return funcs.send(`Display mode is already set to text.`);
                                    con.query(`UPDATE guildSettings SET levelingDisplayMode ="text" WHERE guildId = ${message.guild.id}`);
                                    funcs.send(`Display mode has been set to text.`);
                                    con.query(`UPDATE guildCasenumber SET caseNumber = ${row.caseNumber + 1} WHERE guildId = ${message.guild.id}`);
                                    let finder = message.guild.channels.find(c => c.name == row.logsChannel);
                                    if (!finder) return;
                                    let embed = new MessageEmbed()
                                        .setTitle(`Leveling Display Mode Changed.`)
                                        .setTimestamp()
                                        .setThumbnail(bot.user.avatarURL)
                                        .setColor(funcs.rc())
                                        .addField(`Changed to:`, 'text')
                                        .addField(`Changed by:`, message.author.username)
                                        .addField(`Changed at`, message.createdAt.toDateString())
                                        .addField(`Case number:`, `#${row.caseNumber + 1}`)
                                        .addField(`Message:`, `[JumpTo](${message.url})`);
                                    message.guild.channels.get(finder.id).send(embed);
                                } else if (response == "2") {
                                    if (row.levelingDisplayMode == "image") return funcs.send(`Display mode is already set to image.`);
                                    con.query(`UPDATE guildSettings SET levelingDisplayMode ="image" WHERE guildId = ${message.guild.id}`);
                                    funcs.send(`Display mode has been set to image.`);
                                    con.query(`UPDATE guildCasenumber SET caseNumber = ${row.caseNumber + 1} WHERE guildId = ${message.guild.id}`);
                                    let finder = message.guild.channels.find(c => c.name == row.logsChannel);
                                    if (!finder) return;
                                    let embed = new MessageEmbed()
                                        .setTitle(`Leveling Display Mode Changed.`)
                                        .setTimestamp()
                                        .setThumbnail(bot.user.avatarURL)
                                        .setColor(funcs.rc())
                                        .addField(`Changed to:`, 'image')
                                        .addField(`Changed by:`, message.author.username)
                                        .addField(`Changed at`, message.createdAt.toDateString())
                                        .addField(`Case number:`, `#${row.caseNumber + 1}`)
                                        .addField(`Message:`, `[JumpTo](${message.url})`);
                                    message.guild.channels.get(finder.id).send(embed);
                                } else {
                                    funcs.send(`Command canceled.`);
                                }
                            }).catch((e) => {
                                funcs.send(`You ran out of time or an error occured!`);
                                console.log(`Error: ${e.message} in guild ${message.guild.name} command commandName`);
                            });
                        });
                    } else if (response.content.toLowerCase() === 'exit') {
                        funcs.send('Command cancelled');
                    }
                });
            });
        });
    });
};

module.exports.config = {
    name: "manageleveling",
    aliases: [],
    usage: "Allows to manage leveling for the guild.",
    commandCategory: "moderation",
    cooldownTime: "0"
};