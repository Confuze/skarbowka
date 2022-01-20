import { Client, Intents } from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();
import { readdirSync } from "fs";
import Command from "./structures/command";
import Event from "./structures/event";
import mongoose from "mongoose";

mongoose
	.connect(`mongodb+srv://confuze:${process.env.MONGO_PWD}@skarbowka.zbnnn.mongodb.net/skarbowka?retryWrites=true&w=majority`)
	.then(() => console.log("Connected to the database"))
	.catch((err) => console.log(err));

const client = new Client({
	intents: [Intents.FLAGS.GUILDS]
});

let commands: any = [];

const eventFiles = readdirSync(__dirname + "/events").filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

(async () => {
	for (const file of eventFiles) {
		const event = (await import(__dirname + `/events/${file}`)).default as Event;

		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
})();

const commandFolders = readdirSync(__dirname + "/commands");
for (const folder of commandFolders) {
	const commandFiles = readdirSync(__dirname + `/commands/${folder}`).filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
	(async () => {
		for (const file of commandFiles) {
			const command = (await import(__dirname + `/commands/${folder}/${file}`)).default as Command;

			commands.push(command);
		}
	})();
}

export { commands, client };

client.login(process.env.TOKEN);
