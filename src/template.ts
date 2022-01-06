import { ApplicationCommandOptionData, ApplicationCommandType, Client, CommandInteraction, Options } from "discord.js";

interface Command {
    name: string
    description: string
    permissions?: string | number
    guildonly?: boolean
    type: ApplicationCommandType
    options?: ApplicationCommandOptionData
    defaultPermission?: boolean
    execute(i:CommandInteraction, client:Client, options:Options): void
}

export { Command }