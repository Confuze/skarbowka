import * as djs from "discord.js";
import * as dotenv from "dotenv";
dotenv.config();

const client = new djs.Client({
	intents: [djs.Intents.FLAGS.GUILDS]
});

client.login(process.env.TOKEN);
