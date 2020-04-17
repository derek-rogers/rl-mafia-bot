const { token } = require('../auth.json')
const { prefix } = require('../config.json')
const fs = require('fs')
const { game, teams } = require('./model/gameState')
const methods = require('./methods')
const Discord = require('Discord.js')
const client = new Discord.Client()
client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for(const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

let channel

// should be replaced with mongodb to support multiple sessions


const escapeRegExp = (s) => {
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
}

const handle = (message) => {
	channel = message.channel
	const author = message.author
	const cmd = message.content.match(new RegExp(escapeRegExp(prefix) + '(?<command>\\S*)(?: (?<argument>\\S*))*'))

	if (!cmd || !author) { return }
	switch (cmd.groups.command) {
	case 'j':
	case 'join':
		break

	case 'l':
	case 'leave':
		break

	case 'start':

		assignTeams()
		sendAssignments()
		break

	case 'reset':
		reset()
		break

	case 'v':
	case 'vote':
		castVote(cmd.groups.argument, author)
		break

	case 'w':
	case 'winner':
		reportWinner(cmd.groups.argument)
		break
	case 'b':
		reportWinner('blue')
		break
	case 'o':
		reportWinner('orange')
		break

	case 'n':
	case 'next':
		handleNext()
		break

	case 's':
	case 'scores':
		showScore()
		break

	case 'h':
	case 'help':
		showHelp()
		break
	}
}
const handleNext = () => {
	console.dir(game)
	const undecidedVoters = game.players.filter((player) => player.votedFor == null)
	if (undecidedVoters.length > 0) {
		methods.showVoters(channel)
		return
	}

	if (game.winner == null) {
		const embed = new Discord.MessageEmbed()
			.setTitle('Missing Round Winner')
			.setDescription(`Report who won the last round with either \`${prefix}winner blue\` or \`${prefix}winner orange\``)
			.setColor(0xFFFF00)
		channel.send(embed)
		return
	}

	scoreRound()
	showScore()
	methods.assignRoles()
	assignTeams()
}

const showHelp = () => {
	const embed = new Discord.MessageEmbed()
		.setTitle('Help')
		.setDescription(`List of commands and their usage.\n\nCall the bot with \`${prefix}command [argument]\`.\n  `)
		.setColor(0x00ff00)
		.addFields([
			{ name: '`join`  (`j`)', value: 'Join the current game' },
			{ name: '`leave` (`l`)', value: 'Leave the current game' },
			{ name: '`start`', value: 'Assign players to roles/teams and sends DMs' },
			{ name: '`reset`', value: 'Reset the entire game, clears out all players and scores' },
			{ name: '`vote @Suspect` (`v @Suspect`)', value: 'Cast your vote for who you think the mafia is, by their @' },
			{ name: '`winner [orange | blue]`', value: `Report the winner of the match. (\`${prefix}o\` and \`${prefix}b\` are shortcuts)` },
			{ name: '`next` (`n`)', value: 'After voting and reporting the winner, automatically score the round and advances to the next one' },
			{ name: '`scores` (`s`)', value: 'Display the current scoreboard' },
			{ name: '`help` (`h`)', value: 'Show this list of commands' },
		])

	channel.send(embed)
}

const tag = (id) => {
	return '<@!' + id + '>'
}

const sendAssignments = () => {
	game.players.map((player) => {
		const embed = new Discord.MessageEmbed()
			.setTitle('TOP SECRET')
			.setDescription('Assignment for Round ' + (game.round + 1))
			.setColor(player.team == 'orange' ? 0xff6600 : 0x0000ff)
			.addField('Your Role', player.role.toUpperCase())
			.addField('Your Team', player.team.toUpperCase())
		player.author.send(embed)
	})
}

const assignTeams = () => {
	shuffle(game.players)
	game.players.map((player, index) => {
		player.team = teams[index % 2]
	})
}

const castVote = (candidateId, author) => {
	const voter = game.players.find((player) => player.author.id === author.id)
	if (voter.votedFor != null) {
		channel.send('Chill, ' + tag(author) + '. You can only vote once')
		return
	}
	const match = candidateId.match(/\<@!(?<id>\d+)>/)
	candidateId = match.groups.id
	const candidate = game.players.find((player) => player.author.id)
	voter.votedFor = candidate.author.id
	game.players.map((player) => {
		player.votesFor += player.author.id === candidateId ? 1 : 0
	})

	methods.showVoters(channel)
}

const scoreRound = () => {
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
				else if (player.votesFor === game.players.length - 1) {player.score -= 3}
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
				if(player.votedFor === mafia.name) {
					player.score += 3
				}
				else {
					player.score += 1
				}
			}
			else if(player.votedFor === mafia.name) {
				// villager
				player.score += 1
			}
		}
	})
}

const showScore = () => {
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

	if(game.round === 0) {
		const embed = new Discord.MessageEmbed()
			.setTitle('No scores yet')
			.setDescription('Patience, grasshopper')
			.setColor(0xffff00)
		channel.send(embed)
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

	channel.send(embed)
}

const reportWinner = (winner) => {
	game.winner = teams.find((team) => team === winner)
	const embed = new Discord.MessageEmbed()
		.setTitle(toUpperCamel(winner) + ' wins!')
		.setColor(winner == 'orange' ? 0xff6600 : 0x3333ff)


	channel.send(embed)
}

const reset = () => {
	game.players = []
	game.round = 0
	game.started = false
	const embed = new Discord.MessageEmbed()
		.setTitle('Game Reset')
		.setDescription(`Join a new game with \`${prefix}join\``)
		.setColor(0x00ff00)

	channel.send(embed)
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

const toUpperCamel = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

client.login(token)

client.on('ready', () => {
	console.log('Ready to play some mafia')
})

client.on('message', (message) => {
	if(!message.content.startsWith(prefix) || message.author.bot) {
		return
	}

	const args = message.content.slice(prefix.length).split(/ +/)
	const commandName = args.shift().toLowerCase()

	if(!client.commands.has(commandName)) {
		return
	}

	const command = client.commands.get(commandName)

	try{
		command.execute(message, args)
	}
	catch (error) {
		console.error(error)
		message.reply('there was an error trying to execute that command!')
	}


	// handle(message)
})

