import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";

const command: Command = {
	name: "work",
	description: "Komenda pozwalająca na wykonanie pracy oraz zarobek",
	cooldown: {
        time: 15 * 60
    },
    guildOnly: true,
    type: "CHAT_INPUT",
	defaultPermission: true,
	usage: "/work",
	exampleUsage: "/work",
	async execute(i) {
        const userDocument = await UserModel.quickFind(i.user.id, i.guildId!);
        const reward = Math.floor(Math.random() * 250) + 101;

        userDocument.cash += reward;
        userDocument.save();

		const embed = new MessageEmbed({
			title: "Pomyślno otrzymano wynagrodzienie!",
            description: `Wykonałeś swoją pracę i otrzymujesz wypłatę w postaci \`${reward} 💰\``,
			color: "#6de56b",
		});

		i.reply({
			embeds: [embed]
		});
	}
};

export default command;
