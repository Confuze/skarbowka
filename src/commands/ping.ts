import { CommandInteraction, Interaction } from "discord.js";
import { Command } from "../template";

export const command: Command = {
	name: "ping",
	description: "Komenda testowa do sprawdzenia działalności bota",
	category: "General",
	type: "CHAT_INPUT",
	defaultPermission: true,
	execute(i: CommandInteraction) {
		i.reply({
			content: "Pong essa byku jestem najlepszy norbirt lewandowski dostał złotą piłkę w alternatywnej rzeczywistości"
		});
	}
};
