interface Cooldown {
	userId: string;
    guildId: string;
    name: string;
    timesUsed: number;
    lastUsed: number
}

export default Cooldown;