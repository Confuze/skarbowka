import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import User from "../../models/user";
import { embedColors } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { newUser } from "../../util/db";

const command: Command = {
	name: "bal",
	description: "Pokazuje ilość pieniędzy oraz miejsce w tabeli",
	category: "ECONOMY",
	guildOnly: true,
	type: "CHAT_INPUT",
	defaultPermission: true,
	options: [
		{
			type: ApplicationCommandOptionTypes.USER,
			name: "user",
			description: "Użytkownik, którego pieniądze chesz sprawdzić"
		}
	],
	async execute(i, client) {
		const mention = i.options.getUser("user");
		let user: any;

		if (mention) user = mention;
		else user = i.user;

		if (!(await User.findOne({ userId: user.id, guildId: i.guildId }))) newUser(i.guild!, user);

		const userModel = await User.findOne({ userId: user.id, guildId: i.guildId });

		const embed = new MessageEmbed({
			author: { name: user.tag, icon_url: user.avatarURL()! },
			description: `Miejsce w tablicy wyników: \`kiedyś dodam\`\n Użyj \`/top\` dla pełnej tabeli`, // TODO: Make a leaderboard system (should be easy)
			color: embedColors.info,
			fields: [
				{
					name: "Gotówka",
					value: `\`💰 ${userModel.cash.toString()}\`` // TODO: Use a cooler format - 0,000 instead of 0 (no idea how to do that)
				},
				{
					name: "Bank",
					value: `\`💰 ${userModel.bank.toString()}\``
				},
				{
					name: "Suma",
					value: `\`💰 ${(userModel.cash + userModel.bank).toString()}\``
				}
			]
		});
		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
