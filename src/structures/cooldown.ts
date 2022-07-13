interface Cooldown {
	userId: string;
    guildId: string;
    commandName: string;
    timesUsed: number;
    lastUsed: number
}

export default Cooldown;