import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import User from "../../models/user";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { newUser } from "../../util/db";
import { embedColors, syntaxEmbed } from "../../util/embeds";

const command: Command = {
	name: "money",
	description: "Dodaje lub zabiera pieniądze do banku/gotówki użytkownika",
	category: "ECONOMY",
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
					description: "Bank/gotówka (domyślnie gotówka)"
				}
			]
		},
		{
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			name: "take",
			description: "Zabiera pieniądze z gotówki/banku",
			options: [
				{
					type: ApplicationCommandOptionTypes.INTEGER,
					name: "amount",
					description: "Kwota do zabrania",
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
		const amount = i.options.getInteger("amount", true);
		const user = i.options.getUser("user", true);
		const target = i.options.getString("target", false)?.toLowerCase();
		const userModel = await User.findOne({ userId: user.id, guildId: i.guildId });
		if (!userModel) newUser(i.guild!, user);

		const embed = new MessageEmbed({
			fields: [
				{
					name: "Użytkownik",
					value: `<@${user.id}> / **${user.tag}** / \`${user.id}\``
				},
				{
					name: "Kwota",
					value: `\`${amount} 💰\``
				}
			],
			color: embedColors.success
		});

		if (subcommand === "add") {
			if (!target || target === "bank") {
				userModel.bank = userModel.bank + amount;
				embed.addField("Cel", "Bank");
			} else if (target === "cash") {
				userModel.cash = userModel.cash + amount;
				embed.addField("Cel", "Gotówka");
			} else {
				return i.reply({ embeds: [syntaxEmbed("Podałeś zły cel dodania pieniędzy (cash/bank) - sprawdź literówki", i, this)], ephemeral: true }); 
			}

			embed.setTitle(`Pomyślnie dodano pieniądze`);
			userModel.save();
		} else if (subcommand === "take") {
			if (!target || target === "cash") {
				userModel.cash = userModel.cash - amount >= 0 ? userModel.cash - amount : 0;
				embed.addField("Cel", "Gotówka");
			} else if (target === "bank") {
				userModel.bank = userModel.bank - amount >= 0 ? userModel.bank - amount : 0;
				embed.addField("Cel", "Bank");
			} else {
				return i.reply({ embeds: [syntaxEmbed("Podałeś zły cel dodania pieniędzy (cash/bank) - sprawdź literówki", i, this)], ephemeral: true });
			}

			embed.setTitle(`Pomyślnie zabrano pieniądze`);
			userModel.save();
		}

		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
