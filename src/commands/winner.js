const { saveGameState, loadGameState } = require('../model/gameState')
const teams = require('../model/teams.json')
const { scoreRound } = require('../methods')
const Discord = require('discord.js')

const toUpperCamel = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

module.exports = {
	name: 'winner',
	description: 'Report which team won the last match',
	arguments: '[blue | orange]',
	execute(message, args) {

		if (args && args.length !== 1) {
			return message.reply('The `winner` command takes exactly 1 argument: which team won the last match: ' + teams)
		}

		const winner = args[0]

		if(!teams.includes(winner)) {
			message.reply(`'${winner}' is not an option. Pick ${teams[0]} or ${teams[1]}`)
			return
		}

		const game = loadGameState()

		if (!game.started) {
			message.reply('You have to start a game before reporting a winner')
			return
		}

		game.winner = teams.find((team) => team === winner)
		const embed = new Discord.MessageEmbed()
			.setTitle(toUpperCamel(winner) + ' wins')
			.setColor(winner == 'orange' ? 0xff6600 : 0x3333ff)

		message.channel.send({ embed: embed })

		saveGameState(game)
		scoreRound(message.channel)
		return game
	},
}