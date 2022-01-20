import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";

const command: Command = {
	name: "bal",
	description: "Pokazuje ilość pieniędzy na koncie oraz w gotówce",
	category: "ECONOMY",
	type: "CHAT_INPUT",
	defaultPermission: true,
	execute(i, client) {
		i.reply({
			content: "Kiedyś zrobię" // TODO: make economy brrrr
		});
	}
};

export default command;
