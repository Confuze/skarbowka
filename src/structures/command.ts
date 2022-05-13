import {
	ApplicationCommandOptionData,
	ApplicationCommandType,
	Client,
	CommandInteraction,
	Options,
	PermissionString
} from "discord.js";

interface Command {
	name: string;
	description: string;
	category: "GENERAL" | "ECONOMY" | "ADMIN"; // TODO: make it so it automaticalaly adds a category based on the folder (seems easy but I'm too lazy now)
	permissions?: PermissionString[];
	devOnly?: boolean;
	moderatorOnly?: boolean; // TODO: add moderator role adding and checking
	requiredRoles?: string[]; // TODO: add required roles adding and checking
	guildOnly?: boolean;
	type: ApplicationCommandType;
	defaultPermission?: boolean;
	options?: ApplicationCommandOptionData[];
	usage: string;
	exampleUsage: string;
	execute(i: CommandInteraction, client: Client, options?: Options): void;
}

export default Command;
