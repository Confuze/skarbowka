import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";
import { embedColors } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { newUser } from "../../util/db";

const command: Command = {
	name: "dep",
	description: "Wpłać pieniądze z gotówki do banku",
	category: "ECONOMY",
	guildOnly: true,
	type: "CHAT_INPUT",
	defaultPermission: true,
	usage: "/with <kwota do wpłacenia>",
	exampleUsage: "/dep 500",
	options: [
        {
			type: ApplicationCommandOptionTypes.NUMBER,
            required: true,
            min_value: 1,
			name: "amount",
			description: "Kwota, którą chcesz wpłacić"
		}
	],
	async execute(i) {
        const amount = i.options.getNumber("amount")!;
		if (!(UserModel.findOne({ userId: i.user.id, guildId: i.guildId }))) newUser(i.guild!, i.user);
		const userDocument = (await UserModel.findOne({ userId: i.user.id, guildId: i.guildId }))!;
        const deposited = userDocument.cash - amount >= 0 ? amount : userDocument.cash;
		userDocument.cash -= deposited;
        userDocument.bank += deposited
        userDocument.save()

		const embed = new MessageEmbed({
			author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
            title: "Pomyślnie wypłacono pieniądze.",
			color: embedColors.success,
			fields: [
				{
					name: "Wypłacona kwota",
					value: `\`💰 ${deposited}\``
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
