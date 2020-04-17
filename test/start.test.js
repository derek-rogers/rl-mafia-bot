const start = require('../src/commands/start')
jest.mock('../src/model/gameState')

const mockPlayers = [
	{
		author:  {
			id: '277151325861445632',
			bot: false,
			username: 'DerBear',
		},
		score: 0,
		votesFor: 0,
		votedFor: null,
		mafiaCount: 0,
	},
	{
		author: {
			author:  {
				id: '8771713268614456232',
				bot: false,
				username: 'Shrew',
			},
		},
		score: 0,
		votesFor: 0,
		votedFor: null,
		mafiaCount: 0,
	},
	{
		author: {
			author:  {
				id: '434891321583732543',
				bot: false,
				username: 'Trout',
			},
		},
		score: 0,
		votesFor: 0,
		votedFor: null,
		mafiaCount: 0,
	},
	{
		author: {
			author:  {
				id: '189183754815238',
				bot: false,
				username: 'Bodhi',
			},
		},
		score: 0,
		votesFor: 0,
		votedFor: null,
		mafiaCount: 0,
	},
]


const mockMessage = {
	channel:  {
		send: (msg) => {return msg},
	},
	author:  {
		id: '8771713268614456232',
		bot: false,
		username: 'Shrew',
	},
}

test('start valid game', () => {
	const gameState = require('../src/model/gameState')
	gameState.game.players = mockPlayers
	gameState.game.teams = ['orange', 'blue']
	gameState.game.started = false

	expect(gameState.game.players.length).toBe(4)
	start.execute(mockMessage, [])
	expect(gameState.game.started).toBe(true)
	expect(gameState.game.round).toBe(0)

	let mafiaCount = 0
	const teamCount = { orange: 0, blue: 0 }
	gameState.game.players.map((p) => {
		expect(p.team === 'blue' || 'orange')
		expect(p.role === 'mafia' || 'villager')
		mafiaCount += p.role === 'mafia' ? 1 : 0
		teamCount.orange += p.team === 'orange' ? 1 : 0
		teamCount.blue += p.team === 'blue' ? 1 : 0
	})

	expect(mafiaCount).toBe(1)
	expect(teamCount.orange).toBe(2)
	expect(teamCount.blue).toBe(2)
})

test('fail to start game with 3 players', () => {
	const gameState = require('../src/model/gameState')
	gameState.game.players = [mockPlayers[0], mockPlayers[1], mockPlayers[2]]
	gameState.game.started = false

	expect(gameState.game.players.length).toBe(3)
	start.execute(mockMessage, [])
	expect(gameState.game.started).toBe(false)
	expect(gameState.game.round).toBe(0)
})

