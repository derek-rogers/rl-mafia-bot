const join = require('../src/commands/join')
const { loadGameState } = require('../src/model/gameState')
// jest.mock('../src/model/gameState')

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
	let game = loadGameState()
	game.players = []
	game.round = 0
	game.started = false

	expect(game.players.length).toBe(0)
	game = join.execute(mockMessage1, [])
	expect(game.players.length).toBe(1)
	expect(game.players[0].author).toBe(mockMessage1.author)
	expect(game.players[0].score).toBe(0)
	expect(game.players[0].mafiaCount).toBe(0)
	expect(game.players[0].votesFor).toBe(0)
	expect(game.players[0].votedFor).toBe(null)
})

test('add 2 players', () => {
	const game = loadGameState()
	game.players = []
	game.round = 0
	game.started = false

	expect(game.players.length).toBe(0)
	join.execute(mockMessage1, [])
	join.execute(mockMessage2, [])

	expect(game.players.length).toBe(2)
})