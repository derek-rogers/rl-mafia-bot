const Discord = require('discord.js')
const { prefix } = require('../../config.json')

module.exports = {
	name: 'help',
	description: 'Show list of commands',
	execute(message, args) {

		if (args && args.length > 0) {
			return message.reply('The `help` command takes no arguments')
		}

		const embed = new Discord.MessageEmbed()
			.setTitle('Mafia Bot Help')
			.setColor(0x00FF00)

		message.client.commands.map((command) => {
			embed.addField(`\`${prefix}${command.name}${command.arguments ? ' ' + command.arguments : ''}\``, command.description)
		})

		message.channel.send({ embed: embed })
	},
}