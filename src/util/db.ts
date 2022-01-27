import { Guild, User } from "discord.js";
import UserModel from "../models/user";

const newUser = async (guild: Guild, discordUser: User) => {
	const user = new UserModel({
		userId: discordUser.id,
		guildId: guild.id,
		cash: 0,
		bank: 0
	});
	await user.save();
};

export { newUser };
