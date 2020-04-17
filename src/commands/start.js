const { game } = require('../model/gameState')
const Discord = require('discord.js')
const { prefix } = require('../../config.json')
const methods = require('../methods')

module.exports = {
	name: 'start',
	description: 'Start the current game',
	execute(message, args) {
		if(args && args.length > 0) {
			return message.reply('The `start` command takes no arguments')
		}
		if(game.players.length === 0) {
			const embed = new Discord.MessageEmbed()
				.setTitle('No Players')
				.setDescription(`Join the game with \`${prefix}join\``)
				.setColor(0xffff00)
			message.channel.send({ embed: embed })
			return
		}

		if(game.players.length % 2 !== 0) {
			const embed = new Discord.MessageEmbed()
				.setTitle('Unbalanced Teams')
				.setDescription(`There's an odd number of players in the game. Join the game with \`${prefix}join\``)
				.setColor(0xffff00)
			message.channel.send({ embed: embed })
			return
		}

		if(game.started) {
			const embed = new Discord.MessageEmbed()
				.setTitle('Game Already Started')
				.setDescription(`If you want to start a new game, \`${prefix}reset\` first`)
				.setColor(0xFFFF00)
			message.channel.send({ embed: embed })
			return
		}
		game.started = true

		methods.assignRoles()
		methods.assignTeams()

		const embed = new Discord.MessageEmbed()
			.setTitle('Assignments Delivered')
			.setDescription('Check your DMs for your Role and Team. GLHF!')
			.setColor(0x00FF00)
		message.channel.send({ embed: embed })
	},
}