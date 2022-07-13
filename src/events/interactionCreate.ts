import { GuildMember, Interaction, MessageEmbed } from "discord.js";
import { commands, client, cooldowns } from "../index";
import Command from "../structures/command";
import Event from "../structures/event";
import { embedColors } from "../util/embeds";

const event: Event = {
	name: "interactionCreate",
	async execute(i: Interaction) {
		if (!i.isCommand()) return;

		const command: Command = commands.find((cmd: Command) => {
			return cmd.name == i.commandName;
		});

		if (!i.guild && command.guildOnly) return; // TODO: Make a message saying the command is allowed only in servers

		const permissionsArray = (i.member as GuildMember).permissionsIn(i.channel!.id).toArray();

		if (command.permissions && !permissionsArray.some((perm) => command.permissions?.includes(perm))) {
			const embed = new MessageEmbed({
				author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
				title: "Brak uprawnień!",
				description: "Nie posiadasz uprawnień do użycia tej komendy",
				color: embedColors.failure,
				fields: [{ name: "Wymagane uprawnienia", value: command.permissions.map((perm) => `\`${perm}\``).join(", ") }]
			});
			return i.reply({ embeds: [embed], ephemeral: true });
		}

		if (command.devOnly && i.user.id != process.env.OWNER_ID) {
			const embed = new MessageEmbed({
				author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
				title: "Brak uprawnień!",
				description: "Ta komenda jest dostępna tylko dla właściciela bota",
				color: embedColors.failure
			});

			return i.reply({ embeds: [embed], ephemeral: true });
		}

		if (command.cooldown) {
			const cooldown = cooldowns.find((cooldown) => cooldown.userId === i.user.id && cooldown.guildId === i.guildId && cooldown.commandName === command.name);
			const cooldownTime = command.cooldown.time * 1000;

			if (cooldown && cooldown.timesUsed === command.cooldown.uses && cooldown.lastUsed + cooldownTime > Date.now()) {
				const timeLeft = cooldown.lastUsed + cooldownTime - Date.now();
				const embed = new MessageEmbed({
					author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
					title: "Limit czasowy!",
					description: `Ta komenda posiada limit użyć, zaczekaj jeszcze \`${Math.floor(timeLeft / 1000 / 60 / 60)} godzin ${Math.floor(timeLeft / 1000 / 60)} minut ${Math.floor(timeLeft / 1000)} sekund\``,
					color: embedColors.failure
				});
				return i.reply({ embeds: [embed], ephemeral: true });
			} else if (cooldown) {
				cooldown.timesUsed += 1; // ! Possible issue: If an user uses a command incorrectly and gets an error embed, it still counts as a use
			} else {
				cooldowns.push({
					userId: i.user.id,
					guildId: i.guildId!,
					commandName: command.name,
					timesUsed: 1,
					lastUsed: Date.now()
				});
			}

		}

		try {
			await command.execute(i, client, i.options);
		} catch (err) {
			console.error(err);
			let errorMessage = err;
			if (err instanceof Error) errorMessage = err.message || " "; // If the error message is empty it sets it to " " so the code block is rendered and not left as 6 backticks

			const embed = new MessageEmbed({
				author: { name: i.user.tag, icon_url: i.user.avatarURL()! },
				title: "COŚ POSZŁO NIE TAK :/",
				description: "Wystąpił nieoczekiwany błąd po stronie serwera, przepraszamy",
				color: embedColors.failure,
				fields: [
					{
						name: "Błąd:",
						value: `\`\`\`${errorMessage}\`\`\``
					}
				]
			});

			i.reply({ embeds: [embed] });

			client.users.cache.get(process.env.OWNER_ID!)!.send(`Wystąpił nieoczekiwany błąd w kanale ${i.channel} na serwerze ${i.guild}\n\`\`\`${errorMessage}\`\`\``);
		}
	}
};

export default event;
