import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";
import updateCooldown from "../../util/cooldowns";
import { embedColors, syntaxEmbed } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const command: Command = {
	name: "rob",
	description: "Kradnie gotówkę danego gracza z szansą niepowodzenie",
    cooldown: {
        time: 6 * 60 * 60
    },
    guildOnly: true,
	type: "CHAT_INPUT",
	defaultPermission: true,
	usage: "/rob [@użytkownik]",
	exampleUsage: "/rob @Confuze#1359",
	options: [
		{
			type: ApplicationCommandOptionTypes.USER,
			name: "user",
			description: "Użytkownik, którego chcesz okraść",
            required: true
		}
	],
	async execute(i, _client, cooldown) {
		const mention = i.options.getUser("user")!;
		const mentionDoucment = await UserModel.quickFind(mention.id, i.guildId!);
        const userDocument = await UserModel.quickFind(i.user.id, i.guildId!);
        let reward = 0;
        const embed = new MessageEmbed();
        
        if (mention.id === i.user.id) {
            return i.reply({embeds: [syntaxEmbed("Nie możesz obrabować samego siebie!", i, this)]});
        } else if (mention.bot) {
            return i.reply({embeds: [syntaxEmbed("Nie możesz obrabować bota!", i, this)]});
        } else if (Math.random() > 0.4 && mentionDoucment.cash > 0) {
            reward = Math.floor(mentionDoucment.cash * (Math.random() * 0.5 + 0.5));
            embed.setTitle(`Pomyślnie obrabowano użytkownika ${mention.tag}`);
            embed.setDescription(`Udało ci się okraść użytkownika <@${mention.id}> i zdobywasz \`${reward} 💰\``);
            embed.setColor(embedColors.success);

            userDocument.cash += reward;
            userDocument.save();
            mentionDoucment.cash -= reward;
            mentionDoucment.save();

            updateCooldown(cooldown);
        } else {
            reward = Math.floor(Math.random() * 500) + 100;
            embed.setTitle(`Kradzież gotówki użytkownika <@${mention.tag} nie powiodła się`);
            embed.setDescription(`Niestety nie udało ci się okraść użytkownika <@${mention.id}> i tracisz \`${reward} 💰\``);
            embed.setColor(embedColors.failure);

            userDocument.cash -= reward;
            userDocument.save();

            updateCooldown(cooldown);
        }

		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
