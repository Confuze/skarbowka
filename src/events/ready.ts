import Event from "../structures/event";
import { readdirSync } from "fs";
import { commands, client } from "../index";
import Command from "../structures/command";

const event: Event = {
	name: "ready",
	once: true,
	async execute() {
		console.log("Logged in to discord");

		let target: any;
		if (process.env.TESTING_SERVER) {
			target = client.guilds.cache.get(process.env.TESTING_SERVER);
		} else {
			target = client.application;
		}

		target.commands.set(commands);
	}
};

export default event;
