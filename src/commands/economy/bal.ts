import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import User from "../../models/user";

const command: Command = {
	name: "bal",
	description: "Pokazuje ilość pieniędzy oraz miejsce w tabeli",
	category: "ECONOMY",
	type: "CHAT_INPUT",
	defaultPermission: true,
	async execute(i, client) {
		const user = await User.findOne({ userId: i.user.id, guildId: i.guildId });

		const embed = new MessageEmbed({
			author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
			description: `Miejsce w tablicy wyników: \`kiedyś dodam\`\n Użyj \`/top\` dla pełnej tabeli`, // TODO: Make a leaderboard system (should be easy)
			color: "#6de56b",
			fields: [
				{
					name: "Gotówka",
					value: `\`💰 ${user.cash.toString()}\`` // TODO: Use a cooler format - 0,000 instead of 0 (no idea how to do that)
					// inline: true
				},
				{
					name: "Bank",
					value: `\`💰 ${user.bank.toString()}\``
					// inline: true
				},
				{
					name: "Suma",
					value: `\`💰 ${(user.cash + user.bank).toString()}\``
					// inline: true
				}
			]
		});
		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
