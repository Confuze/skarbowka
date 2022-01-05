import { ApplicationCommandOptionData, ApplicationCommandType } from "discord.js";

interface Command {
    name: string
    description: string
    category: string
    permissions?: string | number
    guildonly?: boolean
    type: ApplicationCommandType
    options?: ApplicationCommandOptionData
    defaultPermission?: boolean
}

export { Command }