const { loadGameState, saveGameState } = require('../model/gameState')
const { showPlayers } = require('../methods')

module.exports = {
	name: 'leave',
	description: 'Leave the current game',
	execute(message, args) {
		if(args && args.length > 0) {
			return message.reply('The `leave` command takes no arguments')
		}

		const game = loadGameState()

		if(game.started) {
			message.channel.send('Sorry, <@!' + message.author.id + '>, the game\'s already started.')
			return
		}

		game.players = game.players.filter((player) => {
			return player.author.id !== message.author.id
		})

		saveGameState(game)
		showPlayers(message.channel)
		return game
	},
}