import { MessageEmbed, User } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";
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
	usage: "/bal [@użytkownik]",
	exampleUsage: "/bal lub /bal @Confuze#1359",
	options: [
		{
			type: ApplicationCommandOptionTypes.USER,
			name: "user",
			description: "Użytkownik, którego pieniądze chesz sprawdzić"
		}
	],
	async execute(i) {
		const mention = i.options.getUser("user");
		let user: User;

		if (mention) user = mention;
		else user = i.user;

		if (!(UserModel.findOne({ userId: user.id, guildId: i.guildId }))) newUser(i.guild!, user);

		const userDocument = await UserModel.findOne({ userId: user.id, guildId: i.guildId });

		const embed = new MessageEmbed({
			author: { name: user.tag, icon_url: user.avatarURL()! },
			description: `Miejsce w tablicy wyników: \`kiedyś dodam\`\n Użyj \`/top\` dla pełnej tabeli`, // TODO: Make a leaderboard system (should be easy)
			color: embedColors.info,
			fields: [
				{
					name: "Gotówka",
					value: `\`💰 ${userDocument.cash.toString()}\`` // TODO: Use a cooler format - 0,000 instead of 0 (no idea how to do that)
				},
				{
					name: "Bank",
					value: `\`💰 ${userDocument.bank.toString()}\``
				},
				{
					name: "Suma",
					value: `\`💰 ${(userDocument.cash + userDocument.bank).toString()}\``
				}
			]
		});
		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
