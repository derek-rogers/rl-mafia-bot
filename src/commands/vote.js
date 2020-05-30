const { loadGameState, saveGameState } = require('../model/gameState')
const { tag, showVoters, scoreRound } = require('../methods.js')
module.exports = {
	name: 'vote',
	description: 'Vote for who you think is the mafia',
	arguments: '@player',
	execute(message, args) {

		const game = loadGameState()

		if (!game.started) {
			message.reply('Start a game before you start attacking people like that')
			return
		}

		if(!args || args.length !== 1) {
			return message.reply('The `vote` command requires exactly 1 argument: the tag of the person you\'re voting for')
		}

		const candidateTag = args[0]

		message.delete()

		const voter = game.players.find((player) => player.author.id === message.author.id)
		if (voter.votedFor != null) {
			message.channel.send('Chill, ' + tag(message.author.id) + '. You can only vote once')
			return
		}
		const match = candidateTag.match(/\<@!?(?<id>\d+)>/)
		if(!match) {
			message.reply('That vote didn\'t look like a tag to me. Make sure you tag them with @')
			return
		}
		const candidateId = match.groups.id
		const candidate = game.players.find((player) => player.author.id === candidateId)

		if(!candidate) {
			if (!message.client.users.cache.get(candidateId)) {
				message.reply('I don\'t believe I\'ve met that person. Make sure you typed it right and try again.')
			}
			else {
				message.reply('Couldn\'t find the person you voted for in the current game. Make sure you typed it right and try again.')
			}
			return
		}

		if(candidate.author.id === message.author.id) {
			message.reply('You can\'t vote for yourself, though after the way you played, I can\'t say I blame you')
			return
		}

		voter.votedFor = candidate.author.id
		game.players.map((player) => {
			player.votesFor += player.author.id === candidateId ? 1 : 0
		})

		saveGameState(game)

		showVoters(message.channel)
		scoreRound(message.channel)
	},
}