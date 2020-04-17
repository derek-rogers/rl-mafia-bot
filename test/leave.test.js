const leave = require('../src/commands/leave')
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

test('remove player', () => {
	const gameState = require('../src/model/gameState')
	gameState.game.players = []
	gameState.game.players.push({ author: mockMessage1.author })
	gameState.game.players.push({ author: mockMessage2.author })
	gameState.game.round = 0
	gameState.game.started = false

	expect(gameState.game.players.length).toBe(2)
	leave.execute(mockMessage1, [])
	expect(gameState.game.players.length).toBe(1)
	expect(gameState.game.players[0].author).toBe(mockMessage2.author)
})

test('remove 2 players', () => {
	const gameState = require('../src/model/gameState')
	gameState.game.players = []
	gameState.game.p2ayers = []
	gameState.game.players.push({ author: mockMessage1.author })
	gameState.game.players.push({ author: mockMessage2.author })
	gameState.game.round = 0
	gameState.game.started = false

	expect(gameState.game.players.length).toBe(2)
	leave.execute(mockMessage1, [])
	leave.execute(mockMessage2, [])
	expect(gameState.game.players.length).toBe(0)
})