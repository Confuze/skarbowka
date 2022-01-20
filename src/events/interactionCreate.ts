import { GuildMember, Interaction, MessageEmbed } from "discord.js";
import { commands, client } from "../index";
import Command from "../structures/command";
import Event from "../structures/event";

const event: Event = {
	name: "interactionCreate",
	execute(i: Interaction) {
		if (!i.isCommand()) return;

		const command: Command = commands.find((cmd: Command) => {
			return cmd.name == i.commandName;
		});

		if (!i.guild && command.guildOnly) return;

		const permissionsArray = (i.member as GuildMember).permissionsIn(i.channel!.id).toArray();

		if (command.permissions && !permissionsArray.some((perm) => command.permissions?.includes(perm))) {
			const embed = new MessageEmbed({
				title: "Brak uprawnień!",
				description: "Nie posiadasz uprawnień do użycia tej komendy",
				timestamp: i.createdAt,
				color: "#D13D23",
				fields: [{ name: "Wymagane uprawnienia", value: command.permissions.map((perm) => `\`${perm}\``).join(", ") }],
				footer: { text: `Wywołane przez: ${i.user.username}`, iconURL: i.user.displayAvatarURL() }
			});

			i.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		if (command.devOnly && i.user.id != "469425967845343233") {
			const embed = new MessageEmbed({
				title: "Brak uprawnień!",
				description: "Ta komenda jest dostępna tylko dla właściciela bota",
				timestamp: i.createdAt,
				color: "#D13D23",
				footer: { text: `Wywołane przez: ${i.user.username}`, iconURL: i.user.displayAvatarURL() }
			});

			i.reply({ embeds: [embed], ephemeral: true });
			return;
		}

		try {
			command.execute(i, client, i.options);
		} catch (err) {
			console.error(err);
		}
	}
};

export default event;
