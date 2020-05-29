'use strict'

module.exports = {
	gameState: {},
	loadGameState: () => {
		this.gameState = {
			players: [],
			round: 0,
			started: false,
		}

		return this.gameState
	},
	saveGameState: (game, callback) => {
		this.gameState = game
		callback()
	},
}