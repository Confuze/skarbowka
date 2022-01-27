import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import User from "../../models/user";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { newUser } from "../../util/db";
import { embedColors } from "../../util/embeds";

const command: Command = {
	name: "money",
	description: "Dodaje lub zabiera pieniądze do banku/gotówki użytkownika",
	category: "ECONOMY",
	permissions: ["ADMINISTRATOR"],
	guildOnly: true,
	type: "CHAT_INPUT",
	defaultPermission: true,
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
	async execute(i, client) {
		// const embed = new MessageEmbed();
		const subcommand = i.options.getSubcommand(true);
		const amount = i.options.getInteger("amount", true);
		const user = i.options.getUser("user", true);
		const target = i.options.getString("target", false);
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
				i.reply({ content: "Niepoprawne użycie komendy", ephemeral: true }); // TODO: Make this an embed and show the user what they did worng + correct syntax - probably gonna make some sort of handler for this
			}

			embed.setTitle(`Pomyślnie dodano pieniądze`);
			userModel.save();
		} else if (subcommand === "take") {
			if (!target || target === "bank") {
				userModel.bank = userModel.bank - amount;
				embed.addField("Cel", "Bank");
			} else if (target === "cash") {
				userModel.cash = userModel.cash - amount;
				embed.addField("Cel", "Gotówka");
			} else {
				i.reply({ content: "Niepoprawne użycie komendy", ephemeral: true }); // TODO: Same as above
			} // TODO: Make it so you can't make an user have negative balance

			embed.setTitle(`Pomyślnie zabrano pieniądze`);
			userModel.save();
		}

		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
