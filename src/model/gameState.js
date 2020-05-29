const fs = require('fs')
module.exports = {
	saveGameState: (game) => {
		try{
			fs.writeFileSync('./model/gameState.json', JSON.stringify({ game }, null, 4))
		}
		catch(err) {
			throw new Error(`ERROR: ${err}`)
		}
	},
	loadGameState: () => {
		let result

		try {
			result = JSON.parse(fs.readFileSync('./model/gameState.json'))
		}
		catch (err) {
			return {
				'players': [],
				'round': 0,
				'started': false,

			}
		}

		return result.game
	},
}