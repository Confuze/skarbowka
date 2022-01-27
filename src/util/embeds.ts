import { ColorResolvable } from "discord.js";

interface ColorObj {
	[keys: string]: ColorResolvable;
}

const embedColors: ColorObj = {
	info: "#7289DA",
	success: "#6DE56B",
	failure: "#D13D23"
};

export { embedColors };
