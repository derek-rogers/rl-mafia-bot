const methods = require('../methods.js')
const { saveGameState, loadGameState } = require('../model/gameState')

module.exports = {
	name: 'join',
	description: 'Join the game',
	execute(message, args) {

		if(args && args.length > 0) {
			return message.reply('The `join` command takes no arguments')
		}

		const game = loadGameState()

		if(game.started) {
			message.channel.send('Sorry, ' + methods.tag(message.author.id) + ', the game\'s already started.')
			return
		}

		if(game.players.find((player) => player.author.id === message.author.id) != undefined) {
			message.channel.send('Calm down, ' + methods.tag(message.author.id) + '. You\'ve already joined')
			return
		}

		game.players.push({
			author: message.author,
			score: 0,
			mafiaCount: 0,
			votesFor: 0,
			votedFor: null,
		})

		saveGameState(game)
		methods.showPlayers(message.channel)
		return game
	},
}