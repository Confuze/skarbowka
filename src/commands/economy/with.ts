import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";
import { embedColors, syntaxEmbed } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const command: Command = {
	name: "with",
	description: "Wypłać pieniądze z banku do gotówki",
	guildOnly: true,
	type: "CHAT_INPUT",
	defaultPermission: true,
	usage: "/with <kwota do wypłacenia>",
	exampleUsage: "/with 500",
	options: [
		{
			type: ApplicationCommandOptionTypes.STRING,
			required: true,
			name: "amount",
			description:
				"Kwota, którą chcesz wypłacić, lub 'all' dla wypłacenia wszystkiego"
		}
	],
	async execute(i) {
		const amount = i.options.getString("amount")!;
		const userDocument = await UserModel.quickFind(i.user.id, i.guildId!);

		let withdrawn = 0;
		if (amount === "all") withdrawn = userDocument.bank;
		else if (parseInt(amount) > 0)
			withdrawn =
				userDocument.bank - parseInt(amount) >= 0
					? parseInt(amount)
					: userDocument.bank;
		else
			return i.reply({
				embeds: [
					syntaxEmbed(
						"Podałeś złą kwotę - podaj liczbę całkowitą większą od 0, lub 'all'.",
						i,
						this
					)
				]
			});

		userDocument.bank -= withdrawn;
		userDocument.cash += withdrawn;
		userDocument.save();

		const embed = new MessageEmbed({
			author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
			title: "Pomyślnie wypłacono pieniądze.",
			color: embedColors.success,
			fields: [
				{
					name: "Wypłacona kwota",
					value: `\`💰 ${withdrawn}\``
				},
				{
					name: "Gotówka",
					value: `\`💰 ${userDocument.cash}\``
				},
				{
					name: "Bank",
					value: `\`💰 ${userDocument.bank}\``
				}
			]
		});

		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
