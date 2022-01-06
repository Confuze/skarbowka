"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const fs = __importStar(require("fs"));
const client = new discord_js_1.Client({
    intents: [discord_js_1.Intents.FLAGS.GUILDS]
});
let commands = [];
const refreshCommands = () => __awaiter(void 0, void 0, void 0, function* () {
    let target;
    if (process.env.TESTING_SERVER) {
        target = client.guilds.cache.get(process.env.TESTING_SERVER);
    }
    else {
        target = client.application;
    }
    const commandFiles = fs.readdirSync(__dirname + "/commands").filter((file) => file.endsWith(".js") || file.endsWith(".ts"));
    for (const file of commandFiles) {
        const commandObj = yield Promise.resolve().then(() => __importStar(require(`./commands/${file}`)));
        const command = commandObj.command;
        commands.push({
            name: command.name,
            description: command.description,
            type: command.type,
            options: command.options,
            defaultPermission: command.defaultPermission,
            execute: command.execute
        });
    }
    target.commands.set(commands);
});
client.once("ready", () => {
    console.log("Bot jest gotowy do kradnięcia");
    refreshCommands();
});
client.on("interactionCreate", (i) => {
    if (!i.isCommand())
        return;
    for (const command of commands) {
        if (i.commandName === command.name)
            command.execute(i);
    }
});
client.login(process.env.TOKEN);
