import { ColorResolvable, CommandInteraction, Interaction, User } from "discord.js";
import { MessageEmbed } from "discord.js";
import Command from "../structures/command";

interface ColorObj {
	[keys: string]: ColorResolvable;
}

const embedColors: ColorObj = {
	info: "#7289DA",
	success: "#6DE56B",
	failure: "#D13D23"
};

const syntaxEmbed = (description: string, i:CommandInteraction, command:Command) => {
	return new MessageEmbed({
			author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
			description: description,
			color: embedColors.failure,
			fields: [
				{
					name: "Twoje użycie",
					value: `\`\`\`\n${i.toString()}\n\`\`\``
				},
				{
					name: "Poprawne użycie",
					value: `\`\`\`\n${command.usage}\n\`\`\``
				},
				{
					name: "Przykładowe użycie",
					value: `\`\`\`\n${command.exampleUsage}\n\`\`\``
				}
			]
	});
};

export { embedColors, syntaxEmbed };
