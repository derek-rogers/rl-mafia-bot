const Discord = require('discord.js')
const { prefix } = require('../../config.json')
const methods = require('../methods')
const { loadGameState, saveGameState } = require('../model/gameState')

module.exports = {
	name: 'start',
	description: 'Start the current game',
	execute(message, args) {
		if(args && args.length > 0) {
			return message.reply('The `start` command takes no arguments')
		}

		const game = loadGameState()

		if(game.players.length === 0) {
			const embed = new Discord.MessageEmbed()
				.setTitle('No Players')
				.setDescription(`Join the game with \`${prefix}join\``)
				.setColor(0xffff00)
			message.channel.send({ embed: embed })
			return
		}

		// if(game.players.length % 2 !== 0) {
		// 	const embed = new Discord.MessageEmbed()
		// 		.setTitle('Unbalanced Teams')
		// 		.setDescription(`There's an odd number of players in the game. Join the game with \`${prefix}join\``)
		// 		.setColor(0xffff00)
		// 	message.channel.send({ embed: embed })
		// 	return
		// }

		if(game.started) {
			const embed = new Discord.MessageEmbed()
				.setTitle('Game Already Started')
				.setDescription(`If you want to start a new game, \`${prefix}reset\` first`)
				.setColor(0xFFFF00)
			message.channel.send({ embed: embed })
			return
		}
		game.started = true
		saveGameState(game)
		methods.assignRoles()
		methods.assignTeams()
		methods.sendAssignments(message.client, message.channel)
	},
}