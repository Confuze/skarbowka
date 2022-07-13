import { MessageEmbed } from "discord.js";
import Command from "../../structures/command";
import UserModel from "../../models/user";
import { embedColors } from "../../util/embeds";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import updateCooldown from "../../util/cooldowns";

interface Prize {
	emote: string;
	chance: number;
	reward: number | string;
}

const prizes: Prize[] = [
	{
		emote: "🎟️",
		chance: 0.15,
		reward: "Pięć darmowych losów"
	},
	{
		emote: "🍒",
		reward: 500,
		chance: 0.4
	},
	{
		emote: "💵",
		reward: 2000,
		chance: 0.15
	},
	{
		emote: "💷",
		reward: 5000,
		chance: 0.15
	},
	{
		emote: "🎊",
		reward: 10000,
		chance: 0.10
	},
	{
		emote: "💎",
		reward: 50000,
		chance: 0.05
	}
];

function pickPrize() {
	const winner = Math.random();
	let threshold = 0;

	for (const prize of prizes) {
		threshold += prize.chance;
		if (threshold > winner) {
			return prize;
		}
	} 
}

const command: Command = {
	name: "scratchcards",
	description: "Zdrapki",
	cooldown: {
		time: 5 * 60,
		uses: 15
	},
	guildOnly: true,
	type: "CHAT_INPUT",
	defaultPermission: true,
	usage: "/dice <use/buy/info>",
	exampleUsage: "/dice buy",
	options: [
		{
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			name: "use",
			description: "Użyj (zdrap) wcześniej zakupioną zdrapkę"
		},
		{
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			name: "buy",
			description: "Kup zdrapkę - Koszt: 200 💰",
			options: [
				{
					name: "amount",
					description: "Ilość zdrapek, które chcesz kupić (domyślnie 1)",
					type: ApplicationCommandOptionTypes.NUMBER,
					min_value: 1
				}
			]
		},
		{
			type: ApplicationCommandOptionTypes.SUB_COMMAND,
			name: "info",
			description: "Uzyskaj informacje na temat systemu zdrapek"
		}
	],
	async execute(i, _client, cooldown) {
		const subcommand = i.options.getSubcommand(true);
		const userDocument = await UserModel.quickFind(i.user.id, i.guildId!);

		if (subcommand === "info") {
			const embed = new MessageEmbed({
				title: "Informacje o zdrapkach",
				description:
					"Poniżej znajdziesz wszystkie informacje o zdrapkach. Jedna zdrapka kosztuje `200 💰` i możesz ją kupić komendą `/scratchcards buy`. Jeśli wylosujesz trzy takie same emotki zdobędziesz nagrodę według tabeli poniżej",
				fields: [
					{
						name: "Tabela",
						value: "```💎💎💎 - 50000\n💎💎   - 20000\n🎊🎊🎊 - 10000\n💷💷💷 - 5000\n🎊🎊   - 4000\n💷💷 -   2000\n💵💵💵 - 2000\n💵💵   - 800\n🍒🍒🍒 - 500\n🍒🍒   - 200\n🎟️🎟️🎟️ - 5 darmowych zdrapek```"
					},
					{
						name: "Ilość twoich zdrapek",
						value: `\`${userDocument.inventory.scratchcards}\``
					}
				],
				color: embedColors.info
			});

			i.reply({ embeds: [embed] });
		} else if (subcommand === "buy") {
			const amount = i.options.getNumber("amount") || 1;
			const cost = amount * 200;

			if (userDocument.cash < cost) {
				const embed = new MessageEmbed({
					author: {
						name: i.user.tag,
						icon_url: i.user.avatarURL()!
					},
					title: `Nie posiadasz wystarczającej kwoty w gotówce!`,
					fields: [
						{
							name: "Twoja gotówka",
							value: `\`${userDocument.cash} 💰\``
						},
						{
							name: "Koszt zdrapek",
							value: `\`${cost} 💰\``
						}
					],
					color: embedColors.failure
				});
				return i.reply({ embeds: [embed], ephemeral: true });
			}

			userDocument.cash -= cost;
			userDocument.inventory.scratchcards += amount;
			userDocument.save();

			const embed = new MessageEmbed({
				title: "Pomyślnie zakupiono zdrapkę",
				fields: [
					{
						name: "Ilość zakupionych zdrapek",
						value: `\`${amount}\``
					},
					{
						name: "Koszt zakupionych zdrapek",
						value: `\`${cost} 💰\``
					}
				],
				color: embedColors.success
			});

			i.reply({ embeds: [embed] });
		} else {
			if (userDocument.inventory.scratchcards <= 0) {
				const embed = new MessageEmbed({
					author: {
						name: i.user.tag,
						icon_url: i.user.avatarURL()!
					},
					title: `Nie posiadasz żadnych zdrapek!`,
					description:
						"Możesz użyć tej komendy tylko, gdy posiadasz zdrapki. Zakup je komendą `/scratchcards buy` lub przeczytaj informacje z `/scratchcards info`.",
					color: embedColors.failure
				});
				return i.reply({ embeds: [embed], ephemeral: true });
			}

			userDocument.inventory.scratchcards -= 1;
			userDocument.save();
			updateCooldown(cooldown);

			const prize1 = pickPrize()!;
			const prize2 = pickPrize()!;
			const prize3 = pickPrize()!;

			const embed1 = new MessageEmbed({
				title: "Oto twoja zdrapka!",
				description:
					"Dziękujemy za użycie zakupionej zdrapki, poniżej możesz ją zdrapać",
				fields: [
					{
						name: "Zdrapka",
						value: `||\`${prize1.emote}\`||||\`${prize2.emote}\`||||\`${prize3.emote}\`||`
					}
				],
				footer: {
					text: "Za 5 sekund dostaniesz wiadomość z wynikiem zdrapki i otrzymasz możliwą nagrodę."
				},
				color: embedColors.info
			});

			await i.reply({ embeds: [embed1] });
			let embed2: MessageEmbed;
			let reward: string;

			// ! WARNING: You are entering the land of spaghetti code. The following lines are really crappy but I am too lazy and uncompetent to fix this. Beware of redundance and bad practices!

			if (prize1 === prize2 && prize1 === prize3) {
				if (prize1.reward === "🎟️") {
					userDocument.inventory.scratchcards += 5;
					reward = prize1.reward;
				} else if (typeof prize1.reward === "number") {
					userDocument.cash += prize1.reward;
					reward = `\`${prize1.reward} 💰\``;
				}
				userDocument.save();

				embed2 = new MessageEmbed({
					title: "Gratulacje, wygrałeś nagrodę główną!",
					description:
						"Wylosowałeś trzy jednakowe znaki w zdrapce, co gwarantuje ci wygraną.",
					fields: [
						{
							name: "Nagroda",
							value: reward!
						}
					],
					color: embedColors.success
				});
			} else if ((prize1 === prize2 && typeof prize1.reward === "number") || (prize1 === prize3 && typeof prize1.reward === "number")) {
				userDocument.cash += prize1.reward * 0.4;
				userDocument.save();

				reward = `\`${prize1.reward * 0.4} 💰\``;
				embed2 = new MessageEmbed({
					title: "Gratulacje, wygrałeś nagrodę poboczną!",
					description:
						"Wylosowałeś dwa jednakowe znaki w zdrapce, co gwarantuje ci wygraną.",
					fields: [
						{
							name: "Nagroda",
							value: reward!
						}
					],
					color: embedColors.success
				});
			} else if (prize2 === prize3 && typeof prize2.reward === "number") {
				userDocument.cash += prize2.reward * 0.4;
				userDocument.save();

				reward = `\`${prize2.reward * 0.4} 💰\``;
				embed2 = new MessageEmbed({
					title: "Gratulacje, wygrałeś nagrodę poboczną!",
					description:
						"Wylosowałeś dwa jednakowe znaki w zdrapce, co gwarantuje ci wygraną.",
					fields: [
						{
							name: "Nagroda",
							value: reward!
						}
					],
					color: embedColors.success
				});
			} else {
				embed2 = new MessageEmbed({
					title: "Niestet nie wygrałeś nagrody",
					description:
						"Twoja zdrapka nie posiadała wygranego wzoru. Powodzenia następnym razem.",
					color: embedColors.failure
				});
			}

			setTimeout(() => {
				i.editReply({ embeds: [embed1, embed2] });
			}, 5000);
		}
	}
};

export default command;
