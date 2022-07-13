import {
	MessageActionRow,
	MessageEmbed,
	MessageButton,
	ButtonInteraction,
	InteractionReplyOptions
} from "discord.js";
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
		const target = i.options.getString("from", false)?.toLowerCase();
		const documents = UserModel.aggregate().match({ guildId: i.guildId });
		let targetString = "";
		const leaderboard: string[] = [];

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
		let page = "";
		let pageIndex = 0;

		for (const [index, document] of (await documents).entries()) {
			if (i.user.id === document.userId) {
				place = index + 1 + ".";
			}

			page += `${index + 1}. <@${document.userId}>: \`💰 ${
				document.value
			}\`\n`;

			if (
				(index != 0 && (index + 1) % 10 === 0) ||
				index + 1 === (await documents).length
			) {
				leaderboard.push(page);
				page = "";
			}
		}

		const getReply = (): InteractionReplyOptions => {
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
						value: leaderboard[pageIndex]
					}
				],
				footer: { text: `Strona ${pageIndex + 1}/${leaderboard.length}` }
			});

			const row = new MessageActionRow()
				.addComponents(
					new MessageButton({
						customId: "prev",
						label: "Poprzednia strona",
						style: "PRIMARY",
						disabled: pageIndex === 0
					})
				)
				.addComponents(
					new MessageButton({
						customId: "next",
						label: "Następna strona",
						style: "PRIMARY",
						disabled: pageIndex + 1 === leaderboard.length
					})
				);

			return {
				embeds: [embed],
				components: [row]
			};
		};

		const filter = (btnInteraction: ButtonInteraction) => {
			return btnInteraction.user.id === i.user.id;
		};

		const collector = i.channel!.createMessageComponentCollector({
			time: 1000 * 60 * 15,
			idle: 1000 * 60,
			componentType: "BUTTON",
			filter
		});

		collector.on("collect", (btnInt) => {
			btnInt.deferUpdate();

			if (btnInt.customId === "prev") {
				pageIndex--;
			} else if (btnInt.customId === "next") {
				pageIndex++;
			}

			i.editReply(getReply());
		});

		collector.on("end", () => {
			const newRow = new MessageActionRow()
				.addComponents(
					new MessageButton({
						customId: "prev",
						label: "Poprzednia strona",
						style: "PRIMARY",
						disabled: true
					})
				)
				.addComponents(
					new MessageButton({
						customId: "next",
						label: "Następna strona",
						style: "PRIMARY",
						disabled: true
					})
				);

			i.editReply({ components: [newRow] });
		});

		i.reply(getReply());
	}
};

export default command;
