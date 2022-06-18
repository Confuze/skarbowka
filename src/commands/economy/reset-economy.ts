import {
	ButtonInteraction,
	MessageActionRow,
	MessageButton,
	MessageEmbed
} from "discord.js";
import UserModel from "../../models/user";
import Command from "../../structures/command";
import { embedColors } from "../../util/embeds";

const command: Command = {
	name: "reset-economy",
	description: "Resetuje pieniądze każdego użytkownika na serwerze",
	guildOnly: true,
	permissions: ["ADMINISTRATOR"],
	type: "CHAT_INPUT",
	defaultPermission: true,
	usage: "/reset-economy",
	exampleUsage: "/reset-economy",
	async execute(i) {
		const embed = new MessageEmbed({
			title: "Czy napewno chcesz zresetować ekonomię serwera?",
			color: embedColors.info,
			description:
				"**UWAGA!** Ta czynność jest nieodwracalna i zresetuje (usunie) pieniądze __każdego__ użytkownika na serwerze"
		});

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton({
					customId: "yes",
					label: "Tak",
					style: "SUCCESS"
				})
			)
			.addComponents(
				new MessageButton({
					customId: "no",
					label: "Nie",
					style: "DANGER"
				})
			);

		const filter = (btnInteraction: ButtonInteraction) => {
			btnInteraction.user.id === i.user.id;
		}; // this is technically useless but I decided to implement it in case I would change the reply not to be ephemeral

		const collector = i.channel!.createMessageComponentCollector({
			componentType: "BUTTON",
			max: 1,
			time: 15000
		});

		collector.on("collect", async (btnInteraction) => {
			if (btnInteraction.customId === "yes") {
				const embed2 = new MessageEmbed({
					title: "Pomyślnie zresetowano ekonomię serwera!",
					description:
						"Pieniądze każdego na serwerze zostały zresetowane. Oby to nie była pomyłka...",
					author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
					color: embedColors.success
				});

				btnInteraction.reply({ embeds: [embed2] });
				i.editReply({
					content: "Potwierdzono resetowanie ekonomi",
					embeds: [],
					components: []
				});

				await UserModel.updateMany(
					{ guildId: i.guildId },
					{ cash: 0, bank: 0 }
				);
			} else {
				i.editReply({
					content: "Anulowano resetowanie ekonomi",
					embeds: [],
					components: []
				});
			}
		});

		collector.once("end", (collected) => {
			if (!collected.first()) {
				i.editReply({
					content:
						"Minęło 15 sekund bez potwierdzenia i wiadomość wygasła. Spróbuj ponownie.",
					embeds: [],
					components: []
				});
			}
		});

		i.reply({
			embeds: [embed],
			ephemeral: true,
			components: [row]
		});
	}
};

export default command;
