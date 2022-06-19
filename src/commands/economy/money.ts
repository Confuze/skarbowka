import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { embedColors, syntaxEmbed } from "../../util/embeds";

const command: Command = {
	name: "money",
	description: "Dodaje lub zabiera pieniądze do banku/gotówki użytkownika",
	permissions: ["ADMINISTRATOR"],
	guildOnly: true,
	type: "CHAT_INPUT",
	defaultPermission: true,
	usage: "/money <add/take> <kwota> <@użytkownik> [cel]",
	exampleUsage: "/money add 1000 @Confuze#1359 cash",
	options: [
		{
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			name: "add",
			description: "Dodaje pieniądze do gotówki/banku",
			options: [
				{
					type: ApplicationCommandOptionTypes.INTEGER,
					name: "amount",
					description: "Kwota do dodania",
					required: true,
					min_value: 1
				},
				{
					type: ApplicationCommandOptionTypes.USER,
					name: "user",
					description: "Użytkownik, który ma dostać pieniądze",
					required: true
				},
				{
					type: ApplicationCommandOptionTypes.STRING,
					name: "target",
					description: "Bank/gotówka (domyślnie bank)"
				}
			]
		},
		{
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			name: "take",
			description: "Zabiera pieniądze z gotówki/banku",
			options: [
				{
					type: ApplicationCommandOptionTypes.STRING,
					name: "amount",
					description: "Kwota do zabrania lub 'all', aby zabrać wszystko",
					required: true,
					min_value: 1
				},
				{
					type: ApplicationCommandOptionTypes.USER,
					name: "user",
					description: "Użytkownik, który ma stracić pieniądze",
					required: true
				},
				{
					type: ApplicationCommandOptionTypes.STRING,
					name: "target",
					description: "Bank/gotówka (domyślnie gotówka)"
				}
			]
		}
	],
	async execute(i) {
		const subcommand = i.options.getSubcommand(true);
		const user = i.options.getUser("user", true);
		const userDocument = await UserModel.quickFind(user.id, i.guildId!);
		const target = i.options.getString("target", false)?.toLowerCase();

		const embed = new MessageEmbed({
			fields: [
				{
					name: "Użytkownik",
					value: `<@${user.id}> / **${user.tag}** / \`${user.id}\``
				}
			],
			color: embedColors.success
		});

		if (subcommand === "add") {
			// This could be made a bit less spaghetti-like but I decided to leave it for now as I currently don't have any ideas for it
			const amount = i.options.getInteger("amount", true);

			if (!target || target === "bank") {
				userDocument.bank += amount;
				embed.addField("Cel", "Bank");
			} else if (target === "cash") {
				userDocument.cash += amount;
				embed.addField("Cel", "Gotówka");
			} else {
				return i.reply({
					embeds: [
						syntaxEmbed(
							"Podałeś zły cel dodania pieniędzy (cash/bank) - sprawdź literówki",
							i,
							this
						)
					],
					ephemeral: true
				});
			}

			embed.addField("Kwota", `\`💰 ${amount}\``);
			embed.setTitle(`Pomyślnie dodano pieniądze`);
		} else if (subcommand === "take") {
			const amount = i.options.getString("amount", true);
			let taken = 0;
			if (amount !== "all" && !(parseInt(amount) > 0))
				return i.reply({
					embeds: [
						syntaxEmbed(
							"Podałeś złą kwotę - podaj liczbę całkowitą większą od 0, lub 'all'.",
							i,
							this
						)
					]
				});

			if (!target || target === "cash") {
				if (amount === "all") taken = userDocument.cash;
				else taken = parseInt(amount);
				userDocument.cash -= taken;
				embed.addField("Cel", "Gotówka");
			} else if (target === "bank") {
				if (amount === "all") taken = userDocument.bank;
				else taken = parseInt(amount);
				userDocument.bank -= taken;
				embed.addField("Cel", "Bank");
			} else {
				return i.reply({
					embeds: [
						syntaxEmbed(
							"Podałeś zły cel dodania pieniędzy (cash/bank) - sprawdź literówki",
							i,
							this
						)
					],
					ephemeral: true
				});
			}

			embed.addField("Kwota", `\`💰 ${taken}\``);
			embed.setTitle(`Pomyślnie zabrano pieniądze`);
		}

		userDocument.save();

		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
