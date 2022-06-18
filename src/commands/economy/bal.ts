import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";
import { embedColors } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const command: Command = {
	name: "bal",
	description: "Pokazuje ilość pieniędzy oraz miejsce w tabeli",
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
		let user = i.user;
		if (mention) user = mention;

		const userDocument = await UserModel.quickFind(user.id, i.guildId!);

		const documents = UserModel.aggregate()
			.match({ guildId: i.guildId })
			.project({
				"userId": 1,
				"cash": 1,
				"bank": 1,
				"value": { "$add": ["$cash", "$bank"] }
			})
			.sort("-value")
			.limit(100);
		let place: number | string = "100+";
		for (const [index, document] of (await documents).entries()) {
			if (user.id === document.userId) {
				place = index + 1 + ".";
			}
		}

		const embed = new MessageEmbed({
			author: { name: user.tag, icon_url: user.avatarURL()! },
			description: `Miejsce w tablicy wyników: \`${place}\`\n Użyj \`/top\` dla pełnej tabeli`,
			color: embedColors.info,
			fields: [
				{
					name: "Gotówka",
					value: `\`💰 ${userDocument.cash}\`` // TODO: Use a cooler format - 0,000 instead of 0 (no idea how to do that)
				},
				{
					name: "Bank",
					value: `\`💰 ${userDocument.bank}\``
				},
				{
					name: "Suma",
					value: `\`💰 ${userDocument.sum}\``
				}
			]
		});

		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
