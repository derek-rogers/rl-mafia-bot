const Discord = require('discord.js')
const config = require('../../config.json')

const { saveGameState } = require('../model/gameState')

module.exports = {
	name: 'reset',
	description: 'Resets the current game',
	execute(message, args) {

		if (args && args.length > 0) {
			return message.reply('The `reset` command takes no arguments')
		}

		const channel = message.channel

		saveGameState({
			'players': [],
			'round': 0,
			'started': false,
		})
		const embed = new Discord.MessageEmbed()
			.setTitle('Game has been reset')
			.setDescription(`Join a new game with \`${config.prefix}join\``)
			.setColor(0x00ff00)
		channel.send({ embed: embed })
	},
}