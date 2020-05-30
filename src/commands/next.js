const Discord = require('discord.js')
const config = require('../../config.json')

const methods = require('../methods.js')
const { saveGameState, loadGameState } = require('../model/gameState')

module.exports = {
	name: 'next',
	description: 'Advance the game to the next round',
	execute(message, args) {

		if (args && args.length > 0) {
			return message.reply('The `next` command takes no arguments')
		}
		const channel = message.channel
		const game = loadGameState()

		if(!game.started) {
			const embed = new Discord.MessageEmbed()
				.setTitle('Game not started')
				.setDescription(`Once everyone has joined, start a game with \`${config.prefix}start\``)
				.setColor(0xFFFF00)
			channel.send({ embed: embed })
			return
		}

		const undecidedVoters = game.players.filter((player) => player.votedFor == null)
		if (undecidedVoters.length > 0) {
			methods.showVoters(channel)
			return
		}

		if (game.winner == null) {
			const embed = new Discord.MessageEmbed()
				.setTitle('Missing Round Winner')
				.setDescription(`Report who won the last round with either \`${config.prefix}winner blue\` or \`${config.prefix}winner orange\``)
				.setColor(0xFFFF00)
			channel.send({ embed: embed })
			return
		}

		game.winner = null
		game.players.map(player => {
			player.votedFor = null
		})
		saveGameState(game)
		methods.assignRoles()
		methods.assignTeams()
		methods.sendAssignments(message.client, message.channel)
	},
}