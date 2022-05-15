import Event from "../structures/event";
import { commands, client } from "../index";
import { ClientApplication, Guild } from "discord.js";

const event: Event = {
	name: "ready",
	once: true,
	async execute() {
		console.log("Logged in to discord");

		let target: Guild | ClientApplication;
		if (process.env.TESTING_SERVER) {
			target = client.guilds.cache.get(process.env.TESTING_SERVER)!;
		} else {
			target = client.application!;
		}

		target.commands.set(commands);
	}
};

export default event;
