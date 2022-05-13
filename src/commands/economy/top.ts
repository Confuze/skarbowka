import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import User from "../../models/user";
import { embedColors, syntaxEmbed } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";

const command: Command = {
	name: "top",
	description: "Pokazuje tabelę z najbogatszymi graczami",
	category: "ECONOMY",
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
				"Pokazuje tabelę z najbogatszymi graczami pod względem gotówki lub pieniędzy w banku"
		}
	],
	async execute(i, client) {
		const leaderboard = await User.find(
			{ guildId: i.guildId },
			"userId cash bank"
		).limit(10);
		let leaderboardString: string = "";
		const target = i.options.getString("from", false)?.toLowerCase();
        let targetString:string =  "gotówka i bank (razem)";
        if (target === "cash") { targetString = "gotówka" } 
        else if (target === "bank") { targetString = "bank" }
        else if (target) { return i.reply({ embeds: [syntaxEmbed("Podałeś niepoprawny argument - sprawdź literówki", i, this)] })}

        leaderboard.forEach((user:any, index:any) => { // TODO: Clear this any type hell
            let amount;
            if (target === "cash") { amount = user.cash } 
            else if (target === "bank") { amount = user.bank }
            else { amount = user.cash + user.bank }
            leaderboardString += `${index + 1}. <@${user.userId}>: \`💰 ${amount}\`\n`
		});
		console.log(target);
		const embed = new MessageEmbed({
			author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
			description: `Oto tabela z najbogatszymi graczami sortując po: ${targetString}`,
			color: embedColors.info,
			fields: [
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
