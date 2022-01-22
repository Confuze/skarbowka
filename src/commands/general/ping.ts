import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";

const command: Command = {
	name: "ping",
	description: "Komenda testowa do sprawdzenia działalności bota",
	category: "GENERAL",
	type: "CHAT_INPUT",
	defaultPermission: true,
	execute(i, client) {
		const embed = new MessageEmbed({
			title: "Wszystko działa!",
			color: "#6de56b",
			fields: [{ name: "Ping bota", value: `\`${client.ws.ping}\`` }]
		});

		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
