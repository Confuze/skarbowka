import { Client, Intents } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();
import * as fs from "fs";
import { Command } from "./template";

const client = new Client({
	intents: [Intents.FLAGS.GUILDS]
});

let commands: any = [];

// This function will later be called through the console so it doesnt spam to the discord api but for now I'm calling it once the client logs in since this is just testing and I only upload commands to one guild
const refreshCommands = async () => {
	let target: any;
	if (process.env.TESTING_SERVER) {
		target = client.guilds.cache.get(process.env.TESTING_SERVER);
	} else {
		target = client.application;
	}

	const commandFiles = fs.readdirSync(__dirname + "/commands").filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

	for (const file of commandFiles) {
		const commandObj = await import(`./commands/${file}`);
		const command = commandObj.command;

		commands.push({
			name: command.name,
			description: command.description,
			type: command.type,
			options: command.options,
			defaultPermission: command.defaultPermission,
			execute: command.execute
		});
	}

	target.commands.set(commands);
};

client.once("ready", () => {
	console.log("Bot jest gotowy do kradnięcia");
	refreshCommands();
});

client.on("interactionCreate", (i) => {
	if (!i.isCommand()) return;

	for (const command of commands) {
		if (i.commandName === command.name) command.execute(i, client);
	}
});

client.login(process.env.TOKEN);
