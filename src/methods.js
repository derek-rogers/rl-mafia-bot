const { game } = require('./model/gameState')
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

		// And swap it with the current element.
		temporaryValue = array[currentIndex]
		array[currentIndex] = array[randomIndex]
		array[randomIndex] = temporaryValue
	}

	return array
}

module.exports = {
	tag: (id) => {
		return tag(id)
	},
	showVoters: (channel) => {
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
		const mafiaIndex = Math.floor(Math.random() * (game.players.length))
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
	},
	assignTeams: () => {
		shuffle(game.players)
		game.players.map((player, index) => {
			player.team = game.teams[index % 2]
		})
	},
	showPlayers: (channel) => {
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
}