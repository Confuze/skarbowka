import Event from "../structures/event";
import { Message } from "discord.js";
import { cooldowns } from "..";
import UserModel from "../models/user";

const event: Event = {
	name: "messageCreate",
	async execute(msg:Message) {
        console.log(msg.content, cooldowns);

        if (msg.author.bot || !msg.guild) return;
        let cooldown = cooldowns.find(cooldown => cooldown.guildId === msg.guildId && cooldown.userId === msg.author.id && cooldown.name === "chat");
        if (cooldown && cooldown.lastUsed + 60 * 1000 > Date.now()) return;
        if (!cooldown) {
            cooldown = cooldowns[cooldowns.push({
                userId: msg.author.id,
                guildId: msg.guildId!,
                name: "chat",
                timesUsed: 1,
                lastUsed: Date.now()
            }) - 1]; // array.push returns the new length of the array so you can substract it by one to get the index of the pushed element
        } else cooldown.lastUsed = Date.now();

        const userDocument = await UserModel.quickFind(msg.author.id, msg.guildId!);
        userDocument.cash += Math.floor(Math.random() * 21) + 10;
        userDocument.save();
	}
};

export default event;
