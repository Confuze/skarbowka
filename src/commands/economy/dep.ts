import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";
import { embedColors, syntaxEmbed } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

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
			type: ApplicationCommandOptionTypes.STRING,
            required: true,
			name: "amount",
			description: "Kwota, którą chcesz wpłacić"
		}
	],
	async execute(i) {
        const amount = i.options.getString("amount")!;
		const userDocument = await UserModel.quickFind(i.user.id, i.guildId!);

        let deposited = 0;
		if (amount === "all") deposited = userDocument.cash;
		else if (parseInt(amount) > 0) deposited = userDocument.cash - parseInt(amount) >= 0 ? parseInt(amount) : userDocument.cash;
		else return i.reply({embeds: [syntaxEmbed("Podałeś złą kwotę - podaj liczbę całkowitą większą od 0, lub 'all'.", i, this)]});

		userDocument.cash -= deposited;
        userDocument.bank += deposited;
        userDocument.save();

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
