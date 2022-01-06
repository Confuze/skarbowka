import { ApplicationCommandOptionData, ApplicationCommandType, Client, CommandInteraction, Guild, Interaction } from "discord.js";

interface Command {
    name: string
    description: string
    category: string
    permissions?: string | number
    guildonly?: boolean
    type: ApplicationCommandType
    options?: ApplicationCommandOptionData
    defaultPermission?: boolean
    execute(i:CommandInteraction): any
}

export { Command }