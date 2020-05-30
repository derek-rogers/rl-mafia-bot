const { token } = require('../auth.json')
const { prefix } = require('../config.json')
const fs = require('fs')
const Discord = require('Discord.js')
const client = new Discord.Client()

client.commands = new Discord.Collection()

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

for(const file of commandFiles) {
	const command = require(`./commands/${file}`)
	client.commands.set(command.name, command)
}

client.login(token)

client.on('ready', () => {
	console.log('Ready to play some mafia')
})

client.on('message', (message) => {
	if(message.author.bot) {
		return
	}

	if (message.guild === null) {
		message.reply('No offense, but I don\'t want you in my DMs. Go back to the mafia channel')
		return
	}

	if(!message.content.startsWith(prefix)) {
		return
	}

	console.dir(message.client)

	const args = message.content.slice(prefix.length).split(/ +/)
	const commandName = args.shift().toLowerCase()

	if(!client.commands.has(commandName)) {
		message.reply(`\`${commandName}\` is not a supported command`)
		return
	}

	const command = client.commands.get(commandName)

	try{
		command.execute(message, args)
		console.log(message.author.username + ': ' + message.content)
	}
	catch (error) {
		console.error(error)
		message.reply('there was an error trying to execute that command')
	}
})

