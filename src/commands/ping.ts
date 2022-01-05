import { Guild } from "discord.js";
import { Command } from "../template";

export const command: Command = {
	name: "ping",
	description: "Komenda testowa do sprawdzenia działalności bota",
	category: "General",
	type: "CHAT_INPUT",
	defaultPermission: true
};
