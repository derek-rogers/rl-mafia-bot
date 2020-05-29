const teams = require('./model/teams.json')
const { loadGameState, saveGameState } = require('./model/gameState')
const Discord = require('discord.js')

const tag = (id) => {
	return `<@!${id}>`
}

const shuffle = (array) => {
	let currentIndex = array.length
	let temporaryValue, randomIndex
	// While there remain elements to shuffle...
	while (currentIndex !== 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex)
		currentIndex -= 1
		console.log('Random Index: ' + randomIndex)

		// And swap it with the current element.
		temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}

	return array
}

const newShuffle = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1)) // random index from 0 to i
		console.log('Fisher-Yates pivot: ' + j);
		// swap elements array[i] and array[j]
		// we use "destructuring assignment" syntax to achieve that
		// you'll find more details about that syntax in later chapters
		// same can be written as:
		// let t = array[i]; array[i] = array[j]; array[j] = t
		[array[i], array[j]] = [array[j], array[i]]
	}
}

module.exports = {
	tag: (id) => {
		return tag(id)
	},
	showVoters: (channel) => {
		const game = loadGameState()

		let finishedString = ''
		let undecidedString = ''
		game.players.map((player) => {
			if(player.votedFor == null) {
				undecidedString += tag(player.author.id) + ' '
			}
			else {
				finishedString += tag(player.author.id) + ' '
			}
		})

		const embed = new Discord.MessageEmbed()
			.setTitle('Voting in Progress')
			.setColor(0xFFFF00)
		if(finishedString !== '') {
			embed.addField('Thx 4 voting', finishedString)
		}
		if(undecidedString != '') {
			embed.addField('Hurry up', undecidedString)
		}

		channel.send({ embed: embed })
	},
	assignRoles: () => {
		const game = loadGameState()
		// game.players = shuffle(game.players)
		const mafiaIndex = Math.floor(Math.random() * (game.players.length))
		console.log('mafiaIndex: ' + mafiaIndex)
		game.winner = null
		game.players.map((player, index) => {
			player.votesFor = 0
			player.votedFor = null
			if (index === mafiaIndex) {
				player.role = 'mafia'
				player.mafiaCount++
			}
			else {
				player.role = 'villager'
			}
		})
		saveGameState(game)
	},
	assignTeams: () => {
		const game = loadGameState()
		console.log('\nBefore Shuffle:')
		console.dir(game.players)
		newShuffle(game.players)
		console.log('After Shuffle:')
		console.dir(game.players)
		console.log('\n')
		game.players.map((player, index) => {
			player.team = teams[index % 2]
		})
		saveGameState(game)
	},
	revealMafia: revealMafia,
	scoreRound: (channel) => {
		const game = loadGameState()

		const undecidedVoters = game.players.filter((player) => player.votedFor == null)
		if (undecidedVoters.length > 0) {
			return
		}

		if (game.winner == null) {
			return
		}

		game.round++
		game.players.map((player) => {
			/*
				x Mafia loses, undetected: 6
				x mafia loses, detected: 2
				x mafia wins, undetected: 2
				x mafia wins, detected: 0
				x mafia wins, unanimously detected: -3

				x villager wins, detects mafia: 3
				x villager loses, detects mafia: 1
				x villager wins, doesn't detect: 1
				x villager loses, doesn't detect: 0
			*/
			if (player.role === 'mafia') {
				if (player.team === game.winner) {
					// mafia won
					if (player.votesFor === 0) { player.score += 2 }
					else if (player.votesFor === game.players.length - 1) { player.score -= 3 }
				}
				else {
					// mafia lost
					player.score += player.votesFor === 0 ? 6 : 2
				}
			}
			else {
				const mafia = game.players.find((p) => p.role === 'mafia')
				if (player.team === game.winner) {
					// villager won
					if (player.votedFor === mafia.author.id) {
						player.score += 3
					}
					else {
						player.score += 1
					}
				}
				else if (player.votedFor === mafia.author.id) {
					// villager lost, but detected mafia
					player.score += 1
				}
			}
		})
		saveGameState(game)
		revealMafia(channel, game)


	},
	sendAssignments: (client, channel) => {
		const game = loadGameState()

		console.log('Sending assignments...')
		game.players.map((player) => {
			const embed = new Discord.MessageEmbed()
				.setTitle('TOP SECRET')
				.setDescription('Assignment for Round ' + (game.round + 1))
				.setColor(player.team == 'orange' ? 0xff6600 : 0x0000ff)
				.addField('Your Role', player.role.toUpperCase())
				.addField('Your Team', player.team.toUpperCase())
			client.users.cache.get(player.author.id).send({ embed: embed })
		})
		const embed = new Discord.MessageEmbed()
			.setTitle('Assignments Delivered')
			.setDescription('Check your DMs for your Role and Team. GLHF!')
			.setColor(0x00FF00)
		channel.send({ embed: embed })
	},
	showPlayers: (channel) => {
		const game = loadGameState()

		const embed = new Discord.MessageEmbed()
			.setTitle('Players')
			.setColor(0x00ff00)
		let description = ''
		game.players.map((player) => {
			description += tag(player.author.id) + '\n'
		})
		embed.setDescription(description)
		channel.send({ embed: embed })
	},
	showScore: showScore,

}
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function showScore(channel) {
	const game = loadGameState()
	const rankStrings = [
		'1st',
		'2nd',
		'3rd',
		'4th',
		'5th',
		'6th',
		'7th',
		'8th',
	]

	if (game.round === 0) {
		const embed = new Discord.MessageEmbed()
			.setTitle('No scores yet')
			.setDescription('Patience, grasshopper')
			.setColor(0xffff00)
		channel.send({ embed: embed })
		return
	}

	game.players.sort((a, b) => b.score - a.score)

	const embed = new Discord.MessageEmbed()
		.setTitle('Scores After Round ' + game.round)
		.setColor(0x00ff00)

	game.players.map((player, index) => {
		embed.addField(rankStrings[index] + ' Place', tag(player.author.id) + ': ' + player.score + ' point' + (player.score !== 1 ? 's' : '') +
			' (Mafia ' + player.mafiaCount + ' time' + (player.mafiaCount !== 1 ? 's)' : ')'))
	})

	channel.send({ embed: embed })
}

function revealMafia(channel, game) {
	wait(0)
		.then(() => {
			const embed = new Discord.MessageEmbed()
				.setTitle('All Votes are In...')
				.setColor(0x00ff00)

			channel.send({ embed: embed })
			return wait(1000)
		})
		.then(() => {
			const embed = new Discord.MessageEmbed()
				.setTitle('The Mafia was...')
				.setColor(0x00ff00)

			channel.send({ embed: embed })
			return wait(1000)
		})
		.then(() => {
			const mafia = game.players.filter((player) => {
				return player.role === 'mafia'
			})[0]

			const embed = new Discord.MessageEmbed()
				.setTitle(mafia.author.username)
				.setColor(0x00ff00)

			channel.send({ embed: embed })
			return wait(1000)
		})
		.then(() => {
			showScore(channel)
		})

}
