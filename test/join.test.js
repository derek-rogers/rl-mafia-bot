const join = require('../src/commands/join')
jest.mock('../src/model/gameState')

const mockMessage1 = {
	channel:  {
		send: (msg) => {return msg},
	},
	author:  {
		id: '277151325861445632',
		bot: false,
		username: 'DerBear',
	},
}

const mockMessage2 = {
	channel:  {
		send: (msg) => {return msg},
	},
	author:  {
		id: '8771713268614456232',
		bot: false,
		username: 'Shrew',
	},
}

test('add new player', () => {
	const gameState = require('../src/model/gameState')
	gameState.game.players = []
	gameState.game.round = 0
	gameState.game.started = false

	expect(gameState.game.players.length).toBe(0)
	join.execute(mockMessage1, [])
	expect(gameState.game.players.length).toBe(1)
	expect(gameState.game.players[0].author).toBe(mockMessage1.author)
	expect(gameState.game.players[0].score).toBe(0)
	expect(gameState.game.players[0].mafiaCount).toBe(0)
	expect(gameState.game.players[0].votesFor).toBe(0)
	expect(gameState.game.players[0].votedFor).toBe(null)
})

test('add 2 players', () => {
	const gameState = require('../src/model/gameState')
	gameState.game.players = []
	gameState.game.round = 0
	gameState.game.started = false

	expect(gameState.game.players.length).toBe(0)
	join.execute(mockMessage1, [])
	join.execute(mockMessage2, [])

	expect(gameState.game.players.length).toBe(2)
})