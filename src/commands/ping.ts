import { CommandInteraction, MessageEmbed } from "discord.js";
import { Command } from "../template";

export const command: Command = {
	name: "ping",
	description: "Komenda testowa do sprawdzenia działalności bota",
	category: "General",
	type: "CHAT_INPUT",
	defaultPermission: true,
	execute(i, client) {
		const embed = new MessageEmbed({
			title: "WSZYSTKO DZIAŁA!",
			timestamp: i.createdAt,
			color: "#6de56b",
			fields: [{ name: "Ping bota", value: `\`${client.ws.ping}\`` }],
			footer: { text: `Wywołane przez: ${i.user.username}`, iconURL: i.user.displayAvatarURL() }
		});

		i.reply({
			embeds: [embed]
		});
	}
};
