import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import User from "../../models/user";
import { embedColors, syntaxEmbed } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { newUser } from "../../util/db";

const command: Command = {
	name: "dice",
	description: "Rzut kośćmi. Obstaw daną liczbę i jeśli ona wypadnie, dostaniesz pieniądze.",
	category: "ECONOMY",
	guildOnly: true,
	type: "CHAT_INPUT",
	defaultPermission: true,
	usage: "/dice <liczba (od 1 do 6)> <obstawiana kwota>",
	exampleUsage: "/dice 4 100",
	options: [
		{
			type: ApplicationCommandOptionTypes.NUMBER,
            required: true,
            min_value: 1,
            max_value: 6,
			name: "number",
			description: "Liczba, którą obstawiasz, że zostanie wylosowana (od 1 do 6)"
		},
        {
			type: ApplicationCommandOptionTypes.NUMBER,
            required: true,
            min_value: 1,
			name: "amount",
			description: "Kwota, którą chcesz obstawić"
		}
	],
	async execute(i, client) {
        if (!(User.findOne({ userId: i.user.id, guildId: i.guildId }))) newUser(i.guild!, i.user);
        const userModel = await User.findOne({ userId: i.user.id, guildId: i.guildId });

        const number = i.options.getNumber("number", true);
		const amount = i.options.getNumber("amount", true);

        if (userModel.cash < amount) { 
            const embed = new MessageEmbed({
            author: { 
                name: i.user.tag,icon_url: i.user.avatarURL()!
            },
            title: `Nie posiadasz wystarczającej kwoty w gotówce!`,
            fields: [
                {
                    name: "Twoja gotówka",
                    value: `\`💰 ${userModel.cash}\``
                },
                {
                    name: "Obstawiona kwota (za duża)",
                    value: `\`💰 ${amount}\``
                }
            ]
        })
            return i.reply({ embeds: [embed], ephemeral: true})
        } else if (amount < 100) {
            const embed = new MessageEmbed({
                author: { 
                    name: i.user.tag,icon_url: i.user.avatarURL()!
                },
                title: `Nie możesz obstawiać kwoty mniejszej niż 100`,
                fields: [
                    {
                        name: "Obstawiona kwota (za mała)",
                        value: `\`💰 ${amount}\``
                    }
                ]
            })
            return i.reply({ embeds: [embed], ephemeral: true})
        }

        const rolled = Math.floor(Math.random() * 7);
        userModel.cash -= amount;

        const embed = new MessageEmbed({
            author: { 
                name: i.user.tag,icon_url: i.user.avatarURL()!
            },
            title: `\\🎲 Wylosowana liczba: ${rolled}`
        })

        if (number === rolled) {
            embed.setDescription("Gratulacje! udało ci się zgadnąć liczbę, i otrzymujesz poczwórną stawkę zakładu.")
            embed.addField("Nagroda", `\`💰 ${amount * 2}\``)
            embed.setColor(embedColors.success)
            userModel.cash += amount * 4;
        } else {
            embed.setDescription("Niestety nie udało ci się zgadnąć liczby. Powodzenia następnym razem.")
            embed.addField("Nagroda", `\`💰 0\``)
            embed.setColor(embedColors.failure)
        }

        userModel.save();

		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
