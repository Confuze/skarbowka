import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";
import { embedColors, syntaxEmbed } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const command: Command = {
	name: "top",
	description: "Pokazuje tabelę z najbogatszymi graczami",
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
				"Wybierz, pod względem czego ma być sortowana tabel: cash/bank/both (domyślnie both)"
		}
	],
	async execute(i) {
		// TODO: make a multiple page system with custom buttons
		const target = i.options.getString("from", false)?.toLowerCase();
		const documents = UserModel.aggregate().match({ guildId: i.guildId });
		let targetString = "";
		let leaderboardString = "";

		if (!target || target === "both") {
			targetString = "Gotówka i bank (razem)";
			documents.project({
				"userId": 1,
				"cash": 1,
				"bank": 1,
				"value": { "$add": ["$cash", "$bank"] }
			});
		} else if (target === "cash") {
			targetString = "Gotówka";
			documents.project({
				"userId": 1,
				"cash": 1,
				"value": "$cash"
			});
		} else if (target === "bank") {
			targetString = "Bank";
			documents.project({
				"userId": 1,
				"bank": 1,
				"value": "$bank"
			});
		} else {
			return i.reply({
				embeds: [
					syntaxEmbed(
						'Podałeś złą wartość argumentu "from" (cash/bank/both) - sprawdź literówki.',
						i,
						this
					)
				],
				ephemeral: true
			});
		}

		documents.sort("-value").limit(100);
		let place: number | string = "100+";

		for (const [index, document] of (await documents).entries()) {
			if (i.user.id === document.userId) {
				place = index + 1 + ".";
			}

			leaderboardString += `${index + 1}. <@${document.userId}>: \`💰 ${
				document.value
			}\`\n`;
		}

		const embed = new MessageEmbed({
			author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
			description: `Oto tabela z najbogatszymi graczami sortując po: **${targetString}**`,
			color: embedColors.info,
			fields: [
				{
					name: "Twoje miejsce w tabeli",
					value: `\`${place}\``
				},
				{
					name: "Tabela",
					value: leaderboardString
				}
			]
		});

		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
