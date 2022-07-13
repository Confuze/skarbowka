import {
	ApplicationCommandOptionData,
	ApplicationCommandType,
	Client,
	CommandInteraction,
	PermissionString
} from "discord.js";
import Cooldown from "./cooldown";

interface Command {
	name: string;
	description: string;
	category?: string;
	permissions?: PermissionString[];
	cooldown?: {
		time: number,
		uses?: number
	};
	devOnly?: boolean;
	moderatorOnly?: boolean; // TODO: add moderator role adding and checking
	requiredRoles?: string[]; // TODO: add required roles adding and checking
	guildOnly?: boolean;
	type: ApplicationCommandType;
	defaultPermission?: boolean;
	options?: ApplicationCommandOptionData[];
	usage: string;
	exampleUsage: string;
	execute(i: CommandInteraction, client: Client, cooldown: Cooldown): void;
}

export default Command;
