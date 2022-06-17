// ! Ignore this, it will be reworked

import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";
import { embedColors, syntaxEmbed } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const command: Command = {
	name: "top",
	description: "Pokazuje tabelę z najbogatszymi graczami",
	category: "ECONOMY",
	guildOnly: true,
	type: "CHAT_INPUT",
	defaultPermission: true,
	usage: "/top [cash/bank]",
	exampleUsage: "/top lub /bal cash",
	options: [
		{
			type: ApplicationCommandOptionTypes.STRING,
			name: "from",
			description:
				"Pokazuje tabelę z najbogatszymi graczami pod względem gotówki lub pieniędzy w banku"
		}
	],
	async execute(i) {
		// TODO: make a multiple page system with custom buttons
		const target = i.options.getString("from", false)?.toLowerCase();
		if (!target) {
			const leaderboard = await UserModel.find(
				{ guildId: i.guildId },
				"userId cash bank"
			)
				.sort("-cash -bank")
				.limit(10);

			console.log(leaderboard);
		}

		// const leaderboard = await UserModel.find(
		// 	{ guildId: i.guildId },
		// 	"userId cash bank"
		// );
		// let leaderboardString = "";
		// const target = i.options.getString("from", false)?.toLowerCase();
		// let targetString =  "gotówka i bank (razem)";
		// if (target === "cash") { targetString = "gotówka" }
		// else if (target === "bank") { targetString = "bank" }
		// else if (target) { return i.reply({ embeds: [syntaxEmbed("Podałeś niepoprawny argument - sprawdź literówki", i, this)] })}
		// leaderboard.sort((a, b) => {
		// 	let amount;
		// 	if (target === "cash") { amount = a.user.cash }
		// 	else if (target === "bank") { amount = user.bank }
		// 	else { amount = user.cash + user.bank }
		// 	return 0;
		// })
		// leaderboard.forEach((user, index:number) => {
		// 	let amount;
		// 	if (target === "cash") { amount = user.cash }
		// 	else if (target === "bank") { amount = user.bank }
		// 	else { amount = user.cash + user.bank }
		// 	leaderboardString += `${index + 1}. <@${user.userId}>: \`💰 ${amount}\`\n`
		// });
		// const embed = new MessageEmbed({
		// 	author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
		// 	description: `Oto tabela z najbogatszymi graczami sortując po: **${targetString}**`,
		// 	color: embedColors.info,
		// 	fields: [
		// 		{
		// 			name: "Tabela",
		// 			value: leaderboardString
		// 		},
		// 		{
		// 			name: "Twoje miejsce w tabeli",
		// 			value: `\`\``
		// 		}
		// 	]
		// });
		i.reply({
			content: "test"
		});
	}
};

export default command;
